'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';

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
}) {
  try {
    const campaign = await prisma.emailCampaign.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        name: data.name,
        subject: data.subject,
        status: 'ACTIVE',
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
      }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: mailbox };
  } catch (error) {
    console.error('createEmailMailbox error:', error);
    return { success: false, error: 'Failed to create mailbox' };
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
