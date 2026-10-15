import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateReplyRules } from '@/lib/campaign-rules';

export const dynamic = 'force-dynamic';

/**
 * Webhook endpoint to catch email replies (SendGrid Inbound Parse, IMAP watcher, Resend Inbound)
 * Automatically evaluates the reply against the campaign's Auto-Responder rules.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Example: { from: 'client@company.com', to: 'sales@starwebflow.com', text: 'fiyat nedir acaba?' }
    const fromEmail = body.from || body.sender || body.fromEmail;
    const replyText = body.text || body.body || body.html || body.subject || '';
    
    if (!fromEmail) {
      return NextResponse.json({ error: 'Missing from email' }, { status: 400 });
    }

    // 1. Find the lead associated with this email
    const lead = await prisma.lead.findFirst({
      where: { email: fromEmail }
    });

    if (lead) {
      // 2. Kural Değerlendirme
      const { matchedRule, detectedKeywords, suggestedAction } = evaluateReplyRules(replyText);
      console.log(`[Auto-Responder Webhook] Reply from ${fromEmail} evaluated. Matched:`, matchedRule?.name, 'Action:', suggestedAction);

      // 3. Pause any active sequences for this lead
      await prisma.leadSequence.updateMany({
        where: { 
          leadId: lead.id,
          status: 'ACTIVE'
        },
        data: {
          status: 'PAUSED'
        }
      });

      // 4. Kural Eylemini Uygula
      let newLeadStatus = 'replied';
      let scoreChange = 50;

      if (suggestedAction === 'UNSUBSCRIBE') {
        newLeadStatus = 'UNSUBSCRIBED';
        scoreChange = -100;
        console.log(`[Auto-Responder] Lead ${fromEmail} auto-unsubscribed (Negative sentiment rule).`);
      } else if (suggestedAction === 'SEND_WHATSAPP') {
        scoreChange = 100;
        console.log(`[Auto-Responder] VIP WhatsApp alarm triggered for ${fromEmail}.`);
      } else if (matchedRule?.action.leadScoreChange) {
        scoreChange = matchedRule.action.leadScoreChange;
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: newLeadStatus,
          score: { increment: scoreChange },
          ghostingAlert: false,
          notes: lead.notes 
            ? `${lead.notes}\n[Auto-Responder]: ${matchedRule?.name || 'Yanıt algılandı'} (${detectedKeywords.join(', ')})`
            : `[Auto-Responder]: ${matchedRule?.name || 'Yanıt algılandı'}`
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        matchedRule: matchedRule?.name,
        action: suggestedAction,
        detectedKeywords 
      });
    }

    return NextResponse.json({ success: true, message: 'Reply processed (lead not in CRM)' });

  } catch (error: any) {
    console.error('Email Reply Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

