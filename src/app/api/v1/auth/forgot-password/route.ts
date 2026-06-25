import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

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

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const resetLink = `${origin}/auth/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_key') {
      try {
        await resend.emails.send({
          from: 'StarWebFlow <noreply@starwebflow.com>',
          to: email,
          subject: 'StarWebFlow Şifre Sıfırlama Talebi',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
              <h2 style="color: #8B5CF6;">Şifre Sıfırlama Talebi</h2>
              <p>Merhaba ${user.name},</p>
              <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi yenilemek için lütfen aşağıdaki butona tıklayın. Bu bağlantı 1 saat boyunca geçerlidir:</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetLink}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Şifremi Sıfırla</a>
              </div>
              <p style="font-size: 12px; color: #64748B;">Alternatif olarak bu bağlantıyı tarayıcınıza yapıştırabilirsiniz:<br/> ${resetLink}</p>
              <p style="font-size: 12px; color: #94A3B8; margin-top: 20px;">Bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
            </div>
          `
        });
        console.log(`Password reset email sent to ${email} via Resend.`);
      } catch (emailErr) {
        console.error('Failed to send password reset email via Resend:', emailErr);
      }
    } else {
      console.warn(`[DEV MODE] Password reset token generated for ${email}: ${token}`);
      console.warn(`[DEV MODE] Reset Link: ${resetLink}`);
    }

    return NextResponse.json({
      success: true,
      message: 'PASSWORD_RESET_EMAIL_SENT',
      data: {
        resetLinkSimulated: process.env.RESEND_API_KEY ? undefined : resetLink
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
