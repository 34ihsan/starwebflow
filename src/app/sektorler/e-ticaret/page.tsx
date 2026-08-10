// ─── E-Ticaret Sektör Sayfası — Server Component (Next.js Page) ─────────────
import type { Metadata } from 'next';
import EcommerceClient from './EcommerceClient';

export const metadata: Metadata = {
  title: 'E-Ticaret & Online Mağaza İçin AI Otomasyon — StarWebFlow',
  description: '7/24 AI sipariş & iade desteği, sepet terk kurtarma botları ve reklam otomasyonu. Ampirik kanıt: Sepet terk oranı -%28, müşteri memnuniyeti 4.9/5.',
  keywords: 'e-ticaret ai otomasyon, online mağaza chatbot, shopify entegrasyonu, woocommerce ai, sepet terk otomasyonu',
  alternates: { canonical: 'https://starwebflow.com/sektorler/e-ticaret' },
};

const sectorSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://starwebflow.com/sektorler/e-ticaret',
  'name': 'E-Ticaret & Online Mağaza Sektörü AI & Otomasyon Çözümleri',
  'description': 'E-ticaret işletmeleri için 7/24 AI sipariş destek ajanı, sepet terk kurtarma botu ve ROAS optimize reklam yönetimi. Ampirik kanıt: Sepet terk oranı -%28.',
  'isPartOf': { '@id': 'https://starwebflow.com/#website' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'E-ticaret mağazama AI müşteri destek botu nasıl entegre edilir?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow AI destek botu; Shopify, WooCommerce veya özel e-ticaret platformunuza API üzerinden bağlanır. Sipariş durumu, iade talepleri, ürün soruları ve stok bilgilerini otomatik yanıtlar. Ortalama kurulum süresi 5-7 iş günüdür. Ampirik kanıt: Sepet terk oranı -%28, müşteri memnuniyeti 4.9/5.'
      }
    },
    {
      '@type': 'Question',
      'name': 'E-ticaret için AI reklam yönetimi nasıl çalışır?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'StarWebFlow AI Otopilot motoru; Meta, Google Shopping ve TikTok Ads kampanyalarınızı gerçek zamanlı ROAS ve CTR verilerine göre optimize eder. Zarar eden reklam gruplarını otomatik durdurur, bütçeyi en karlı ürün kategorilerine kaydırır. Ortalama ROAS artışı: 3.13x.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sectorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <EcommerceClient />
    </>
  );
}
