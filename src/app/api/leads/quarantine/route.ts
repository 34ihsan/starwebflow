import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/modules/auth/auth.helpers';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized or no tenant' }, { status: 401 });
    }

    const tenantId = session.tenantId;

    // Fetch leads that are unsubscribed and have some bounce/error note
    const quarantinedLeads = await prisma.lead.findMany({
      where: {
        tenantId,
        unsubscribed: true,
        notes: {
          not: null
        }
      },
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        notes: true,
        status: true
      }
    });

    // Filter to only those with [BOUNCED] or similar tags if needed, 
    // but right now assuming any unsubscribed with notes is in quarantine.
    const mapped = quarantinedLeads.map(l => {
      let reason = "Unknown / Manuel İptal";
      let severity = "low";

      if (l.notes) {
        if (l.notes.includes('Geçersiz e-posta')) {
          reason = "Geçersiz E-Posta Formatı veya Tek kullanımlık";
          severity = "high";
        } else if (l.notes.includes('MX kaydı bulunamadı')) {
          reason = "MX Kaydı Yok (Domain Geçersiz)";
          severity = "high";
        } else if (l.notes.includes('HARD BOUNCE')) {
          reason = "Hard Bounce (Geri Döndü)";
          severity = "high";
        } else if (l.notes.includes('Spamhaus') || l.notes.includes('Blacklist')) {
          reason = "Blacklist (Spam/Engelli)";
          severity = "critical";
        } else if (l.notes.includes('[BOUNCED]')) {
          reason = l.notes.split('\n').find(line => line.includes('[BOUNCED]')) || "Bounce (Teslim Edilemedi)";
          severity = "high";
        } else {
          reason = l.notes.split('\n')[0] || reason;
          severity = "medium";
        }
      }

      return {
        id: l.id,
        email: l.email || "Bilinmiyor",
        name: l.name,
        company: l.company,
        reason,
        severity,
        rawNotes: l.notes
      };
    });

    // Filter out 'low' severity if they don't seem to be email bounces, but let's keep all for now to be safe.
    const filtered = mapped.filter(m => m.severity !== 'low');

    return NextResponse.json({ success: true, leads: filtered });

  } catch (error) {
    console.error('Error fetching quarantine:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized or no tenant' }, { status: 401 });
    }

    const tenantId = session.tenantId;
    const body = await req.json();
    const { leadId, action } = body;

    if (!leadId || action !== 'whitelist') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Whitelist logic: 
    // 1. Set unsubscribed to false
    // 2. Clear bounce/quarantine notes

    let newNotes = lead.notes || '';
    // Remove lines that have [BOUNCED] or other quarantine keywords
    newNotes = newNotes.split('\n')
      .filter(line => !line.includes('[BOUNCED]') && !line.includes('Geçersiz') && !line.includes('MX kaydı') && !line.includes('HARD BOUNCE') && !line.includes('Quarantine'))
      .join('\n');

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        unsubscribed: false,
        notes: newNotes.trim() === '' ? null : newNotes.trim()
      }
    });

    return NextResponse.json({ success: true, message: 'E-posta güvenli listeye alındı.' });

  } catch (error) {
    console.error('Error whitelisting lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
