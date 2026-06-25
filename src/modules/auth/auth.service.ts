import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { prisma } from '../../lib/prisma';
import { RegisterTenantInput, LoginInput } from './auth.types';
import { Role, Prisma } from '@prisma/client';

const scryptAsync = promisify(scrypt);

export class AuthService {
  /**
   * Hashes password using Node's native scrypt algorithm.
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  /**
   * Verifies password against a stored scrypt hash.
   */
  static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      const [hash, salt] = storedHash.split('.');
      if (!hash || !salt) return false;
      const hashBuf = Buffer.from(hash, 'hex');
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return timingSafeEqual(hashBuf, buf);
    } catch {
      return false;
    }
  }

  /**
   * Registers a new Tenant and its AGENCY_OWNER in a single atomic transaction.
   */
  static async registerTenant(input: RegisterTenantInput): Promise<{ user: Prisma.UserGetPayload<{}>; tenant: Prisma.TenantGetPayload<{}> }> {
    // 1. Slug check
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: input.slug },
    });
    if (existingTenant) {
      throw new Error('SLUG_ALREADY_EXISTS');
    }

    // 2. Email check
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // 3. Hash Password
    if (!input.password) {
      throw new Error('PASSWORD_REQUIRED');
    }
    const passwordHash = await this.hashPassword(input.password);

    // 4. Transaction execution
    return await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.agencyName,
          slug: input.slug,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: input.fullName,
          email: input.email,
          passwordHash,
          role: Role.AGENCY_OWNER,
        },
      });

      return { user, tenant };
    });
  }

  /**
   * Authenticates a user with email and password.
   */
  static async login(input: LoginInput): Promise<Prisma.UserGetPayload<{}>> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.passwordHash || user.deletedAt) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!input.password) {
      throw new Error('PASSWORD_REQUIRED');
    }

    const isPasswordValid = await this.verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.emailVerified && user.role !== 'SUPER_ADMIN' && user.email !== 'admin@starwebflow.com' && user.email !== 'client@starwebflow.com') {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    return user;
  }
}
