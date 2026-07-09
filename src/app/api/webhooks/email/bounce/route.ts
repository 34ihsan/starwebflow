import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Genel amaçlı Bounce (İletilemedi) ve Complaint (Spam Şikayeti) yakalama webhook'u.
// İleride Amazon SES, Sendgrid, Postmark vb. servislerle entegre edilebilir.
export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Not: Gerçek servislere göre payload yapısı değişecektir.
    // Bu yapı genel bir standart senaryodur.
    const type = payload.type; // 'Bounce' veya 'Complaint'
    const emailAddress = payload.emailAddress; // Hatanın geldiği/bounce eden bizim kendi mail adresimiz

    if (!emailAddress) {
      return NextResponse.json({ success: false, error: 'Email address missing' }, { status: 400 });
    }

    const mailbox = await prisma.emailMailbox.findFirst({
      where: { email: emailAddress }
    });

    if (!mailbox) {
      return NextResponse.json({ success: false, error: 'Mailbox not found' }, { status: 404 });
    }

    if (type === 'Bounce') {
      const newBounceCount = mailbox.bounceCount + 1;
      let isPaused = mailbox.isPaused;
      let status = mailbox.status;

      // OMNI-ROUTING KORUMASI
      // Eğer bir mailbox art arda çok fazla bounce alırsa (örneğin 5), kampanyalardan çıkar.
      if (newBounceCount >= 5) {
        isPaused = true;
        status = 'PAUSED';
        console.log(`[OMNI-ROUTING] Domain/Mailbox paused dynamically due to Bounce threshold: ${emailAddress}`);
      }

      await prisma.emailMailbox.update({
        where: { id: mailbox.id },
        data: {
          bounceCount: newBounceCount,
          isPaused,
          status
        }
      });
    } else if (type === 'Complaint') {
      const newSpamCount = mailbox.spamCount + 1;
      let isPaused = mailbox.isPaused;
      let status = mailbox.status;

      // Spam şikayetleri çok tehlikelidir, tolerans daha düşüktür (örneğin 2)
      if (newSpamCount >= 2) {
        isPaused = true;
        status = 'PAUSED';
        console.log(`[OMNI-ROUTING] Domain/Mailbox paused dynamically due to SPAM Complaint: ${emailAddress}`);
      }

      await prisma.emailMailbox.update({
        where: { id: mailbox.id },
        data: {
          spamCount: newSpamCount,
          isPaused,
          status,
          reputation: { decrement: 10 } // Spam repütasyonu çok düşürür
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
