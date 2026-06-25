import { getClientDashboardData } from '@/app/actions/client';
import ClientProjectsClient from './ClientProjectsClient';

export const metadata = {
  title: 'StarWebFlow | Projelerim',
  description: 'Müşteri Projeleri',
}

export default async function ClientProjectsPage() {
  const res = await getClientDashboardData('default-tenant');
  const projects = res.success ? res.data?.projects || [] : [];

  return <ClientProjectsClient initialProjects={projects} />;
}
