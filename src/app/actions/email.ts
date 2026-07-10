'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { checkSPF, checkDMARC, checkDKIM } from '@/lib/utils/dns-check';

export async function getEmailData(tenantId: string) {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    
    const templates = await prisma.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const mailboxes = await prisma.emailMailbox.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: { campaigns, templates, mailboxes } };
  } catch (error) {
    console.error('getEmailData error:', error);
    return { success: false, error: 'Failed to fetch email data' };
  }
}

export async function createEmailCampaign(data: {
  tenantId: string;
  name: string;
  subject: string;
  audience?: string;
  htmlBody?: string;
  scheduledAt?: string | null;
  mailboxPool?: string[];
}) {
  try {
    const campaign = await prisma.emailCampaign.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        name: data.name,
        subject: data.subject,
        status: 'ACTIVE',
        audience: data.audience || 'Tüm Liste',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        // Store mailboxPool IDs as JSON in the audience field for now
        // (pending schema migration for dedicated column)
        ...(data.mailboxPool && data.mailboxPool.length > 0 ? {
          audience: `${data.audience || 'Tüm Liste'}||mailboxPool:${JSON.stringify(data.mailboxPool)}`
        } : {}),
        templates: data.htmlBody ? {
          create: [{
            tenant: { connect: { id: data.tenantId } },
            name: `${data.name} İçeriği`,
            subject: data.subject,
            htmlBody: data.htmlBody,
            stepDay: 1
          }]
        } : undefined
      },
      include: {
        templates: true
      }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: campaign };
  } catch (error) {
    console.error('createEmailCampaign error:', error);
    return { success: false, error: 'Failed to create campaign' };
  }
}

export async function createEmailMailbox(data: {
  tenantId: string;
  email: string;
  provider?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string;
  appPassword?: string;
  senderName?: string;
  dailyLimit?: number;
}) {
  try {
    const domain = data.email.split('@')[1];
    let spfStatus = false, dkimStatus = false, dmarcStatus = false;
    
    if (domain) {
      [spfStatus, dkimStatus, dmarcStatus] = await Promise.all([
        checkSPF(domain),
        checkDKIM(domain),
        checkDMARC(domain)
      ]);
    }

    const mailbox = await prisma.emailMailbox.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        email: data.email,
        status: 'WARMUP',
        reputation: 100,
        limit: data.dailyLimit || 50,
        provider: data.provider,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPassword: data.smtpPassword,
        imapHost: data.imapHost,
        imapPort: data.imapPort,
        imapUser: data.imapUser,
        imapPassword: data.imapPassword,
        appPassword: data.appPassword,
        senderName: data.senderName,
        spfStatus,
        dkimStatus,
        dmarcStatus,
      }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: mailbox };
  } catch (error) {
    console.error('createEmailMailbox error:', error);
    return { success: false, error: 'Failed to create mailbox' };
  }
}

export async function verifyMailboxDns(mailboxId: string) {
  try {
    const mailbox = await prisma.emailMailbox.findUnique({
      where: { id: mailboxId }
    });
    
    if (!mailbox || !mailbox.email) {
      return { success: false, error: 'Mailbox not found' };
    }
    
    const domain = mailbox.email.split('@')[1];
    if (!domain) {
      return { success: false, error: 'Invalid email format' };
    }
    
    const [spfStatus, dkimStatus, dmarcStatus] = await Promise.all([
      checkSPF(domain),
      checkDKIM(domain),
      checkDMARC(domain)
    ]);
    
    const updatedMailbox = await prisma.emailMailbox.update({
      where: { id: mailboxId },
      data: {
        spfStatus,
        dkimStatus,
        dmarcStatus
      }
    });
    
    safeRevalidatePath('/admin/email');
    return { success: true, data: updatedMailbox };
  } catch (error) {
    console.error('verifyMailboxDns error:', error);
    return { success: false, error: 'Failed to verify DNS records' };
  }
}

export async function updateMailboxStatus(data: { id: string, status: string }) {
  try {
    const mailbox = await prisma.emailMailbox.update({
      where: { id: data.id },
      data: { status: data.status }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: mailbox };
  } catch (error) {
    console.error('updateMailboxStatus error:', error);
    return { success: false, error: 'Failed to update mailbox status' };
  }
}

export async function analyzeEmailContent(content: string) {
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      system: `Sen bir e-posta pazarlama uzmanı ve AI analizörüsün. Gelen metni analiz edip, JSON formatında yanıt dönmelisin.
Format:
{
  "urgency": 0-100 arası sayı (Aciliyet hissi),
  "trust": 0-100 arası sayı (Kurumsallık & Güven),
  "spamRisk": 0-100 arası sayı (Satış Baskısı/Spam riski),
  "feedback": "Kısa ve net bir geri bildirim cümlesi"
}`,
      prompt: `Metin:\n${content}`
    });

    try {
      const result = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: 'JSON parse hatası' };
    }
  } catch (error) {
    return { success: false, error: 'AI analizi başarısız oldu' };
  }
}
