import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { Truck, Bot, Calculator, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lojistik & Taşımacılık İçin Otomatik Navlun & Teklif Otomasyonu — StarWebFlow',
  description: 'Lojistik ve navlun şirketleri için anlık navlun hesaplama, otomatik PDF teklif gönderme ve WhatsApp takip botu. API entegrasyonu ile gümrük ve kargo entegrasyonu.',
  keywords: 'lojistik yazılımı, navlun hesaplama, kargo takip sistemi, lojistik ai otomasyon, rfq otomasyon, tedarik zinciri dijitalleşme',
  alternates: { canonical: 'https://starwebflow.com/sektorler/lojistik' },
};

const sectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://starwebflow.com/sektorler/lojistik',
  'name': 'Lojistik & Taşımacılık Sektörü AI & Otomasyon Çözümleri',
  'isPartOf': { '@id': 'https://starwebflow.com/#website' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Lojistik şirketi için AI navlun hesaplama sistemi nasıl kurulur?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow, mevcut TMS (Taşıma Yönetim Sistemi) veya API’ya bağlanarak anlık navlun hesaplama ve otomatik PDF teklif üretimi sunar. Müşteri teklif taleplerini (RFQ) AI ile ön işleyip insan müdahalesini minimuma indirir.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Lojistik sektörü için hangi dijital çözümler sunuyorsunuz?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Anlık navlun ve kota hesaplama, otomatik PDF teklif gönderme, WhatsApp kargo takip botu, uluslararası müşteri için çok dilli web portal, API entegrasyonu (gümrük, haritalama, kargo takip) ve B2B lead capture sistemi sunuyoruz.'
      }
    }
  ]
};

export default function LojistikSektorPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sectorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="py-16 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800 mb-6">
            <Truck className="w-4 h-4 text-cyan-600" />
            Lojistik & Navlun Ekosistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
            Anında Navlun Hesaplama & <br />
            <span className="text-cyan-600">
              Otomatik PDF Teklif Platformu
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 font-normal">
            Yük ve konteyner tekliflerini saatlerce manuel hazırlamaya son verin. Çıkış/Varış lokasyonu, desimetreküp ve ağırlığa göre otomatik navlun fiyatlandırması sunun ve PDF teklifini müşterinize saniyeler içinde iletin.
          </p>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all">
            <Calculator className="w-10 h-10 text-cyan-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Otomatik Navlun & Desi Hesaplama</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              Karayolu, Denizyolu ve Havayolu için canlı navlun fiyat matrisi ve otomatik teklif oluşturma.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all">
            <Bot className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp Kargo & Yük Takip Botu</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              Müşterilerinize konteyner ve yük durumunu WhatsApp üzerinden otomatik bildiren AI destekli takip sistemi.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Entegre ERP & CRM Altyapısı</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
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
