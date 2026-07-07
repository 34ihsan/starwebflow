'use server';

import { prisma } from '@/lib/prisma';

export async function getClientDashboardData(tenantId: string, clientId?: string) {
  try {
    // If no specific client is provided, try to find the first client in the tenant
    let actualClientId = clientId;
    if (!actualClientId) {
      const firstClient = await prisma.user.findFirst({
        where: { tenantId, role: 'CLIENT_MEMBER' },
        select: { id: true }
      });
      if (firstClient) {
        actualClientId = firstClient.id;
      }
    }

    if (!actualClientId) {
      return {
        success: false,
        error: 'Müşteri bulunamadı veya oturum geçersiz.'
      };
    }

    const client = await prisma.user.findUnique({
      where: { id: actualClientId },
      select: { name: true, email: true }
    });

    const projects = await prisma.project.findMany({
      where: { tenantId, clientId: actualClientId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // Find all invoices associated with this client's projects
    const projectIds = projects.map(p => p.id);
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        OR: [
          { projectId: { in: projectIds } },
          client?.email ? { clientCompany: { email: client.email } } : {}
        ]
      },
      include: {
        items: true,
        clientCompany: true,
        project: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Fetch real contracts from DB matching client email
    let contracts: any[] = [];
    if (client?.email) {
      const dbContracts = await prisma.contract.findMany({
        where: {
          tenantId,
          clientEmail: client.email
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      contracts = dbContracts;
    }

    return {
      success: true,
      data: {
        client,
        projects,
        contracts,
        recentInvoices
      }
    };

  } catch (error) {
    console.error('getClientDashboardData error:', error);
    return { success: false, error: 'Veriler alınamadı' };
  }
}
