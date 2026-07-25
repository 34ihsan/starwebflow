import { getInboxMessages } from '@/app/actions/inbox';
import InboxClient from './InboxClient';

export default async function InboxPage() {
  const result = await getInboxMessages();
  const messages = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Inbox 📩</h1>
        <p className="text-[#94A3B8] mb-8">
          Tüm bağlı e-posta hesaplarınıza (Warmup harici) gelen organik mesajlar burada toplanır.
        </p>
        
        <InboxClient initialMessages={messages || []} />
      </div>
    </div>
  );
}
