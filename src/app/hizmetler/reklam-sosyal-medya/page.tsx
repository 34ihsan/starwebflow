import type { Metadata } from 'next'
import ReklamSosyalPage from './ReklamSosyalPage'

export const metadata: Metadata = {
  title: 'Reklam & Sosyal Medya — AI Destekli Büyüme | StarWebFlow',
  description: 'AI optimize Meta/Google Ads, otonom içerik üretimi. Creative Generator ile ürününüz için 3 platforma uygun reklam anında oluşturun.',
  keywords: 'reklam yönetimi, meta ads, google ads, sosyal medya, ai içerik, roas optimizasyonu',
}

export default function Page() {
  return <ReklamSosyalPage />
}
