import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { HeartPulse, Bot, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Sağlık Turizmi & Klinikler İçin AI & Web Otomasyonu — StarWebFlow',
  description: 'Sağlık turizmi ve klinikler için 7/24 otonom hasta randevu alma, WhatsApp AI asistanı ve uluslararası SEO uyumlu Next.js 14 web platformları.',
};

export default function SaglikSektorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />
      <main className="pt-28 pb-16">
        {/* HERO */}
        <section className="py-16 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 mb-6">
            <HeartPulse className="w-4 h-4" />
            Sağlık Turizmi & Klinik Ekosistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Uluslararası Hastalar İçin <br />
            <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              7/24 AI Hasta Kabul & Randevu Otomasyonu
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-[#94A3B8] text-lg sm:text-xl leading-relaxed mb-8">
            Gece saat farkı nedeniyle kaçan yurt dışı hastalarına son verin. Almanca, İngilizce ve Arapça bilen AI Ajanı ile hastalarınızı anında karşılayın, ön bilgi toplayın ve doğrudan CRM takviminize randevu düşürün.
          </p>
        </section>

        {/* FEATURES GRID */}
        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Bot className="w-10 h-10 text-rose-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Çok Dilli AI Hasta Karşılama</h3>
            <p className="text-[#94A3B8] text-sm">
              Almanca, İngilizce, Fransızca ve Arapça dillerinde 7/24 hastaları karşılar, tedavi paketleri hakkında bilgi verir.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Clock className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Otomatik Randevu & CRM</h3>
            <p className="text-[#94A3B8] text-sm">
              Hasta taleplerini ve tıbbi fotoğraflarını güvenli şekilde toplayıp doktor takviminizle eşzamanlar.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">KVKK & HIPAA Uyumlu Güvenlik</h3>
            <p className="text-[#94A3B8] text-sm">
              Hasta mahremiyeti standartlarına tam uyumlu, şifrelenmiş veri iletimi ve güvenli bulut altyapısı.
            </p>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
