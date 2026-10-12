'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, ArrowLeft, LogOut, User, Sparkles, Wifi } from 'lucide-react'
import SidebarNav from './SidebarNav'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSettings } from '@/lib/settings/SettingsContext'
import ClientAiChatbot from '@/components/client/ClientAiChatbot'

const localDict = {
  tr: {
    portal: 'StarPortal',
    backToSite: 'Siteye Dön',
    profile: 'Profilim',
    logout: 'Çıkış Yap',
    welcome: 'Hoş Geldiniz',
    online: 'Sistem Aktif',
    notifications: 'Bildirimler',
  },
  en: {
    portal: 'StarPortal',
    backToSite: 'Back to Site',
    profile: 'My Profile',
    logout: 'Logout',
    welcome: 'Welcome',
    online: 'System Online',
    notifications: 'Notifications',
  },
  de: {
    portal: 'StarPortal',
    backToSite: 'Zurück zur Website',
    profile: 'Mein Profil',
    logout: 'Abmelden',
    welcome: 'Willkommen',
    online: 'System Aktiv',
    notifications: 'Benachrichtigungen',
  }
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  const { settings } = useSettings()
  const router = useRouter()
  const dict = localDict[language] || localDict.tr

  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString(language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : 'tr-TR', {
        hour: '2-digit', minute: '2-digit'
      }))
      const hour = now.getHours()
      if (language === 'tr') {
        setGreeting(hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi Günler' : 'İyi Akşamlar')
      } else if (language === 'de') {
        setGreeting(hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend')
      } else {
        setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening')
      }
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [language])

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' })
    } catch (_) {
      // ignore network errors
    }
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050A] text-slate-900 dark:text-white flex font-sans transition-colors duration-200">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 flex flex-col h-screen sticky top-0 border-r border-slate-200/80 dark:border-white/[0.06] bg-white/90 dark:bg-[#0A0A0F]/90 backdrop-blur-2xl">

        {/* Logo */}
        <div className="p-6 border-b border-slate-200/80 dark:border-white/[0.06] relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="StarWebFlow home">
            <img 
              src="/starwebflow_logo_main.png" 
              alt="StarWebFlow" 
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="border-l border-slate-200 dark:border-white/10 pl-2">
              <span className="font-bold text-xs tracking-tight font-['Outfit'] block leading-none text-slate-800 dark:text-slate-200">
                Client<span className="text-[#4F8EF7]">Portal</span>
              </span>
              <span className="status-online text-[8px] text-[#10B981] font-semibold tracking-widest uppercase mt-0.5 block">
                {dict.online}
              </span>
            </div>
          </Link>
        </div>

        <SidebarNav />

        {/* Bottom — Back to site */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.06]">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-500 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-white rounded-xl transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{dict.backToSite}</span>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header
          className="h-16 border-b border-slate-200/80 dark:border-white/[0.06] flex items-center px-8 shrink-0 justify-between relative bg-white/80 dark:bg-[#0A0A0F]/80 backdrop-blur-xl"
        >
          {/* Top glow line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/20 to-transparent" />

          {/* Greeting + Time */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-semibold font-['Outfit'] text-base text-slate-900 dark:text-white leading-none">
                {greeting}, <span className="text-[#4F8EF7]">Müşteri</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-[#475569] mt-0.5 font-medium">{currentTime}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* System status pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
              <Wifi className="w-3 h-3 text-[#10B981]" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-[#10B981] tracking-wide">{dict.online}</span>
            </div>

            {/* Notification bell */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] transition-all duration-200 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.06] relative"
              aria-label={dict.notifications}
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#4F8EF7] rounded-full" aria-hidden="true" style={{ boxShadow: '0 0 6px rgba(79,142,247,0.8)' }} />
            </button>

            {/* Profile */}
            <div className="relative group">
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)',
                  boxShadow: '0 0 16px rgba(79,142,247,0.3)',
                }}
                aria-label={dict.profile}
              >
                M
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden bg-white border border-slate-200">
                <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Müşteri</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">client@domain.com</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/client/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors rounded-xl font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    {dict.profile}
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors rounded-xl font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {dict.logout}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto bg-[#FAFBFD]">
          {children}
        </div>
      </main>

      {/* AI Chatbot */}
      <ClientAiChatbot />
    </div>
  )
}
