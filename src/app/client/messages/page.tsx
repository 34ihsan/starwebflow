import { redirect } from 'next/navigation';
import { getServerSession } from '@/modules/auth/auth.server';
import { getOrCreateClientThread } from '@/app/actions/chat';
import ClientMessagesClient from './ClientMessagesClient';

export default async function ClientMessagesPage() {
  const session = await getServerSession();

  if (!session || session.role !== 'CLIENT_MEMBER') {
    redirect('/auth/login');
  }

  // Get or create the main chat thread for this client
  const response = await getOrCreateClientThread(session.tenantId, session.userId);
  const thread = response.success ? response.data : null;

  return (
    <ClientMessagesClient 
      initialThread={thread} 
      tenantId={session.tenantId} 
      clientId={session.userId} 
    />
  );
}
