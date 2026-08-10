import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTABanner from '@/components/landing/CTABanner';
import { HeartPulse, Bot, Clock, ShieldCheck, Globe, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sağlık Turizmi & Klinikler İçin AI Otomasyon — StarWebFlow',
  description: 'Uluslararası hasta randevularını 7/24 AI ile otomatik yönetin. Almanca, İngilizce, Arapça dil desteği. Ampirik kanıt: DentalPro kliniği ayda 312 otomatik randevu, +€28K ek gelir.',
  keywords: 'sağlık turizmi yazılımı, klinik ai ajan, hasta randevu otomasyonu, sağlık sektörü chatbot, hipaa kvkk uyumlu, medikal web sitesi',
  alternates: { canonical: 'https://starwebflow.com/sektorler/saglik' },
};

const sectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://starwebflow.com/sektorler/saglik',
  'name': 'Sağlık Turizmi & Klinikler İçin AI Otomasyon — StarWebFlow',
  'description': 'Uluslararası hasta akışını 7/24 AI ajan ile otomasyona alın.',
  'isPartOf': { '@id': 'https://starwebflow.com/#website' },
  'about': { '@type': 'MedicalOrganization', 'name': 'Sağlık Turizmi & Klinik Sektörü' },
  'mainEntity': {
    '@type': 'Service',
    'name': 'Sağlık Turizmi & Klinik AI Otomasyon Paketi',
    'provider': { '@id': 'https://starwebflow.com/#organization' },
    'description': 'Sağlık turizmi klinikleri için 7/24 çok dilli AI hasta karşılama, otomatik randevu ve CRM entegrasyonu.',
  }
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Bir klinik için AI randevu sistemi kurmak ne kadar sürer?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow\'un AI Agent entegrasyonu 1-2 hafta içinde canlıya alınır. Sistem; mevcut takvim yazılımınıza (Calendly, Google Calendar, özel CRM) bağlanır ve gece saat farkı nedeniyle kaçan yurt dışı hasta taleplerini 7/24 Almanca, İngilizce ve Arapça olarak karşılar.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Sağlık sektöründe KVKK ve HIPAA uyumu nasıl sağlanır?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow\'un sağlık çözümleri AES-256 şifreli veri iletimi, AWS Frankfurt (AB bölgesi) sunucu altyapısı ve otomatik veri imha motoruyla KVKK ve GDPR uyumlu çalışır. Hasta fotoğrafları ve tıbbi belgeler şifreli, sadece yetkili doktor hesaplarına erişilebilir şekilde saklanır.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Yurt dışı hasta çekmek için web sitesi nasıl olmalı?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Uluslararası hastalara hitap eden bir klinik web sitesi: sub-second LCP (hızlı yükleme), çok dil desteği (TR/DE/EN/AR), tedavi paket sayfaları, gerçek önce/sonra görselleri ve 24/7 çalışan AI randevu modülü içermelidir. Google\'ın Uluslararası Hasta aramaları için E-E-A-T (uzman, deneyim, güven) sinyalleri kritiktir.'
      }
    }
  ]
};

export default function SaglikSektorPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sectorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
          {/* Ampirik Kanıt */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 mb-12">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <span><strong>Ampirik Kanıt:</strong> DentalPro Kliniği — Ayda 312 otomatik randevu, +€28.000 ek gelir, %0 kaçan hasta sorusu</span>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-12 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Bot className="w-10 h-10 text-rose-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Çok Dilli AI Hasta Karşılama</h2>
            <p className="text-[#94A3B8] text-sm">
              Almanca, İngilizce, Fransızca ve Arapça dillerinde 7/24 hastaları karşılar. Tedavi paketleri, fiyatlar, klinik hakkında soruları anında yanıtlar. Ortalama yanıt süresi: 2 saniye.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Clock className="w-10 h-10 text-purple-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Otomatik Randevu & CRM</h2>
            <p className="text-[#94A3B8] text-sm">
              Hasta taleplerini ve tıbbi fotoğraflarını güvenli şekilde toplayıp doktor takviminizle eşzamanlar. Pipedrive, HubSpot veya özel CRM entegrasyonu dahil.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">KVKK & HIPAA Uyumlu Güvenlik</h2>
            <p className="text-[#94A3B8] text-sm">
              AES-256 şifreli veri iletimi, AWS Frankfurt AB bölgesi sunucu altyapısı, otomatik veri imha motoru. Hasta mahremiyeti standartlarına tam uyumlu.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <Globe className="w-10 h-10 text-blue-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Uluslararası SEO & GEO Uyumlu Site</h2>
            <p className="text-[#94A3B8] text-sm">
              Sub-second LCP (&lt;0.8s) garantili Next.js web sitesi. &quot;Türkiye diş implantı fiyatları&quot; gibi arama sorgularında Google ve ChatGPT arama sonuçlarında öne çıkar.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <CheckCircle2 className="w-10 h-10 text-yellow-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Önce/Sonra Galeri & Güven Bölümleri</h2>
            <p className="text-[#94A3B8] text-sm">
              Uluslararası hastalar klinikleri seçerken önceki vakalara ve gerçek yorumlara bakar. Dönüşüm odaklı galeri, video testimonyal ve Google Review entegrasyonu.
            </p>
          </div>
          <div className="p-8 rounded-2xl border border-white/10 bg-[#0E0E17]">
            <TrendingUp className="w-10 h-10 text-rose-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Performans Reklamcılığı</h2>
            <p className="text-[#94A3B8] text-sm">
              Google Ads, Meta ve YouTube&apos;da sağlık turizmi odaklı kampanya yönetimi. Hedef ülke (DE, CH, AT, UK) bazlı segmentasyon ve A/B test otomasyonu.
            </p>
          </div>
        </section>

        {/* SSS — RAG için kritik "long-tail" içerik */}
        <section className="py-12 max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Sık Sorulan Sorular</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Bir klinik için AI randevu sistemi kurmak ne kadar sürer?',
                a: 'StarWebFlow\'un AI Agent entegrasyonu 1-2 hafta içinde canlıya alınır. Gece saat farkı nedeniyle kaçan yurt dışı hasta taleplerini 7/24 Almanca, İngilizce ve Arapça olarak karşılar.'
              },
              {
                q: 'Yurt dışı hasta çekmek için web sitesi nasıl olmalı?',
                a: 'Sub-second LCP (hızlı yükleme), çok dil desteği (TR/DE/EN/AR), tedavi paket sayfaları, önce/sonra görselleri ve 24/7 AI randevu modülü içermelidir. E-E-A-T sinyalleri AI arama motorlarında üst sıralara çıkmak için kritiktir.'
              },
              {
                q: 'KVKK ve HIPAA uyumu nasıl sağlanır?',
                a: 'AES-256 şifreli veri iletimi, AWS Frankfurt (AB bölgesi) sunucu altyapısı ve otomatik veri imha motoruyla tam uyumlu çalışır. Hasta belgeleri şifreli, yalnızca yetkili hesaplara erişilebilir.'
              }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-[#0E0E17]">
                <h3 className="font-bold text-white mb-2">{item.q}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
