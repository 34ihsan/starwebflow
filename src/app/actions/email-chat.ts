'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/modules/auth/auth.server';
import { Resend } from 'resend';

// Configure Resend using environment variable
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

/**
 * Gets or creates a chat thread for a lead
 */
export async function getOrCreateLeadThread(tenantId: string, leadId: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) throw new Error('Lead not found');

  let thread = await prisma.chatThread.findFirst({
    where: {
      tenantId,
      leadId,
    },
    include: {
      lead: true,
    },
  });

  if (!thread) {
    thread = await prisma.chatThread.create({
      data: {
        tenantId,
        leadId,
      },
      include: {
        lead: true,
      },
    });
  }

  return thread;
}

/**
 * Sends a message via Email to a Lead and saves it in the ChatThread
 */
export async function sendEmailMessageToLead(
  threadId: string,
  content: string,
  attachments: string[] = []
) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { lead: true, tenant: true },
  });

  if (!thread || !thread.lead) {
    throw new Error('Chat thread or Lead not found');
  }

  if (!thread.lead.email) {
    throw new Error('Lead does not have an email address');
  }

  // 1. Send the email using Resend
  const fromEmail = process.env.OUTBOUND_EMAIL_ADDRESS || `reply+${thread.id}@yourdomain.com`;
  
  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: `Support <${fromEmail}>`,
        to: thread.lead.email,
        subject: `Re: Your Inquiry with ${thread.tenant.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <p>${content.replace(/\n/g, '<br/>')}</p>
            <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eaeaea;" />
            <p style="color: #666; font-size: 12px;">Reply to this email to continue the conversation.</p>
          </div>
        `,
        // Send In-Reply-To or just rely on Reply-To
        replyTo: fromEmail,
      });
    } else {
      console.warn('RESEND_API_KEY is not set. Email was not sent, just simulating.');
    }
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Failed to send email');
  }

  // 2. Save the message to the database
  const message = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      senderId: session.id, // Admin
      content,
      attachments: attachments.length ? attachments : undefined,
      isEmail: true,
      isFromLead: false,
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return message;
}
