'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSettings } from '@/lib/settings/SettingsContext'
import { 
  FileText, LayoutDashboard, Settings, Users, ArrowLeft, 
  Activity, FileSpreadsheet, FolderKanban, ReceiptText, 
  Mail, Bot, Rocket, Calendar, MessageSquare, Target, Sparkles,
  TicketCheck, LogOut, Bell, Globe
} from 'lucide-react'

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
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { settings } = useSettings()

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
    <div className="min-h-screen bg-[#05050A] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0F] border-r border-white/[0.05] flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/[0.05]">
          <Link href="/" className="flex items-center gap-2 group">
            {settings?.preferences?.branding?.logoUrl ? (
              <img src={settings.preferences.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
                  <span className="text-white font-black text-sm">SW</span>
                </div>
                <span className="font-black text-lg tracking-tight font-['Outfit']">
                  Star<span className="text-[#8B5CF6]">Admin</span>
                </span>
              </>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon, accent, exact }) => (
              <Link key={href} href={href} className={getLinkClasses(href, accent, exact)}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {isActive(href, exact) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/[0.05] space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Siteye Dön
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/[0.05] bg-[#0A0A0F]/80 backdrop-blur-md flex items-center px-8 shrink-0 justify-between">
          <h1 className="font-semibold font-['Outfit'] text-lg text-[#E2E8F0]">StarWebFlow Admin</h1>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-[#94A3B8] hover:text-white relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#0A0A0F]"></span>
              </button>
              
              <div className="absolute right-0 mt-2 w-80 bg-[#131B2A] border border-white/[0.05] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-4 border-b border-white/[0.05]">
                  <h3 className="font-semibold text-white">Son Aktiviteler</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {/* Mock Notifications */}
                  <div className="p-4 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex flex-shrink-0 items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Yeni Müşteri Kaydı</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Ahmet Kaya sisteme katıldı.</p>
                        <p className="text-[10px] text-[#64748B] mt-1">10 dk önce</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex flex-shrink-0 items-center justify-center">
                        <TicketCheck className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Yeni Destek Talebi</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Acil: Sunucu bağlantı hatası</p>
                        <p className="text-[10px] text-[#64748B] mt-1">1 saat önce</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 flex flex-shrink-0 items-center justify-center">
                        <ReceiptText className="w-4 h-4 text-fuchsia-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Fatura Ödendi</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">#INV-2024-001 ödendi.</p>
                        <p className="text-[10px] text-[#64748B] mt-1">3 saat önce</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-white/[0.05] text-center">
                  <button className="text-xs text-[#8B5CF6] hover:text-[#7C3AED] font-medium transition-colors">Tümünü Gör</button>
                </div>
              </div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#4F8EF7] flex items-center justify-center font-bold text-xs">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-[#05050A]">
          {children}
        </div>
      </main>
    </div>
  )
}
