import { getTenantSettings } from '@/app/actions/settings';
import SettingsDashboardClient from './SettingsDashboardClient';
import { getServerSession } from '@/modules/auth/auth.helpers';

export default async function AdminSettingsDashboardPage() {
  const session = await getServerSession();
  const tenantId = session?.tenantId || 'default-tenant';
  
  const res = await getTenantSettings(tenantId);
  const initialData = res.success ? res.data : {};

  return <SettingsDashboardClient initialData={initialData as any} tenantId={tenantId} />;
}
