'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';

export async function getProjects(tenantId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { tenantId },
      include: {
        client: true,
        tasks: true,
        manager: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: projects };
  } catch (error) {
    console.error('getProjects error:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

export async function createProject(data: {
  tenantId: string;
  clientId?: string;
  title: string;
  type: string;
  status?: string;
  progress?: number;
  riskLevel?: string;
}) {
  try {
    if (!data.clientId) {
      return { success: false, error: 'Müşteri (Client) seçimi zorunludur.' };
    }

    // Ensure tenant exists
    const defaultTenant = await prisma.tenant.upsert({
      where: { slug: data.tenantId || 'default-tenant' },
      update: {},
      create: {
        id: data.tenantId || 'default-tenant',
        slug: data.tenantId || 'default-tenant',
        name: 'Default Tenant'
      }
    });

    let clientObj = { connect: { id: data.clientId } };

    const project = await prisma.project.create({
      data: {
        tenant: { connect: { id: defaultTenant?.id || data.tenantId || 'default-tenant' } },
        title: data.title,
        type: data.type,
        status: data.status || 'PLANNING',
        progress: data.progress || 0,
        riskLevel: data.riskLevel || 'LOW',
        client: clientObj
      },
      include: {
        client: true,
        tasks: true,
        manager: true
      }
    });
    safeRevalidatePath('/admin/projects');
    return { success: true, data: project };
  } catch (error) {
    console.error('createProject error:', error);
    return { success: false, error: 'Failed to create project' };
  }
}
