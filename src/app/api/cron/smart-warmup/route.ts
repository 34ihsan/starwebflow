import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processInboundEmails } from '@/lib/imap';
import { subscribeToNewsletters } from '@/lib/newsletter';
import { checkSPF, checkDKIM, checkDMARC } from '@/lib/utils/dns-check';
import {
  selectWarmupTarget,
  isWithinOrganicHours,
  calculateAdaptiveWarmupLimit,
  generateWarmupContent,
  detectProvider,
  WarmupMailboxMeta
} from '@/lib/warmup/engine';
import nodemailer from 'nodemailer';
import { recordPlacements, getPlacementStats, shouldQuarantine } from '@/lib/warmup/placement';
import { authorizeCronOrStaff } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed serverless duration

// Helper function to process array in parallel chunks (batching)
async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(
      chunk.map((item) =>
        fn(item).catch((err) => {
          console.error(`Error in concurrent batch task:`, err);
          return null as any;
        })
      )
    );
    results.push(...chunkResults);
  }
  return results.filter(Boolean);
}

export async function GET(req: Request) {
  const authz = await authorizeCronOrStaff(req);
  if (!authz.ok) {
    return NextResponse.json({ error: authz.reason || 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Tüm aktif veya WARMUP statüsündeki mail kutularını çek (Tüm tenant'lar çapraz havuzda)
    const mailboxes = await prisma.emailMailbox.findMany({
      where: {
        OR: [{ status: 'WARMUP' }, { status: 'ACTIVE' }],
        isPaused: false
      }
    });

    if (mailboxes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Isıtılacak aktif veya WARMUP hesap bulunamadı.'
      });
    }

    const allEmails = mailboxes.map((m) => m.email.toLowerCase());
    const mailboxIdByEmail = new Map<string, string>(mailboxes.map((m) => [m.email.toLowerCase(), m.id]));

    let inboundCount = 0;
    let outboundCount = 0;
    let rescuedCount = 0;
    let completedThreadsCount = 0;

    // --- ADIM 1: PARALEL IMAP TARAMASI (BATCH SIZE: 4) ---
    // Her mail kutusu için 6 saniye timeout korumalı paralel IMAP kontrolü
    await mapConcurrent(mailboxes, 4, async (mailbox) => {
      try {
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(mailbox.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // İlk adımlarda veya bülten aboneliği almamış kutular için bülten tohumlama
        if (mailbox.warmupProgress === 0 || mailbox.sentToday === 0) {
          console.log(`[Seed Phase] Triggering multi-newsletter subscription for: ${mailbox.email}`);
          subscribeToNewsletters(mailbox.email).catch(() => {});
        }

        // IMAP Taraması (Inbox + Spam klasörü)
        const imapRes = await Promise.race([
          processInboundEmails(
            {
              email: mailbox.email,
              imapHost: mailbox.imapHost || undefined,
              imapPort: mailbox.imapPort || undefined,
              imapUser: mailbox.imapUser || undefined,
              imapPassword: mailbox.imapPassword || undefined,
              appPassword: mailbox.appPassword || undefined
            },
            allEmails
          ),
          new Promise<any>((resolve) =>
            setTimeout(() => resolve({ success: false, reason: 'Timeout (6s)' }), 6000)
          )
        ]);

        if (imapRes && imapRes.success) {
          inboundCount += imapRes.readCount || 0;
          rescuedCount += imapRes.rescuedFromSpam || 0;

          // Gerçek inbox placement ölçümü (spam'e düşen / inbox'a düşen warmup mailleri)
          await recordPlacements(mailbox.email, imapRes.placements, mailboxIdByEmail);

          const bounceIncrement = imapRes.bounceCount || 0;
          let newStatus = mailbox.status;
          let isPaused = mailbox.isPaused;

          // Bounce kuralı: 5+ bounce durumunda hesabı otomatik karantinaya al
          if (mailbox.bounceCount + bounceIncrement >= 5) {
            newStatus = 'ERROR';
            isPaused = true;
            console.log(`[OMNI-ROUTING] Mailbox ${mailbox.email} paused due to excessive bounces.`);
          }

          if (imapRes.bouncedRecipients && imapRes.bouncedRecipients.length > 0) {
            for (const bouncedEmail of imapRes.bouncedRecipients) {
              console.log(`[BOUNCE HANDLING] Marking ${bouncedEmail} as hard bounced.`);
              await prisma.lead.updateMany({
                where: { email: bouncedEmail },
                data: { unsubscribed: true, notes: 'HARD BOUNCE - DO NOT SEND' }
              });
              await prisma.outreachItem.updateMany({
                where: { email: bouncedEmail },
                data: { status: 'FAILED', errorMsg: 'HARD BOUNCE' }
              });
              const leads = await prisma.lead.findMany({ where: { email: bouncedEmail } });
              for (const l of leads) {
                await prisma.leadSequence.updateMany({
                  where: { leadId: l.id, status: 'ACTIVE' },
                  data: { status: 'COMPLETED' }
                });
              }
            }
          }

          // Periyodik DNS Doğrulama (%20 olasılıkla arka planda)
          const domain = mailbox.email.split('@')[1];
          if (domain && Math.random() < 0.2) {
            try {
              const [spf, dkim, dmarc] = await Promise.all([
                checkSPF(domain),
                checkDKIM(domain),
                checkDMARC(domain)
              ]);

              if (!spf && !dkim) {
                newStatus = 'ERROR';
                isPaused = true;
                console.log(`[DNS CHECK] Mailbox ${mailbox.email} paused due to missing SPF/DKIM.`);
              }

              await prisma.emailMailbox.update({
                where: { id: mailbox.id },
                data: { spfStatus: spf, dkimStatus: dkim, dmarcStatus: dmarc }
              });
            } catch (dnsErr) {
              // ignore dns check failure
            }
          }

          await prisma.emailMailbox.update({
            where: { id: mailbox.id },
            data: {
              bounceCount: { increment: bounceIncrement },
              status: newStatus,
              isPaused,
              warmupProgress: {
                increment: Math.min(100, (imapRes.rescuedFromSpam || 0) * 3 + (imapRes.readCount || 0))
              },
              reputation: {
                increment: Math.min(100, (imapRes.readCount || 0) + (imapRes.rescuedFromSpam || 0) * 2)
              },
              receivedToday: { increment: (imapRes.readCount || 0) + (imapRes.rescuedFromSpam || 0) }
            }
          });
        }
      } catch (boxErr) {
        console.error(`IMAP error for ${mailbox.email}:`, boxErr);
      }
    });

    // --- ADIM 2: ORGANİK İNSAN RİTMİ & GÖNDERİM KONTROLÜ ---
    const url = new URL(req.url);
    const isForce = url.searchParams.get('force') === 'true';

    const organicTiming = isWithinOrganicHours();
    if (!organicTiming.allowed && !isForce) {
      console.log(`[WARMUP TIMING] Gönderim atlandı: ${organicTiming.reason}`);
      return NextResponse.json({
        success: true,
        skippedDueToTiming: true,
        timing: organicTiming,
        stats: {
          inboundCount,
          rescuedCount,
          outboundCount: 0,
          completedThreadsCount: 0,
          totalMailboxes: mailboxes.length
        },
        message: `IMAP Tarandı (Okunan: ${inboundCount}, Spam'den Kurtarılan: ${rescuedCount}). Gönderim organik ritim nedeniyle durduruldu (${organicTiming.reason}). Acil test için 'Zorla Isıt' yapabilirsiniz.`
      });
    }

    // Son 7 günün GERÇEK yerleşim verisi: sağlık/limit hesabı için kümülatif `spammed` yerine
    // güncel spam sayısı kullanılır; spam oranı >= %40 olan gönderici geçici olarak sessize alınır.
    const placementStats = await getPlacementStats(allEmails, 7);
    mailboxes.forEach((m) => {
      const st = placementStats.get(m.email.toLowerCase());
      if (st) (m as any).spammed = st.spam;
    });

    const sendResults: Array<{ from: string; to: string; subject: string; success: boolean; error?: string }> = [];
    const skippedMailboxes: Array<{ email: string; reason: string }> = [];

    // Limitine ulaşmamış göndericileri belirle (Matematiksel Ramping Eğrisi)
    const activeSenders = mailboxes.filter((m) => {
      if (m.isPaused) {
        skippedMailboxes.push({ email: m.email, reason: 'Kutu duraklatılmış (isPaused: true)' });
        return false;
      }
      if (m.status === 'ERROR') {
        skippedMailboxes.push({ email: m.email, reason: 'Kutu hata (ERROR) durumunda' });
        return false;
      }
      if (shouldQuarantine(placementStats.get(m.email.toLowerCase()))) {
        skippedMailboxes.push({ email: m.email, reason: 'Yüksek spam oranı nedeniyle karantinada' });
        console.warn(`[PLACEMENT] ${m.email} son 7 günde yüksek spam oranı nedeniyle bu turda atlandı.`);
        return false;
      }
      const dynamicLimit = calculateAdaptiveWarmupLimit(m as unknown as WarmupMailboxMeta);
      if ((m.sentToday || 0) >= dynamicLimit) {
        skippedMailboxes.push({ email: m.email, reason: `Günlük ısınma kotasına ulaştı (${m.sentToday}/${dynamicLimit} mail)` });
        return false;
      }
      return true;
    });

    if (activeSenders.length >= 1) {
      // Göndericileri karıştır
      const shuffledSenders = [...activeSenders].sort(() => 0.5 - Math.random());

      // Paralel gönderim (Batch size: 3)
      await mapConcurrent(shuffledSenders, 3, async (sender) => {
        // Çapraz havuzdan hedef seç (Kısır döngüyü kıran Cross-Domain & Cross-ESP seçici)
        const recipient = selectWarmupTarget(
          sender as unknown as WarmupMailboxMeta,
          mailboxes as unknown as WarmupMailboxMeta[]
        );

        if (!recipient) {
          skippedMailboxes.push({ email: sender.email, reason: 'Uygun çapraz hedef kutu bulunamadı' });
          console.log(`[WARMUP TARGET] Uygun farklı hedef bulunamadı: ${sender.email}`);
          return;
        }

        // Açık bir Thread var mı?
        const existingThread = await prisma.emailWarmupThread.findFirst({
          where: {
            mailboxId: sender.id,
            targetEmail: recipient.email,
            status: 'ACTIVE'
          }
        });

        // Gerçekçi B2B AI İçerik Üretimi (Spam Kelime Koruması & Bağlamsal Diyalog)
        const contentResult = await generateWarmupContent({
          sender: sender as unknown as WarmupMailboxMeta,
          recipient: recipient as unknown as WarmupMailboxMeta,
          existingThread
        });

        // Eğer bu döngüde yanıt verilmeyecekse (insan ritmi %45 yanıt) pas geç (force durumunda %80'e çıkar)
        if (!contentResult.shouldReply && !isForce) {
          skippedMailboxes.push({ email: sender.email, reason: 'Doğal insan bekleme süresi (Yanıt ertelendi)' });
          console.log(`[WARMUP ENGAGEMENT] Yanıt ertelendi (Doğal insan bekleme süresi): ${sender.email} -> ${recipient.email}`);
          return;
        }

        // Gerçek çift yönlü konuşma: devam eden thread'de alıcı da havuzdaki gerçek bir kutuysa
        // yanıtı ALICI gönderir (A->B, B->A). Master seed'lerde kimlik bilgisi yoktur; gönderici devam eder.
        const recipientBox: any = recipient;
        const recipientPass = recipientBox.smtpPassword || recipientBox.appPassword || '';
        const replierIsRecipient = !!(existingThread && recipientBox.smtpHost && recipientPass && contentResult.inReplyTo);
        const from: any = replierIsRecipient ? recipientBox : sender;
        const toEmail = replierIsRecipient ? sender.email : recipient.email;

        // İnsan ritmi: gönderimler arasında 0.3-3 sn rastgele gecikme (burst oranını kır, force modunda daha kısa)
        await new Promise((r) => setTimeout(r, isForce ? 200 : 300 + Math.random() * 2700));

        // SMTP ile Mail Gönder (5s Timeout)
        const pass = from.smtpPassword || from.appPassword || '';
        if (!from.smtpHost || !pass) {
          skippedMailboxes.push({
            email: from.email,
            reason: 'SMTP sunucu hostu veya App Password (şifre) eksik'
          });
          return;
        }

        try {
          const dynamicTransporter = nodemailer.createTransport({
            host: from.smtpHost,
            port: from.smtpPort || 587,
            secure: from.smtpPort === 465,
            auth: { user: from.smtpUser || from.email, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000
          } as any);

          // NOT: Sağlayıcıların "warmup trafiği" olarak işaretleyebileceği X-Warmup özel başlıkları kaldırıldı.
          const mailOptions: any = {
            from: `${from.senderName || 'StarWebFlow'} <${from.email}>`,
            to: toEmail,
            subject: contentResult.subject,
            html: `${contentResult.body}\n<!-- swf-warmup-token: ${Date.now()} -->`
          };

          if (contentResult.inReplyTo) {
            mailOptions.inReplyTo = contentResult.inReplyTo;
            mailOptions.references = [contentResult.inReplyTo];
          }

          const info = await dynamicTransporter.sendMail(mailOptions);
          const sentMessageId = info.messageId || `<${Date.now()}@starwebflow.com>`;

          if (existingThread) {
            if (contentResult.isCompletedThread) {
              // Thread tamamlandı, kapat
              await prisma.emailWarmupThread.update({
                where: { id: existingThread.id },
                data: {
                  lastMessageId: sentMessageId,
                  messageCount: { increment: 1 },
                  status: 'COMPLETED'
                }
              });
              completedThreadsCount++;
              console.log(`[WARMUP THREAD COMPLETED] Thread başarıyla tamamlandı: ${existingThread.id}`);
            } else {
              await prisma.emailWarmupThread.update({
                where: { id: existingThread.id },
                data: {
                  lastMessageId: sentMessageId,
                  messageCount: { increment: 1 }
                }
              });
            }
          } else {
            await prisma.emailWarmupThread.create({
              data: {
                tenantId: sender.tenantId,
                mailboxId: sender.id,
                targetEmail: recipient.email,
                subject: contentResult.subject,
                lastMessageId: sentMessageId
              }
            });
          }

          outboundCount++;
          sendResults.push({
            from: from.email,
            to: toEmail,
            subject: contentResult.subject,
            success: true
          });

          // İlerleme ve Limit Güncelle
          await prisma.emailMailbox.update({
            where: { id: sender.id },
            data: {
              sentToday: { increment: 1 },
              warmupProgress: { increment: 2 },
              reputation: { increment: 1 }
            }
          });

          console.log(
            `[WARMUP SENT] ${sender.email} (${detectProvider(sender.email, sender.smtpHost)}) -> ${recipient.email} (${detectProvider(recipient.email, recipient.smtpHost)}) | Konu: ${contentResult.subject}`
          );
        } catch (sendErr: any) {
          console.error(`SMTP delivery error for ${sender.email}:`, sendErr?.message);
          sendResults.push({
            from: from.email,
            to: toEmail,
            subject: contentResult.subject,
            success: false,
            error: sendErr?.message || 'SMTP Gönderim Hatası'
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      forced: isForce,
      timing: organicTiming,
      stats: {
        inboundCount,
        rescuedCount,
        outboundCount,
        completedThreadsCount,
        totalMailboxes: mailboxes.length,
        activeSendersCount: activeSenders.length
      },
      sendResults,
      skippedMailboxes,
      message: `A++ Otonom Isıtma Tamamlandı! Okunan: ${inboundCount}, Spam'den Kurtarılan: ${rescuedCount}, Gönderilen (Çapraz Ağ): ${outboundCount}, Tamamlanan Diyalog: ${completedThreadsCount}`
    });
  } catch (error: any) {
    console.error('Smart Warmup Error:', error);
    return NextResponse.json({ error: error?.message || 'Isıtma hatası oluştu.' }, { status: 500 });
  }
}
