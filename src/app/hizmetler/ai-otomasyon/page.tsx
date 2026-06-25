import type { Metadata } from 'next'
import AIOtomasyonPage from './AIOtomasyonPage'

export const metadata: Metadata = {
  title: 'AI Otomasyonları — n8n Workflow | StarWebFlow',
  description: 'Haftada kaç saat manuel iş yapıyorsunuz? Cost-Saver Calculator ile hesaplayın. n8n tabanlı AI otomasyonlarla işlerinizi 7/24 çalıştırın.',
  keywords: 'ai otomasyon, n8n, workflow otomasyon, iş süreci otomasyonu, zapier alternatifi',
}

export default function Page() {
  return <AIOtomasyonPage />
}
