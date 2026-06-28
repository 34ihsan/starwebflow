'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';

export async function getAppointments(tenantId: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { tenantId },
      orderBy: { startTime: 'asc' },
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error('getAppointments error:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function createAppointment(data: {
  tenantId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  startTime: Date;
  endTime: Date;
  status?: string;
  meetLink?: string;
}) {
  try {
    const apt = await prisma.appointment.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        meetLink: data.meetLink,
      }
    });
    safeRevalidatePath('/admin/appointments');
    return { success: true, data: apt };
  } catch (error) {
    console.error('createAppointment error:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}
