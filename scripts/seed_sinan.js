const { PrismaClient } = require('@prisma/client');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const email = 'sinan.guenay@starwebflow.com';
  const name = 'Sinan Günay';
  const password = process.env.ADMIN_PASSWORD || 'StarWebflow2026!';

  console.log(`Setting up super admin for: ${email}`);

  // 1. Get or create tenant
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        id: 'starwebflow-agency',
        name: 'StarWebFlow Agency',
        slug: 'starwebflow-agency',
      },
    });
    console.log('Created tenant:', tenant.slug);
  }

  // 2. Hash password
  const passwordHash = await hashPassword(password);

  // 3. Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      name,
    },
    create: {
      tenantId: tenant.id,
      email,
      name,
      passwordHash,
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Super Admin successfully seeded/updated:');
  console.log('   Email:', user.email);
  console.log('   Role:', user.role);
  console.log('   Password:', password);
}

main()
  .catch((err) => {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
