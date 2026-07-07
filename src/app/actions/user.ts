'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { logActivity } from './activity';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function getUsers(tenantId: string) {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId, deletedAt: null },
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
    let passwordHash = 'dummy_hash';
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }
    
    const user = await prisma.user.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
      }
    });
    
    await logActivity({
      tenantId: data.tenantId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} kullanıcısı oluşturuldu.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error) {
    console.error('createUser error:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function deleteUser(userId: string, tenantId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId, tenantId },
      data: { deletedAt: new Date() }
    });

    await logActivity({
      tenantId,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} kullanıcısı silindi.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error) {
    console.error('deleteUser error:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

export async function updateUserRole(userId: string, tenantId: string, role: any) {
  try {
    const user = await prisma.user.update({
      where: { id: userId, tenantId },
      data: { role }
    });

    await logActivity({
      tenantId,
      action: 'RBAC_UPDATE',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} kullanıcısının rolü ${role} olarak güncellendi.`
    });

    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error) {
    console.error('updateUserRole error:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

export async function resetUserPassword(userId: string, tenantId: string) {
  try {
    const newPassword = randomBytes(8).toString('hex');
    const passwordHash = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: { id: userId, tenantId },
      data: { passwordHash }
    });

    await logActivity({
      tenantId,
      action: 'SECURITY',
      entityType: 'User',
      entityId: user.id,
      details: `${user.name} için şifre sıfırlama talebi oluşturuldu.`
    });

    // In a real scenario, this is where we'd trigger an email.
    // For now, we'll return the new password to show in the UI for convenience.

    safeRevalidatePath('/admin/users');
    return { success: true, newPassword };
  } catch (error) {
    console.error('resetUserPassword error:', error);
    return { success: false, error: 'Failed to reset user password' };
  }
}
