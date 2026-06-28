'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';

// Fetch all threads for a tenant (Admin view)
export async function getTenantChatThreads(tenantId: string) {
  try {
    const threads = await prisma.chatThread.findMany({
      where: { tenantId },
      include: {
        client: true,
        lead: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, data: threads };
  } catch (error) {
    console.error('Failed to get tenant chat threads:', error);
    return { success: false, error: 'Mesajlar alınamadı' };
  }
}

// Get or create a thread for a client
export async function getOrCreateClientThread(tenantId: string, clientId: string) {
  try {
    let thread = await prisma.chatThread.findUnique({
      where: {
        tenantId_clientId: { tenantId, clientId }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        }
      }
    });

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          tenantId,
          clientId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: true }
          }
        }
      });
    }

    return { success: true, data: thread };
  } catch (error) {
    console.error('Failed to get or create client thread:', error);
    return { success: false, error: 'Mesajlaşma başlatılamadı' };
  }
}

// Send a message
export async function sendChatMessage(data: {
  threadId: string;
  senderId: string;
  content: string;
  attachments?: any;
  relatedType?: string;
  relatedId?: string;
}) {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        threadId: data.threadId,
        senderId: data.senderId,
        content: data.content,
        attachments: data.attachments || null,
        relatedType: data.relatedType || null,
        relatedId: data.relatedId || null,
      },
      include: {
        sender: true
      }
    });

    // Update thread updated at
    await prisma.chatThread.update({
      where: { id: data.threadId },
      data: { updatedAt: new Date() }
    });

    safeRevalidatePath('/admin/messages');
    safeRevalidatePath('/client/messages');
    
    return { success: true, data: message };
  } catch (error) {
    console.error('Failed to send chat message:', error);
    return { success: false, error: 'Mesaj gönderilemedi' };
  }
}

// Mark messages as read
export async function markThreadAsRead(threadId: string, userId: string) {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark thread as read:', error);
    return { success: false, error: 'Mesajlar okundu olarak işaretlenemedi' };
  }
}

// Get all messages for a specific thread
export async function getThreadMessages(threadId: string) {
  try {
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        }
      }
    });
    return { success: true, data: thread };
  } catch (error) {
    console.error('Failed to get thread messages:', error);
    return { success: false, error: 'Mesajlar alınamadı' };
  }
}

// Update a message
export async function updateChatMessage(messageId: string, senderId: string, newContent: string) {
  try {
    // Verify ownership
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage || existingMessage.senderId !== senderId) {
      return { success: false, error: 'Yetkisiz işlem veya mesaj bulunamadı' };
    }

    const message = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: newContent },
      include: { sender: true }
    });

    safeRevalidatePath('/admin/messages');
    safeRevalidatePath('/client/messages');

    return { success: true, data: message };
  } catch (error) {
    console.error('Failed to update chat message:', error);
    return { success: false, error: 'Mesaj güncellenemedi' };
  }
}

// Delete a message (Hard Delete)
export async function deleteChatMessage(messageId: string, senderId: string) {
  try {
    // Verify ownership
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage || existingMessage.senderId !== senderId) {
      return { success: false, error: 'Yetkisiz işlem veya mesaj bulunamadı' };
    }

    await prisma.chatMessage.delete({
      where: { id: messageId }
    });

    safeRevalidatePath('/admin/messages');
    safeRevalidatePath('/client/messages');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete chat message:', error);
    return { success: false, error: 'Mesaj silinemedi' };
  }
}
