import { getTenantSettings } from '@/app/actions/settings';
import SettingsDashboardClient from './SettingsDashboardClient';

export default async function AdminSettingsDashboardPage() {
  const res = await getTenantSettings('default-tenant');
  const initialData = res.success ? res.data : {};

  return <SettingsDashboardClient initialData={initialData as any} />;
}
