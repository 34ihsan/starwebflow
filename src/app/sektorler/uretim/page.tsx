import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { Factory, Bot, Layers, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'B2B Üretim & Sanayi İçin AI Dijital Kataloğu & Talep Otomasyonu — StarWebFlow',
  description: 'İmalatçı ve sanayiciler için uluslararası B2B ürün kataloğu, özel RFQ (Teklif İste) otomasyonu ve küresel müşteri kazanım sistemi.',
};

export default function UretimSektorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="py-16 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-6">
            <Factory className="w-4 h-4" />
            B2B İmalat & Sanayi Ekosistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Küresel B2B Ürün Kataloğu & <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
              Otomatik RFQ (Teklif İste) Motoru
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-[#94A3B8] text-lg sm:text-xl leading-relaxed mb-8">
            Sanayi ürünlerinizi ve teknik spektleri dünya genelindeki toptan alıcılara sergileyin. Özel CAD/PDF dosya yükleme destekli RFQ motoru ile gelen talepleri anında sınıflandırıp satış mühendislerinize yönlendirin.
          </p>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Layers className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">İnteraktif B2B Ürün Kataloğu</h3>
            <p className="text-[#94A3B8] text-sm">
              Binlerce parçayı filtrelenebilir teknik özellikler, 3D/CAD indirme ve özel şartnamelerle sunun.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Bot className="w-10 h-10 text-teal-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Akıllı RFQ & İhale Talebi Motoru</h3>
            <p className="text-[#94A3B8] text-sm">
              Alıcıların adet, tolerans ve teslimat şartlarını otomatik forma dökerek hızlı fiyatlama yapın.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <ShieldCheck className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">ISO & Sanayi Sertifikasyon Sergisi</h3>
            <p className="text-[#94A3B8] text-sm">
              ISO 9001, CE, TUV onay belgeleriniz ve kalite yönetim standartlarınızla kurumsal güven inşa edin.
            </p>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
