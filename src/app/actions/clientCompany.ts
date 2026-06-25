'use server'

import { prisma as db } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getClientCompanies(tenantId: string) {
  try {
    const companies = await db.clientCompany.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: companies }
  } catch (error) {
    console.error('Failed to get client companies:', error)
    return { success: false, error: 'Müşteri şirketleri alınamadı' }
  }
}

export async function createClientCompany(data: {
  tenantId: string
  name: string
  email?: string
  phone?: string
  addressStreet?: string
  addressCity?: string
  addressZip?: string
  addressCountry?: string
  taxId?: string
  vatId?: string
  contactPerson?: string
}) {
  try {
    const newCompany = await db.clientCompany.create({
      data,
    })
    revalidatePath('/admin/invoices')
    return { success: true, data: newCompany }
  } catch (error) {
    console.error('Failed to create client company:', error)
    return { success: false, error: 'Şirket oluşturulamadı' }
  }
}
