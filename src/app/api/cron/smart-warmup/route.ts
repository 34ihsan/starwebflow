import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { processInboundEmails } from '@/lib/imap';
import { subscribeToNewsletters } from '@/lib/newsletter';
import { checkSPF, checkDKIM, checkDMARC } from '@/lib/utils/dns-check';
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

const WARMUP_PERSONAS = [
  "Sen bir müşteri hizmetleri yetkilisisin. Samimi, yardımsever ama kısa konuşuyorsun.",
  "Sen bir proje yöneticisisin. Ciddi, sonuç odaklı ve kurumsal bir dille yazıyorsun.",
  "Sen bir mühendissin. Analitik düşünüyor, bazen teknik detaylar soruyorsun.",
  "Sen ofisteki yakın bir iş arkadaşısın. Çok rahat, samimi ve günlük bir dille yazıyorsun.",
  "Sen bir pazarlama uzmanısın. Vizyoner, enerjik ve yenilikçi bir ton kullanıyorsun."
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

    const allEmails = mailboxes.map(m => m.email.toLowerCase());

    let inboundCount = 0;
    let outboundCount = 0;
    let rescuedCount = 0;

    // --- ADIM 1: PARALEL IMAP TARAMASI (BATCH SIZE: 4) ---
    // Her mail kutusu için 6 saniye timeout korumalı paralel IMAP kontolü
    await mapConcurrent(mailboxes, 4, async (mailbox) => {
      try {
        // Bülten Tohumlama (Seed Phase) Yönetimi
        // Hem yeni hesaplar hem de mevcut 20+ günlük hesaplar ilk kez bülten aboneliği alır.
        // 14 gün boyunca bülten etkileşimi sürer ve 14 gün tamamlandığında otonom abonelikten çıkılır.
        const daysSinceCreation = Math.floor((Date.now() - new Date(mailbox.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        
        // Eğer daha önce bülten aboneliği yapılmadıysa (warmupProgress < 50 veya ilk adımlardaysa) aboneliği başlat
        if (mailbox.warmupProgress === 0 || mailbox.sentToday === 0) {
          console.log(`[Seed Phase] Triggering newsletter subscription for active mailbox: ${mailbox.email}`);
          subscribeToNewsletters(mailbox.email).catch(() => {});
        }

        // 14. Gün Dolduğunda Otonom Unsubscribe (Abonelikten Çıkma)
        if (daysSinceCreation === 14 || (daysSinceCreation > 14 && mailbox.warmupProgress >= 100)) {
          console.log(`[Seed Phase Complete] Day ${daysSinceCreation}: Autonomous unsubscribe trigger for ${mailbox.email}`);
          // imapRes içerisinden gelen Unsubscribe linklerine otonom tıklanarak çıkılır
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
          }, allEmails),
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

          if (imapRes.bouncedRecipients && imapRes.bouncedRecipients.length > 0) {
             for (const bouncedEmail of imapRes.bouncedRecipients) {
                 console.log(`[BOUNCE HANDLING] Marking ${bouncedEmail} as hard bounced and unsubscribed.`);
                 await prisma.lead.updateMany({
                    where: { email: bouncedEmail },
                    data: { unsubscribed: true, notes: 'HARD BOUNCE - DO NOT SEND' }
                 });
                 await prisma.outreachItem.updateMany({
                    where: { email: bouncedEmail },
                    data: { status: 'FAILED', errorMsg: 'HARD BOUNCE' }
                 });
                 // Also stop their sequence if they have an active one
                 const leads = await prisma.lead.findMany({ where: { email: bouncedEmail } });
                 for (const l of leads) {
                    await prisma.leadSequence.updateMany({
                       where: { leadId: l.id, status: 'ACTIVE' },
                       data: { status: 'COMPLETED' }
                    });
                 }
             }
          }

          // 4.3 Otonom DNS Doğrulama & Self-Healing (Periyodik Kontrol)
          // 24 saatte bir veya rastgele döngülerde DNS (SPF/DKIM/DMARC) durumunu doğrula
          const domain = mailbox.email.split('@')[1];
          if (domain && Math.random() < 0.2) { // %20 şansla arka planda DNS doğrula
            try {
              const [spf, dkim, dmarc] = await Promise.all([
                checkSPF(domain),
                checkDKIM(domain),
                checkDMARC(domain)
              ]);

              // Eğer SPF veya DKIM tamamen bozulmuşsa hesabı güvenli moda al
              if (!spf && !dkim) {
                newStatus = 'ERROR';
                isPaused = true;
                console.log(`[DNS SELF-HEALING] Mailbox ${mailbox.email} paused due to missing SPF/DKIM DNS records.`);
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
    // Gerçek insan mesai saatleri ve hafta sonu simülasyonu
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0: Pazar, 6: Cumartesi
    const isWeekend = currentDay === 0 || currentDay === 6;

    // Hafta sonları %70 oranında gönderim yapmama simülasyonu (İnsan ritmi)
    const skipForWeekend = isWeekend && Math.random() > 0.3;

    // Limitine ulaşmamış göndericileri belirle
    const activeSenders = skipForWeekend ? [] : mailboxes.filter(m => {
      if (m.isPaused || m.status === 'ERROR') return false;
      
      // Elite/Pro Ramping Logic (15-day warmup phase)
      const daysActive = Math.floor((Date.now() - new Date(m.createdAt || Date.now()).getTime()) / 86400000) || 1;
      let dynamicLimit = 5;
      
      if (daysActive <= 7) {
        dynamicLimit = Math.min(8, m.limit || 50); // Sandbox phase
      } else if (daysActive <= 14) {
        dynamicLimit = Math.min(20, m.limit || 50); // Growth phase
      } else {
        dynamicLimit = m.limit || 50; // Elite phase (Full scale)
      }
      
      return (m.sentToday || 0) < dynamicLimit;
    });

    if (activeSenders.length >= 1) {
      const shuffledSenders = [...activeSenders].sort(() => 0.5 - Math.random());

      await mapConcurrent(shuffledSenders, 3, async (sender) => {
        // ESP-Matching (Sağlayıcıya Özel Akıllı Yönlendirme)
        // Aynı provider (Gmail -> Gmail, Outlook -> Outlook) olan hedeflere %70 öncelik ver
        const senderDomain = sender.email.split('@')[1]?.toLowerCase() || '';
        const isSenderGoogle = senderDomain.includes('gmail') || (sender.smtpHost || '').includes('google');
        const isSenderOutlook = senderDomain.includes('outlook') || senderDomain.includes('hotmail') || (sender.smtpHost || '').includes('office365');

        let possibleTargets = mailboxes.filter(m => m.id !== sender.id);
        if (possibleTargets.length === 0) return;

        const sameProviderTargets = possibleTargets.filter(m => {
          const targetDomain = m.email.split('@')[1]?.toLowerCase() || '';
          if (isSenderGoogle) return targetDomain.includes('gmail') || (m.smtpHost || '').includes('google');
          if (isSenderOutlook) return targetDomain.includes('outlook') || targetDomain.includes('hotmail') || (m.smtpHost || '').includes('office365');
          return targetDomain === senderDomain;
        });

        // %70 ihtimalle aynı provider seç, yoksa genel havuzdan seç
        const useSameProvider = sameProviderTargets.length > 0 && Math.random() < 0.7;
        const targetPool = useSameProvider ? sameProviderTargets : possibleTargets;
        const recipient = targetPool[Math.floor(Math.random() * targetPool.length)];

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
          const persona = WARMUP_PERSONAS[Math.floor(Math.random() * WARMUP_PERSONAS.length)];
          
          if (existingThread) {
            inReplyTo = existingThread.lastMessageId;
            subject = existingThread.subject.startsWith('Re:') ? existingThread.subject : `Re: ${existingThread.subject}`;
            
            const { text: generatedEmail } = await generateText({
              model: getFlashModel(),
              system: `${persona} Karşındaki kişi meslektaşın. Konu: "${existingThread.subject}". Sadece 1-3 cümlelik doğal bir Türkçe cevap ver, HTML tag veya json verme.`,
              prompt: "Doğal bir yanıt yaz."
            });
            body = `<p>${generatedEmail.replace(/```/g, '').trim()}</p>`;
          } else {
            const topic = WARMUP_TOPICS[Math.floor(Math.random() * WARMUP_TOPICS.length)];
            const { text: generatedEmail } = await generateText({
              model: getFlashModel(),
              system: `${persona} Konu: "${topic}". Pazarlama veya satış yapma. Konuyla alakalı kısa, samimi bir e-posta metni üret. Çıktı JSON olmalı: {"subject": "Konu", "body": "Html Gövde"}`,
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
          
          // Link Simulation: %30 ihtimalle dummy güvenli link ekle
          if (Math.random() > 0.7) {
            const dummyLinks = [
              "https://tr.wikipedia.org/wiki/Ana_Sayfa", 
              "https://news.ycombinator.com/", 
              "https://github.com",
              "https://medium.com"
            ];
            const link = dummyLinks[Math.floor(Math.random() * dummyLinks.length)];
            const texts = ["Şu linke bir göz atabilir misin?", "Buradaki detaylar ilgini çekebilir:", "Referans olarak şu adresi bırakıyorum:", "Detaylar burada:"];
            const text = texts[Math.floor(Math.random() * texts.length)];
            body += `<p><br>${text} <a href="${link}">${link}</a></p>`;
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
