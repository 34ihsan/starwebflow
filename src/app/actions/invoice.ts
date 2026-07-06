'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { logActivity } from './activity';

export async function getInvoices(tenantId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        project: {
          include: { client: true }
        },
        clientCompany: true,
        items: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: JSON.parse(JSON.stringify(invoices)) };
  } catch (error) {
    console.error('getInvoices error:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

export async function createInvoice(data: {
  tenantId: string;
  projectId?: string;
  clientCompanyId?: string;
  netAmount: number;
  taxRate: number;
  taxAmount: number;
  grossAmount: number;
  status?: string;
  invoiceDate?: Date;
  deliveryDate?: Date;
  deliveryEndDate?: Date;
  dueDate?: Date;
  currency?: string;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  try {
    const year = (data.invoiceDate ? new Date(data.invoiceDate) : new Date()).getFullYear();
    const prefix = `RE-${year}-`;
    
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId: data.tenantId,
        invoiceNo: { startsWith: prefix }
      },
      orderBy: { invoiceNo: 'desc' }
    });

    let nextNumber = 1;
    if (latestInvoice && latestInvoice.invoiceNo) {
      const parts = latestInvoice.invoiceNo.split('-');
      if (parts.length === 3) {
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) nextNumber = lastNum + 1;
      }
    }
    let newInvoiceNo = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.invoice.findUnique({
        where: { invoiceNo: newInvoiceNo }
      });
      if (existing) {
        nextNumber++;
        newInvoiceNo = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
      } else {
        isUnique = true;
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: newInvoiceNo,
        tenantId: data.tenantId,
        projectId: data.projectId,
        clientCompanyId: data.clientCompanyId,
        netAmount: data.netAmount,
        taxRate: data.taxRate,
        taxAmount: data.taxAmount,
        grossAmount: data.grossAmount,
        currency: data.currency || "TRY",
        status: data.status || 'draft',
        invoiceDate: data.invoiceDate || new Date(),
        deliveryDate: data.deliveryDate || new Date(),
        deliveryEndDate: data.deliveryEndDate,
        dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: {
        project: {
          include: { client: true }
        },
        clientCompany: true,
        items: true
      }
    });
    
    await logActivity({
      tenantId: data.tenantId,
      action: 'CREATED_INVOICE',
      entityType: 'Invoice',
      entityId: invoice.id,
      details: `${data.grossAmount} ${data.currency || 'TRY'} tutarında yeni fatura oluşturuldu.`,
    });

    safeRevalidatePath('/admin/invoices');
    return { success: true, data: JSON.parse(JSON.stringify(invoice)) };
  } catch (error) {
    console.error('createInvoice error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create invoice' };
  }
}

export async function deleteInvoice(id: string, tenantId: string) {
  try {
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });

    const invoice = await prisma.invoice.delete({
      where: { id, tenantId },
    });

    await logActivity({
      tenantId,
      action: 'DELETED_INVOICE',
      entityType: 'Invoice',
      entityId: id,
      details: `${invoice.invoiceNo} numaralı fatura silindi.`,
    });

    safeRevalidatePath('/admin/invoices');
    return { success: true };
  } catch (error) {
    console.error('deleteInvoice error:', error);
    return { success: false, error: 'Failed to delete invoice' };
  }
}

export async function updateInvoice(id: string, tenantId: string, data: any) {
  try {
    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });

    // Update invoice and add new items
    const invoice = await prisma.invoice.update({
      where: { id, tenantId },
      data: {
        projectId: data.projectId,
        clientCompanyId: data.clientCompanyId,
        netAmount: data.netAmount,
        taxRate: data.taxRate,
        taxAmount: data.taxAmount,
        grossAmount: data.grossAmount,
        currency: data.currency || "TRY",
        status: data.status,
        invoiceDate: data.invoiceDate,
        deliveryDate: data.deliveryDate,
        deliveryEndDate: data.deliveryEndDate,
        dueDate: data.dueDate,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: {
        project: {
          include: { client: true }
        },
        clientCompany: true,
        items: true
      }
    });

    await logActivity({
      tenantId,
      action: 'UPDATED_INVOICE',
      entityType: 'Invoice',
      entityId: id,
      details: `${invoice.invoiceNo} numaralı fatura güncellendi.`,
    });

    safeRevalidatePath('/admin/invoices');
    return { success: true, data: JSON.parse(JSON.stringify(invoice)) };
  } catch (error) {
    console.error('updateInvoice error:', error);
    return { success: false, error: 'Failed to update invoice' };
  }
}
