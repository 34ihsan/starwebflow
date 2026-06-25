'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function triggerEmailCampaignForUpdate(updateId: string, tenantId: string = 'default-tenant') {
  try {
    // 1. Fetch the update and technology
    const update = await prisma.technologyUpdate.findUnique({
      where: { id: updateId },
      include: { technology: true }
    })

    if (!update) return { success: false, error: 'Update not found' }

    // 2. Find all projects using this technology
    const projectTechs = await prisma.projectTechnology.findMany({
      where: { technologyId: update.technologyId },
      include: {
        project: {
          include: {
            client: true
          }
        }
      }
    })

    if (projectTechs.length === 0) {
      return { success: false, error: 'No projects found using this technology.' }
    }

    // 3. Find unique clients/companies to email
    const clientsToEmail = new Map() // clientCompanyId -> client data

    for (const pt of projectTechs) {
      if (!pt.project.clientId) continue
      
      // Attempt to find the client's company
      const company = await prisma.clientCompany.findFirst({
        where: { 
          // Match by some logic, assuming the client user is linked, 
          // or we can use the user's email directly if no company.
          email: pt.project.client.email 
        }
      })

      const targetEmail = company?.contactEmail || company?.email || pt.project.client.email
      const targetName = company?.contactPerson || pt.project.client.name

      clientsToEmail.set(targetEmail, {
        email: targetEmail,
        name: targetName,
        company: company?.name || 'Your Company',
        projectName: pt.project.title
      })
    }

    if (clientsToEmail.size === 0) {
      return { success: false, error: 'No valid client emails found.' }
    }

    // 4. Create a BulkOutreach campaign
    const bulkOutreach = await prisma.bulkOutreach.create({
      data: {
        tenantId,
        name: `Tech Update Alert: ${update.technology.name} - ${update.title}`,
        status: 'QUEUED',
        totalCount: clientsToEmail.size,
        settings: {
          template: `Merhaba {{name}},\n\nProjeniz ({{projectName}}) altyapısında kullandığımız {{techName}} teknolojisi için kritik bir güncelleme yayınlandı:\n\n**{{updateTitle}}**\n\nBu güncelleme sisteminizi etkileyebilir. İncelemek ve gerekirse bakım çalışması planlamak için lütfen bizimle iletişime geçin.\n\nİyi çalışmalar.`,
          techName: update.technology.name,
          updateTitle: update.title
        }
      }
    })

    // 5. Create OutreachItems
    const outreachItemsData = Array.from(clientsToEmail.values()).map(client => ({
      bulkOutreachId: bulkOutreach.id,
      email: client.email,
      name: client.name,
      company: client.company
    }))

    await prisma.outreachItem.createMany({
      data: outreachItemsData
    })

    // 6. Mark update as notified/email sent
    await prisma.technologyUpdate.update({
      where: { id: updateId },
      data: { emailSent: true, isNotified: true }
    })

    revalidatePath('/admin/tech-updates')

    return { success: true, data: bulkOutreach, count: clientsToEmail.size }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteTechnologyUpdate(id: string) {
  try {
    await prisma.technologyUpdate.delete({
      where: { id }
    })
    revalidatePath('/admin/tech-updates')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
