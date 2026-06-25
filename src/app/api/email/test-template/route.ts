import { NextResponse } from 'next/server';
import { metamorphicRewrite } from '@/app/actions/outreachEngine';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const { toEmail, subject, body, leadName, leadCompany, leadIndustry, leadLanguage } = await request.json();

    if (!toEmail || !body) {
      return NextResponse.json({ error: 'Missing required fields (toEmail, body)' }, { status: 400 });
    }

    // Rewrite using AI
    const htmlBody = await metamorphicRewrite(body, {
      name: leadName || 'Test Kullanıcı',
      company: leadCompany || 'Test Şirketi',
      industry: leadIndustry || 'Yazılım',
      language: leadLanguage || 'TR'
    });

    // Replace Subject variables
    const finalSubject = subject
      .replace('{Name}', leadName || 'Test Kullanıcı')
      .replace('{Company}', leadCompany || 'Test Şirketi')
      .replace('{Industry}', leadIndustry || 'Yazılım');

    // Simulate unsubscribe link
    const finalHtmlBody = htmlBody.replace(/\[Abonelikten Çık\]/g, `<a href="#" style="color: #6b7280; text-decoration: underline;">Abonelikten Çık (Test)</a>`);

    const senderEmail = process.env.OUTBOUND_EMAIL_ADDRESS || 'info@starwebflow.com';

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: `StarWebflow <${senderEmail}>`,
        to: toEmail,
        subject: `[TEST] ${finalSubject}`,
        html: finalHtmlBody,
      });
    } else {
      console.warn('RESEND_API_KEY is not set. Simulating send:', finalHtmlBody);
    }

    return NextResponse.json({ success: true, message: 'Test e-postası başarıyla gönderildi.' });
  } catch (error: any) {
    console.error('[Test Template Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
