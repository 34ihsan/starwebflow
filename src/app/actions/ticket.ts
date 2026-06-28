'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { logActivity } from './activity';

export async function getTickets(tenantId: string) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { tenantId },
      include: {
        client: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, data: tickets };
  } catch (error) {
    console.error('Failed to get tickets:', error);
    return { success: false, error: 'Biletler alınamadı' };
  }
}

export async function getClientTickets(tenantId: string, clientId: string) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { tenantId, clientId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, data: tickets };
  } catch (error) {
    console.error('Failed to get client tickets:', error);
    return { success: false, error: 'Müşteri biletleri alınamadı' };
  }
}

export async function createTicket(data: {
  tenantId: string;
  clientId: string;
  subject: string;
  description: string;
  priority?: string;
}) {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        tenantId: data.tenantId,
        clientId: data.clientId,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'MEDIUM',
      }
    });

    await logActivity({
      tenantId: data.tenantId,
      action: 'CREATED_TICKET',
      entityType: 'Ticket',
      entityId: ticket.id,
      details: `Yeni destek talebi: ${data.subject}`,
    });

    safeRevalidatePath('/admin/tickets');
    safeRevalidatePath('/client/tickets');
    safeRevalidatePath('/client');
    return { success: true, data: ticket };
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return { success: false, error: 'Destek talebi oluşturulamadı' };
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        status,
        ...(status === 'RESOLVED' || status === 'CLOSED' ? { resolvedAt: new Date() } : {})
      }
    });

    await logActivity({
      tenantId: ticket.tenantId,
      action: 'UPDATED_TICKET_STATUS',
      entityType: 'Ticket',
      entityId: ticket.id,
      details: `${ticket.subject} başlıklı destek talebi ${status} olarak güncellendi.`,
    });

    safeRevalidatePath('/admin/tickets');
    safeRevalidatePath('/client/tickets');
    safeRevalidatePath('/client');
    return { success: true, data: ticket };
  } catch (error) {
    console.error('Failed to update ticket status:', error);
    return { success: false, error: 'Destek talebi durumu güncellenemedi' };
  }
}

export async function addTicketMessage(data: {
  ticketId: string;
  senderId: string;
  content: string;
  isInternal?: boolean;
}) {
  try {
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: data.ticketId,
        senderId: data.senderId,
        content: data.content,
        isInternal: data.isInternal || false,
      }
    });

    // Update the ticket's updatedAt timestamp
    await prisma.ticket.update({
      where: { id: data.ticketId },
      data: { updatedAt: new Date() }
    });

    safeRevalidatePath('/admin/tickets');
    safeRevalidatePath('/client/tickets');
    return { success: true, data: message };
  } catch (error) {
    console.error('Failed to add ticket message:', error);
    return { success: false, error: 'Mesaj gönderilemedi' };
  }
}

export async function evaluateTicketPriority(text: string) {
  const lowerText = text.toLowerCase();
  
  const keywords = {
    URGENT: [
      'çöktü', 'açılmıyor', 'kapalı', 'durdu', 'erişim yok', 'giremiyorum', 
      'ödeme alınamıyor', 'hacklendi', 'acil', 'hemen', 'kritik', '500 hatası', 
      'beyaz ekran', 'site yok', 'kilitlendi'
    ],
    HIGH: [
      'çalışmıyor', 'sorun var', 'yavaş', 'bozuk', 'iletilmiyor', 'form', 
      'hata mesajı', 'eksik', 'yanlış', 'bağlantı kopuyor', 'buton çalışmıyor', 
      'yüklenmiyor', 'sepete eklenmiyor', 'donuyor'
    ],
    MEDIUM: [
      'tasarım', 'renk', 'metin', 'yazı', 'resim', 'görsel', 'logo', 'değiştirme', 
      'kayma', 'hizalama', 'font', 'boyut', 'ufak hata', 'düzeltme', 'içerik', 'ekleme'
    ],
    LOW: [
      'yeni', 'fikir', 'özellik', 'geliştirme', 'öneri', 'olsaydı', 'ekleyelim', 
      'ileride', 'zamanla', 'güncelleme', 'aklıma geldi', 'mümkün mü', 'tavsiye', 'eklenti'
    ]
  };

  const scores = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

  for (const word of keywords.URGENT) { if (lowerText.includes(word)) scores.URGENT += 2; }
  for (const word of keywords.HIGH) { if (lowerText.includes(word)) scores.HIGH += 2; }
  for (const word of keywords.MEDIUM) { if (lowerText.includes(word)) scores.MEDIUM += 1; }
  for (const word of keywords.LOW) { if (lowerText.includes(word)) scores.LOW += 1; }

  // Default to MEDIUM if no keywords matched
  let priority = 'MEDIUM';
  let maxScore = 0;

  // Determine highest score, favoring higher urgency in case of ties
  if (scores.LOW > maxScore) { priority = 'LOW'; maxScore = scores.LOW; }
  if (scores.MEDIUM > maxScore) { priority = 'MEDIUM'; maxScore = scores.MEDIUM; }
  if (scores.HIGH > maxScore) { priority = 'HIGH'; maxScore = scores.HIGH; }
  if (scores.URGENT > maxScore) { priority = 'URGENT'; maxScore = scores.URGENT; }

  const reasons: Record<string, string> = {
    URGENT: 'Sistemin durması veya kritik erişim sorunları tespit edildi.',
    HIGH: 'Fonksiyonel sorunlar veya hatalar tespit edildi.',
    MEDIUM: 'Tasarım veya içerik düzenlemesi tespit edildi.',
    LOW: 'Yeni fikir veya aciliyeti olmayan geliştirme tespit edildi.'
  };

  return { priority, reason: reasons[priority] };
}
