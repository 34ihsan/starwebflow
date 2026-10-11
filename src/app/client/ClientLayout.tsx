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
    <div className="min-h-screen bg-[#05050A] text-white flex font-sans">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 flex flex-col h-screen sticky top-0 border-r border-white/[0.06]" style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #080810 100%)' }}>

        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06] relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />
          <Link href="/" className="flex items-center gap-3 group" aria-label="StarPortal home">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #4F8EF7, #06B6D4)',
                boxShadow: '0 0 20px rgba(79,142,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-white font-black text-sm font-['Outfit']">SW</span>
            </div>
            <div>
              <span className="font-black text-lg tracking-tight font-['Outfit'] block leading-none">
                Star<span className="text-[#4F8EF7]">Portal</span>
              </span>
              <span className="status-online text-[9px] text-[#10B981] font-semibold tracking-widest uppercase">
                {dict.online}
              </span>
            </div>
          </Link>
        </div>

        <SidebarNav />

        {/* Bottom — Back to site */}
        <div className="p-4 border-t border-white/[0.06]">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#64748B] hover:text-white rounded-xl transition-all duration-200 hover:bg-white/[0.04] group"
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
          className="h-16 border-b border-white/[0.06] flex items-center px-8 shrink-0 justify-between relative"
          style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(20px)' }}
        >
          {/* Top glow line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/20 to-transparent" />

          {/* Greeting + Time */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-semibold font-['Outfit'] text-base text-white leading-none">
                {greeting}, <span className="text-[#4F8EF7]">Müşteri</span>
              </h1>
              <p className="text-[10px] text-[#475569] mt-0.5 font-medium">{currentTime}</p>
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
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200 text-[#94A3B8] hover:text-white border border-white/[0.06] hover:border-white/[0.12] relative"
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
              <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden" style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-4 pt-3 pb-2 border-b border-white/[0.06]">
                  <p className="text-xs text-[#64748B] font-medium">Müşteri</p>
                  <p className="text-sm font-semibold text-white mt-0.5">client@domain.com</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/client/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors rounded-xl"
                  >
                    <User className="w-4 h-4" />
                    {dict.profile}
                  </Link>
                  <div className="h-px bg-white/[0.05] my-1 mx-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-xl"
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
        <div className="flex-1 overflow-auto bg-[#05050A]">
          {children}
        </div>
      </main>

      {/* AI Chatbot */}
      <ClientAiChatbot />
    </div>
  )
}
