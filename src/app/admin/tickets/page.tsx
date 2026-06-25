import { prisma } from '@/lib/prisma';
import { getTickets } from '@/app/actions/ticket';
import AdminTicketsClient from './AdminTicketsClient';

export const metadata = {
  title: 'StarWebFlow | Destek Talepleri (Admin)',
  description: 'Müşteri destek talepleri yönetimi',
}

export default async function AdminTicketsPage() {
  const tenantId = 'default-tenant';
  let initialTickets: any[] = [];
  
  const res = await getTickets(tenantId);
  if (res.success && res.data) {
    initialTickets = res.data;
  }

  return <AdminTicketsClient initialTickets={initialTickets} tenantId={tenantId} />;
}
