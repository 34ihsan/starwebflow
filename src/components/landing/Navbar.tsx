'use client'

import { useEffect, useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Menu, X, Zap, LogIn, UserPlus, Globe, Bot, Megaphone, Cog, Monitor, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSettings } from '@/lib/settings/SettingsContext'

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const { settings } = useSettings()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)

  const services = [
    {
      icon: Globe,
      label: t('services.web.title'),
      desc: t('services.web.desc'),
      href: '/hizmetler/web-gelistirme',
      color: '#4F8EF7',
    },
    {
      icon: Monitor,
      label: t('services.saas.title'),
      desc: t('services.saas.desc'),
      href: '/hizmetler/web-uygulamasi',
      color: '#06B6D4',
    },
    {
      icon: Bot,
      label: t('services.agents.title'),
      desc: t('services.agents.desc'),
      href: '/hizmetler/ai-agents',
      color: '#8B5CF6',
    },
    {
      icon: Cog,
      label: t('services.automation.title'),
      desc: t('services.automation.desc'),
      href: '/hizmetler/ai-otomasyon',
      color: '#10B981',
    },
    {
      icon: Megaphone,
      label: t('services.marketing.title'),
      desc: t('services.marketing.desc'),
      href: '/hizmetler/reklam-sosyal-medya',
      color: '#F59E0B',
    },
  ]

  const navLinks = [
    { label: t('navbar.whyUs'), href: '/#why-us' },
    { label: t('navbar.pricing'), href: '/#pricing' },
    { label: t('navbar.process'), href: '/#process' },
    { label: t('navbar.blog'), href: '/blog' },
    { label: t('navbar.contact'), href: '/#contact' },
  ]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('/#') || href.startsWith('#')) {
      const id = href.replace('/#', '#')
      if (window.location.pathname === '/') {
        const el = document.querySelector(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.href = href
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
        style={{ animation: 'slideDown 0.5s ease both' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              {settings?.preferences?.branding?.logoUrl ? (
                <img src={settings.preferences.branding.logoUrl} alt="Logo" className="h-9 object-contain" />
              ) : (
                <>
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_20px_rgba(79,142,247,0.4)] group-hover:shadow-[0_0_30px_rgba(79,142,247,0.6)] transition-shadow duration-300">
                    <Zap className="w-5 h-5 text-white" fill="white" />
                  </div>
                  <span className="font-['Outfit'] font-800 text-xl tracking-tight">
                    Star<span className="gradient-text-blue font-black">WebFlow</span>
                  </span>
                </>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Hizmetler mega-menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setServicesOpen(o => !o)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    servicesOpen ? 'text-white bg-white/5' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('navbar.services')}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {servicesOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
                    style={{
                      background: 'rgba(12,12,22,0.95)',
                      backdropFilter: 'blur(20px)',
                      animation: 'fadeInUp 0.2s ease both',
                    }}
                  >
                    {/* Dropdown header */}
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <div className="text-[10px] text-[#475569] uppercase tracking-widest font-semibold">
                        {t('navbar.portfolioTitle')}
                      </div>
                    </div>

                    {/* Services grid */}
                    <div className="p-3">
                      {services.map((service) => {
                        const Icon = service.icon
                        return (
                          <Link
                            key={service.href}
                            href={service.href}
                            onClick={() => setServicesOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group"
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                              style={{
                                background: `${service.color}15`,
                                border: `1px solid ${service.color}25`,
                              }}
                            >
                              <Icon className="w-4.5 h-4.5" style={{ color: service.color }} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                                {service.label}
                              </div>
                              <div className="text-xs text-[#64748B]">{service.desc}</div>
                            </div>
                            <div
                              className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: service.color }}
                            >
                              →
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] text-[#334155]">
                        {language === 'tr' ? 'Tüm hizmetler dahil' : language === 'en' ? 'All services included' : 'Alle Dienstleistungen inklusive'}
                      </span>
                      <Link
                        href="/#services"
                        onClick={() => setServicesOpen(false)}
                        className="text-xs text-[#4F8EF7] hover:text-white transition-colors"
                      >
                        {t('navbar.allServices')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                link.href.startsWith('/#') ? (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white font-medium rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white font-medium rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {/* Dil Seçici Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#94A3B8] hover:text-white font-medium rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/[0.05]"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="uppercase">{language}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-[#0C0C16] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {(['tr', 'en', 'de'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-white/5 transition-colors uppercase ${
                          language === lang ? 'text-blue-400 bg-white/[0.02]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Deutsch'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/auth/login" className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white font-medium rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('navbar.login')}
              </Link>
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.href = '/auth/register'}
              >
                <UserPlus className="w-4 h-4" />
                {t('navbar.register')}
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menü"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 pt-2 space-y-1 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/[0.06]">
            {/* Mobile Services */}
            <button
              onClick={() => setMobileServicesOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#94A3B8] hover:text-white font-medium rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              {t('navbar.services')}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileServicesOpen && (
              <div className="pl-3 space-y-1">
                {services.map(service => {
                  const Icon = service.icon
                  return (
                    <Link
                      key={service.href}
                      href={service.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: service.color }} />
                      <span className="text-sm text-[#94A3B8]">{service.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}

            {navLinks.map((link) => (
              link.href.startsWith('/#') ? (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-left px-4 py-3 text-sm text-[#94A3B8] hover:text-white font-medium rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm text-[#94A3B8] hover:text-white font-medium rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-around py-3 border-t border-b border-white/[0.05] my-2">
              {(['tr', 'en', 'de'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                    language === lang 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                      : 'text-[#64748B] hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === 'tr' ? 'Türkçe (TR)' : lang === 'en' ? 'English (EN)' : 'Deutsch (DE)'}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/auth/login" className="w-full text-center px-4 py-3 text-sm text-[#94A3B8] hover:text-white font-medium rounded-xl hover:bg-white/5 border border-white/5 transition-all duration-200 flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('navbar.login')}
              </Link>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => window.location.href = '/auth/register'}
              >
                <UserPlus className="w-4 h-4" />
                {t('navbar.register')}
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
