import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendMagicLinkEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gerekli.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Güvenlik amacıyla kullanıcı yoksa bile başarılı dönüyoruz (User enumeration engellemek için)
      return NextResponse.json({ success: true, message: 'Eğer bu e-posta sistemde kayıtlıysa, sihirli giriş bağlantısı gönderildi.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

    await prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.starwebflow.com';
    const magicLink = `${appUrl}/api/auth/magic-link/verify?token=${token}`;

    // Mail gönder (Nodemailer + Hostinger SMTP)
    const mailResult = await sendMagicLinkEmail({
      to: email,
      name: user.name || email,
      magicLink,
    });

    if (!mailResult.success && !mailResult.simulated) {
      console.error('[Magic Link] Mail gönderilemedi:', mailResult.error);
      // Mail gönderimi başarısız olsa bile token oluşturuldu, devam ediyoruz
    }

    console.log('[Magic Link] ✅ Link oluşturuldu:', email, '→', magicLink);
    return NextResponse.json({ success: true, message: 'Sihirli bağlantı e-posta adresinize gönderildi.' });
  } catch (error: any) {
    console.error('Magic Link Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
