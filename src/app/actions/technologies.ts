'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTechnologies(tenantId: string = 'default-tenant') {
  try {
    const technologies = await prisma.technology.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { projects: true, updates: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: technologies }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createTechnology(data: {
  tenantId?: string
  name: string
  category: string
  rssFeedUrl?: string
  description?: string
}) {
  try {
    const tenantId = data.tenantId || 'default-tenant'
    const tech = await prisma.technology.create({
      data: {
        tenantId,
        name: data.name,
        category: data.category,
        rssFeedUrl: data.rssFeedUrl,
        description: data.description
      }
    })
    revalidatePath('/admin/technologies')
    return { success: true, data: tech }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteTechnology(id: string) {
  try {
    await prisma.technology.delete({
      where: { id }
    })
    revalidatePath('/admin/technologies')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function assignProjectTechnology(projectId: string, technologyId: string, version?: string) {
  try {
    const assignment = await prisma.projectTechnology.create({
      data: {
        projectId,
        technologyId,
        version
      }
    })
    return { success: true, data: assignment }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function removeProjectTechnology(projectId: string, technologyId: string) {
  try {
    await prisma.projectTechnology.delete({
      where: {
        projectId_technologyId: {
          projectId,
          technologyId
        }
      }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getTechnologyUpdates(tenantId: string = 'default-tenant') {
  try {
    const updates = await prisma.technologyUpdate.findMany({
      where: {
        technology: {
          tenantId
        }
      },
      include: {
        technology: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: updates }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
