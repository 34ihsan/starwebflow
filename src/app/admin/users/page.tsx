import { getUsers } from '@/app/actions/user';
import UsersDashboardClient from './UsersDashboardClient';

export default async function AdminUsersDashboardPage() {
  const res = await getUsers('default-tenant');
  const initialData = res.success ? res.data : [];

  return <UsersDashboardClient initialData={initialData as any} />;
}
