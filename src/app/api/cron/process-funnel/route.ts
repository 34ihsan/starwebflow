import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

export const maxDuration = 300; // Allow up to 5 mins

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'local_cron_secret'}`) {
      // In local dev, we might not have a cron secret, so you can bypass this or ensure you send the right header
      // return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();

    // 1. Process Downsell Candidates
    // Rule: Sequences that are "COMPLETED" (reached day 20 with no action),
    // and hasn't been updated in the last 30 days.
    const downsellThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const downsellCandidates = await prisma.leadSequence.findMany({
      where: {
        status: { in: ['COMPLETED', 'REPLIED'] },
        flowType: 'COLD_OUTREACH',
        updatedAt: { lte: downsellThreshold },
        lead: {
          unsubscribed: false, // Do not send if they unsubscribed
          status: { not: 'won' }, // If won, they should get an upsell
          sequences: {
            none: { flowType: 'DOWNSELL_AUDIT' } // Ensure they don't already have a downsell
          }
        }
      },
      include: { lead: true },
      take: 50
    });

    const createdDownsells = [];
    for (const seq of downsellCandidates) {
      const newSeq = await prisma.leadSequence.create({
        data: {
          tenantId: seq.tenantId,
          leadId: seq.leadId,
          flowType: 'DOWNSELL_AUDIT',
          currentStep: 1,
          status: 'ACTIVE',
          nextRunAt: new Date(now.getTime() + 1 * 60 * 60 * 1000), // Start in 1 hour
        }
      });
      createdDownsells.push(newSeq.id);
    }

    // 2. Process Upsell Candidates
    // Rule: Leads that have "APPOINTMENT_BOOKED" or "WON",
    // after 60 days of inactivity/success, we can push an upsell.
    const upsellThreshold = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

    const upsellCandidates = await prisma.leadSequence.findMany({
      where: {
        status: { in: ['APPOINTMENT_BOOKED', 'WON'] },
        flowType: 'COLD_OUTREACH',
        updatedAt: { lte: upsellThreshold },
        lead: {
          unsubscribed: false, // Do not send if they unsubscribed
          sequences: {
            none: { flowType: 'UPSELL_AUTOMATION' } // Ensure they don't already have an upsell
          }
        }
      },
      include: { lead: true },
      take: 50
    });

    const createdUpsells = [];
    for (const seq of upsellCandidates) {
      // Logic: Determine upsell product based on lead's industry or previous product
      let upsellFlowType = 'UPSELL_AUTOMATION';
      if (seq.lead.industry === 'HEALTH') upsellFlowType = 'UPSELL_CHATBOT';
      if (seq.lead.industry === 'ECOMMERCE') upsellFlowType = 'UPSELL_SEO_ADS';

      const newSeq = await prisma.leadSequence.create({
        data: {
          tenantId: seq.tenantId,
          leadId: seq.leadId,
          flowType: upsellFlowType,
          currentStep: 1,
          status: 'ACTIVE',
          nextRunAt: new Date(now.getTime() + 1 * 60 * 60 * 1000),
        }
      });
      createdUpsells.push(newSeq.id);
    }

    return NextResponse.json({ 
      success: true, 
      downsellsTriggered: createdDownsells.length,
      upsellsTriggered: createdUpsells.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Funnel Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
