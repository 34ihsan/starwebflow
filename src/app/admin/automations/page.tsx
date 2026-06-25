import { getAutomations } from '@/app/actions/automation';
import AutomationsDashboardClient from './AutomationsDashboardClient';

export default async function AdminAutomationsDashboardPage() {
  const res = await getAutomations('default-tenant');
  const initialData = res.success ? res.data : { flows: [], webhooks: [], logs: [] };

  return <AutomationsDashboardClient initialData={initialData as any} />;
}
