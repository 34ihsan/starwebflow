'use server';

import { prisma } from '@/lib/prisma';

// Define a default tenant ID for MVP
const DEFAULT_TENANT_ID = 'default-tenant';

export async function getTemplates() {
  const templates = await prisma.emailTemplate.findMany({
    where: { tenantId: DEFAULT_TENANT_ID }
  });
  return templates;
}

export async function saveTemplate(name: string, subject: string, htmlBody: string) {
  // name format: DRIP_{SECTOR}_{DAY} e.g. DRIP_HEALTH_1
  
  // Ensure tenant exists for MVP
  const tenant = await prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_ID } });
  if (!tenant) {
    await prisma.tenant.create({
      data: { id: DEFAULT_TENANT_ID, slug: DEFAULT_TENANT_ID, name: 'Default Tenant' }
    });
  }

  const existing = await prisma.emailTemplate.findFirst({
    where: { tenantId: DEFAULT_TENANT_ID, name }
  });

  if (existing) {
    return prisma.emailTemplate.update({
      where: { id: existing.id },
      data: { subject, htmlBody }
    });
  } else {
    return prisma.emailTemplate.create({
      data: {
        tenantId: DEFAULT_TENANT_ID,
        name,
        subject,
        htmlBody
      }
    });
  }
}
