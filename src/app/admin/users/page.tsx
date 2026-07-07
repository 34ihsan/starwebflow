import { getUsers } from '@/app/actions/user';
import { getActivities } from '@/app/actions/activity';
import UsersDashboardClient from './UsersDashboardClient';

export default async function AdminUsersDashboardPage() {
  const res = await getUsers('default-tenant');
  const initialData = res.success ? res.data : [];
  
  const activitiesRes = await getActivities('default-tenant');
  const initialActivities = activitiesRes.success && activitiesRes.data ? activitiesRes.data : [];

  return <UsersDashboardClient initialData={initialData as any} initialActivities={initialActivities as any} />;
}
