import { getLeads } from '@/app/actions/lead';
import { getTasks } from '@/app/actions/task';
import CrmDashboardClient from './CrmDashboardClient';
import { getTenantIdOrLegacy } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export default async function CrmDashboardPage() {
  const tenantId = await getTenantIdOrLegacy();
  const [leadsRes, tasksRes] = await Promise.all([
    getLeads(tenantId),
    getTasks(tenantId)
  ]);
  
  const initialLeads = leadsRes.success && leadsRes.data ? leadsRes.data : [];
  const initialTasks = tasksRes.success && tasksRes.data ? tasksRes.data : [];

  return <CrmDashboardClient initialLeads={initialLeads as any[]} initialTasks={initialTasks as any[]} />;
}
