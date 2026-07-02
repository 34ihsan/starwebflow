import { NextResponse } from 'next/server';
import { sendContactFormNotification } from '@/lib/email';

/**
 * POST /api/email/contact
 *
 * CTABanner iletişim formundan gelen verileri alır:
 *  - Admin'e bildirim maili gönderir (info@starwebflow.com)
 *  - Ziyaretçiye otomatik teşekkür maili gönderir
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, company, projectType, budget, message, language } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Ad ve e-posta zorunludur.' },
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
