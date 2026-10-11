'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderKanban, LayoutDashboard, FileText, LifeBuoy, ScrollText, Globe, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const SECTION_LABELS = {
  main: { tr: 'ANA MENÜ', en: 'MAIN MENU', de: 'HAUPTMENÜ' },
  account: { tr: 'HESAP', en: 'ACCOUNT', de: 'KONTO' },
}

export default function SidebarNav() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const lang = language as 'tr' | 'en' | 'de'

  const mainNavItems = [
    { name: t('dashboard.sidebar.overview'), href: '/client',          icon: LayoutDashboard },
    { name: t('dashboard.sidebar.projects'), href: '/client/projects', icon: FolderKanban   },
    { name: t('dashboard.sidebar.invoices'), href: '/client/invoices', icon: FileText        },
    { name: t('dashboard.sidebar.support'),  href: '/client/support',  icon: LifeBuoy       },
    { name: t('dashboard.sidebar.contracts'), href: '/client/contracts', icon: ScrollText   },
  ];

  const accountNavItems = [
    { name: lang === 'tr' ? 'Mesajlar' : lang === 'de' ? 'Nachrichten' : 'Messages', href: '/client/messages', icon: MessageSquare },
  ];

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/client' && pathname.startsWith(item.href))
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        className={`
          dashboard-nav-item
          flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium
          ${isActive
            ? 'sidebar-glow-active text-white'
            : 'text-[#64748B] hover:text-[#CBD5E1]'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#4F8EF7]' : 'text-[#475569]'}`} aria-hidden="true" />
        <span>{item.name}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4F8EF7]" style={{ boxShadow: '0 0 6px rgba(79,142,247,0.8)' }} aria-hidden="true" />
        )}
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full justify-between py-4 overflow-y-auto">
      <nav className="px-3 space-y-4">

        {/* Main nav */}
        <div>
          <p className="px-4 mb-2 text-[9px] font-bold tracking-[0.15em] text-[#334155] uppercase">
            {SECTION_LABELS.main[lang]}
          </p>
          <div className="space-y-0.5">
            {mainNavItems.map((item) => <NavItem key={item.href} item={item} />)}
          </div>
        </div>

        {/* Account nav */}
        <div>
          <p className="px-4 mb-2 text-[9px] font-bold tracking-[0.15em] text-[#334155] uppercase">
            {SECTION_LABELS.account[lang]}
          </p>
          <div className="space-y-0.5">
            {accountNavItems.map((item) => <NavItem key={item.href} item={item} />)}
          </div>
        </div>
      </nav>

      {/* Language switcher */}
      <div className="px-4 pt-4 border-t border-white/[0.06] mt-4">
        <p className="text-[9px] font-bold tracking-[0.15em] text-[#334155] uppercase mb-2">Dil / Language</p>
        <div className="flex items-center gap-1">
          {(['tr', 'en', 'de'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                language === l
                  ? 'bg-[#4F8EF7]/15 text-[#4F8EF7] border border-[#4F8EF7]/25'
                  : 'text-[#475569] hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Globe className="w-2.5 h-2.5" aria-hidden="true" />
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
