import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // Since a lead email might exist in multiple tenants if we operate multi-tenant B2B,
    // usually we'd pass tenantId or leadId too. For simplicity, we unsubscribe from all matching.
    const leads = await prisma.lead.findMany({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (leads.length === 0) {
      return NextResponse.json({ message: 'Email not found in our records.' });
    }

    // Mark as unsubscribed and pause sequences
    for (const lead of leads) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { unsubscribed: true }
      });

      await prisma.leadSequence.updateMany({
        where: { leadId: lead.id, status: 'ACTIVE' },
        data: { status: 'UNSUBSCRIBED' }
      });
    }

    // HTML response for the user
    const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Abonelikten Ayrıldınız</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 400px; }
          h1 { color: #111827; font-size: 24px; margin-bottom: 16px; }
          p { color: #4b5563; font-size: 16px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Abonelikten Ayrıldınız</h1>
          <p><b>${email}</b> adresi iletişim listemizden başarıyla çıkarılmıştır. Bundan sonra sizden bir talep gelmediği sürece tarafımızdan e-posta almayacaksınız.</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('[Unsubscribe Error]', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}
