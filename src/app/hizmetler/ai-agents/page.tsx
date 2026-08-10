import type { Metadata } from 'next'
import AIAgentsPage from './AIAgentsPage'

export const metadata: Metadata = {
  title: 'AI Agents — 7/24 Dijital Çalışanlar | StarWebFlow',
  description: 'CRM entegreli, 7/24 aktif AI ajanlar. Destek maliyetlerini %60 azaltın, hiçbir lead kaçırmayın. Ampirik kanıt: DentalPro kliniğinde 312 otomatik randevu/ay ve +€28K ek gelir.',
  keywords: 'ai agents, yapay zeka ajanlar, chatbot, müşteri hizmetleri otomasyonu, crm entegrasyonu, AI dijital çalışan, otonom ajan',
  alternates: { canonical: 'https://starwebflow.com/hizmetler/ai-agents' },
  openGraph: {
    title: 'AI Agents | StarWebFlow — 7/24 Otonom Dijital Çalışanlar',
    description: 'Gece 2\'de gelen müşteri mesajını kaybetmeyin. CRM entegreli, marka sesinizi öğrenen AI ajan — 2 haftada canlı.',
    type: 'website',
    url: 'https://starwebflow.com/hizmetler/ai-agents',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://starwebflow.com/hizmetler/ai-agents#service',
  'name': 'AI Agents (Yapay Zeka Ajanları)',
  'serviceType': 'AI Chatbot & Autonomous Agent Development',
  'provider': { '@id': 'https://starwebflow.com/#organization' },
  'description': '7/24 otonom çalışan, CRM entegreli AI satış ve destek ajanları. 1 çalışan bütçesiyle 3 AI ajan. Ampirik kanıt: DentalPro Kliniği — ayda 312 otomatik randevu, +€28.000 ek gelir, %0 kaçan hasta sorusu.',
  'areaServed': ['DE', 'TR', 'AT', 'CH'],
  'audience': { '@type': 'BusinessAudience', 'audienceType': 'B2B SMB & Enterprise' },
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'AI Agent Paketleri',
    'itemListElement': [
      { '@type': 'Offer', 'name': 'Starter Agent', 'description': '1 AI ajan, 1 entegrasyon, temel raporlama' },
      { '@type': 'Offer', 'name': 'Growth Agent', 'description': '3 AI ajan, CRM + WhatsApp entegrasyonu, aylık analitik rapor' },
      { '@type': 'Offer', 'name': 'Enterprise Agent', 'description': 'Sınırsız ajan, özel LLM fine-tuning, SLA garantisi' },
    ]
  },
  'review': [
    {
      '@type': 'Review',
      'reviewRating': { '@type': 'Rating', 'ratingValue': '5', 'bestRating': '5' },
      'author': { '@type': 'Organization', 'name': 'DentalPro Kliniği' },
      'reviewBody': 'Gece 11\'de gelen randevu taleplerini kaybediyorduk. AI agent ile ayda 312 otomatik randevu ve +€28K ek gelir sağladık. Hiçbir soru cevapsız kalmıyor.'
    }
  ]
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <AIAgentsPage />
    </>
  )
}
