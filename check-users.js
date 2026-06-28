const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users.map(u => ({ email: u.email, tenantId: u.tenantId })), null, 2));
}

main().finally(() => prisma.$disconnect());
