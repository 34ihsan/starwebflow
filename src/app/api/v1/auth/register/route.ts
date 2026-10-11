import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/modules/auth/auth.service';
import crypto from 'crypto';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendVerificationEmail } from '@/lib/email';

import { verifyEmailSafely, verifyNameSafely } from '@/lib/utils/email-validator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, recaptchaToken, hp_check } = body;

    // 1. Honeypot Bot Trap (İnsanların göremediği ama botların doldurduğu gizli alan)
    if (hp_check) {
      console.warn(`[BOT BLOCKED] Honeypot field filled during registration: ${email}`);
      return NextResponse.json({ success: true, message: 'VERIFICATION_EMAIL_SENT' });
    }

    // 2. reCAPTCHA doğrulaması
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

    // 3. İsim Doğrulaması (Sahte veya tek harfli bot isimlerini engelle)
    const nameCheck = verifyNameSafely(name);
    if (!nameCheck.isValid) {
      return NextResponse.json({ success: false, error: nameCheck.reason }, { status: 400 });
    }

    // 4. Canlı E-posta Doğrulaması (Format, Geçici Mail Servisleri & Canlı DNS MX Kontrolü)
    const emailCheck = await verifyEmailSafely(email);
    if (!emailCheck.isValid) {
      return NextResponse.json({ success: false, error: emailCheck.reason }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });
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
        email: cleanEmail,
        name: cleanName,
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
