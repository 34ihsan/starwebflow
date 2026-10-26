import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default-tenant',
      name: 'StarWebFlow Workspace',
      slug: 'default'
    }
  });
  console.log('Default tenant ensured:', tenant.id);

  await prisma.tenantSettings.upsert({
    where: { tenantId: 'default-tenant' },
    update: {},
    create: {
      tenantId: 'default-tenant',
      companyName: 'StarWebFlow Digital Agent',
      preferences: {
        language: 'de',
        timezone: 'Europe/Berlin',
        general: {
          currency: 'EUR',
          website: 'www.starwebflow.com'
        }
      }
    }
  });
  console.log('Default tenant settings ensured.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
