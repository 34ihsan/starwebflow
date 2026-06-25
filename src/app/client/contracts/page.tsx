import { getClientDashboardData } from '@/app/actions/client';
import ClientContractsClient from './ClientContractsClient';

export const metadata = {
  title: 'StarWebFlow | Sözleşmelerim',
  description: 'Müşteri Sözleşmeleri',
}

export default async function ClientContractsPage() {
  const res = await getClientDashboardData('default-tenant');
  const contracts = res.success ? res.data?.contracts || [] : [];

  return <ClientContractsClient initialContracts={contracts} />;
}
