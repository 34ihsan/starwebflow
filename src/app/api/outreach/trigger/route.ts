import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processOutreachBatch } from '@/app/actions/outreachEngine';

export async function POST(req: Request) {
  try {
    const { tenantId, data, basePrompt } = await req.json();

    if (!tenantId || !data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Geçersiz veri.' }, { status: 400 });
    }

    // 1. Create BulkOutreach record
    const bulkOutreach = await prisma.bulkOutreach.create({
      data: {
        tenantId,
        name: `Otonom Outreach - ${new Date().toISOString()}`,
        status: 'QUEUED',
        totalCount: data.length,
        settings: { basePrompt }
      }
    });

    // 2. Insert OutreachItems
    const itemsData = data.map((row: any) => ({
      bulkOutreachId: bulkOutreach.id,
      name: row.Name || row.name || null,
      email: row.Email || row.email,
      company: row.Company || row.company || null,
      status: 'PENDING'
    }));

    await prisma.outreachItem.createMany({
      data: itemsData
    });

    // 3. Fire-and-Forget background process (Simulated Queue)
    // In Vercel serverless this might timeout, but locally or on long-running node it works perfectly.
    // For production, we'd enqueue to Inngest/Qstash here.
    processOutreachBatch(bulkOutreach.id, tenantId, basePrompt || 'Tanışma toplantısı isteği').catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: 'Motor ateşlendi, kuyruğa alındı.', 
      bulkOutreachId: bulkOutreach.id 
    });

  } catch (error: any) {
    console.error('Trigger Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
