const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Testing DB connection...");
  const tenants = await prisma.tenant.findMany();
  console.log("Tenants:", tenants);

  const campaigns = await prisma.emailCampaign.findMany({
    include: { templates: true }
  });
  console.log("Campaigns in DB:", campaigns.length);

  await prisma.$disconnect();
}

test().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
