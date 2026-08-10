import { NextResponse } from 'next/server';
import { sendContactFormNotification } from '@/lib/email';
import { verifyEmailSafely } from '@/lib/utils/email-validator';

/**
 * POST /api/email/contact
 *
 * CTABanner ve LeadFormModal iletişim formlarından gelen verileri doğrular ve iletir:
 *  - Honeypot bot engelleme
 *  - Canlı MX ve Disposable Mail Doğrulaması
 *  - Admin'e bildirim maili gönderir (info@starwebflow.com)
 *  - Ziyaretçiye otomatik teşekkür maili gönderir
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, projectType, budget, message, language, hp_check } = body;

    // 1. Honeypot Bot Trap (İnsanların göremediği ama botların doldurduğu gizli alan)
    if (hp_check) {
      console.warn(`[BOT DETECTED] Honeypot field filled by bot for email: ${email}`);
      return NextResponse.json({ success: true, message: 'Form başarıyla iletildi.' }); // Botu kandırmak için 200 dön
    }

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Ad ve e-posta zorunludur.' },
        { status: 400 }
      );
    }

    // 2. Canlı MX Sunucu ve Sahte Mail (Disposable/Syntax) Doğrulaması
    const emailValidation = await verifyEmailSafely(email);
    if (!emailValidation.isValid) {
      console.warn(`[INVALID EMAIL BLOCKED] ${email}: ${emailValidation.reason}`);
      return NextResponse.json(
        { success: false, error: emailValidation.reason || 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    const result = await sendContactFormNotification({
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      message,
      language: language || 'tr',
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[API /email/contact] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
