import { prisma } from '../../lib/prisma';
import { CreateTaskInput, UpdateTaskInput } from './task.types';
import { Prisma } from '@prisma/client';
import { ProjectService } from '../projects/project.service';

export class TaskService {
  /**
   * Creates a new task under a project, validating tenant and assignee ownership.
   */
  static async createTask(
    tenantId: string,
    projectId: string,
    input: CreateTaskInput
  ): Promise<Prisma.TaskGetPayload<{}>> {
    // 1. Ensure project exists and belongs to the tenant
    await ProjectService.getProjectById(tenantId, projectId);

    // 2. Validate assignee belongs to the same tenant if provided
    if (input.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: input.assigneeId },
      });
      if (!assignee || assignee.tenantId !== tenantId || assignee.deletedAt) {
        throw new Error('INVALID_ASSIGNEE');
      }
    }

    // 3. Create the task
    return await prisma.task.create({
      data: {
        projectId,
        title: input.title,
        description: input.description || null,
        assigneeId: input.assigneeId || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: 'todo',
      },
    });
  }

  /**
   * Lists all tasks under a specific project, with IDOR verification.
   */
  static async getTasksByProjectId(tenantId: string, projectId: string): Promise<Prisma.TaskGetPayload<{}>[]> {
    // Ownership check (throws error if not found/belongs to another tenant)
    await ProjectService.getProjectById(tenantId, projectId);

    return await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Fetches a single task by ID, checking tenant isolation via its parent project.
   */
  static async getTaskById(tenantId: string, id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task || task.tenantId !== tenantId || (task.project && task.project.deletedAt)) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }

  /**
   * Updates task details with strict role and transition controls.
   */
  static async updateTask(
    tenantId: string,
    id: string,
    input: UpdateTaskInput,
    userRole: string,
    userId: string
  ): Promise<Prisma.TaskGetPayload<{}>> {
    // 1. Ownership check
    const task = await this.getTaskById(tenantId, id);

    // 2. Client Role Constraints
    const isClient = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(userRole);
    if (isClient) {
      // Clients cannot edit title, description, assignee, or dueDate
      const hasRestrictedUpdates =
        input.title !== undefined ||
        input.description !== undefined ||
        input.assigneeId !== undefined ||
        input.dueDate !== undefined;

      if (hasRestrictedUpdates) {
        throw new Error('CLIENT_UNAUTHORIZED_FIELDS');
      }

      // Clients can ONLY transition task from 'review' to 'done' or 'todo'
      if (input.status) {
        if (task.status !== 'review') {
          throw new Error('CLIENT_INVALID_STATUS_TRANSITION');
        }
        if (!['done', 'todo'].includes(input.status)) {
          throw new Error('CLIENT_INVALID_STATUS_TRANSITION');
        }
      }
    }

    // 3. Validate assignee belongs to the same tenant if updated
    if (input.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: input.assigneeId },
      });
      if (!assignee || assignee.tenantId !== tenantId || assignee.deletedAt) {
        throw new Error('INVALID_ASSIGNEE');
      }
    }

    // 4. Update fields
    return await prisma.task.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      },
    });
  }

  /**
   * Deletes a task after verifying ownership.
   */
  static async deleteTask(tenantId: string, id: string): Promise<void> {
    // Ensure task exists and belongs to the tenant
    await this.getTaskById(tenantId, id);

    await prisma.task.delete({
      where: { id },
    });
  }
}
