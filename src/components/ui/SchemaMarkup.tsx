import React from 'react';

/**
 * StarWebFlow Arama Motoru ve Yapay Zeka Arama Motorları (GEO) için
 * Yapılandırılmış Veri (Schema.org / JSON-LD) Bileşeni.
 */
export default function SchemaMarkup() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://starwebflow.com/#organization',
    'name': 'StarWebFlow',
    'alternateName': 'StarWebFlow Dijital Ajans & AI Mühendislik',
    'url': 'https://starwebflow.com',
    'logo': 'https://starwebflow.com/logo.png',
    'image': 'https://starwebflow.com/og-image.png',
    'description': 'AI destekli iş otomasyonları, yüksek performanslı web uygulamaları ve veriye dayalı reklam stratejileri sunan premium B2B teknoloji ajansı.',
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
      '@type': 'Person',
      'name': 'Sinan Günay',
      'jobTitle': 'Inhaber & Founder'
    },
    'foundingDate': '2024-01-01',
    'sameAs': [
      'https://www.linkedin.com/company/starwebflow',
      'https://github.com/starwebflow',
      'https://twitter.com/starwebflow'
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://starwebflow.com/#website',
    'name': 'StarWebFlow',
    'url': 'https://starwebflow.com',
    'description': 'Geleceğin Dijital Ekosistemi ve AI Mühendislik Çözümleri',
    'publisher': {
      '@id': 'https://starwebflow.com/#organization'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'StarWebFlow hangi hizmetleri sunmaktadır?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow; yüksek performanslı web geliştirme, özel SaaS/web uygulamaları, yapay zeka ajanları (AI Agents), iş akışı otomasyonları (n8n/API) ve dijital performans reklamcılığı alanlarında premium B2B hizmetler sunmaktadır.'
        }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow yapay zeka ajanları (AI Agents) ne gibi operasyonel avantajlar sağlar?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow yapay zeka ajanları, müşteri hizmetleri, ciro artırma ve CRM entegrasyonu süreçlerini 24/7 otonom yönetir. 1 çalışan bütçesiyle 3 yapay zeka ajanı devreye alınarak operasyonel maliyetler %70\'in üzerinde azaltılır ve iş süreçlerinde 10x hız sağlanır.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Müşteri verileri yasal olarak ne kadar süre saklanır ve ne zaman silinir?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow, yasal uyumluluk (GDPR/DSGVO/KVKK) standartlarına göre çalışır. Güvenlik ve otomasyon logları 180 gün (6 ay) sonra otomatik olarak silinir. Aday müşteri ve randevu kayıtları 1 yıl sonunda imha edilir. Faturalar ve imzalı sözleşmeler ise ticaret ve vergi kanunları gereğince 10 yıl saklandıktan sonra sistemden kalıcı olarak temizlenir veya anonim hale getirilir.'
        }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow platform güvenliğini nasıl sağlamaktadır?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'StarWebFlow, \'savunma derinliği\' (defense-in-depth) mimarisiyle korunmaktadır. Girdi doğrulama ve sanitizasyonu ile XSS ve SQL Injection engellenir. IP tabanlı akıllı Rate Limiting ile DDoS ve kaba kuvvet (Brute Force) saldırıları engellenir. Ayrıca sıkı Content Security Policy (CSP), HSTS ve güvenlik HTTP başlıkları ile veri sızıntılarına karşı tam koruma sağlanır.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
