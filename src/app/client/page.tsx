import { getClientDashboardData } from '@/app/actions/client';
import { getActivities } from '@/app/actions/activity';
import ClientDashboardOverview from './ClientDashboardOverview';

export const metadata = {
  title: 'StarWebFlow | Genel Bakış',
  description: 'Müşteri Paneli Genel Bakış',
}

export default async function DashboardPage() {
  const res = await getClientDashboardData('default-tenant');
  
  // Extract the client ID if available
  const clientId = res.success && res.data?.client ? (res.data.client as any).id : undefined;
  
  // Only fetch activities for this specific client, hiding admin operations
  const activitiesRes = clientId 
    ? await getActivities('default-tenant', 10, clientId)
    : { success: true, data: [] };
  
  // Default mock data in case DB fails
  const data = res.success ? res.data : {
    client: { name: 'Müşteri' },
    projects: [],
    contracts: [],
    recentInvoices: []
  };

  const activities = activitiesRes.success ? activitiesRes.data : [];

  return <ClientDashboardOverview initialData={data} initialActivities={activities} />;
}
