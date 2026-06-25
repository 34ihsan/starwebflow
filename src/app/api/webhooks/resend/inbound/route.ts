import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Resend Inbound Webhook Payload Example (Simplified)
// {
//   "from": "Acme <hello@acme.com>",
//   "to": "sales@starwebflow.com",
//   "subject": "Re: Project discussion",
//   "text": "Sounds good, let's chat.",
//   "html": "..."
// }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract raw email addresses from potential "Name <email@domain.com>" formats
    const rawFrom = body.from || '';
    const rawTo = body.to || '';
    
    const fromEmailMatch = rawFrom.match(/<([^>]+)>/);
    const fromEmail = fromEmailMatch ? fromEmailMatch[1].toLowerCase() : rawFrom.toLowerCase();
    
    const toEmailMatch = rawTo.match(/<([^>]+)>/);
    const toEmail = toEmailMatch ? toEmailMatch[1].toLowerCase() : rawTo.toLowerCase();

    if (!fromEmail || !toEmail) {
      return NextResponse.json({ error: 'Missing from/to email' }, { status: 400 });
    }

    // 1. Identify Tenant by the receiving mailbox
    const mailbox = await prisma.emailMailbox.findFirst({
      where: { email: { equals: toEmail, mode: 'insensitive' } }
    });

    if (!mailbox) {
      console.warn(`[Inbound Webhook] Received email to unknown mailbox: ${toEmail}`);
      return NextResponse.json({ success: true, message: 'Mailbox not managed by us' });
    }

    const tenantId = mailbox.tenantId;

    // 2. Identify the Lead
    const lead = await prisma.lead.findFirst({
      where: { 
        tenantId, 
        email: { equals: fromEmail, mode: 'insensitive' } 
      }
    });

    if (!lead) {
      console.warn(`[Inbound Webhook] Received email from unknown lead: ${fromEmail}`);
      // Still might want to record it, but for automation stopping, we do nothing.
      return NextResponse.json({ success: true, message: 'Unknown lead' });
    }

    // 3. Circuit Breaker: Stop active sequences
    const activeSequences = await prisma.leadSequence.findMany({
      where: { leadId: lead.id, status: 'ACTIVE' }
    });

    for (const seq of activeSequences) {
      await prisma.leadSequence.update({
        where: { id: seq.id },
        data: { status: 'REPLIED' }
      });
      console.log(`[Circuit Breaker] Stopped sequence ${seq.id} for lead ${lead.email}`);
    }

    // 4. CRM Integration: Log to ChatThread / ChatMessage
    let thread = await prisma.chatThread.findUnique({
      where: {
        tenantId_leadId: { tenantId, leadId: lead.id }
      }
    });

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: { tenantId, leadId: lead.id }
      });
    }

    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        isFromLead: true,
        isEmail: true,
        content: body.text || body.html || body.subject || '(No Content)',
        attachments: { subject: body.subject }
      }
    });

    // Also update lead status if it was 'new' or 'contacted'
    if (lead.status === 'new' || lead.status === 'contacted') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'proposal' } // or a new custom status like 'replied'
      });
    }

    return NextResponse.json({ success: true, message: 'Processed successfully' });

  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
