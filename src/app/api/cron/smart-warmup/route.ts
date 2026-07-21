import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { processInboundEmails } from '@/lib/imap';
import { subscribeToNewsletters } from '@/lib/newsletter';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed serverless duration

const WARMUP_TOPICS = [
  "Yapay zekanın geleceği ve iş dünyasındaki etkileri",
  "Uzaktan çalışma modelleri ve verimlilik artırma",
  "Yeni çıkan kahve demleme teknikleri ve çekirdek türleri",
  "Sabah rutini alışkanlıkları ve odaklanma",
  "Hafta sonu doğa yürüyüşü ve seyahat tavsiyeleri",
  "Popüler bilim kurgu kitapları ve teknoloji trendleri",
  "Yazılım mimarisi ve bulut bilişimdeki yenilikler",
  "Dijital pazarlama ve sosyal medya stratejileri"
];

// Helper function to process array in parallel chunks (batching)
async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(item => fn(item).catch(err => {
      console.error(`Error in concurrent batch task:`, err);
      return null as any;
    })));
    results.push(...chunkResults);
  }
  return results.filter(Boolean);
}

export async function GET(req: Request) {
  // Optional CRON Secret authentication
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow query param bypass for manual admin dashboard trigger
    const url = new URL(req.url);
    if (url.searchParams.get('key') !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      // Allow internal calls from same origin / admin session
    }
  }

  try {
    // 1. Tüm aktif veya WARMUP statüsündeki mail kutularını çek
    const mailboxes = await prisma.emailMailbox.findMany({
      where: {
        OR: [
          { status: 'WARMUP' },
          { status: 'ACTIVE' }
        ],
        isPaused: false
      }
    });

    if (mailboxes.length === 0) {
      return NextResponse.json({ success: true, message: "Isıtılacak aktif veya WARMUP hesap bulunamadı." });
    }

    let inboundCount = 0;
    let outboundCount = 0;
    let rescuedCount = 0;

    // --- ADIM 1: PARALEL IMAP TARAMASI (BATCH SIZE: 4) ---
    // Her mail kutusu için 6 saniye timeout korumalı paralel IMAP kontolü
    await mapConcurrent(mailboxes, 4, async (mailbox) => {
      try {
        if (mailbox.warmupProgress === 0) {
          subscribeToNewsletters(mailbox.email).catch(() => {});
        }

        // IMAP Taraması (Inbox + Spam klasörü)
        const imapRes = await Promise.race([
          processInboundEmails({
            email: mailbox.email,
            imapHost: mailbox.imapHost || undefined,
            imapPort: mailbox.imapPort || undefined,
            imapUser: mailbox.imapUser || undefined,
            imapPassword: mailbox.imapPassword || undefined,
            appPassword: mailbox.appPassword || undefined
          }),
          new Promise<any>(resolve => setTimeout(() => resolve({ success: false, reason: 'Timeout (6s)' }), 6000))
        ]);

        if (imapRes && imapRes.success) {
          inboundCount += (imapRes.readCount || 0);
          rescuedCount += (imapRes.rescuedFromSpam || 0);

          const bounceIncrement = imapRes.bounceCount || 0;
          let newStatus = mailbox.status;
          let isPaused = mailbox.isPaused;

          // Bounce kuralı: 5+ ağır bounce durumunda hesabı karantinaya al
          if ((mailbox.bounceCount + bounceIncrement) >= 5) {
            newStatus = 'ERROR';
            isPaused = true;
            console.log(`[OMNI-ROUTING] Mailbox ${mailbox.email} paused due to excessive bounces.`);
          }

          await prisma.emailMailbox.update({
            where: { id: mailbox.id },
            data: {
              bounceCount: { increment: bounceIncrement },
              status: newStatus,
              isPaused,
              warmupProgress: { increment: Math.min(100, (imapRes.rescuedFromSpam || 0) * 3 + (imapRes.readCount || 0)) },
              reputation: { increment: Math.min(100, (imapRes.readCount || 0) + (imapRes.rescuedFromSpam || 0) * 2) },
              receivedToday: { increment: (imapRes.readCount || 0) + (imapRes.rescuedFromSpam || 0) }
            }
          });
        }
      } catch (boxErr) {
        console.error(`IMAP error for ${mailbox.email}:`, boxErr);
      }
    });

    // --- ADIM 2: PARALEL GÖNDERİM TRAFİĞİ (BATCH SIZE: 3) ---
    // Limitine ulaşmamış göndericileri belirle
    const activeSenders = mailboxes.filter(m => {
      if (m.isPaused || m.status === 'ERROR') return false;
      const dynamicLimit = Math.min(m.limit || 50, (m.warmupDay || 1) * 5 + 10);
      return (m.sentToday || 0) < dynamicLimit;
    });

    if (activeSenders.length >= 1) {
      const shuffledSenders = [...activeSenders].sort(() => 0.5 - Math.random());

      await mapConcurrent(shuffledSenders, 3, async (sender) => {
        // Alıcı seç (kendisi hariç başka bir mailbox)
        const possibleTargets = mailboxes.filter(m => m.id !== sender.id);
        if (possibleTargets.length === 0) return;
        const recipient = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

        // Kendi aralarında açık bir Thread var mı?
        const existingThread = await prisma.emailWarmupThread.findFirst({
          where: {
            mailboxId: sender.id,
            targetEmail: recipient.email,
            status: 'ACTIVE'
          }
        });

        let subject = "Selamlar!";
        let body = "Nasılsın, umarım her şey yolundadır.";
        let inReplyTo = undefined;

        try {
          if (existingThread) {
            inReplyTo = existingThread.lastMessageId;
            subject = existingThread.subject.startsWith('Re:') ? existingThread.subject : `Re: ${existingThread.subject}`;
            
            const { text: generatedEmail } = await generateText({
              model: getFlashModel(),
              system: `Sen profesyonel bir meslektaşsın ve meslektaşına kısa, doğal bir cevap yazıyorsun. Konu: "${existingThread.subject}". Sadece 1-2 cümlelik Türkçe cevap ver, HTML tag veya json verme.`,
              prompt: "Kısa yanıt yaz."
            });
            body = `<p>${generatedEmail.replace(/```/g, '').trim()}</p>`;
          } else {
            const topic = WARMUP_TOPICS[Math.floor(Math.random() * WARMUP_TOPICS.length)];
            const { text: generatedEmail } = await generateText({
              model: getFlashModel(),
              system: `Sen bir profesyonelsin. Konu: "${topic}". Pazarlama veya satış yapma. 2 paragraf kısa, samimi bir e-posta metni üret. Çıktı JSON olmalı: {"subject": "Konu", "body": "Html Gövde"}`,
              prompt: "E-posta üret."
            });

            let cleanJson = generatedEmail.trim();
            if (cleanJson.startsWith('```')) {
              cleanJson = cleanJson.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
            }
            const emailData = JSON.parse(cleanJson);
            subject = emailData.subject || "Günlük Güncelleme";
            body = emailData.body || "<p>Merhaba, iyi çalışmalar dilerim.</p>";
          }
        } catch (aiErr) {
          // AI zaman aşımına uğrarsa varsayılan şablon kullan (döngüyü kırma!)
          subject = existingThread ? `Re: ${existingThread.subject}` : "İş takibi & Proje Notları";
          body = "<p>Merhaba, gönderdiğiniz mesajı aldım. Detayları inceleyip tarafınıza dönüş sağlayacağım. İyi çalışmalar.</p>";
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
              connectionTimeout: 5000,
            } as any);

            const mailOptions: any = {
              from: `${sender.senderName || 'StarWebFlow'} <${sender.email}>`,
              to: recipient.email,
              subject,
              html: body,
            };

            if (inReplyTo) {
              mailOptions.inReplyTo = inReplyTo;
              mailOptions.references = [inReplyTo];
            }

            const info = await dynamicTransporter.sendMail(mailOptions);
            const sentMessageId = info.messageId || `<${Date.now()}@starwebflow.com>`;

            if (existingThread) {
              await prisma.emailWarmupThread.update({
                where: { id: existingThread.id },
                data: {
                  lastMessageId: sentMessageId,
                  messageCount: { increment: 1 }
                }
              });
            } else {
              await prisma.emailWarmupThread.create({
                data: {
                  tenantId: sender.tenantId,
                  mailboxId: sender.id,
                  targetEmail: recipient.email,
                  subject,
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
          } catch (sendErr: any) {
            console.error(`SMTP delivery error for ${sender.email}:`, sendErr?.message);
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Otonom Isıtma Tamamlandı! Okunan: ${inboundCount}, Spam'den Kurtarılan: ${rescuedCount}, Gönderilen (Paralel): ${outboundCount}`
    });

  } catch (error: any) {
    console.error('Smart Warmup Error:', error);
    return NextResponse.json({ error: error?.message || 'Isıtma hatası oluştu.' }, { status: 500 });
  }
}
