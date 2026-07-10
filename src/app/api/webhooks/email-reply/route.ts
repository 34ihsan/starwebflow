import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook endpoint to catch email replies (e.g. from SendGrid Inbound Parse or IMAP watcher)
 * This is a foundational placeholder for an Elite Pro system.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Example: { from: 'client@company.com', to: 'sales@starwebflow.com', text: '...' }
    const fromEmail = body.from;
    
    if (!fromEmail) {
      return NextResponse.json({ error: 'Missing from email' }, { status: 400 });
    }

    // 1. Find the lead associated with this email
    const lead = await prisma.lead.findFirst({
      where: { email: fromEmail }
    });

    if (lead) {
      // 2. Pause any active sequences for this lead to stop automated follow-ups
      await prisma.leadSequence.updateMany({
        where: { 
          leadId: lead.id,
          status: 'ACTIVE'
        },
        data: {
          status: 'PAUSED'
        }
      });

      // 3. Mark lead status as replied or update score
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'replied',
          score: { increment: 50 },
          ghostingAlert: false
        }
      });
      
      console.log(`[Webhook] Reply caught for ${fromEmail}. Sequence paused.`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Email Reply Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
