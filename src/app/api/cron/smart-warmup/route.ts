import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { Resend } from 'resend';

// Resend initialization (Ensure RESEND_API_KEY is available)
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

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

    if (mailboxes.length < 2) {
      return NextResponse.json({ success: true, message: "Eşleşecek yeterli Warmup hesabı bulunamadı." });
    }

    // Hesapları rastgele karıştır
    const shuffled = [...mailboxes].sort(() => 0.5 - Math.random());
    let sentCount = 0;

    // Hesapları çiftler halinde eşleştir ve birbirlerine mail attır
    for (let i = 0; i < shuffled.length; i += 2) {
      const sender = shuffled[i];
      const recipient = shuffled[i + 1];

      if (!sender || !recipient) continue;

      // Gönderici için limit kontrolü (emin olmak adına)
      if (sender.sentToday >= sender.limit) continue;

      // Rastgele bir konu seç
      const topic = WARMUP_TOPICS[Math.floor(Math.random() * WARMUP_TOPICS.length)];

      // AI ile "Human-like" bir mail içeriği oluştur
      const { text: generatedEmail } = await generateText({
        model: getFlashModel(),
        system: `Sen bir çalışansın ve meslektaşına (veya arkadaşına) günlük sıradan bir konu hakkında e-posta yazıyorsun. Konu: "${topic}".
Amacımız: İki gerçek insan konuşuyormuş gibi hissettirmek.
Kurallar:
1. Pazarlama veya satış KESİNLİKLE YAPMA.
2. 2-3 paragrafı geçmesin. Samimi bir dil kullan.
3. Çıktıyı JSON formatında ver. Örn: {"subject": "Konu Başlığı", "body": "Html Gövde"}`,
        prompt: "Lütfen e-postayı oluştur."
      });

      let emailData;
      try {
        emailData = JSON.parse(generatedEmail);
      } catch (err) {
        console.error("Failed to parse AI warmup email JSON", err);
        continue;
      }

      // Maili gönder (Gerçek ortamda resend.emails.send() çalışır)
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_key') {
        await resend.emails.send({
          from: sender.email,
          to: [recipient.email],
          subject: emailData.subject || "Selamlar!",
          html: emailData.body || "Nasılsın, umarım her şey yolundadır.",
        });
      }

      // İstatistikleri güncelle (Hem gönderici hem de alıcı etkileşimi simüle edilir)
      await prisma.emailMailbox.update({
        where: { id: sender.id },
        data: {
          sentToday: { increment: 1 },
          warmupProgress: { increment: 1 },
          reputation: { increment: 1 } // Reputasyon da artar
        }
      });
      
      await prisma.emailMailbox.update({
        where: { id: recipient.id },
        data: {
          warmupProgress: { increment: 1 },
          reputation: { increment: 1 } // Alıcı olarak inbox aktivitesi de reputasyonu artırır
        }
      });

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} adet Smart Warmup e-postası başarıyla gönderildi ve skorlar güncellendi.`
    });

  } catch (error: any) {
    console.error('Smart Warmup Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
