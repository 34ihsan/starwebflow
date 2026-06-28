'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  companyName: z.string().max(100, "Şirket adı çok uzun").optional(),
  apiKeys: z.any().optional(),
  preferences: z.any().optional(),
});

// Simple in-memory rate limit (In production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ipOrId: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 5;

  let record = rateLimitMap.get(ipOrId);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ipOrId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function getTenantSettings(tenantId: string) {
  try {
    let settings = await prisma.tenantSettings.findUnique({
      where: { tenantId }
    });

    if (!settings) {
      settings = await prisma.tenantSettings.create({
        data: {
          tenant: { connect: { id: tenantId } },
          companyName: 'StarWebFlow',
          apiKeys: { stripe: 'sk_live_51Mxyz...93jK' },
          preferences: { language: 'tr', timezone: 'Europe/Istanbul' }
        }
      });
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error('getTenantSettings error:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateTenantSettings(tenantId: string, data: { companyName?: string; apiKeys?: any; preferences?: any }) {
  try {
    if (!checkRateLimit(tenantId)) {
      return { success: false, error: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.' };
    }

    const validatedData = updateSettingsSchema.parse(data);

    const existingSettings = await prisma.tenantSettings.findUnique({
      where: { tenantId }
    });
    
    const settings = await prisma.tenantSettings.update({
      where: { tenantId },
      data: {
        companyName: validatedData.companyName,
        ...(validatedData.apiKeys && { apiKeys: validatedData.apiKeys }),
        ...(validatedData.preferences && { 
          preferences: {
            ...(existingSettings?.preferences as any || {}),
            ...validatedData.preferences
          } 
        }),
      }
    });
    revalidatePath('/admin/settings');
    revalidatePath('/admin/invoices');
    return { success: true, data: settings };
  } catch (error) {
    console.error('updateTenantSettings error:', error);
    return { success: false, error: 'Ayarlar güncellenemedi veya veri formatı hatalı.' };
  }
}
