import { NextResponse } from 'next/server';
import { metamorphicRewrite } from '@/app/actions/outreachEngine';
import { sendOutreachEmail } from '@/lib/email';

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

    const senderEmail = process.env.SMTP_USER || 'info@starwebflow.com';

    await sendOutreachEmail({
      from: senderEmail,
      to: toEmail,
      subject: `[TEST] ${finalSubject}`,
      html: finalHtmlBody,
      replyTo: senderEmail,
    });

    return NextResponse.json({ success: true, message: 'Test e-postası başarıyla gönderildi.' });
  } catch (error: any) {
    console.error('[Test Template Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
