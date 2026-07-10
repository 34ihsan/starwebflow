import { getEmailData } from '@/app/actions/email';
import EmailDashboardClient from './EmailDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminEmailDashboardPage() {
  const res = await getEmailData('default-tenant');
  const initialData = res.success ? res.data : { campaigns: [], templates: [], mailboxes: [] };

  return <EmailDashboardClient initialData={initialData as any} />;
}
