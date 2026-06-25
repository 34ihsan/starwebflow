'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderKanban, LayoutDashboard, FileText, LifeBuoy, ScrollText, Globe, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function SidebarNav() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const navItems = [
    { name: t('dashboard.sidebar.overview'), href: '/client', icon: LayoutDashboard },
    { name: t('dashboard.sidebar.projects'), href: '/client/projects', icon: FolderKanban },
    { name: t('dashboard.sidebar.invoices'), href: '/client/invoices', icon: FileText },
    { name: t('dashboard.sidebar.support'), href: '/client/support', icon: LifeBuoy },
    { name: t('dashboard.sidebar.contracts'), href: '/client/contracts', icon: ScrollText },
    { name: 'Mesajlar', href: '/client/messages', icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-full justify-between pb-4">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                isActive 
                  ? "text-[#4F8EF7] bg-[#4F8EF7]/10" 
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Language switcher */}
      <div className="px-4 pt-4 border-t border-white/[0.05] flex items-center justify-around">
        {(['tr', 'en', 'de'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
              language === lang 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            <Globe className="w-2.5 h-2.5" />
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
