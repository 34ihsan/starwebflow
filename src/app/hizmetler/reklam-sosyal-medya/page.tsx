import type { Metadata } from 'next'
import ReklamSosyalPage from './ReklamSosyalPage'

export const metadata: Metadata = {
  title: 'Reklam & Sosyal Medya — AI Destekli Büyüme | StarWebFlow',
  description: 'Meta, Google, TikTok ve LinkedIn reklamlarını AI Otopilot ile yönetin. Ortalama ROAS 3.13x. AI optimize içerik ve kampanya yönetimi — harcama kaybı sıfır.',
  keywords: 'reklam yönetimi, meta ads, google ads, tiktok ads, linkedin ads, sosyal medya, ai içerik, roas optimizasyonu, ai otopilot reklam',
  alternates: { canonical: 'https://starwebflow.com/hizmetler/reklam-sosyal-medya' },
  openGraph: {
    title: 'AI Reklam Yönetimi | StarWebFlow — Meta, Google, TikTok, LinkedIn',
    description: 'AI Otopilot ile reklam harcamanızı optimize edin. Ort. ROAS 3.13x, CTR %3.4.',
    type: 'website',
    url: 'https://starwebflow.com/hizmetler/reklam-sosyal-medya',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://starwebflow.com/hizmetler/reklam-sosyal-medya#service',
  'name': 'AI Destekli Reklam & Sosyal Medya Yönetimi',
  'serviceType': 'Performance Marketing & AI Ad Optimization',
  'provider': { '@id': 'https://starwebflow.com/#organization' },
  'description': 'Meta (Facebook/Instagram), Google Ads, TikTok Ads ve LinkedIn Ads platformlarında otonom AI kampanya yönetimi. Ortalama ROAS 3.13x, CTR %3.4, Hook Rate %36. AI Otopilot motoru zarar eden kampanyaları otomatik durdurur, bütçeyi en verimli kampanyalara kaydırır.',
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
      <ReklamSosyalPage />
    </>
  )
}
