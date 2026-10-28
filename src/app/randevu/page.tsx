import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ChatWidget from '@/components/marketing/ChatWidget';
import AppointmentBookingClient from './AppointmentBookingClient';

export const metadata = {
  title: '15 Dakikalık Ücretsiz Mimari & Fizibilite Randevusu | Starwebflow',
  description:
    'Sovereign AI (Ollama), süreç otomasyonu (n8n), Next.js kurumsal web sistemleri ve canlı site denetimi için kıdemli yazılım mimarımızla birebir teknik keşif randevusu planlayın.',
};

export default function RandevuPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col w-full max-w-full overflow-x-hidden">
      <Navbar />
      <div className="flex-1">
        <AppointmentBookingClient />
      </div>
      <Footer />
      <ChatWidget />
    </main>
  );
}

