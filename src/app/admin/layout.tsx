'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSettings } from '@/lib/settings/SettingsContext'
import { 
  FileText, LayoutDashboard, Settings, Users, ArrowLeft, 
  Activity, FileSpreadsheet, FolderKanban, ReceiptText, 
  Mail, Bot, Rocket, Calendar, MessageSquare, Target, Sparkles,
  TicketCheck, LogOut, Bell, Globe, User, Inbox
} from 'lucide-react'
import { NotificationBell } from '@/components/layout/NotificationBell'

const navItems = [
  { href: '/admin', label: 'Komuta Merkezi', icon: LayoutDashboard, exact: true },
  { href: '/admin/analytics', label: 'Analitik & Trafik', icon: Activity },
  { href: '/admin/crm', label: 'CRM ve Leadler', icon: Users },
  { href: '/admin/prospecting', label: 'Müşteri Avcısı', icon: Target, accent: 'purple' },
  { href: '/admin/proposals', label: 'Teklif Talepleri', icon: FileSpreadsheet },
  { href: '/admin/projects', label: 'Projeler', icon: FolderKanban },
  { href: '/admin/invoices', label: 'Faturalar', icon: ReceiptText },
  { href: '/admin/contracts', label: 'Sözleşmeler', icon: FileText },
  { href: '/admin/tickets', label: 'Destek Talepleri', icon: TicketCheck },
  { href: '/admin/messages', label: 'Mesajlar', icon: MessageSquare },
  { href: '/admin/inbox', label: 'Gelen Kutusu (Inbox)', icon: Inbox, accent: 'violet' },
  { href: '/admin/email', label: 'E-Posta Motoru', icon: Mail },
  { href: '/admin/automations', label: 'Otomasyonlar', icon: Bot },
  { href: '/admin/ai-studio', label: 'Google AI Stüdyo', icon: Sparkles, accent: 'violet' },
  { href: '/admin/social', label: 'Sosyal İçerikler', icon: Rocket },
  { href: '/admin/blog', label: 'AI Blog Motoru', icon: FileText },
  { href: '/admin/appointments', label: 'Randevular', icon: Calendar },
  { href: '/admin/users', label: 'Kullanıcı Yönetimi', icon: Users },
  { href: '/admin/monitoring', label: 'Servis Takibi', icon: Globe },
  { href: '/admin/tech-updates', label: 'Tech Güncellemeleri', icon: Bell, accent: 'purple' },
  { href: '/admin/technologies', label: 'Teknolojiler (RSS)', icon: Settings },
  { href: '/admin/profile', label: 'Profilim (Hesabım)', icon: User, accent: 'violet' },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { settings } = useSettings()

  if (pathname.includes('/print/')) {
    return <>{children}</>;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const getLinkClasses = (href: string, accent?: string, exact?: boolean) => {
    const active = isActive(href, exact)
    if (active) {
      if (accent === 'purple') return 'flex items-center gap-3 px-3 py-2 text-sm text-purple-300 font-medium bg-purple-500/10 border border-purple-500/20 rounded-lg transition-colors'
      if (accent === 'violet') return 'flex items-center gap-3 px-3 py-2 text-sm text-violet-300 font-medium bg-violet-500/10 border border-violet-500/20 rounded-lg transition-colors'
      return 'flex items-center gap-3 px-3 py-2 text-sm text-white font-medium bg-white/[0.06] border border-white/[0.08] rounded-lg transition-colors'
    }
    if (accent === 'purple') return 'flex items-center gap-3 px-3 py-2 text-sm text-[#94A3B8] hover:text-purple-300 hover:bg-purple-500/5 rounded-lg transition-colors'
    if (accent === 'violet') return 'flex items-center gap-3 px-3 py-2 text-sm text-[#94A3B8] hover:text-violet-300 hover:bg-violet-500/5 rounded-lg transition-colors'
    return 'flex items-center gap-3 px-3 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors'
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' })
    } catch (_) {
      // ignore network errors, still redirect
    }
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#05050A] text-white flex font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0F]/80 backdrop-blur-2xl border-r border-white/[0.05] flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-40">
        <div className="p-6 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
          <Link href="/" className="flex items-center gap-2 group">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl.startsWith('http') || settings.logoUrl.startsWith('/') ? settings.logoUrl : `/${settings.logoUrl}`} 
                  alt="Logo" 
                  className="w-8 h-8 rounded-lg object-contain bg-white shadow-lg group-hover:scale-105 transition-transform" 
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#4F8EF7] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all">
                  <span className="text-white font-black text-sm">A</span>
                </div>
              )}
              <span className="font-black text-lg tracking-tight font-['Outfit'] transition-all group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#4F8EF7] group-hover:to-[#8B5CF6]">
                {settings?.companyName ? (
                  <>Admin <span className="text-[#8B5CF6] text-sm ml-1 truncate">{settings.companyName}</span></>
                ) : (
                  <>Star<span className="text-[#8B5CF6]">Admin</span></>
                )}
              </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none py-2">
          <nav className="p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon, accent, exact }) => (
              <Link key={href} href={href} className={getLinkClasses(href, accent, exact) + " group hover:translate-x-1 transition-transform"}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive(href, exact) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`} />
                {label}
                {isActive(href, exact) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/[0.05] space-y-1 bg-gradient-to-t from-[#0A0A0F] to-transparent">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] hover:text-white hover:bg-white/[0.05] rounded-lg transition-all hover:translate-x-1">
            <ArrowLeft className="w-3 h-3" />
            Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none mix-blend-screen" />
        
        <header className="h-16 border-b border-white/[0.05] bg-[#0A0A0F]/60 backdrop-blur-xl flex items-center px-8 shrink-0 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold font-['Outfit'] text-lg text-[#E2E8F0] tracking-tight">
              {settings?.companyName ? `${settings.companyName} Paneli` : 'StarWebFlow Admin'}
            </h1>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#4F8EF7] flex items-center justify-center font-bold text-sm text-white shadow-lg hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all hover:scale-105 border border-white/10">
                A
              </button>
              
              <div className="absolute right-0 mt-3 w-56 glass border border-white/[0.08] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 translate-y-2 group-hover:translate-y-0">
                <div className="px-4 py-2 border-b border-white/5 mb-1">
                  <p className="text-sm font-medium text-white">Yönetici Hesabı</p>
                  <p className="text-xs text-slate-400">admin@starwebflow.com</p>
                </div>
                <Link href="/admin/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors">
                  <User className="w-4 h-4" />
                  Profilim
                </Link>
                <div className="h-px bg-white/[0.05] my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-transparent relative z-10 scrollbar-none">
          {children}
        </div>
      </main>
    </div>
  )
}
