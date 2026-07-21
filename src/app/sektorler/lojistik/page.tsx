import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { Truck, Bot, Calculator, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Lojistik & Taşımacılık İçin Otomatik Navlun & Teklif Otomasyonu — StarWebFlow',
  description: 'Lojistik ve navlun şirketleri için anlık navlun hesaplama, otomatik PDF teklif gönderme ve WhatsApp takip botu.',
};

export default function LojistikSektorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="py-16 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-6">
            <Truck className="w-4 h-4" />
            Lojistik & Navlun Ekosistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Anında Navlun Hesaplama & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Otomatik PDF Teklif Platformu
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-[#94A3B8] text-lg sm:text-xl leading-relaxed mb-8">
            Yük ve konteyner tekliflerini saatlerce manuel hazırlamaya son verin. Çıkış/Varış lokasyonu, desimetreküp ve ağırlığa göre otomatik navlun fiyatlandırması sunun ve PDF teklifini müşterinize saniyeler içinde iletin.
          </p>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Calculator className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Otomatik Navlun & Desi Hesaplama</h3>
            <p className="text-[#94A3B8] text-sm">
              Karayolu, Denizyolu ve Havayolu için canlı navlun fiyat matrisi ve otomatik teklif oluşturma.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Bot className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">WhatsApp Kargo & Yük Takip Botu</h3>
            <p className="text-[#94A3B8] text-sm">
              Müşterilerinize konteyner ve yük durumunu WhatsApp üzerinden otomatik bildiren AI destekli takip sistemi.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Entegre ERP & CRM Altyapısı</h3>
            <p className="text-[#94A3B8] text-sm">
              Gelen tüm taşıma taleplerini temsilci atamasıyla CRM panelinize eşzamanlı aktarır.
            </p>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
