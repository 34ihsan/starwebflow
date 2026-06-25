const { createLeadWithProposal } = require('./src/app/actions/lead');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Testing createLeadWithProposal with default-tenant...");
  const res = await createLeadWithProposal({
    tenantId: 'default-tenant',
    name: 'Ihsan Inan Test',
    email: 'ihsaninan34+test@gmail.com',
    industry: 'Eğitim',
    serviceType: 'Web Tasarım',
    source: 'Test Script'
  });

  console.log("Result:", res);
  if (res.success) {
    console.log("Lead created successfully!");
    // Clean it up
    await prisma.lead.delete({
      where: { id: res.data.id }
    });
    console.log("Cleaned up test lead.");
  } else {
    console.error("Error creating lead:", res.error);
  }
  await prisma.$disconnect();
}

test().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
