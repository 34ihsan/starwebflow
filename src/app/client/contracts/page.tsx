import { getClientDashboardData } from '@/app/actions/client';
import ClientContractsClient from './ClientContractsClient';

export const metadata = {
  title: 'StarWebFlow | Sözleşmelerim',
  description: 'Müşteri Sözleşmeleri',
}

export const maxDuration = 60;

export default async function ClientContractsPage() {
  const res = await getClientDashboardData('default-tenant');
  const contracts = res.success ? res.data?.contracts || [] : [];
  const clientInfo = res.success ? res.data?.client || null : null;

  return <ClientContractsClient initialContracts={contracts} clientInfo={clientInfo} />;
}
