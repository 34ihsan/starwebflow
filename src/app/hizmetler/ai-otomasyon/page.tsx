import type { Metadata } from 'next'
import AIOtomasyonPage from './AIOtomasyonPage'

export const metadata: Metadata = {
  title: 'AI Otomasyonları — n8n Workflow | StarWebFlow',
  description: 'Haftada kaç saat manuel iş yapıyorsunuz? n8n tabanlı AI otomasyonlarla işlerinizi 7/24 çalıştırın. Aylık 100+ saat tasarruf — ampirik müşteri verisi.',
  keywords: 'ai otomasyon, n8n, workflow otomasyon, iş süreci otomasyonu, zapier alternatifi, api entegrasyon',
  alternates: { canonical: 'https://starwebflow.com/hizmetler/ai-otomasyon' },
  openGraph: {
    title: 'AI Otomasyonları | StarWebFlow — n8n & API Entegrasyonları',
    description: 'Manuel iş süreçlerinizi tamamen otomasyona alın. Cost-Saver Calculator ile tasarrufu hesaplayın.',
    type: 'website',
    url: 'https://starwebflow.com/hizmetler/ai-otomasyon',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://starwebflow.com/hizmetler/ai-otomasyon#service',
  'name': 'AI Otomasyonu (n8n & API Entegrasyonu)',
  'serviceType': 'Business Process Automation & AI Workflow',
  'provider': { '@id': 'https://starwebflow.com/#organization' },
  'description': 'n8n, webhook ve REST API entegrasyonları ile iş süreçlerini tamamen otomasyona alma. Müşteri onboarding, lead nurturing, raporlama ve faturalandırma iş akışları. Ampirik kanıt: Ortalama müşteri ayda 100+ saat tasarruf ediyor.',
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
      <AIOtomasyonPage />
    </>
  )
}
