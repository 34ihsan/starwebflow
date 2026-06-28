'use server';

import { prisma as db } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { logActivity } from './activity';

export async function getTasks(tenantId: string) {
  try {
    const tasks = await db.task.findMany({
      where: { tenantId },
      include: {
        lead: true,
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return { success: false, error: 'Görevler alınamadı' };
  }
}

export async function createTask(data: {
  tenantId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  leadId?: string;
  projectId?: string;
}) {
  try {
    const newTask = await db.task.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        leadId: data.leadId,
        projectId: data.projectId,
      },
      include: {
        lead: true,
        project: true
      }
    });

    await logActivity({
      tenantId: data.tenantId,
      action: 'CREATED_TASK',
      entityType: 'Task',
      entityId: newTask.id,
      details: `Yeni bir görev eklendi: ${data.title}`,
    });

    safeRevalidatePath('/admin/crm');
    safeRevalidatePath('/admin/projects');
    return { success: true, data: newTask };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { success: false, error: 'Görev oluşturulamadı' };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        lead: true,
        project: true
      }
    });

    if (updatedTask.projectId) {
      const allTasks = await db.task.findMany({
        where: { projectId: updatedTask.projectId }
      });
      const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
      const totalTasks = allTasks.length;
      
      let progress = 0;
      if (totalTasks > 0) {
        progress = Math.round((completedTasks / totalTasks) * 100);
      }

      await db.project.update({
        where: { id: updatedTask.projectId },
        data: { progress }
      });
    }

    await logActivity({
      tenantId: updatedTask.tenantId,
      action: 'UPDATED_TASK_STATUS',
      entityType: 'Task',
      entityId: updatedTask.id,
      details: `${updatedTask.title} görevinin durumu ${status} olarak güncellendi.`,
    });

    safeRevalidatePath('/admin/crm');
    safeRevalidatePath('/admin/projects');
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { success: false, error: 'Görev güncellenemedi' };
  }
}
