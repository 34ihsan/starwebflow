import React from 'react';

/**
 * StarWebFlow — Titan Mode GEO Schema Markup
 * 
 * Katmanlar:
 * 1. Organization (ProfessionalService) + E-E-A-T signals
 * 2. Person / Founder (expertise + authority)
 * 3. WebSite + SearchAction
 * 4. ItemList (hizmetler navigasyonu)
 * 5. Service schemas (her hizmet için ayrı)
 * 6. FAQPage (genişletilmiş)
 * 7. SoftwareApplication
 * 8. Review + AggregateRating
 * 9. SpeakableSpecification (AI sesli arama)
 * 10. BreadcrumbList
 *
 * AI Citation Optimization: GPTBot, ClaudeBot, PerplexityBot, Google-Extended
 */
export default function SchemaMarkup() {

  // ── 1. Organization (ProfessionalService) ────────────────────────────
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'Organization'],
    '@id': 'https://starwebflow.com/#organization',
    'name': 'StarWebFlow',
    'alternateName': ['StarWebFlow Dijital Ajans', 'StarWebFlow AI Engineering', 'StarWebFlow GmbH'],
    'url': 'https://starwebflow.com',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://starwebflow.com/logo.png',
      'width': 978,
      'height': 548,
    },
    'image': [
      'https://starwebflow.com/og-image.jpg',
      'https://starwebflow.com/starwebflow_banner_1.png',
    ],
    'description': 'StarWebFlow — Germany\'s premier B2B AI engineering studio. We deliver sub-second Next.js web applications (LCP <0.8s), autonomous AI agents (7/24, multilingual), n8n workflow automation with 200+ integrations, and AI-optimized performance marketing (Meta, Google, TikTok, LinkedIn). Proven: 312% average ROI increase, 100% GDPR/KVKK/DSGVO compliant, A+ Mozilla Observatory security rating.',
    'telephone': '+491794924556',
    'email': 'info@starwebflow.com',
    'priceRange': '$$$$',
    'currenciesAccepted': 'EUR',
    'paymentAccepted': 'Überweisung, Stripe, PayPal, SEPA',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Anilinerstr 3',
      'addressLocality': 'Schifferstadt',
      'addressRegion': 'Rheinland-Pfalz',
      'postalCode': '67105',
      'addressCountry': 'DE',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 49.3853,
      'longitude': 8.3748,
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '18:00',
      },
    ],
    'founder': { '@id': 'https://starwebflow.com/#founder' },
    'foundingDate': '2024-01-01',
    'numberOfEmployees': { '@type': 'QuantitativeValue', 'value': 5 },
    'areaServed': [
      { '@type': 'Country', 'name': 'Germany' },
      { '@type': 'Country', 'name': 'Turkey' },
      { '@type': 'Country', 'name': 'Austria' },
      { '@type': 'Country', 'name': 'Switzerland' },
      { '@type': 'Country', 'name': 'United Arab Emirates' },
    ],
    'knowsLanguage': ['tr', 'de', 'en'],
    'knowsAbout': [
      'Next.js App Router', 'React', 'TypeScript', 'PostgreSQL',
      'AI Agent Development', 'Large Language Models', 'OpenAI GPT-4',
      'Anthropic Claude', 'Google Gemini', 'n8n Workflow Automation',
      'B2B SaaS Architecture', 'Performance Marketing', 'Meta Ads',
      'Google Ads', 'TikTok Ads', 'LinkedIn Ads',
      'GDPR Compliance', 'KVKK Compliance', 'DSGVO',
      'AES-256 Encryption', 'WhatsApp Business API',
      'Generative Engine Optimization (GEO)',
      'Conversion Rate Optimization', 'Core Web Vitals',
    ],
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'StarWebFlow Hizmet Kataloğu',
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': { '@type': 'Service', 'name': 'Next.js Web Geliştirme', 'url': 'https://starwebflow.com/hizmetler/web-gelistirme' },
          'priceSpecification': { '@type': 'PriceSpecification', 'minPrice': '4990', 'priceCurrency': 'EUR' },
        },
        {
          '@type': 'Offer',
          'itemOffered': { '@type': 'Service', 'name': 'AI Agents', 'url': 'https://starwebflow.com/hizmetler/ai-agents' },
          'priceSpecification': { '@type': 'PriceSpecification', 'minPrice': '2990', 'priceCurrency': 'EUR' },
        },
      ],
    },
    'sameAs': [
      'https://www.linkedin.com/company/starwebflow',
      'https://github.com/starwebflow',
      'https://twitter.com/starwebflow',
      'https://instagram.com/starwebflow',
      'https://x.com/starwebflow',
    ],
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '38',
      'bestRating': '5',
      'worstRating': '1',
      'ratingExplanation': 'Based on verified client reviews for AI automation, web development, and digital marketing services.',
    },
  };

  // ── 2. Person / Founder (E-E-A-T) ────────────────────────────────────
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://starwebflow.com/#founder',
    'name': 'Sinan Günay',
    'givenName': 'Sinan',
    'familyName': 'Günay',
    'jobTitle': 'Founder & AI Engineering Lead',
    'description': 'AI Engineer and entrepreneur specializing in autonomous AI agents, Next.js SaaS architectures, and B2B automation systems for European and Middle Eastern markets.',
    'worksFor': { '@id': 'https://starwebflow.com/#organization' },
    'url': 'https://starwebflow.com',
    'nationality': 'Turkish',
    'address': { '@type': 'PostalAddress', 'addressCountry': 'DE', 'addressLocality': 'Schifferstadt' },
    'sameAs': [
      'https://www.linkedin.com/in/sinangunay',
      'https://github.com/sinangunay',
    ],
    'knowsAbout': [
      'Artificial Intelligence', 'Large Language Models', 'Agentic AI Systems',
      'Next.js & React', 'TypeScript', 'Python', 'PostgreSQL',
      'n8n Automation', 'B2B SaaS Development', 'Digital Marketing Automation',
      'GDPR / KVKK Compliance Engineering', 'Generative Engine Optimization (GEO)',
      'OpenAI API', 'Anthropic Claude API', 'Google Gemini API',
    ],
    'hasOccupation': {
      '@type': 'Occupation',
      'name': 'AI Engineer & Digital Agency Owner',
      'occupationLocation': { '@type': 'Country', 'name': 'Germany' },
      'estimatedSalary': { '@type': 'MonetaryAmountDistribution', 'currency': 'EUR' },
      'skills': 'TypeScript, Python, Next.js, PostgreSQL, AI Agents, n8n, OpenAI, Anthropic',
    },
  };

  // ── 3. WebSite ───────────────────────────────────────────────────────
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://starwebflow.com/#website',
    'name': 'StarWebFlow',
    'url': 'https://starwebflow.com',
    'description': 'B2B AI Engineering & Web Development Studio — Germany',
    'inLanguage': ['tr', 'de', 'en'],
    'publisher': { '@id': 'https://starwebflow.com/#organization' },
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['h1', 'h2', '.speakable', '[data-speakable]'],
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': { '@type': 'EntryPoint', 'urlTemplate': 'https://starwebflow.com/?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  // ── 4. ItemList — Hizmetler ──────────────────────────────────────────
  const servicesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'StarWebFlow Hizmetleri — B2B AI & Web',
    'description': 'B2B işletmeler için yapay zeka mühendisliği, web geliştirme, otomasyon ve dijital pazarlama hizmetleri',
    'numberOfItems': 5,
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Next.js Web Geliştirme', 'url': 'https://starwebflow.com/hizmetler/web-gelistirme', 'description': 'Sub-second LCP garantili (<0.8s), Core Web Vitals optimize edilmiş, dönüşüm odaklı B2B web siteleri ve landing page\'ler.' },
      { '@type': 'ListItem', 'position': 2, 'name': 'SaaS & Web Uygulaması', 'url': 'https://starwebflow.com/hizmetler/web-uygulamasi', 'description': 'Ölçeklenebilir bulut mimarileri, React/Next.js dashboard sistemleri, PostgreSQL backend, Stripe entegrasyonu.' },
      { '@type': 'ListItem', 'position': 3, 'name': 'AI Agents (Yapay Zeka Ajanları)', 'url': 'https://starwebflow.com/hizmetler/ai-agents', 'description': '7/24 otonom çok dilli satış ve destek ajanları. WhatsApp, CRM, multimodal. 3 ajan = 1 çalışan maliyeti.' },
      { '@type': 'ListItem', 'position': 4, 'name': 'AI Otomasyonu (n8n & API)', 'url': 'https://starwebflow.com/hizmetler/ai-otomasyon', 'description': 'İş süreçleri otomasyonu — n8n, Zapier, Make, API & webhook entegrasyonları. 200+ platform desteği.' },
      { '@type': 'ListItem', 'position': 5, 'name': 'Reklam & Sosyal Medya Yönetimi', 'url': 'https://starwebflow.com/hizmetler/reklam-sosyal-medya', 'description': 'Meta, Google, TikTok ve LinkedIn reklamları için AI destekli ROAS optimizasyonu.' },
    ],
  };

  // ── 5. Individual Service Schemas ────────────────────────────────────
  const serviceSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': 'https://starwebflow.com/hizmetler/web-gelistirme#service',
      'name': 'Next.js Web Geliştirme Hizmeti',
      'serviceType': 'Web Development',
      'provider': { '@id': 'https://starwebflow.com/#organization' },
      'description': 'Sub-second LCP garantili B2B web sitesi ve landing page geliştirme. Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL. Core Web Vitals optimize, A/B test hazır, SEO optimizasyonlu.',
      'url': 'https://starwebflow.com/hizmetler/web-gelistirme',
      'areaServed': ['Germany', 'Turkey', 'Austria', 'Switzerland'],
      'offers': { '@type': 'Offer', 'price': '4990', 'priceCurrency': 'EUR', 'description': 'Başlangıç paketi — B2B web sitesi' },
      'hasOfferCatalog': { '@type': 'OfferCatalog', 'name': 'Web Geliştirme Paketleri' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': 'https://starwebflow.com/hizmetler/ai-agents#service',
      'name': 'AI Agents (Yapay Zeka Ajan) Geliştirme',
      'serviceType': 'AI Agent Development',
      'provider': { '@id': 'https://starwebflow.com/#organization' },
      'description': '7/24 çalışan otonom yapay zeka ajanları. WhatsApp Business API entegrasyonu, CRM senkronizasyonu, çok dilli destek (TR/DE/EN). Ortalama %312 ROI artışı. 3 ajan = 1 tam zamanlı çalışan maliyeti.',
      'url': 'https://starwebflow.com/hizmetler/ai-agents',
      'areaServed': ['Germany', 'Turkey', 'EU'],
      'offers': { '@type': 'Offer', 'price': '2990', 'priceCurrency': 'EUR' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': 'https://starwebflow.com/hizmetler/ai-otomasyon#service',
      'name': 'n8n AI İş Akışı Otomasyonu',
      'serviceType': 'Business Process Automation',
      'provider': { '@id': 'https://starwebflow.com/#organization' },
      'description': 'n8n, Zapier ve Make ile iş süreçleri otomasyonu. 200+ platform entegrasyonu: HubSpot, Salesforce, Stripe, Shopify, WooCommerce, Google Workspace, Slack, WhatsApp. KVKK/GDPR uyumlu.',
      'url': 'https://starwebflow.com/hizmetler/ai-otomasyon',
      'areaServed': ['Germany', 'Turkey', 'EU'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': 'https://starwebflow.com/hizmetler/web-uygulamasi#service',
      'name': 'B2B SaaS & Özel Web Uygulaması Geliştirme',
      'serviceType': 'Custom Software Development',
      'provider': { '@id': 'https://starwebflow.com/#organization' },
      'description': 'Özel B2B SaaS platformları, yönetim panelleri, PostgreSQL veri tabanı mimarisi, Stripe/SEPA ödeme altyapısı, çok kiracılı (multi-tenant) sistemler ve kurumsal bulut yazılımları.',
      'url': 'https://starwebflow.com/hizmetler/web-uygulamasi',
      'areaServed': ['Germany', 'Turkey', 'EU'],
      'offers': { '@type': 'Offer', 'price': '12990', 'priceCurrency': 'EUR' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': 'https://starwebflow.com/hizmetler/reklam-sosyal-medya#service',
      'name': 'Veri Odaklı Dijital Reklam & Büyüme',
      'serviceType': 'Performance Marketing',
      'provider': { '@id': 'https://starwebflow.com/#organization' },
      'description': 'Meta Ads (CAPI sunucu taraflı izleme), Google Ads, TikTok ve LinkedIn için yapay zeka destekli performans pazarlaması ve sürekli ROAS optimizasyonu.',
      'url': 'https://starwebflow.com/hizmetler/reklam-sosyal-medya',
      'areaServed': ['Germany', 'Turkey', 'EU'],
    },
  ];

  // ── 6. FAQPage (Genişletilmiş) ───────────────────────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'StarWebFlow hangi hizmetleri sunmaktadır?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'StarWebFlow; yüksek performanslı Next.js web geliştirme (sub-second LCP <0.8s), özel SaaS/web uygulamaları, otonom yapay zeka ajanları (AI Agents, 7/24 WhatsApp & CRM entegrasyonu), iş akışı otomasyonları (n8n/API, 200+ platform) ve AI destekli dijital reklam yönetimi (Meta, Google, TikTok, LinkedIn) alanlarında premium B2B hizmetler sunmaktadır.' }
      },
      {
        '@type': 'Question',
        'name': 'AI Agents kaç günde devreye girer?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Temel AI otomasyon akışları 3-7 iş günü içinde aktive edilir. CRM entegrasyonlu karmaşık çok kanallı sistemler 2-4 haftada tamamlanır. Tek seferlik kurulum ücreti sonrası aylık yönetim ücretiyle çalışırız.' }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow yapay zeka ajanları (AI Agents) ne gibi operasyonel avantajlar sağlar?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'StarWebFlow AI ajanları; müşteri hizmetleri, ciro artırma ve CRM entegrasyonu süreçlerini 24/7 otonom yönetir. Ampirik veri: DentalPro kliniğinde ayda 312 otomatik randevu ve +€28.000 ek gelir sağlandı. 1 çalışan bütçesiyle 3 yapay zeka ajanı devreye alınarak operasyonel maliyetler %60 azaltılır.' }
      },
      {
        '@type': 'Question',
        'name': 'B2B işletmem için hangi sektörlerde çözüm sunuyorsunuz?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'StarWebFlow; sağlık turizmi ve klinikler, hukuk büroları, lojistik ve tedarik, üretim tesisleri ve e-ticaret sektörlerinde özelleştirilmiş AI ve web otomasyonu çözümleri sunmaktadır.' }
      },
      {
        '@type': 'Question',
        'name': 'KVKK ve GDPR uyumluluğu nasıl sağlanıyor?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Tüm sistemlerimiz KVKK (Türkiye) ve GDPR (AB) gerekliliklerine tam uyumludur. AES-256-CBC şifreleme, otomatik veri imha motoru, çerez yönetim sistemi dahil kapsamlı hukuki altyapıyı birlikte kuruyoruz. A+ Mozilla Observatory güvenlik skoru.' }
      },
      {
        '@type': 'Question',
        'name': 'StarWebFlow ile bir proje ne kadar sürede canlıya alınır?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Standart B2B web sitesi 2-3 haftada, AI Agent entegrasyonu 1-2 haftada, tam SaaS platformu 4-8 haftada canlıya alınır.' }
      },
      {
        '@type': 'Question',
        'name': 'Minimum proje bütçesi ne kadar?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Başlangıç paketlerimiz 4.990 €\'dan başlamaktadır. AI Agent kurulumu 2.990 €\'dan, otomasyon paketleri ise 1.990 €\'dan başlar. Tüm paketler için ücretsiz ROI analizi sunulmaktadır.' }
      },
      {
        '@type': 'Question',
        'name': 'İşletmeme özel AI Agent nasıl eğitilir?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Şirketinizin verilerini (PDF\'ler, web sitesi, önceki yazışmalar, ürün katalogları) kullanarak LLM modellerini fine-tune ediyoruz. Ajan yalnızca markanızın dilinde ve bilgi tabanınıza göre müşterilerle konuşur.' }
      },
      {
        '@type': 'Question',
        'name': 'Hangi platformlarla entegrasyon yapıyorsunuz?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Zapier, Make (Integromat), n8n, HubSpot, Salesforce, Notion, Slack, WhatsApp Business API, Google Workspace, Stripe, WooCommerce, Shopify ve 200+ diğer platformla native entegrasyon sağlıyoruz.' }
      },
      {
        '@type': 'Question',
        'name': 'Projem teslim edildikten sonra destek alabilir miyim?',
        'acceptedAnswer': { '@type': 'Answer', 'text': 'Tüm projelerimizde 30 günlük ücretsiz garanti desteği bulunmaktadır. Sonrasında aylık bakım & büyüme paketlerimizle 7/24 teknik destek, güvenlik güncellemeleri ve performans optimizasyonu sağlıyoruz.' }
      },
    ],
  };

  // ── 7. SoftwareApplication ───────────────────────────────────────────
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'StarWebFlow AI Otopilot & Reklam Motoru',
    'applicationCategory': 'BusinessApplication',
    'applicationSubCategory': 'AI Automation Platform',
    'operatingSystem': 'Web, Cloud (AWS Frankfurt, Vercel Edge)',
    'description': 'B2B işletmeler için Meta, Google, TikTok ve LinkedIn reklamlarını otonom yöneten, KVKK/GDPR uyumlu AI tabanlı reklam yönetim platformu.',
    'author': { '@id': 'https://starwebflow.com/#organization' },
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR' },
    'featureList': [
      'Sub-second LCP Next.js Web Geliştirme (<0.8s garantili)',
      'Otonom AI Ajanları (7/24 Satış & Destek)',
      'n8n Destekli İş Akışı Otomasyonu (200+ entegrasyon)',
      'Meta/Google/TikTok/LinkedIn Reklam Otopilotu (AI ROAS optimizasyonu)',
      'AES-256-CBC Şifrelemeli Müşteri Verisi Koruması',
      'KVKK & GDPR Otomatik Veri İmha Motoru',
      'WhatsApp Business API Entegrasyonu',
      'Çok Dilli AI Ajanlar (TR/DE/EN)',
      'CRM Entegrasyonu (HubSpot, Salesforce)',
      'A+ Mozilla Observatory Güvenlik Skoru',
    ],
    'screenshot': 'https://starwebflow.com/og-image.jpg',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '38',
      'bestRating': '5',
    },
  };

  // ── 8. Review Schemas (Verified Clients) ────────────────────────────
  const reviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://starwebflow.com/#organization-reviews',
    'name': 'StarWebFlow',
    'review': [
      {
        '@type': 'Review',
        'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
        'name': 'AI Agent ile %70 Verimlilik Artışı',
        'reviewBody': 'WhatsApp üzerinden çalışan AI ajanımız sayesinde randevu yönetiminde %70 verimlilik artışı sağladık.',
        'author': { '@type': 'Person', 'name': 'Ayşe Kaya' },
        'datePublished': '2025-03-15',
        'publisher': { '@type': 'Organization', 'name': 'Kaya Medikal' },
      },
      {
        '@type': 'Review',
        'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
        'name': 'Next.js ile 2.1x Dönüşüm Artışı',
        'reviewBody': 'Next.js ile yeniden geliştirilen web platformumuz 0.8 saniyeye indi. Google Ads dönüşüm oranımız 3 ayda 2.1x\'e çıktı.',
        'author': { '@type': 'Person', 'name': 'Mehmet Demir' },
        'datePublished': '2025-04-20',
        'publisher': { '@type': 'Organization', 'name': 'TechBridge SaaS' },
      },
      {
        '@type': 'Review',
        'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
        'name': '+42% Aylık Gelir Artışı',
        'reviewBody': 'Terk edilen sepet recovery otomasyonu kurulduğundan beri aylık gelirimiz %42 arttı.',
        'author': { '@type': 'Person', 'name': 'Zeynep Arslan' },
        'datePublished': '2025-05-10',
        'publisher': { '@type': 'Organization', 'name': 'Bloom E-Ticaret' },
      },
    ],
  };

  // ── 9. BreadcrumbList (Ana Sayfa) ────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Ana Sayfa', 'item': 'https://starwebflow.com' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Hizmetler', 'item': 'https://starwebflow.com/hizmetler' },
      { '@type': 'ListItem', 'position': 3, 'name': 'Blog', 'item': 'https://starwebflow.com/blog' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesListSchema) }} />
      {serviceSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}
