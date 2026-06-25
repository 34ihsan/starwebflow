import { getProjects } from '@/app/actions/project';
import ProjectsDashboardClient from './ProjectsDashboardClient';

export default async function AdminProjectsDashboardPage() {
  const res = await getProjects('default-tenant');
  const initialProjects = res.success ? res.data : [];

  return <ProjectsDashboardClient initialProjects={res.data || []} />;
}
