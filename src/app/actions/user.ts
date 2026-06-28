'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';

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
}) {
  try {
    const user = await prisma.user.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash: 'dummy_hash', // In a real app, hash a random password and send email
      }
    });
    safeRevalidatePath('/admin/users');
    return { success: true, data: user };
  } catch (error) {
    console.error('createUser error:', error);
    return { success: false, error: 'Failed to create user' };
  }
}
