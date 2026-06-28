'use server'

import { prisma as db } from '@/lib/prisma'
import { safeRevalidatePath } from '@/lib/utils/cache';

export async function getClientCompanies(tenantId: string) {
  try {
    const companies = await db.clientCompany.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { invoices: true } }
      }
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
    const newCompany = await db.clientCompany.create({ data })
    try { safeRevalidatePath('/admin/invoices') } catch (e) { console.warn('revalidatePath skipped', e) }
    return { success: true, data: newCompany }
  } catch (error: any) {
    console.error('Failed to create client company:', error)
    return { success: false, error: error?.message || 'Şirket oluşturulamadı' }
  }
}

export async function updateClientCompany(id: string, tenantId: string, data: {
  name?: string
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
    const updated = await db.clientCompany.update({
      where: { id, tenantId },
      data
    })
    try { safeRevalidatePath('/admin/invoices') } catch (e) { console.warn('revalidatePath skipped', e) }
    return { success: true, data: updated }
  } catch (error: any) {
    console.error('Failed to update client company:', error)
    return { success: false, error: error?.message || 'Şirket güncellenemedi' }
  }
}

export async function deleteClientCompany(id: string, tenantId: string) {
  try {
    await db.clientCompany.delete({ where: { id, tenantId } })
    try { safeRevalidatePath('/admin/invoices') } catch (e) { console.warn('revalidatePath skipped', e) }
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete client company:', error)
    return { success: false, error: error?.message || 'Şirket silinemedi' }
  }
}
