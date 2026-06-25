import type { Metadata } from 'next'
import AIAgentsPage from './AIAgentsPage'

export const metadata: Metadata = {
  title: 'AI Agents — 7/24 Dijital Çalışanlar | StarWebFlow',
  description: 'CRM entegreli, 7/24 aktif AI ajanlar. Destek maliyetlerini %60 azaltın, hiçbir lead kaçırmayın. Agent Test Lab ile kendi sektörünüzde test edin.',
  keywords: 'ai agents, yapay zeka ajanlar, chatbot, müşteri hizmetleri otomasyonu, crm entegrasyonu',
  openGraph: {
    title: 'AI Agents | StarWebFlow',
    description: '7/24 çalışan dijital çalışanlar. Hiçbir müşteri mesajı cevapsız kalmasın.',
    type: 'website',
  },
}

export default function Page() {
  return <AIAgentsPage />
}
