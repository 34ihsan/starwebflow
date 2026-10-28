'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { google } from 'googleapis';

export async function checkGoogleCalendarStatus(tenantId: string) {
  try {
    const settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });
    const apiKeys = (settings?.apiKeys as any) || {};
    return !!apiKeys.google_calendar?.refresh_token || !!apiKeys.google_calendar?.access_token;
  } catch (error) {
    console.error('checkGoogleCalendarStatus error:', error);
    return false;
  }
}

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
  sendMeetLink?: boolean;
}) {
  try {
    let meetLink = undefined;

    if (data.sendMeetLink) {
      const settings = await prisma.tenantSettings.findUnique({ where: { tenantId: data.tenantId } });
      const apiKeys = (settings?.apiKeys as any) || {};
      const gcKeys = apiKeys.google_calendar;

      if (gcKeys && (gcKeys.refresh_token || gcKeys.access_token) && process.env.GOOGLE_CLIENT_ID) {
         try {
           const oauth2Client = new google.auth.OAuth2(
             process.env.GOOGLE_CLIENT_ID,
             process.env.GOOGLE_CLIENT_SECRET
           );
           oauth2Client.setCredentials({
             access_token: gcKeys.access_token,
             refresh_token: gcKeys.refresh_token,
             expiry_date: gcKeys.expiry_date
           });

           const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
           const event = {
              summary: data.title,
              description: `StarWebFlow Meeting with ${data.clientName}`,
              start: { dateTime: new Date(data.startTime).toISOString() },
              end: { dateTime: new Date(data.endTime).toISOString() },
              attendees: [{ email: data.clientEmail }],
              conferenceData: {
                createRequest: {
                  requestId: `meet_${Date.now()}`,
                  conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
              }
           };

           const res = await calendar.events.insert({
             calendarId: 'primary',
             requestBody: event,
             conferenceDataVersion: 1
           });
           
           meetLink = res.data.hangoutLink;
           
           // İsteğe bağlı: Token yenilendiyse DB'yi güncellemek için oauth2Client.on('tokens') dinlenebilir.
         } catch (googleError) {
           console.error('Google API Error:', googleError);
           meetLink = undefined;
         }
      } else {
         // Fallback to undefined if not connected
         meetLink = undefined;
      }
    }

    const apt = await prisma.appointment.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        meetLink: meetLink,
      }
    });
    safeRevalidatePath('/admin/appointments');
    return { success: true, data: apt };
  } catch (error) {
    console.error('createAppointment error:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}

export async function deleteAppointment(id: string) {
  try {
    await prisma.appointment.delete({
      where: { id },
    });
    safeRevalidatePath('/admin/appointments');
    return { success: true };
  } catch (error) {
    console.error('deleteAppointment error:', error);
    return { success: false, error: 'Failed to delete appointment' };
  }
}

export async function createPublicBooking(data: {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  topic: string;
  notes?: string;
  dateStr: string;
  timeSlot: string;
}) {
  try {
    if (!data.clientName || !data.clientEmail || !data.dateStr || !data.timeSlot) {
      return { success: false, error: 'Lütfen tüm zorunlu alanları doldurunuz.' };
    }

    // 1. Resolve or create tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: 'default-tenant',
          name: 'Starwebflow',
          slug: 'starwebflow-' + Date.now(),
        },
      });
    }
    const tenantId = tenant.id;

    // 2. Parse start and end time
    const [hours, minutes] = data.timeSlot.split(':').map((s) => parseInt(s, 10));
    const startTime = new Date(data.dateStr);
    startTime.setHours(isNaN(hours) ? 14 : hours, isNaN(minutes) ? 0 : minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15 mins discovery session

    const title = `[15dk Mimari Keşif] ${data.topic || 'Genel Değerlendirme'} - ${data.clientName}`;
    const meetLink = 'https://meet.google.com/swf-arch-review';

    // 3. Create appointment
    const apt = await prisma.appointment.create({
      data: {
        tenantId,
        title,
        clientName: data.clientName.trim(),
        clientEmail: data.clientEmail.trim().toLowerCase(),
        startTime,
        endTime,
        status: 'scheduled',
        meetLink,
      },
    });

    // 4. Create or update corresponding lead record
    try {
      await prisma.lead.create({
        data: {
          tenantId,
          name: data.clientName.trim(),
          email: data.clientEmail.trim().toLowerCase(),
          phone: data.clientPhone?.trim() || null,
          company: data.companyName?.trim() || null,
          source: 'Randevu Portalı (/randevu)',
          serviceType: data.topic,
          status: 'new',
        },
      });
    } catch (leadError) {
      console.warn('[Appointment] Lead creation error (safe ignored):', leadError);
    }

    safeRevalidatePath('/admin/appointments');
    safeRevalidatePath('/admin/leads');

    return {
      success: true,
      appointment: {
        id: apt.id,
        title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        meetLink,
        clientName: apt.clientName,
        clientEmail: apt.clientEmail,
      },
    };
  } catch (error: any) {
    console.error('createPublicBooking error:', error);
    return { success: false, error: error.message || 'Randevu oluşturulurken bir hata oluştu.' };
  }
}
