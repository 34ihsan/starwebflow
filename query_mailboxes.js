const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mailboxes = await prisma.emailMailbox.findMany();
  console.log(mailboxes);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
