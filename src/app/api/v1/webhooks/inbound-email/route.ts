import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Resend sends webhook payloads for inbound emails.
    // The payload usually contains a 'html' or 'text' field, and 'from', 'to', 'subject' fields.
    const body = await req.json();

    // Verify it's from Resend (usually done via signature header, omitted for simplicity)
    // Detailed docs: https://resend.com/docs/knowledge-base/inbound-emails

    const { from, to, subject, html, text } = body;
    const content = html || text || 'No content';

    // We assume the thread ID is encoded in the 'to' address (e.g. reply+THREAD_ID@yourdomain.com)
    // Or we parse it from the subject if it has [Thread:THREAD_ID]
    let threadId = null;
    
    if (to) {
      // e.g., to: "reply+1234-5678-9012@mg.starwebflow.com"
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
    });

    if (!thread) {
      console.warn('Thread not found for inbound email:', threadId);
      return NextResponse.json({ success: true, message: 'Thread not found' });
    }

    // Insert the message from the Lead
    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content, // A real parser would strip out quoted text
        isEmail: true,
        isFromLead: true,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
