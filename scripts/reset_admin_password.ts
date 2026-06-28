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
  const email = 'admin@starwebflow.com';
  const user = await prisma.user.findUnique({
    where: { email }
  });
  console.log('User found:', user ? 'Yes' : 'No');
  
  if (user) {
    console.log('Role:', user.role);
    console.log('DeletedAt:', user.deletedAt);
    
    // Reset password to admin123
    const newHash = await hashPassword('admin123');
    await prisma.user.update({
      where: { email },
      data: { passwordHash: newHash }
    });
    console.log('Password reset to admin123 successfully.');
  } else {
    console.log('Admin user not found. Let us see what users exist:');
    const users = await prisma.user.findMany({
      select: { email: true, role: true }
    });
    console.log(users);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
