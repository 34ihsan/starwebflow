const { scrypt, randomBytes, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function verifyPassword(password, storedHash) {
  try {
    const [hash, salt] = storedHash.split('.');
    if (!hash || !salt) return false;
    const hashBuf = Buffer.from(hash, 'hex');
    const buf = (await scryptAsync(password, salt, 64));
    return timingSafeEqual(hashBuf, buf);
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function main() {
  const user = await prisma.user.findUnique({where: {email: 'info@starwebflow.com'}});
  console.log("User found:", !!user);
  if (user) {
    console.log("Hash:", user.passwordHash);
    const valid = await verifyPassword('infoadmin123', user.passwordHash);
    console.log("Password valid:", valid);
  }
}
main().finally(() => prisma.$disconnect());
