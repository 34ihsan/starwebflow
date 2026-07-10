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
           meetLink = `https://meet.google.com/mock-error-${Math.random().toString(36).substring(7)}`;
         }
      } else {
         // Fallback to mock if not connected
         meetLink = `https://meet.google.com/mock-${Math.random().toString(36).substring(7)}`;
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
