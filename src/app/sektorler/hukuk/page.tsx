import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { Scale, Bot, FileText, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hukuk Büroları & Danışmanlık İçin AI & Web Otomasyonu — StarWebFlow',
  description: 'Avukatlık büroları için müvekkil ön eleme, otomatik evrak toplama ve KVKK/DSGVO onaylı güvenli dijital prestij altyapısı. 7/24 AI asistan ile potansiyel müvekkilleri kaçırmayın.',
  keywords: 'hukuk bürosu web sitesi, avukat dijital pazarlama, müvekkil ön eleme ai, dsgvo uyumlu hukuk yazılımı, avukatlık crm',
  alternates: { canonical: 'https://starwebflow.com/sektorler/hukuk' },
};

const sectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://starwebflow.com/sektorler/hukuk',
  'name': 'Hukuk Büroları için AI & Web Otomasyon Çözümleri',
  'description': 'Avukatlık büroları için müvekkil ön eleme, otomatik evrak ve KVKK/DSGVO uyumlu dijital altyapı.',
  'isPartOf': { '@id': 'https://starwebflow.com/#website' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Hukuk bürosu için AI asistan nasıl çalışır?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow hukuk bürosu AI asistanı, web sitesine gelen potansiyel müvekkillere 7/24 yanıt verir. Hukuki alan (aile hukuku, iş hukuku, ceza hukuku vb.) ve dava özetini toplar, uygunluk ön değerlendirmesi yapar ve avukatın takvimine uygun ilk görüşme randevusu oluşturur. Gizlilik politikasına uygun, şifreli iletişim kullanır.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Avukatlık web sitesi DSGVO ve KVKK uyumlu nasıl olur?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Hukuk bürosu web siteleri özellikle gizlilik hassasiyeti yüksektir. StarWebFlow: AES-256 şifreli form verileri, GDPR uyumlu çerez yönetimi, otomatik veri saklama/imha politikası (1 yıl potansiyel müvekkil verisi) ve avukat-müvekkil gizliliğine uygun şifreli mesajlaşma altyapısı sunar.'
      }
    }
  ]
};

export default function HukukSektorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sectorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
