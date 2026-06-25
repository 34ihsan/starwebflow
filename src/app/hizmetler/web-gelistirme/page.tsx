import type { Metadata } from 'next'
import WebGelistirmePage from './WebGelistirmePage'

export const metadata: Metadata = {
  title: 'Web Geliştirme & Web Sitesi | StarWebFlow',
  description: 'Next.js ile yüksek dönüşümlü, lightning-fast web siteleri. Conversion Analyzer ile sitenizin ne kadar gelir kaybettiğini 30 saniyede öğrenin.',
  keywords: 'web geliştirme, next.js, web sitesi, dönüşüm optimizasyonu, dijital ajans istanbul',
  openGraph: {
    title: 'Web Geliştirme | StarWebFlow',
    description: 'Yavaş site = kaybedilen müşteri. Lightning-fast Next.js çözümleri.',
    type: 'website',
  },
}

export default function Page() {
  return <WebGelistirmePage />
}
