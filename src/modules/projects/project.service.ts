import { prisma } from '../../lib/prisma';
import { CreateProjectInput, UpdateProjectInput } from './project.types';
import { Prisma } from '@prisma/client';

export class ProjectService {
  /**
   * Creates a new project in the database.
   */
  static async createProject(
    tenantId: string,
    clientId: string,
    input: CreateProjectInput
  ): Promise<Prisma.ProjectGetPayload<{}>> {
    return await prisma.project.create({
      data: {
        tenantId,
        clientId,
        title: input.title,
        status: 'briefing',
        briefData: input.briefData || {},
      },
    });
  }

  /**
   * Lists projects belonging to a tenant using cursor-based pagination.
   * Optionally filters by clientId (e.g., if a client user is requesting).
   */
  static async getProjects(
    tenantId: string,
    options: { limit: number; cursor?: string; clientId?: string }
  ): Promise<{ projects: Prisma.ProjectGetPayload<{}>[]; nextCursor?: string }> {
    // Clamp limit: min 1, max 100 — prevent negative/NaN/enormous values from client
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    
    const projects = await prisma.project.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(options.clientId && { clientId: options.clientId }),
      },
      take: limit + 1,
      cursor: options.cursor ? { id: options.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | undefined = undefined;
    if (projects.length > limit) {
      const nextItem = projects.pop();
      nextCursor = nextItem?.id;
    }

    return {
      projects,
      nextCursor,
    };
  }

  /**
   * Fetches a project by ID, ensuring strict tenant isolation.
   */
  static async getProjectById(tenantId: string, id: string): Promise<Prisma.ProjectGetPayload<{}>> {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    // Strict validation of existence and tenant ownership
    if (!project || project.tenantId !== tenantId || project.deletedAt) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return project;
  }

  /**
   * Updates a project after verifying it belongs to the tenant.
   */
  static async updateProject(
    tenantId: string,
    id: string,
    input: UpdateProjectInput
  ): Promise<Prisma.ProjectGetPayload<{}>> {
    // 1. Ownership check (throws error if not found/belongs to another tenant)
    const existing = await this.getProjectById(tenantId, id);

    // 2. Build update data — only include defined fields
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.briefData !== undefined) data.briefData = input.briefData;
    if (input.status !== undefined) data.status = input.status;
    if (input.managerId !== undefined) data.managerId = input.managerId;

    // 3. Guard: if nothing to update, return existing project (no DB write)
    if (Object.keys(data).length === 0) {
      return existing;
    }

    // 4. Perform the update
    return await prisma.project.update({
      where: { id },
      data,
    });
  }
}
