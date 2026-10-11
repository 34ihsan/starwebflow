'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { logActivity } from './activity';
import { verifyEmailSafely, verifyNameSafely } from '@/lib/utils/email-validator';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function getUsers(tenantId?: string) {
  try {
    const where: any = { deletedAt: null };
    if (tenantId && tenantId !== 'default-tenant' && tenantId !== 'all') {
      where.tenantId = tenantId;
    }
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('getUsers error:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function createUser(data: {
  tenantId: string;
  email: string;
  name: string;
  role: any;
  password?: string;
}) {
  try {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanName = (data.name || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'E-posta adresi zorunludur.' };
    }

    const nameCheck = verifyNameSafely(cleanName);
    if (!nameCheck.isValid) {
      return { success: false, error: nameCheck.reason };
    }

    const emailCheck = await verifyEmailSafely(cleanEmail);
    if (!emailCheck.isValid) {
      return { success: false, error: emailCheck.reason };
    }

    let passwordHash: string;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    } else {
      const randomPass = randomBytes(16).toString('hex');
      passwordHash = await hashPassword(randomPass);
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });

    if (existing) {
      // If user exists, update their details safely
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: data.name || existing.name,
          role: data.role || existing.role,
          passwordHash,
          deletedAt: null,
          emailVerified: true,
        }
      });
      safeRevalidatePath('/admin/users');
      return { success: true, data: updated };
    }

    // Ensure tenant exists
    let targetTenantId = data.tenantId;
    const tenantExists = await prisma.tenant.findUnique({ where: { id: targetTenantId } });
    if (!tenantExists) {
      const firstTenant = await prisma.tenant.findFirst();
      if (firstTenant) targetTenantId = firstTenant.id;
    }

    const user = await prisma.user.create({
      data: {
        tenant: { connect: { id: targetTenantId } },
        email: cleanEmail,
        name: data.name,
        role: data.role,
        passwordHash,
        emailVerified: true,
      }
    });
    
    await logActivity({
      tenantId: targetTenantId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} kullanıcısı oluşturuldu.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error: any) {
    console.error('createUser error:', error);
    return { success: false, error: error?.message || 'Failed to create user' };
  }
}

export async function deleteUser(userId: string, tenantId?: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return { success: false, error: 'Kullanıcı bulunamadı.' };
    }

    // Try hard delete first if user has no dependencies; fallback to soft-delete
    let user;
    try {
      user = await prisma.user.delete({
        where: { id: userId }
      });
    } catch {
      user = await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() }
      });
    }

    await logActivity({
      tenantId: existing.tenantId,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} kullanıcısı silindi.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error: any) {
    console.error('deleteUser error:', error);
    return { success: false, error: error?.message || 'Failed to delete user' };
  }
}

export async function updateUserRole(userId: string, tenantId?: string, role?: any) {
  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return { success: false, error: 'Kullanıcı bulunamadı.' };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    await logActivity({
      tenantId: existing.tenantId,
      action: 'RBAC_UPDATE',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} kullanıcısının rolü ${role} olarak güncellendi.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error: any) {
    console.error('updateUserRole error:', error);
    return { success: false, error: error?.message || 'Failed to update user role' };
  }
}

export async function resetUserPassword(userId: string, tenantId?: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return { success: false, error: 'Kullanıcı bulunamadı.' };
    }

    const newPassword = randomBytes(8).toString('hex');
    const passwordHash = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await logActivity({
      tenantId: existing.tenantId,
      action: 'SECURITY',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} için şifre sıfırlama talebi oluşturuldu.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, newPassword };
  } catch (error: any) {
    console.error('resetUserPassword error:', error);
    return { success: false, error: error?.message || 'Failed to reset user password' };
  }
}
