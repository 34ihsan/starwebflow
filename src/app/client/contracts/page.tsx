import { getClientDashboardData } from '@/app/actions/client';
import { getTenantSettings } from '@/app/actions/settings';
import ClientContractsClient from './ClientContractsClient';

export const metadata = {
  title: 'StarWebFlow | Sözleşmelerim',
  description: 'Müşteri Sözleşmeleri',
}

export const maxDuration = 60;

export default async function ClientContractsPage() {
  const [res, settingsRes] = await Promise.all([
    getClientDashboardData('default-tenant'),
    getTenantSettings('default-tenant')
  ]);
  
  const contracts = res.success ? res.data?.contracts || [] : [];
  const clientInfo = res.success ? res.data?.client || null : null;
  const tenantSettings = settingsRes.success ? settingsRes.data : null;

  return <ClientContractsClient initialContracts={contracts} clientInfo={clientInfo} tenantSettings={tenantSettings} />;
}
