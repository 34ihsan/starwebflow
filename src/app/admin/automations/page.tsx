import { getAutomations } from '@/app/actions/automation';
import AutomationsDashboardClient from './AutomationsDashboardClient';
import { getTenantIdOrLegacy } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export default async function AdminAutomationsDashboardPage() {
  const tenantId = await getTenantIdOrLegacy();
  const res = await getAutomations(tenantId);
  const initialData = res.success ? res.data : { flows: [], webhooks: [], logs: [] };

  return <AutomationsDashboardClient initialData={initialData as any} tenantId={tenantId} />;
}

