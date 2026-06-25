import { getContracts } from '@/app/actions/contract';
import ContractsDashboardClient from './ContractsDashboardClient';

export default async function AdminContractsDashboardPage() {
  const res = await getContracts('default-tenant');
  const initialContracts = res.success ? res.data : [];

  return <ContractsDashboardClient initialContracts={res.data || []} />;
}
