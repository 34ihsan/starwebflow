import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLink = `${appUrl}/api/auth/magic-link/verify?token=${token}`;

    // Test/Dev ortamı için konsola basıyoruz. Canlıda Resend veya SendGrid ile gönderilecek.
    console.log('✨ Magic Link Generated for:', email);
    console.log('👉', magicLink);

    // TODO: Send via Resend
    // await resend.emails.send({
    //   from: 'StarWebflow <login@starwebflow.com>',
    //   to: email,
    //   subject: 'Sihirli Giriş Bağlantınız',
    //   html: `<p>Merhaba ${user.name},</p><p>Aşağıdaki bağlantıya tıklayarak şifresiz giriş yapabilirsiniz:</p><p><a href="${magicLink}">${magicLink}</a></p>`,
    // });

    return NextResponse.json({ success: true, message: 'Sihirli bağlantı e-posta adresinize gönderildi.' });
  } catch (error: any) {
    console.error('Magic Link Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
