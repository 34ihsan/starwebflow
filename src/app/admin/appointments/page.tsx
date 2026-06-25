import { getAppointments } from '@/app/actions/appointment';
import AppointmentsDashboardClient from './AppointmentsDashboardClient';

export default async function AdminAppointmentsDashboardPage() {
  const res = await getAppointments('default-tenant');
  const initialData = res.success ? res.data : [];

  return <AppointmentsDashboardClient initialData={initialData as any} />;
}
