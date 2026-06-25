import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/modules/auth/auth.service';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

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

    // Determine absolute verification link
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const verifyLink = `${origin}/auth/verify-email?token=${verificationToken}`;

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_key') {
      try {
        await resend.emails.send({
          from: 'StarWebFlow <noreply@starwebflow.com>',
          to: email,
          subject: 'StarWebFlow E-posta Doğrulama',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
              <h2 style="color: #8B5CF6;">E-posta Adresinizi Doğrulayın</h2>
              <p>Merhaba ${name},</p>
              <p>StarWebFlow platformuna başarıyla kayıt oldunuz. Hesabınızı etkinleştirmek ve sisteme giriş yapabilmek için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın:</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${verifyLink}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">E-posta Doğrula</a>
              </div>
              <p style="font-size: 12px; color: #64748B;">Alternatif olarak bu bağlantıyı tarayıcınıza yapıştırabilirsiniz:<br/> ${verifyLink}</p>
            </div>
          `
        });
        console.log(`Verification email sent to ${email} via Resend.`);
      } catch (emailErr) {
        console.error('Failed to send verification email via Resend:', emailErr);
      }
    } else {
      console.warn(`[DEV MODE] Verification token generated for ${email}: ${verificationToken}`);
      console.warn(`[DEV MODE] Verification Link: ${verifyLink}`);
    }

    return NextResponse.json({
      success: true,
      message: 'VERIFICATION_EMAIL_SENT',
      data: {
        email: user.email,
        verifyLinkSimulated: process.env.RESEND_API_KEY ? undefined : verifyLink
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
