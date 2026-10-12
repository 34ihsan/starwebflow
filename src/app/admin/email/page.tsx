import { getEmailData } from '@/app/actions/email';
import EmailDashboardClient from './EmailDashboardClient';
import { getTenantIdOrLegacy } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export default async function AdminEmailDashboardPage() {
  const res = await getEmailData(await getTenantIdOrLegacy());
  const initialData = res.success ? res.data : { campaigns: [], templates: [], mailboxes: [] };

  return <EmailDashboardClient initialData={initialData as any} />;
}
