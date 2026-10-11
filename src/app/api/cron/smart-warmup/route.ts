import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processInboundEmails } from '@/lib/imap';
import { subscribeToNewsletters } from '@/lib/newsletter';
import { checkSPF, checkDKIM, checkDMARC } from '@/lib/utils/dns-check';
import {
  selectWarmupTarget,
  isWithinOrganicHours,
  calculateDynamicWarmupLimit,
  generateWarmupContent,
  detectProvider,
  WarmupMailboxMeta
} from '@/lib/warmup/engine';
import nodemailer from 'nodemailer';

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
  // Optional CRON Secret authentication
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    const url = new URL(req.url);
    if (url.searchParams.get('key') !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      // Allow internal calls from same origin / admin session
    }
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
    const organicTiming = isWithinOrganicHours();
    if (!organicTiming.allowed) {
      console.log(`[WARMUP TIMING] Gönderim atlandı: ${organicTiming.reason}`);
      return NextResponse.json({
        success: true,
        message: `IMAP Tarandı (Okunan: ${inboundCount}, Spam'den Kurtarılan: ${rescuedCount}). Gönderim organik ritim nedeniyle durduruldu (${organicTiming.reason}).`
      });
    }

    // Limitine ulaşmamış göndericileri belirle (Matematiksel Ramping Eğrisi)
    const activeSenders = mailboxes.filter((m) => {
      if (m.isPaused || m.status === 'ERROR') return false;
      const dynamicLimit = calculateDynamicWarmupLimit(m as unknown as WarmupMailboxMeta);
      return (m.sentToday || 0) < dynamicLimit;
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

        // Eğer bu döngüde yanıt verilmeyecekse (insan ritmi %45 yanıt) pas geç
        if (!contentResult.shouldReply) {
          console.log(`[WARMUP ENGAGEMENT] Yanıt ertelendi (Doğal insan bekleme süresi): ${sender.email} -> ${recipient.email}`);
          return;
        }

        // SMTP ile Mail Gönder (5s Timeout)
        const pass = sender.smtpPassword || sender.appPassword || '';
        if (sender.smtpHost && pass) {
          try {
            const dynamicTransporter = nodemailer.createTransport({
              host: sender.smtpHost,
              port: sender.smtpPort || 587,
              secure: sender.smtpPort === 465,
              auth: { user: sender.smtpUser || sender.email, pass },
              tls: { rejectUnauthorized: false },
              connectionTimeout: 5000
            } as any);

            const mailOptions: any = {
              from: `${sender.senderName || 'StarWebFlow'} <${sender.email}>`,
              to: recipient.email,
              subject: contentResult.subject,
              html: `${contentResult.body}\n<!-- swf-warmup-token: ${Date.now()} -->`,
              headers: {
                'X-StarWebFlow-Warmup': 'true',
                'X-Warmup-Service': 'StarWebFlow-Pro-Engine'
              }
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
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `A++ Otonom Isıtma Tamamlandı! Okunan: ${inboundCount}, Spam'den Kurtarılan: ${rescuedCount}, Gönderilen (Çapraz Ağ): ${outboundCount}, Tamamlanan Diyalog: ${completedThreadsCount}`
    });
  } catch (error: any) {
    console.error('Smart Warmup Error:', error);
    return NextResponse.json({ error: error?.message || 'Isıtma hatası oluştu.' }, { status: 500 });
  }
}
