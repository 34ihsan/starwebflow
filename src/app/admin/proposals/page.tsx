import { getProposals } from '@/app/actions/proposal';
import ProposalsDashboardClient from './ProposalsDashboardClient';

export const metadata = {
  title: 'StarWebFlow | Teklif Talepleri (Admin)',
  description: 'Müşterilerden gelen SLA ve proforma teklif istekleri',
};

export default async function AdminProposalsPage() {
  const tenantId = 'default-tenant';
  const res = await getProposals(tenantId);
  const proposals = (res.success && res.data ? res.data : []).map(p => ({
    ...p,
    oneTimeTotal: Number(p.oneTimeTotal),
    monthlyTotal: Number(p.monthlyTotal),
    grandTotal: Number(p.grandTotal)
  }));

  return <ProposalsDashboardClient initialProposals={proposals as any} tenantId={tenantId} />;
}
