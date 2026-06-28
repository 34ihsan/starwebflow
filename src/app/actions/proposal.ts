'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { logActivity } from './activity';

function generateProposalNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `PRP-${year}-${rand}`;
}

export async function getProposals(tenantId: string) {
  try {
    const proposals = await prisma.proposal.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: proposals };
  } catch (error) {
    console.error('Failed to get proposals:', error);
    return { success: false, error: 'Teklifler alınamadı' };
  }
}

export async function createProposal(data: {
  tenantId: string;
  companyName: string;
  authorizedPerson: string;
  email: string;
  phone?: string;
  website?: string;
  serviceType?: string;
  message?: string;
  oneTimeTotal?: number;
  monthlyTotal?: number;
  grandTotal?: number;
  currency?: string;
  selectedSla?: string;
}) {
  try {
    const proposalNumber = generateProposalNumber();
    const proposal = await prisma.proposal.create({
      data: {
        tenantId: data.tenantId,
        proposalNumber,
        companyName: data.companyName,
        authorizedPerson: data.authorizedPerson,
        email: data.email,
        phone: data.phone,
        website: data.website,
        serviceType: data.serviceType,
        message: data.message,
        oneTimeTotal: data.oneTimeTotal ?? 0,
        monthlyTotal: data.monthlyTotal ?? 0,
        grandTotal: data.grandTotal ?? 0,
        currency: data.currency ?? 'EUR',
        selectedSla: data.selectedSla ?? 'Starter',
        status: 'PENDING',
      },
    });

    await logActivity({
      tenantId: data.tenantId,
      action: 'CREATED_PROPOSAL',
      entityType: 'Proposal',
      entityId: proposal.id,
      details: `Yeni teklif talebi: ${data.companyName} (${proposalNumber})`,
    });

    safeRevalidatePath('/admin/proposals');
    return { success: true, data: proposal };
  } catch (error) {
    console.error('Failed to create proposal:', error);
    return { success: false, error: 'Teklif talebi oluşturulamadı' };
  }
}

export async function updateProposalStatus(
  proposalId: string,
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
) {
  try {
    const proposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status,
        reviewedAt: status !== 'PENDING' ? new Date() : null,
      },
    });

    await logActivity({
      tenantId: proposal.tenantId,
      action: 'UPDATED_PROPOSAL_STATUS',
      entityType: 'Proposal',
      entityId: proposal.id,
      details: `${proposal.companyName} teklifinin durumu "${status}" olarak güncellendi.`,
    });

    safeRevalidatePath('/admin/proposals');
    return { success: true, data: proposal };
  } catch (error) {
    console.error('Failed to update proposal status:', error);
    return { success: false, error: 'Teklif durumu güncellenemedi' };
  }
}

export async function updateProposalNotes(proposalId: string, adminNotes: string) {
  try {
    const proposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: { adminNotes },
    });

    safeRevalidatePath('/admin/proposals');
    return { success: true, data: proposal };
  } catch (error) {
    console.error('Failed to update proposal notes:', error);
    return { success: false, error: 'Notlar kaydedilemedi' };
  }
}
