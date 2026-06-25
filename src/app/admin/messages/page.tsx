import { redirect } from 'next/navigation';
import { getServerSession } from '@/modules/auth/auth.server';
import { getTenantChatThreads } from '@/app/actions/chat';
import AdminMessagesClient from './AdminMessagesClient';

export default async function AdminMessagesPage() {
  const session = await getServerSession();

  if (!session || (session.role !== 'AGENCY_OWNER' && session.role !== 'AGENCY_MEMBER' && session.role !== 'SUPER_ADMIN')) {
    redirect('/auth/login');
  }

  const response = await getTenantChatThreads(session.tenantId);
  const threads = response.success ? response.data : [];

  const { prisma } = await import('@/lib/prisma');
  const allUsers = await prisma.user.findMany({
    where: { 
      tenantId: session.tenantId,
      id: { not: session.userId }
    },
    select: { id: true, name: true, email: true, role: true }
  });

  return (
    <AdminMessagesClient 
      initialThreads={threads} 
      allUsers={allUsers}
      tenantId={session.tenantId} 
      adminId={session.userId} 
    />
  );
}
