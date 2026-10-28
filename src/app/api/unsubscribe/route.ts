import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const leadId = searchParams.get('leadId');

    if (!email && !leadId) {
      return NextResponse.json({ error: 'Email or leadId parameter is required' }, { status: 400 });
    }

    const where: any = {};
    if (leadId) {
      where.id = leadId;
    } else if (email) {
      where.email = { equals: email, mode: 'insensitive' };
    }

    const leads = await prisma.lead.findMany({ where });

    if (leads.length === 0) {
      return NextResponse.json({ message: 'Record not found in our records.' });
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

    const displayEmail = email || leads[0]?.email || 'E-Mail-Adresse';
    const isGerman = (leads[0]?.country || '').toLowerCase().includes('almanya') || (leads[0]?.country || '').toLowerCase().includes('germany') || (leads[0]?.country || '').toLowerCase().includes('deutschland');

    // HTML response for the user (DSGVO / Multi-language compliant)
    const html = `
      <!DOCTYPE html>
      <html lang="${isGerman ? 'de' : 'tr'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isGerman ? 'Erfolgreich abgemeldet' : 'Abonelikten Ayrıldınız'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #0f172a; color: #f8fafc; }
          .container { text-align: center; background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .icon { width: 48px; height: 48px; margin: 0 auto 16px; color: #10b981; }
          h1 { color: #f8fafc; font-size: 22px; margin-bottom: 12px; }
          p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
          .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 600; font-size: 13px; padding: 4px 12px; border-radius: 9999px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1>${isGerman ? 'Erfolgreich abgemeldet' : 'Abonelikten Ayrıldınız'}</h1>
          <p>${isGerman 
            ? `Die Adresse <b>${displayEmail}</b> wurde erfolgreich aus unserem Verteiler entfernt. Sie erhalten künftig keine automatisierten Nachrichten mehr von uns (DSGVO-konform).` 
            : `<b>${displayEmail}</b> adresi iletişim listemizden başarıyla çıkarılmıştır. Bundan sonra sizden bir talep gelmediği sürece tarafımızdan e-posta almayacaksınız.`}
          </p>
          <span class="badge">${isGerman ? 'Status: Abgemeldet' : 'Durum: Listeden Çıkarıldı'}</span>
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
