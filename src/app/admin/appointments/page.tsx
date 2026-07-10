import { getAppointments, checkGoogleCalendarStatus } from '@/app/actions/appointment';
import AppointmentsDashboardClient from './AppointmentsDashboardClient';

export default async function AdminAppointmentsDashboardPage() {
  const tenantId = 'default-tenant'; // Gerçek senaryoda auth context'ten alınacak
  const res = await getAppointments(tenantId);
  const initialData = res.success ? res.data : [];
  
  const isGoogleConnected = await checkGoogleCalendarStatus(tenantId);

  return <AppointmentsDashboardClient initialData={initialData as any} isGoogleConnected={isGoogleConnected} />;
}
