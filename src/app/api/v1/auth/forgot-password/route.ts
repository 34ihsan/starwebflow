import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, recaptchaToken } = body;

    // reCAPTCHA doğrulaması
    if (recaptchaToken) {
      const captcha = await verifyRecaptcha(recaptchaToken);
      if (!captcha.success) {
        return NextResponse.json({
          success: false,
          error: captcha.error || 'Bot doğrulaması başarısız.'
        }, { status: 400 });
      }
    }

    if (!email) {
      return NextResponse.json({ success: false, error: 'E-posta adresi zorunludur.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // To prevent user enumeration attacks, return a success message even if email is not found
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'PASSWORD_RESET_EMAIL_SENT'
      });
    }

    // Create a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 Hour from now

    // Save token in DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.starwebflow.com';
    const resetLink = `${appUrl}/auth/reset-password?token=${token}`;

    // Mail gönder (Nodemailer + Hostinger SMTP)
    await sendPasswordResetEmail({
      to: email,
      name: user.name || email,
      resetLink,
    }).catch((err) => console.error('Password reset email failed:', err));

    return NextResponse.json({
      success: true,
      message: 'PASSWORD_RESET_EMAIL_SENT',
      data: {}
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
