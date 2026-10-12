import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { Factory, Bot, Layers, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'B2B Üretim & Sanayi İçin AI Dijital Kataloğu & Talep Otomasyonu — StarWebFlow',
  description: 'İmalatcı ve sanayiciler için uluslararası B2B ürün kataloğu, özel RFQ (Teklif İste) otomasyonu ve küresel müşteri kazanm sistemi. Almanya, Avusturya ve İsviçre pazarlarına açılın.',
  keywords: 'üretim b2b yazılım, sanayi dijitalleşme, rfq teklif otomasyonu, üretici web sitesi, ihracatçı dijital pazarlama, erp entegrasyonu',
  alternates: { canonical: 'https://starwebflow.com/sektorler/uretim' },
};

const sectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://starwebflow.com/sektorler/uretim',
  'name': 'B2B Üretim & Sanayi Sektörü AI & Otomasyon Çözümleri',
  'isPartOf': { '@id': 'https://starwebflow.com/#website' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Bir üretim firması için dijital B2B kataloğu nasıl kurulur?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow B2B dijital katalog sistemi; ürünleri kategori/teknik özellik bazlı filtreli gösterir, fiyat teklifini (RFQ) otomatik toplar ve satış ekibine émail/CRM bildirimi gönderir. Almanca ve İngilizce dil desteği ile DACH pazarına erişimi kolaylaştırır.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Almanya ve Avrupa B2B pazarına web sitesi ile nasıl açılırım?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'DACH (Almanya, Avusturya, İsviçre) pazarı için; Almanca SEO optimize web sitesi, DSGVO uyumlu form sistemi, Google Ads Almanya kampanyası ve B2B lead nurturing otomasyonu kurulması gerekir. StarWebFlow tüm bu öğeleri tek pakette sunmaktadır.'
      }
    }
  ]
};

export default function UretimSektorPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sectorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="py-16 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-6">
            <Factory className="w-4 h-4 text-emerald-600" />
            B2B İmalat & Sanayi Ekosistemi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
            Küresel B2B Ürün Kataloğu & <br />
            <span className="text-emerald-600">
              Otomatik RFQ (Teklif İste) Motoru
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 font-normal">
            Sanayi ürünlerinizi ve teknik spektleri dünya genelindeki toptan alıcılara sergileyin. Özel CAD/PDF dosya yükleme destekli RFQ motoru ile gelen talepleri anında sınıflandırıp satış mühendislerinize yönlendirin.
          </p>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all">
            <Layers className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">İnteraktif B2B Ürün Kataloğu</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              Binlerce parçayı filtrelenebilir teknik özellikler, 3D/CAD indirme ve özel şartnamelerle sunun.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all">
            <Bot className="w-10 h-10 text-teal-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Akıllı RFQ & İhale Talebi Motoru</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
              Alıcıların adet, tolerans ve teslimat şartlarını otomatik forma dökerek hızlı fiyatlama yapın.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all">
            <ShieldCheck className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">ISO & Sanayi Sertifikasyon Sergisi</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-normal">
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
