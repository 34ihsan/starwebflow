import type { Metadata } from 'next'
import WebUygulamasiPage from './WebUygulamasiPage'

export const metadata: Metadata = {
  title: 'Web Uygulamaları & SaaS Platformları | StarWebFlow',
  description: 'Custom web app, SaaS dashboard ve B2B platform geliştirme. Digital Twin simülasyonu ile projenizi kodlanmadan önce görün.',
  keywords: 'web uygulaması, saas geliştirme, dashboard, b2b platform, custom software',
}

export default function Page() {
  return <WebUygulamasiPage />
}
