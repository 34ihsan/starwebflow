'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function logActivity(data: {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}) {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
      }
    });
    
    // Revalidate dashboards so they show the latest activity
    revalidatePath('/admin');
    revalidatePath('/client');
    
    return { success: true, data: activity };
  } catch (error) {
    console.error('logActivity error:', error);
    return { success: false, error: 'Failed to log activity' };
  }
}

export async function getActivities(tenantId: string, limit = 10, userId?: string) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { 
        tenantId,
        ...(userId ? { userId } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: true,
      }
    });
    return { success: true, data: activities };
  } catch (error) {
    console.error('getActivities error:', error);
    return { success: false, error: 'Failed to fetch activities' };
  }
}
