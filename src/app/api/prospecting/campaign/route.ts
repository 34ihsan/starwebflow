import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventBus } from '@/lib/automation/eventBus';
import { getStaffTenantId } from '@/lib/tenant';

export async function POST(req: Request) {
  try {
    const tenantId = await getStaffTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadIds, campaignId } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ success: false, error: "Geçersiz lead ID listesi." }, { status: 400 });
    }

    console.log(`[Campaign API] Assigning ${leadIds.length} leads to campaign ${campaignId}`);

    // Update leads status to indicate they are active in a campaign (sadece kendi tenant'ının lead'leri)
    const updatedCount = await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        tenantId
      },
      data: {
        status: "IN_CAMPAIGN",
        // Ideally we would link to a campaign table here
        // campaignId: campaignId 
      }
    });

    // Simulate sending event to the Automation Engine to start dripping emails
    await EventBus.emit('campaign.started', { 
      campaignId, 
      leadIds, 
      tenantId
    });

    return NextResponse.json({
      success: true,
      message: `${updatedCount.count} müşteri kampanyaya eklendi.`
    });

  } catch (error: any) {
    console.error("[Campaign API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
