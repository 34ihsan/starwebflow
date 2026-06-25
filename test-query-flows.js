const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Querying mailboxes...");
  const mailboxes = await prisma.emailMailbox.findMany();
  console.log("Mailboxes in DB:", JSON.stringify(mailboxes, null, 2));
  await prisma.$disconnect();
}

test().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
