import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StarWebFlow — Premium AI Otomasyon & Web Geliştirme Ekosistemi',
    short_name: 'StarWebFlow',
    description: 'B2B işletmeler için sub-second Next.js web geliştirme, otonom yapay zeka ajanları (AI Agents) ve iş akışı otomasyonları.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/starwebflow_logo_main.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/starwebflow_logo_main.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
