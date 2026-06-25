'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
    // If no client provided, we can either create a dummy one or omit it.
    // For now we assume a dummy user if none exists so relations don't break
    // or we make clientId optional in schema? Wait, clientId is required in schema!
    // Let's create a default client if missing
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

    let clientObj = undefined;
    if (data.clientId) {
      clientObj = { connect: { id: data.clientId } };
    } else {
      // Find or create default client
      const defaultUser = await prisma.user.upsert({
        where: { email: 'client@starwebflow.com' },
        update: {},
        create: {
          tenantId: defaultTenant.id,
          email: 'client@starwebflow.com',
          passwordHash: 'dummy',
          name: 'Default Client'
        }
      });
      clientObj = { connect: { id: defaultUser.id } };
    }

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
    revalidatePath('/admin/projects');
    return { success: true, data: project };
  } catch (error) {
    console.error('createProject error:', error);
    return { success: false, error: 'Failed to create project' };
  }
}
