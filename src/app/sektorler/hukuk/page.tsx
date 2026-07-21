import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { Scale, Bot, FileText, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Hukuk Büroları & Danışmanlık İçin AI & Web Otomasyonu — StarWebFlow',
  description: 'Hukuk büroları için müvekkil ön eleme, otomatik evrak toplama ve KVKK/DSGVO onaylı güvenli dijital prestij altyapısı.',
};

export default function HukukSektorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="py-16 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 mb-6">
            <Scale className="w-4 h-4" />
            Hukuk Büroları & Danışmanlık Ekosistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Müvekkil Ön Eleme & <br />
            <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Otomatik Danışmanlık Randevu Sistemi
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-[#94A3B8] text-lg sm:text-xl leading-relaxed mb-8">
            Uygun olmayan dava ve danışmanlık talepleriyle vakit kaybetmeyin. AI Asistanı müvekkillerinizin hukuki konusunu önden analiz eder, gerekli ön bilgileri toplar ve filtrelenmiş nitelikli danışmanlık randevusunu oluşturur.
          </p>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Bot className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Akıllı Müvekkil Ön Eleme</h3>
            <p className="text-[#94A3B8] text-sm">
              Danışmanlık konusunu (Ticaret, İş, Ceza, Gayrimenkul) tespit ederek ön soru setlerini yanıtlatır.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <FileText className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Otomatik Evrak & Ön Bilgi Toplama</h3>
            <p className="text-[#94A3B8] text-sm">
              Görüşme öncesi gerekli dava evraklarını ve özet detayları güvenli kanaldan toplar.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">DSGVO / KVKK Tam Gizlilik Mührü</h3>
            <p className="text-[#94A3B8] text-sm">
              Sır saklama ve gizlilik protokollerine uygun, izole veri sunucuları ile sıfır veri sızıntısı.
            </p>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
