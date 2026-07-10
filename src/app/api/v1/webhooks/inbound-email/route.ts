import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    // Resend sends webhook payloads for inbound emails.
    const body = await req.json();

    const { from, to, subject, html, text } = body;
    const content = html || text || 'No content';

    // Basic heuristic to detect warmup/bot emails
    const lowerFrom = (from || '').toLowerCase();
    const lowerSubject = (subject || '').toLowerCase();
    const isBot = 
      lowerFrom.includes('warmup') || 
      lowerFrom.includes('mailer-daemon') ||
      lowerFrom.includes('postmaster') ||
      lowerFrom.includes('no-reply') ||
      lowerFrom.includes('bounce') ||
      lowerSubject.includes('[warmup]') ||
      lowerSubject.includes('auto-reply') ||
      lowerSubject.includes('out of office');

    // We assume the thread ID is encoded in the 'to' address (e.g. reply+THREAD_ID@yourdomain.com)
    let threadId = null;
    
    if (to) {
      const match = to.match(/reply\+([a-zA-Z0-9-]+)@/);
      if (match && match[1]) {
        threadId = match[1];
      }
    }

    if (!threadId) {
      console.warn('Inbound email received but no threadId found in To address:', to);
      return NextResponse.json({ success: true, message: 'Ignored, no thread ID' });
    }

    // Find the thread
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        lead: true,
      }
    });

    if (!thread) {
      console.warn('Thread not found for inbound email:', threadId);
      return NextResponse.json({ success: true, message: 'Thread not found' });
    }

    // Insert the message from the Lead
    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content,
        isEmail: true,
        isFromLead: true,
      },
    });

    // Create Notification only if it's a real human
    if (!isBot) {
      const senderName = thread.lead?.name || from;
      await createNotification({
        tenantId: thread.tenantId,
        title: `Yeni E-posta: ${senderName}`,
        message: `${subject || 'Konu Yok'}\n\n${(text || content).substring(0, 100)}...`,
        type: 'EMAIL',
        link: `/admin/leads/${thread.leadId}?tab=chat`
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
