import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { sendOutreachEmail } from '@/lib/email';
import { processInboundEmails } from '@/lib/imap';
import { subscribeToNewsletters } from '@/lib/newsletter';

// Konular listesi, AI'ın her defasında farklı bir tema üzerinden sohbet başlatması için
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

// Dış ajanslar ve web siteleri (Örnek listesi - Güvenlik amaçlı sınırlandırılmış)
const EXTERNAL_TARGET_AGENCIES = [
  "hello@digitalagency-hamburg.de",
  "contact@munich-webdesign.de",
  "info@berlin-seo-experts.de",
  "support@cologne-devs.de",
  "inquiries@frankfurt-marketing.de"
];

export async function GET(req: Request) {
  // CRON endpoint authentication
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Sadece "WARMUP" statüsünde olan ve günlük limitini doldurmamış hesapları çek
    const mailboxes = await prisma.emailMailbox.findMany({
      where: {
        status: 'WARMUP',
        sentToday: { lt: 50 } // Güvenlik limiti: Günde en fazla 50 warmup maili
      }
    });

    if (mailboxes.length === 0) {
      return NextResponse.json({ success: true, message: "Isıtılacak Warmup hesabı bulunamadı." });
    }

    let inboundCount = 0;
    let outboundCount = 0;

    // --- ADIM 1: GİRİŞ TRAFİĞİ (INBOUND NEWSLETTER & IMAP CHECK) ---
    for (const mailbox of mailboxes) {
      // Yeni eklenen mailler (warmupProgress === 0) için otomatik bülten kaydı tetikle
      if (mailbox.warmupProgress === 0) {
        await subscribeToNewsletters(mailbox.email);
      }

      // IMAP üzerinden bülten onaylama ve mailleri okuma simülasyonu
      const imapRes = await processInboundEmails({
        email: mailbox.email,
        imapHost: mailbox.imapHost || undefined,
        imapPort: mailbox.imapPort || undefined,
        imapUser: mailbox.imapUser || undefined,
        imapPassword: mailbox.imapPassword || undefined,
        appPassword: mailbox.appPassword || undefined
      });

      if (imapRes.success) {
        inboundCount += (imapRes.confirmedCount || 0) + (imapRes.readCount || 0);
        // İtibarı başarılı okuma işlemine göre güncelle
        await prisma.emailMailbox.update({
          where: { id: mailbox.id },
          data: {
            warmupProgress: { increment: imapRes.confirmedCount || 0 },
            reputation: { increment: Math.min(5, imapRes.readCount || 0) }
          }
        });
      }
    }

    // --- ADIM 2: ÇIKIŞ TRAFİĞİ (PAIRED WARMUP & EXTERNAL OUTBOUND) ---
    if (mailboxes.length >= 2) {
      // Hesapları rastgele karıştır
      const shuffled = [...mailboxes].sort(() => 0.5 - Math.random());

      // Hesapları çiftler halinde eşleştir ve birbirlerine mail attır
      for (let i = 0; i < shuffled.length; i += 2) {
        const sender = shuffled[i];
        const recipient = shuffled[i + 1];

        if (!sender || !recipient) continue;
        if (sender.sentToday >= sender.limit) continue;

        // %20 olasılıkla veya havuz dışı gerçek bir ajansa "Proje Teklif Talebi" gönder (External Outbound)
        const isExternalOutbound = Math.random() < 0.2;
        let targetEmail = recipient.email;
        let isRealExternal = false;

        if (isExternalOutbound) {
          // Zaten contacted olmayan bir dış hedef seç
          const contacted = await prisma.emailWarmupContactLog.findMany();
          const contactedEmails = contacted.map(c => c.email);
          const availableTargets = EXTERNAL_TARGET_AGENCIES.filter(e => !contactedEmails.includes(e));

          if (availableTargets.length > 0) {
            targetEmail = availableTargets[Math.floor(Math.random() * availableTargets.length)];
            isRealExternal = true;
          }
        }

        let subject = "Selamlar!";
        let body = "Nasılsın, umarım her şey yolundadır.";

        if (isRealExternal) {
          // Dış siteler için Gemini ile gerçekçi iş teklifi maili oluştur
          const { text: generatedEmail } = await generateText({
            model: getFlashModel(),
            system: `Sen bir potansiyel müşterisin ve bir web tasarım/yazılım ajansına projen hakkında fiyat teklifi almak için yazıyorsun.
Kurallar:
1. Kesinlikle otomatik/bot maili gibi görünmesin. Son derece doğal olsun.
2. Web tasarım, Next.js portal, mobil uygulama veya SEO gibi makul bir hizmet talep et.
3. Çıktıyı JSON formatında ver. Örn: {"subject": "Konu Başlığı", "body": "Html Gövde"}`,
            prompt: "Lütfen teklif talebi e-postasını oluştur."
          });

          try {
            const emailData = JSON.parse(generatedEmail);
            subject = emailData.subject || "Next.js Web Projesi Teklif Talebi";
            body = emailData.body || "Merhaba, web sitemiz için yenileme teklifi almak istiyoruz.";
          } catch (err) {
            console.error("Failed to parse AI external warmup email", err);
          }
        } else {
          // Kendi aralarında normal sohbet konusu
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

          try {
            const emailData = JSON.parse(generatedEmail);
            subject = emailData.subject;
            body = emailData.body;
          } catch (err) {
            console.error("Failed to parse AI warmup email JSON", err);
          }
        }

        // Maili gönder (Artık SMTP kullanılıyor)
        try {
          await sendOutreachEmail({
            from: sender.email,
            to: targetEmail,
            subject,
            html: body,
          });
        } catch (error) {
          console.error("Warmup email sending failed via SMTP", error);
        }

        // İstatistikleri güncelle
        await prisma.emailMailbox.update({
          where: { id: sender.id },
          data: {
            sentToday: { increment: 1 },
            warmupProgress: { increment: 1 },
            reputation: { increment: 1 }
          }
        });

        if (isRealExternal) {
          // Dış hedef logu ekle (Tekrar mail atmamak için)
          await prisma.emailWarmupContactLog.create({
            data: { email: targetEmail }
          });
        } else {
          // Alıcı da veritabanında kayıtlı olduğu için onun da ilerlemesini güncelle
          await prisma.emailMailbox.update({
            where: { id: recipient.id },
            data: {
              warmupProgress: { increment: 1 },
              reputation: { increment: 1 }
            }
          });
        }

        outboundCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Isıtma işlemi tamamlandı. Giriş Etkileşimi: ${inboundCount}, Gönderilen Mail: ${outboundCount}`
    });

  } catch (error: any) {
    console.error('Smart Warmup Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
