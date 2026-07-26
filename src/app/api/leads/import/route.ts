import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/modules/auth/auth.helpers';

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized or no tenant' }, { status: 401 });
    }

    const tenantId = session.tenantId;
    const body = await req.json();

    // Expecting: { name, source, sector, country, leads: [{ email, name, company, linkedinUrl, ... }] }
    const { name, source, sector, country, leads } = body;

    if (!name || !leads || !Array.isArray(leads)) {
      return NextResponse.json({ error: 'List name and leads array are required' }, { status: 400 });
    }

    // 1. Create or Find the LeadList
    const leadList = await prisma.leadList.create({
      data: {
        tenantId,
        name,
        source: source || 'CSV_UPLOAD',
        sector: sector || null,
        country: country || null,
      }
    });

    // 2. Insert Leads
    let insertedCount = 0;
    
    // Using a transaction for bulk insert (if valid data)
    for (const lead of leads) {
      if (!lead.email && !lead.linkedinUrl) continue; // Need at least email or linkedin
      
      let finalStatus = 'new';
      let notes = lead.notes || null;

      if (lead.email) {
        const { verifyEmailSafely } = await import('@/lib/utils/email-validator');
        const validation = await verifyEmailSafely(lead.email);
        if (!validation.isValid) {
          // You can skip them entirely or insert them as 'bounced' immediately.
          // The plan specified to insert them as 'bounced' or skip. Let's insert as 'bounced' so they see it.
          finalStatus = 'bounced';
          notes = validation.reason || 'Geçersiz e-posta.';
        }
      }

      await prisma.lead.create({
        data: {
          tenantId,
          leadListId: leadList.id,
          name: lead.name || 'Unknown',
          email: lead.email || null,
          company: lead.company || null,
          industry: lead.industry || sector || null,
          country: lead.country || country || null,
          linkedinUrl: lead.linkedinUrl || null,
          source: source || 'CSV_UPLOAD',
          status: finalStatus,
          notes: notes,
          ...(finalStatus === 'bounced' ? { unsubscribed: true } : {})
        }
      });
      insertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      leadListId: leadList.id, 
      insertedCount 
    });

  } catch (error) {
    console.error('Lead import error:', error);
    return NextResponse.json({ error: 'Failed to import leads' }, { status: 500 });
  }
}
