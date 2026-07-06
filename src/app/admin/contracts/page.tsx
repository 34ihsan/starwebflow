import { getContracts } from '@/app/actions/contract';
import { getTenantSettings } from '@/app/actions/settings';
import { getServerSession } from '@/modules/auth/auth.helpers';
import ContractsDashboardClient from './ContractsDashboardClient';

export const maxDuration = 60;

export default async function AdminContractsDashboardPage() {
  const session = await getServerSession();
  const tenantId = session?.tenantId || 'default-tenant';

  const [contractsRes, settingsRes] = await Promise.all([
    getContracts(tenantId),
    getTenantSettings(tenantId)
  ]);

  const initialContracts = contractsRes.success ? contractsRes.data : [];
  const tenantSettings = settingsRes.success ? settingsRes.data : null;

  return <ContractsDashboardClient initialContracts={initialContracts || []} tenantSettings={tenantSettings} />;
}
