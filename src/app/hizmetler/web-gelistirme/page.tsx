import type { Metadata } from 'next'
import WebGelistirmePage from './WebGelistirmePage'

export const metadata: Metadata = {
  title: 'Web Geliştirme & Web Sitesi | StarWebFlow',
  description: 'Next.js App Router ile sub-second LCP garantili, dönüşüm odaklı B2B web siteleri. Ortalama LCP < 0.8 saniye, Google Core Web Vitals A skoru.',
  keywords: 'web geliştirme, next.js, web sitesi, dönüşüm optimizasyonu, dijital ajans, sub-second lcp, B2B web',
  alternates: { canonical: 'https://starwebflow.com/hizmetler/web-gelistirme' },
  openGraph: {
    title: 'Web Geliştirme | StarWebFlow — Sub-second, Dönüşüm Odaklı',
    description: 'Yavaş site = kaybedilen müşteri. Lightning-fast Next.js, ortalama LCP 0.8s altında.',
    type: 'website',
    url: 'https://starwebflow.com/hizmetler/web-gelistirme',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://starwebflow.com/hizmetler/web-gelistirme#service',
  'name': 'Web Geliştirme (Next.js App Router)',
  'serviceType': 'B2B Web Development & Performance Optimization',
  'provider': { '@id': 'https://starwebflow.com/#organization' },
  'description': 'Sub-second LCP (<0.8s), Google Core Web Vitals A skoru garantili, Next.js App Router tabanlı B2B web siteleri. Glassmorphism UI, Outfit typography, lead capture ve ROI hesaplama modülleri dahil.',
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
      <WebGelistirmePage />
    </>
  )
}
