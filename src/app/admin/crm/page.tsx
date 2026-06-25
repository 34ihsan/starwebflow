import { getLeads } from '@/app/actions/lead';
import { getTasks } from '@/app/actions/task';
import CrmDashboardClient from './CrmDashboardClient';

export default async function CrmDashboardPage() {
  const [leadsRes, tasksRes] = await Promise.all([
    getLeads('default-tenant'),
    getTasks('default-tenant')
  ]);
  
  const initialLeads = leadsRes.success && leadsRes.data ? leadsRes.data : [];
  const initialTasks = tasksRes.success && tasksRes.data ? tasksRes.data : [];

  return <CrmDashboardClient initialLeads={initialLeads as any[]} initialTasks={initialTasks as any[]} />;
}
