'use server';

import { prisma } from '@/lib/prisma';

export async function initializeWidgetSession(data: {
  tenantId: string;
  name: string;
  contact: string;
}) {
  try {
    const isEmail = data.contact.includes('@');
    const emailStr = isEmail ? data.contact : null;
    const phoneStr = !isEmail ? data.contact : null;

    // 1. Check if lead already exists with this contact for the tenant
    let lead = await prisma.lead.findFirst({
      where: { 
        tenantId: data.tenantId,
        OR: [
          { email: emailStr || 'NO_MATCH' },
          { phone: phoneStr || 'NO_MATCH' }
        ]
      }
    });

    if (!lead) {
      // Create new lead
      lead = await prisma.lead.create({
        data: {
          tenantId: data.tenantId,
          name: data.name,
          email: emailStr,
          phone: phoneStr,
          source: 'Live Chat Widget',
          status: 'new'
        }
      });
    }

    // 2. Find or create an open ChatThread
    let thread = await prisma.chatThread.findFirst({
      where: { leadId: lead.id, tenantId: data.tenantId }
    });

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          tenantId: data.tenantId,
          leadId: lead.id,
        }
      });
      
      // Auto-welcome message
      await prisma.chatMessage.create({
        data: {
          threadId: thread.id,
          content: `Merhaba ${data.name.split(' ')[0]}, size nasıl yardımcı olabiliriz?`,
          isFromLead: false, // from us
        }
      });
    }

    return { success: true, threadId: thread.id, leadId: lead.id };
  } catch (error) {
    console.error('Error initializing widget session:', error);
    return { success: false, error: 'Oturum başlatılamadı' };
  }
}

export async function sendWidgetMessage(threadId: string, content: string) {
  try {
    const msg = await prisma.chatMessage.create({
      data: {
        threadId,
        content,
        isFromLead: true, // It's coming from the widget, so it's from the lead
      }
    });

    // We can also trigger a notification to the admin here if needed

    return { success: true, message: msg };
  } catch (error) {
    console.error('Error sending widget message:', error);
    return { success: false, error: 'Mesaj gönderilemedi' };
  }
}

export async function getWidgetMessages(threadId: string) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    });
    return { success: true, messages };
  } catch (error) {
    console.error('Error fetching widget messages:', error);
    return { success: false, error: 'Mesajlar alınamadı' };
  }
}
