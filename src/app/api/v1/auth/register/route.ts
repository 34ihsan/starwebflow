import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/modules/auth/auth.service';
import crypto from 'crypto';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, recaptchaToken } = body;

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

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 400 });
    }

    // Assign to a default tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: 'default-tenant',
          name: 'StarWebFlow',
          slug: 'starwebflow',
        }
      });
    }

    // Create verification token
    const verificationToken = crypto.randomUUID();

    // Create User (unverified)
    const hashedPassword = await AuthService.hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        tenantId: tenant.id,
        role: 'CLIENT_MEMBER',
        emailVerified: false,
        verificationToken,
      }
    });

    // Doğrulama linkini belirle
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.starwebflow.com';
    const verifyLink = `${appUrl}/auth/verify-email?token=${verificationToken}`;

    // Mail gönder (Nodemailer + Hostinger SMTP)
    await sendVerificationEmail({
      to: email,
      name,
      verifyLink,
    }).catch((err) => console.error('Verification email failed:', err));

    console.log(`Verification email sent to ${email}.`);

    return NextResponse.json({
      success: true,
      message: 'VERIFICATION_EMAIL_SENT',
      data: {
        email: user.email
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
