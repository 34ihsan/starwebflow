import type { Metadata } from 'next'
import WebUygulamasiPage from './WebUygulamasiPage'

export const metadata: Metadata = {
  title: 'Web Uygulamaları & SaaS Platformları | StarWebFlow',
  description: 'Custom SaaS dashboard ve B2B platform geliştirme. Next.js App Router, PostgreSQL, Prisma ORM ile ölçeklenebilir bulut mimarileri. Digital Twin simülasyonu dahil.',
  keywords: 'web uygulaması, saas geliştirme, dashboard, b2b platform, custom software, next.js saas, prisma postgresql',
  alternates: { canonical: 'https://starwebflow.com/hizmetler/web-uygulamasi' },
  openGraph: {
    title: 'Web Uygulamaları & SaaS | StarWebFlow',
    description: 'Custom SaaS ve B2B platform geliştirme. Next.js + PostgreSQL + AI entegrasyonu.',
    type: 'website',
    url: 'https://starwebflow.com/hizmetler/web-uygulamasi',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://starwebflow.com/hizmetler/web-uygulamasi#service',
  'name': 'SaaS & Web Uygulaması Geliştirme',
  'serviceType': 'Custom SaaS & B2B Platform Development',
  'provider': { '@id': 'https://starwebflow.com/#organization' },
  'description': 'Next.js App Router, React, PostgreSQL ve Prisma ORM ile ölçeklenebilir bulut mimarileri. Multi-tenant SaaS, CRM dashboardları, raporlama sistemleri ve AI entegrasyonu. Responsive workspace tasarımı ve RBAC yetkilendirme dahil.',
  'areaServed': ['DE', 'TR', 'AT', 'CH'],
  'audience': { '@type': 'BusinessAudience', 'audienceType': 'B2B SMB & Enterprise' },
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <WebUygulamasiPage />
    </>
  )
}
