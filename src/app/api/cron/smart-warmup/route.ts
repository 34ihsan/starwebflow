import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { processInboundEmails } from '@/lib/imap';
import { subscribeToNewsletters } from '@/lib/newsletter';
import nodemailer from 'nodemailer';

const WARMUP_TOPICS = [
  "Yapay zekanın geleceği ve iş dünyasındaki etkileri",
  "Uzaktan çalışma modelleri ve ofise dönüş tartışmaları",
  "Yeni çıkan kahve demleme teknikleri ve çekirdek türleri",
  "Sabah rutini alışkanlıkları ve verimlilik artırma",
  "Hafta sonu doğa yürüyüşü ve kamp tavsiyeleri",
  "Popüler bilim kurgu filmleri ve dizileri",
  "Evcil hayvan bakımı ve komik anılar",
  "Elektrikli araçların yükselişi ve teknolojik yenilikler"
];

export async function GET(req: Request) {
  // CRON endpoint authentication
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Tüm aktif WARMUP hesaplarını çek
    const mailboxes = await prisma.emailMailbox.findMany({
      where: {
        status: 'WARMUP',
        isPaused: false
      }
    });

    if (mailboxes.length === 0) {
      return NextResponse.json({ success: true, message: "Isıtılacak aktif hesap bulunamadı." });
    }

    let inboundCount = 0;
    let outboundCount = 0;
    let rescuedCount = 0;

    // --- ADIM 1: GİRİŞ TRAFİĞİ (IMAP SPAM RESCUE & BOUNCE) ---
    for (const mailbox of mailboxes) {
      if (mailbox.warmupProgress === 0) {
        await subscribeToNewsletters(mailbox.email);
      }

      // IMAP Taraması (Inbox + Spam klasörü)
      const imapRes = await processInboundEmails({
        email: mailbox.email,
        imapHost: mailbox.imapHost || undefined,
        imapPort: mailbox.imapPort || undefined,
        imapUser: mailbox.imapUser || undefined,
        imapPassword: mailbox.imapPassword || undefined,
        appPassword: mailbox.appPassword || undefined
      });

      if (imapRes.success) {
        inboundCount += (imapRes.readCount || 0);
        rescuedCount += (imapRes.rescuedFromSpam || 0);

        // Omni-Routing Failover: Bounce tespiti
        const bounceIncrement = imapRes.bounceCount || 0;
        let newStatus = mailbox.status;
        let isPaused = mailbox.isPaused;

        // Eşik değeri: Çok fazla bounce aldıysa hesabı durdur
        if ((mailbox.bounceCount + bounceIncrement) >= 5) {
          newStatus = 'PAUSED';
          isPaused = true;
          console.log(`[OMNI-ROUTING] Mailbox ${mailbox.email} paused due to excessive bounces!`);
        }

        await prisma.emailMailbox.update({
          where: { id: mailbox.id },
          data: {
            bounceCount: { increment: bounceIncrement },
            status: newStatus,
            isPaused,
            warmupProgress: { increment: (imapRes.rescuedFromSpam || 0) * 2 }, // Spam'den kurtarma x2 puan
            reputation: { increment: (imapRes.readCount || 0) + (imapRes.rescuedFromSpam || 0) * 3 },
            receivedToday: { increment: (imapRes.readCount || 0) + (imapRes.rescuedFromSpam || 0) }
          }
        });

        // Hatalı (Bounce'a sebep olan) hedefleri otomatik dondur (Omni-Routing 100% Anti-Bounce)
        if (imapRes.bouncedRecipients && imapRes.bouncedRecipients.length > 0) {
          for (const badTarget of imapRes.bouncedRecipients) {
            await prisma.emailMailbox.updateMany({
              where: { email: badTarget },
              data: { isPaused: true, status: 'ERROR', bounceCount: { increment: 5 } } // Anında dondur
            });
            console.log(`[OMNI-ROUTING] CATASTROPHIC BOUNCE PREVENTED: Auto-paused target ${badTarget} based on bounce report from ${mailbox.email}`);
          }
        }
      }
    }

    // --- ADIM 2: ÇIKIŞ TRAFİĞİ (ALGORITHMIC RAMP-UP & THREADING) ---
    
    // Güvenlik & Algoritma: Sadece günlük dinamik limiti dolmamış olanları gönderici yap
    // Kural: warmupDay * 2 adede kadar gönder (Max: maxDailyLimit)
    const activeSenders = mailboxes.filter(m => {
      if (m.isPaused || m.status !== 'WARMUP') return false;
      const dynamicLimit = Math.min(m.maxDailyLimit, m.warmupDay * 2);
      return m.sentToday < dynamicLimit;
    });

    if (activeSenders.length >= 1 && mailboxes.length >= 2) {
      // Göndericileri karıştır
      const shuffled = [...activeSenders].sort(() => 0.5 - Math.random());

      for (let i = 0; i < shuffled.length; i++) {
        const sender = shuffled[i];
        
        // Rastgele başka bir mailbox seç (kendisi hariç)
        const possibleTargets = mailboxes.filter(m => m.id !== sender.id);
        if (possibleTargets.length === 0) continue;
        const recipient = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

        // Kendi aralarında açık bir Thread (Zincir) var mı kontrol et
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
        let isReply = false;

        try {
          if (existingThread) {
            // YANIT (THREAD) OLUŞTUR
            isReply = true;
            inReplyTo = existingThread.lastMessageId;
            subject = existingThread.subject.startsWith('Re:') ? existingThread.subject : `Re: ${existingThread.subject}`;
            
            const { text: generatedEmail } = await generateText({
              model: getFlashModel(),
              system: `Sen bir çalışansın ve meslektaşına önceki maile kısa bir cevap yazıyorsun. Konu: "${existingThread.subject}".
Kurallar:
1. Kısa tut (1-2 paragraf).
2. Sadece HTML formatında <body> içeriğini ver, JSON döndürme, sadece metin.`,
              prompt: "Lütfen e-postayı oluştur."
            });
            body = generatedEmail.replace(/```html/g, '').replace(/```/g, '');
          } else {
            // YENİ KONU BAŞLAT
            const topic = WARMUP_TOPICS[Math.floor(Math.random() * WARMUP_TOPICS.length)];
            const { text: generatedEmail } = await generateText({
              model: getFlashModel(),
              system: `Sen bir çalışansın ve meslektaşına günlük sıradan bir konu hakkında e-posta yazıyorsun. Konu: "${topic}".
Kurallar:
1. Pazarlama veya satış KESİNLİKLE YAPMA.
2. 2-3 paragrafı geçmesin. Samimi bir dil kullan.
3. Çıktıyı JSON formatında ver. Örn: {"subject": "Konu Başlığı", "body": "Html Gövde"}`,
              prompt: "Lütfen e-postayı oluştur."
            });

            let cleanJson = generatedEmail.trim();
            if (cleanJson.startsWith('```')) {
              cleanJson = cleanJson.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
            }
            const emailData = JSON.parse(cleanJson);
            subject = emailData.subject || "Warmup Mesajı";
            body = emailData.body || "Merhaba, iyi çalışmalar dilerim.";
          }
        } catch (err) {
          console.error("AI Thread/Mail generation failed", err);
          continue; // AI çöktüyse mail atma
        }

        // Maili gönder (Kendi SMTP ayarlarıyla)
        try {
          if (sender.smtpHost && (sender.smtpPassword || sender.appPassword)) {
            const dynamicTransporter = nodemailer.createTransport({
              host: sender.smtpHost,
              port: sender.smtpPort || 587,
              secure: sender.smtpPort === 465,
              auth: { user: sender.smtpUser || sender.email, pass: sender.smtpPassword || sender.appPassword },
              tls: { rejectUnauthorized: false }
            } as any);
            
            const mailOptions: any = {
              from: `${sender.senderName || 'StarWebflow'} <${sender.email}>`,
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

            // Thread kaydını veritabanında güncelle/oluştur
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
                  subject: subject,
                  lastMessageId: sentMessageId
                }
              });
            }

            outboundCount++;
            
            // Limit Güncelle
            await prisma.emailMailbox.update({
              where: { id: sender.id },
              data: {
                sentToday: { increment: 1 },
                warmupProgress: { increment: 1 }
              }
            });
          }
        } catch (error) {
          console.error(`SMTP sending failed for ${sender.email}`, error);
          // Hata durumunda (yanlış şifre vb.) hata sayacını artırıp PAUSE edebiliriz.
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `P2P Isıtma tamamlandı. Okunan/Yıldızlanan: ${inboundCount}, Spam'den Kurtarılan: ${rescuedCount}, Gönderilen Mail (Threaded): ${outboundCount}`
    });

  } catch (error: any) {
    console.error('Smart Warmup Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
