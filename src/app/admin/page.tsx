import { getDashboardData } from '@/app/actions/dashboard';
import { getActivities } from '@/app/actions/activity';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const res = await getDashboardData('default-tenant');
  const activitiesRes = await getActivities('default-tenant');
  
  const dashboardData = res.success ? res.data : {
    stats: {
      revenue: { current: 0, growth: 0 },
      leads: { current: 0, growth: 0, total: 0 },
      appointments: { current: 0, growth: 0 },
      activeProjects: 0
    },
    charts: {
      revenueData: [],
      leadsData: []
    }
  };

  const activities = activitiesRes.success && activitiesRes.data ? activitiesRes.data : [];

  return <AdminDashboardClient initialData={dashboardData as any} initialActivities={activities as any[]} />;
}
