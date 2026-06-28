import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const email = 'client@starwebflow.com';
  
  // Create or get Tenant (we attach the client to the main admin tenant for testing)
  let tenant = await prisma.tenant.findUnique({ where: { slug: 'starwebflow-admin' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'StarWebFlow Admin',
        slug: 'starwebflow-admin',
      }
    });
    console.log('Tenant created:', tenant.slug);
  } else {
    console.log('Tenant exists:', tenant.slug);
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  const passwordHash = await hashPassword('client123');

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test Client',
        passwordHash,
        role: 'CLIENT_OWNER',
        tenantId: tenant.id,
        emailVerified: true,
      }
    });
    console.log('Client user created successfully with password: client123');
  } else {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'CLIENT_OWNER', emailVerified: true }
    });
    console.log('Client user updated successfully with password: client123');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
