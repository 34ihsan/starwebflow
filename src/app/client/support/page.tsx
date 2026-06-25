import { prisma } from '@/lib/prisma';
import { getClientTickets } from '@/app/actions/ticket';
import ClientSupportClient from './ClientSupportClient';

export const metadata = {
  title: 'StarWebFlow | Destek & İletişim',
  description: 'Müşteri Destek Merkezi',
}

export default async function ClientSupportPage() {
  const tenantId = 'default-tenant';
  let clientId = '';
  
  const firstClient = await prisma.user.findFirst({
    where: { tenantId, role: 'CLIENT_MEMBER' },
    select: { id: true }
  });
  if (firstClient) {
    clientId = firstClient.id;
  }

  let initialTickets: any[] = [];
  if (clientId) {
    const res = await getClientTickets(tenantId, clientId);
    if (res.success && res.data) {
      initialTickets = res.data;
    }
  }

  return <ClientSupportClient initialTickets={initialTickets} clientId={clientId} tenantId={tenantId} />;
}
