const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.tenantSettings.findUnique({ where: { tenantId: 'default-tenant' } });
  const newPrefs = {
    ...existing.preferences,
    billing: {
      legalName: 'StarWebFlow Digital Agency',
      address: 'Test Mah. Test Sok. No: 1\nIstanbul, Turkiye',
      taxOffice: 'Sisli',
      taxNumber: '1234567890',
      vatId: 'TR1234567890',
      bankName: 'Test Bank',
      iban: 'TR000000000000000000000000',
      isKleinunternehmer: true
    }
  };
  await prisma.tenantSettings.update({
    where: { tenantId: 'default-tenant' },
    data: { preferences: newPrefs }
  });
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
