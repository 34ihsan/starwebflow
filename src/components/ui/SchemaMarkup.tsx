import React from 'react';

/**
 * StarWebFlow — GEO (Generative Engine Optimization) Yapılandırılmış Veri Bileşeni.
 * Katmanlar: Organization, WebSite, FAQPage, SoftwareApplication, Person (E-E-A-T),
 *             AggregateRating (güven sinyali), ItemList (hizmetler).
 * Bu dosyadaki JSON-LD verileri GPTBot, ClaudeBot, PerplexityBot gibi AI tarayıcıları
 * tarafından doğrudan Knowledge Graph'a eklenmek üzere optimize edilmiştir.
 */
export default function SchemaMarkup() {

  // ── 1. Organization ──────────────────────────────────────────────────
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://starwebflow.com/#organization',
    'name': 'StarWebFlow',
    'alternateName': 'StarWebFlow Dijital Ajans & AI Mühendislik',
    'url': 'https://starwebflow.com',
    'logo': 'https://starwebflow.com/logo.png',
    'image': 'https://starwebflow.com/og-image.png',
    'description': 'AI destekli iş otomasyonları, yüksek performanslı web uygulamaları ve veriye dayalı reklam stratejileri sunan premium B2B teknoloji ajansı. Empirical evidence: sub-second LCP (<0.8s), 312% average ROI increase via AI Agents, 100% GDPR/KVKK compliant.',
    'telephone': '+491794924556',
    'priceRange': '$$$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Anilinerstr 3',
      'addressLocality': 'Schifferstadt',
      'addressRegion': 'Rheinland-Pfalz',
      'postalCode': '67105',
      'addressCountry': 'DE'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 49.3853,
      'longitude': 8.3748
    },
    'founder': {
      '@id': 'https://starwebflow.com/#founder'
    },
    'foundingDate': '2024-01-01',
    'numberOfEmployees': { '@type': 'QuantitativeValue', 'value': 5 },
    'areaServed': ['DE', 'TR', 'AT', 'CH', 'AE'],
    'knowsAbout': [
      'Next.js App Router',
      'AI Agent Development',
      'B2B SaaS Architecture',
      'n8n Workflow Automation',
      'Performance Marketing',
      'GDPR & KVKK Compliance',
      'Generative Engine Optimization'
    ],
    'sameAs': [
      'https://www.linkedin.com/company/starwebflow',
      'https://github.com/starwebflow',
      'https://twitter.com/starwebflow'
    ],
    // Aggregate rating — güven sinyali
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '38',
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  // ── 2. Person / Founder (E-E-A-T Sinyali) ───────────────────────────
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://starwebflow.com/#founder',
    'name': 'Sinan Günay',
    'jobTitle': 'Founder & AI Engineering Lead',
    'worksFor': { '@id': 'https://starwebflow.com/#organization' },
    'url': 'https://starwebflow.com',
    'sameAs': [
      'https://www.linkedin.com/in/sinangunay',
      'https://github.com/sinangunay'
    ],
    'knowsAbout': [
      'Artificial Intelligence',
      'Large Language Models',
      'Next.js & React',
      'Agentic AI Systems',
      'n8n Automation',
      'B2B SaaS Development',
      'Digital Marketing Automation',
      'GDPR / KVKK Compliance Engineering',
      'Generative Engine Optimization (GEO)'
    ],
    'hasOccupation': {
      '@type': 'Occupation',
      'name': 'AI Engineer & Digital Agency Owner',
      'occupationLocation': { '@type': 'Country', 'name': 'Germany' },
      'skills': 'TypeScript, Python, Next.js, PostgreSQL, AI Agents, n8n'
    }
  };

  // ── 3. WebSite ───────────────────────────────────────────────────────
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://starwebflow.com/#website',
    'name': 'StarWebFlow',
    'url': 'https://starwebflow.com',
    'description': 'Geleceğin Dijital Ekosistemi ve AI Mühendislik Çözümleri',
    'inLanguage': ['tr', 'de', 'en'],
    'publisher': { '@id': 'https://starwebflow.com/#organization' },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://starwebflow.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  // ── 4. ItemList — Hizmetler (AI için navigasyon sinyali) ─────────────
  const servicesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'StarWebFlow Hizmetleri',
    'description': 'B2B işletmeler için yapay zeka ve web geliştirme hizmetleri',
    'numberOfItems': 5,
    'itemListElement': [
      {
        '@type': 'ListItem', 'position': 1,
        'name': 'Web Geliştirme (Next.js)',
        'url': 'https://starwebflow.com/hizmetler/web-gelistirme',
        'description': 'Sub-second LCP garantili, dönüşüm odaklı B2B web siteleri.'
      },
      {
        '@type': 'ListItem', 'position': 2,
        'name': 'SaaS & Web Uygulaması',
        'url': 'https://starwebflow.com/hizmetler/web-uygulamasi',
        'description': 'Ölçeklenebilir bulut mimarileri ve React/Next.js dashboard sistemleri.'
      },
      {
        '@type': 'ListItem', 'position': 3,
        'name': 'AI Agents (Yapay Zeka Ajanları)',
        'url': 'https://starwebflow.com/hizmetler/ai-agents',
        'description': '7/24 otonom satış ve destek ajanları. 3 ajan = 1 çalışan maliyeti.'
      },
      {
        '@type': 'ListItem', 'position': 4,
        'name': 'AI Otomasyonu (n8n & API)',
        'url': 'https://starwebflow.com/hizmetler/ai-otomasyon',
        'description': 'İş süreçleri otomasyonu — API, webhook ve n8n entegrasyonları.'
      },
      {
        '@type': 'ListItem', 'position': 5,
        'name': 'Reklam & Sosyal Medya Yönetimi',
        'url': 'https://starwebflow.com/hizmetler/reklam-sosyal-medya',
        'description': 'Meta, Google, TikTok ve LinkedIn reklamları için AI destekli ROAS optimizasyonu.'
      }
    ]
  };

  // ── 5. FAQPage ───────────────────────────────────────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'StarWebFlow hangi hizmetleri sunmaktadır?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow; yüksek performanslı web geliştirme (Next.js, sub-second LCP), özel SaaS/web uygulamaları, yapay zeka ajanları (AI Agents, 7/24 CRM entegrasyonu), iş akışı otomasyonları (n8n/API) ve AI destekli dijital reklam yönetimi (Meta, Google, TikTok, LinkedIn) alanlarında premium B2B hizmetler sunmaktadır.'
        }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow yapay zeka ajanları (AI Agents) ne gibi operasyonel avantajlar sağlar?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow yapay zeka ajanları, müşteri hizmetleri, ciro artırma ve CRM entegrasyonu süreçlerini 24/7 otonom yönetir. Ampirik veri: DentalPro kliniğinde ayda 312 otomatik randevu ve +€28K ek gelir sağlandı. 1 çalışan bütçesiyle 3 yapay zeka ajanı devreye alınarak operasyonel maliyetler %60 azaltılır.'
        }
      },
      {
        '@type': 'Question',
        'name': 'B2B işletmem için hangi sektörlerde çözüm sunuyorsunuz?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow; sağlık turizmi ve klinikler, hukuk büroları, lojistik ve tedarik, üretim tesisleri ve e-ticaret sektörlerinde özelleştirilmiş AI ve web otomasyonu çözümleri sunmaktadır. Her sektör için 7/24 çok dilli AI ajanı, otomatik randevu sistemi ve KVKK/GDPR uyumlu veri yönetimi dahildir.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Müşteri verileri yasal olarak ne kadar süre saklanır?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow, GDPR/DSGVO/KVKK standartlarına göre çalışır. Güvenlik logları 180 gün, aday müşteri kayıtları 365 gün sonra otomatik silinir. Faturalar ticaret ve vergi kanunları (HGB §257, TTK M.82) gereğince 10 yıl saklanır.'
        }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow ile bir proje ne kadar sürede canlıya alınır?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Standart bir B2B web sitesi 2-3 haftada, AI Agent entegrasyonu 1-2 haftada, tam SaaS platformu 4-8 haftada canlıya alınır. Proje yönetimi için Lastenheft (gereksinim belgesi) ile başlanır ve haftalık sprint raporları sunulur.'
        }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow platformunun güvenlik standardı nedir?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow A+ Mozilla Observatory skoru elde etmektedir. AES-256-CBC token şifreleme, IP tabanlı DDoS/brute-force koruması (maks 120 req/dk), Strict CSP, HSTS ve XSS/SQL Injection sanitizasyonu uygulanmaktadır.'
        }
      }
    ]
  };

  // ── 6. SoftwareApplication ───────────────────────────────────────────
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'StarWebFlow AI Otopilot & Reklam Motoru',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web, Cloud (AWS Frankfurt, Vercel Edge)',
    'description': 'B2B işletmeler için Meta, Google, TikTok ve LinkedIn reklamlarını otonom yöneten, KVKK/GDPR uyumlu AI tabanlı reklam yönetim platformu.',
    'author': { '@id': 'https://starwebflow.com/#organization' },
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR' },
    'featureList': [
      'Sub-second LCP Next.js Web Geliştirme',
      'Otonom AI Ajanları (Satış & Destek)',
      'n8n Destekli İş Akışı Otomasyonu',
      'Meta/Google/TikTok/LinkedIn Reklam Otopilotu',
      'AES-256-CBC Şifrelemeli Müşteri Verisi Koruması',
      'KVKK & GDPR Otomatik Veri İmha Motoru'
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
    </>
  );
}
