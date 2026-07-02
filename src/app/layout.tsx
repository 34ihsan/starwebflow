import type { Metadata } from 'next'
import './globals.css'
import CookieConsent from '@/components/ui/CookieConsent'
import SystemHealthWidget from '@/components/ui/SystemHealthWidget'
import SchemaMarkup from '@/components/ui/SchemaMarkup'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import TrackingScripts from '@/components/marketing/TrackingScripts'
import { prisma } from '@/lib/prisma'
import { SettingsProvider } from '@/lib/settings/SettingsContext'
import { RecaptchaProvider } from '@/components/ui/RecaptchaProvider'

export const metadata: Metadata = {
  title: 'StarWebFlow — Premium AI Otomasyon & Web Geliştirme Ekosistemi',
  description: 'B2B işletmeler için yüksek performanslı web geliştirme, özel SaaS yazılımları, otonom yapay zeka ajanları (AI Agents), iş akışı otomasyonları (n8n) ve veri odaklı reklam stratejileri sunuyoruz.',
  keywords: 'dijital ajans, AI otomasyon, web uygulamaları, yapay zeka, reklam, sosyal medya, AI agents, SaaS, Next.js, SEO, GEO, veri saklama imha, DSGVO, KVKK',
  alternates: {
    canonical: 'https://starwebflow.com',
  },
  openGraph: {
    title: 'StarWebFlow — Premium AI Otomasyon & Web Geliştirme Ekosistemi',
    description: 'AI destekli iş otomasyonları, özel SaaS yazılımları ve yüksek performanslı web uygulamaları ile markanızı geleceğe taşıyın.',
    type: 'website',
    url: 'https://starwebflow.com',
    siteName: 'StarWebFlow',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StarWebFlow — Premium AI Otomasyon & Web Geliştirme Ekosistemi',
    description: 'B2B şirketleri için yapay zeka ajanları, akıllı iş akışları ve sub-second Next.js web uygulamaları.',
    creator: '@starwebflow',
  },
  other: {
    'google-site-verification': 'google_verification_code_placeholder',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let trackingCodes = {};
  let dbSettings: any = null;
  try {
    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: 'default-tenant' }
    });
    
    if (settings) {
      dbSettings = settings;
    }

    if (settings?.preferences) {
      const preferences = settings.preferences as any;
      if (preferences.marketing) {
        trackingCodes = preferences.marketing;
      }
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <SchemaMarkup />
        <TrackingScripts {...trackingCodes} />
      </head>
      <body className="bg-[#0A0A0F] text-white antialiased overflow-x-hidden" suppressHydrationWarning>
        <SettingsProvider initialSettings={dbSettings}>
          <LanguageProvider>
            <RecaptchaProvider>
              {children}
              <CookieConsent />
              <SystemHealthWidget />
            </RecaptchaProvider>
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
