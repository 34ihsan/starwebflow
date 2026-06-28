'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, ArrowLeft, LogOut } from 'lucide-react'
import SidebarNav from './SidebarNav'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSettings } from '@/lib/settings/SettingsContext'
import ClientAiChatbot from '@/components/client/ClientAiChatbot'

const localDict = {
  tr: {
    portal: 'StarPortal',
    backToSite: 'Siteye Dön',
    logout: 'Çıkış Yap',
    welcome: 'Hoş Geldiniz, Müşteri'
  },
  en: {
    portal: 'StarPortal',
    backToSite: 'Back to Site',
    logout: 'Logout',
    welcome: 'Welcome, Client'
  },
  de: {
    portal: 'StarPortal',
    backToSite: 'Zurück zur Website',
    logout: 'Abmelden',
    welcome: 'Willkommen, Kunde'
  }
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  const { settings } = useSettings()
  const router = useRouter()
  const dict = localDict[language] || localDict.tr

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' })
    } catch (_) {
      // ignore network errors
    }
    router.push('/auth/login')
  }
  
  return (
    <div className="min-h-screen bg-[#05050A] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0F] border-r border-white/[0.05] flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/[0.05]">
          <Link href="/" className="flex items-center gap-2 group">
              <>
                <div className="w-8 h-8 rounded-lg bg-[#4F8EF7] flex items-center justify-center">
                  <span className="text-white font-black text-sm">SW</span>
                </div>
                <span className="font-black text-lg tracking-tight font-['Outfit']">
                  Star<span className="text-[#4F8EF7]">Portal</span>
                </span>
              </>
          </Link>
        </div>

        <SidebarNav />

        <div className="p-4 border-t border-white/[0.05] space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {dict.backToSite}
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            {dict.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/[0.05] bg-[#0A0A0F]/80 backdrop-blur-md flex items-center px-8 shrink-0 justify-between">
          <h1 className="font-semibold font-['Outfit'] text-lg">{dict.welcome}</h1>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#94A3B8] hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F8EF7] to-[#06B6D4] flex items-center justify-center font-bold text-xs">
              M
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-[#05050A]">
          {children}
        </div>
      </main>

      {/* AI Chatbot for Client Portal */}
      <ClientAiChatbot />
    </div>
  )
}
