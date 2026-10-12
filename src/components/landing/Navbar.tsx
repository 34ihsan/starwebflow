'use client'

import { useEffect, useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Menu, X, Zap, LogIn, UserPlus, Globe, Bot, Megaphone, Cog, Monitor, ChevronDown, Check } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSettings } from '@/lib/settings/SettingsContext'
import FlagIcon from '@/components/ui/FlagIcon'

import RegionBanner from './RegionBanner'

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
      label: language === 'de' ? 'Sub-Second Web-Ökosystem' : language === 'en' ? 'Sub-Second Web Ecosystem' : 'Sub-Second Web Ekosistemi',
      subLabel: 'Next.js 14 & Ultra Speed',
      desc: language === 'de' ? 'Lädt in unter 0,4s, verhindert Absprünge und verdreifacht die Conversion-Rate.' : language === 'en' ? '0.4s load time prevents visitor drop-off and triples sales conversion.' : '0.4s açılış süresi ile ziyaretçi kaybını önler, satış dönüşümünü 3x artırır.',
      href: '/hizmetler/web-gelistirme',
      color: '#4F8EF7',
      badge: language === 'de' ? 'SSR / Ultra-Speed' : language === 'en' ? 'SSR / Ultra Speed' : 'SSR / Ultra Hız',
    },
    {
      icon: Monitor,
      label: language === 'de' ? 'Maßgeschneiderte SaaS & Cloud' : language === 'en' ? 'Custom SaaS & Cloud Architecture' : 'Özel SaaS & Bulut Mimari',
      subLabel: 'Cloud-Native & Dashboards',
      desc: language === 'de' ? 'Schluss mit Excel-Chaos: Maßgeschneiderte Cloud-Verwaltung für Ihr Unternehmen.' : language === 'en' ? 'Eliminate spreadsheet chaos with custom cloud management built for your firm.' : 'Excel karmaşasına son veren, şirketinize özel bulut yönetim altyapıları.',
      href: '/hizmetler/web-uygulamasi',
      color: '#06B6D4',
      badge: 'Cloud-Native',
    },
    {
      icon: Bot,
      label: language === 'de' ? 'Autonome KI-Agenten' : language === 'en' ? 'Autonomous AI Agents' : 'Otonom AI Ajanları',
      subLabel: language === 'de' ? 'LLM & RAG-Architektur' : language === 'en' ? 'LLM & RAG Architecture' : 'LLM & RAG Mimarisi',
      desc: language === 'de' ? 'Rund-um-die-Uhr Kundenbetreuung, automatische Angebotserstellung und Terminbuchung.' : language === 'en' ? '24/7 client inquiries, automated proposals, and direct calendar appointments.' : '7/24 kesintisiz müşteri yanıtı, teklif sunma ve otomatik randevu alımı.',
      href: '/hizmetler/ai-agents',
      color: '#8B5CF6',
      badge: 'Multi-LLM & RAG',
    },
    {
      icon: Cog,
      label: language === 'de' ? 'Kognitive Workflow-Automatisierung' : language === 'en' ? 'Cognitive Workflow Automation' : 'Kognitif İş Akışı Otomasyonu',
      subLabel: language === 'de' ? 'n8n & API-Integration' : language === 'en' ? 'n8n & API Integration' : 'n8n & API Entegrasyonu',
      desc: language === 'de' ? 'Spart Ihrem Team durch intelligente Automatisierungen wöchentlich 15+ Stunden.' : language === 'en' ? 'Saves your team 15+ hours weekly by automating operational processes.' : 'Süreçleri otomatikleştirerek ekibinize haftalık 15+ saat kazandırır.',
      href: '/hizmetler/ai-otomasyon',
      color: '#10B981',
      badge: 'n8n & Webhooks',
    },
    {
      icon: Megaphone,
      label: language === 'de' ? 'Datengesteuertes Wachstum' : language === 'en' ? 'Data-Driven Algorithmic Growth' : 'Veri Odaklı Algoritmik Büyüme',
      subLabel: 'Growth & Performance Ads',
      desc: language === 'de' ? 'Meta CAPI & Google Ads für punktgenaue Kundenakquise mit maximalem ROAS.' : language === 'en' ? 'Targeted client acquisition funnel with Meta CAPI & Google Ads.' : 'Meta CAPI & Google Ads ile hedef kitleye nokta atışı müşteri akışı.',
      href: '/hizmetler/reklam-sosyal-medya',
      color: '#F59E0B',
      badge: 'High ROAS',
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
      <RegionBanner />
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || servicesOpen
            ? 'bg-white/95 dark:bg-[#0A0A0F]/95 backdrop-blur-2xl border-b border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
            : 'bg-transparent'
        }`}
        style={{ animation: 'slideDown 0.5s ease both' }}
      >
        {/* Top subtle neon line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              {settings?.preferences?.branding?.logoUrl ? (
                <img src={settings.preferences.branding.logoUrl} alt="Logo" className="h-[54px] md:h-[58px] object-contain" />
              ) : (
                <img src="/starwebflow_logo_main.png" alt="StarWebFlow Logo" className="h-[58px] lg:h-[66px] w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Hizmetler mega-menu */}
              <div 
                className="relative" 
                ref={dropdownRef}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  onClick={() => setServicesOpen(o => !o)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    servicesOpen ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5' : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
                  }`}
                >
                  {t('navbar.services')}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {servicesOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] font-sans overflow-hidden backdrop-blur-2xl"
                    style={{
                      animation: 'fadeInUp 0.2s ease both',
                    }}
                  >
                    {/* Top Accent Line */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500" />

                    {/* Dropdown Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 block mb-0.5">
                          {t('navbar.portfolioTitle')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-none">
                          {language === 'de' ? 'Ingenieurskunst + Messbarer Geschäftserfolg' : language === 'en' ? 'Engineering Power + Concrete Business ROI' : 'Mühendislik Gücü + Somut İşletme Kazancı'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                        ● {language === 'de' ? 'Systeme aktiv' : language === 'en' ? 'Systems Active' : 'Sistemler Aktif'}
                      </span>
                    </div>

                    {/* Services Grid (2 Columns) */}
                    <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {services.map((service) => {
                        const Icon = service.icon
                        return (
                          <Link
                            key={service.href}
                            href={service.href}
                            onClick={() => setServicesOpen(false)}
                            className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/90 transition-all duration-200 group"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5 shadow-xs"
                              style={{
                                background: `${service.color}15`,
                                border: `1px solid ${service.color}35`,
                              }}
                            >
                              <Icon className="w-5 h-5" style={{ color: service.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {service.label}
                                </span>
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-600 bg-slate-100 border border-slate-200 flex-shrink-0"
                                >
                                  {service.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-tight line-clamp-2 font-normal">
                                {service.desc}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Dropdown Footer Banner */}
                    <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'de' ? 'Nicht sicher, welche Lösung Sie brauchen?' : language === 'en' ? 'Not sure which solution fits your needs?' : 'Hangi çözüme ihtiyacınız olduğundan emin değil misiniz?'}</span>
                      </div>
                      <Link
                        href="/#services"
                        onClick={() => setServicesOpen(false)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
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
                    className="px-4 py-2 text-sm text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white font-medium rounded-lg hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white font-medium rounded-lg hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Dil Seçici Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-slate-700 hover:text-slate-900 font-semibold rounded-lg hover:bg-slate-100/80 transition-all duration-200 cursor-pointer border border-slate-200/80 bg-white/70 shadow-2xs"
                  aria-label="Dil seçimi"
                >
                  <FlagIcon code={language} className="w-4.5 h-3" />
                  <span className="uppercase text-xs tracking-wider font-bold">{language}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 p-1">
                    {(['tr', 'en', 'de'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          language === lang ? 'text-blue-600 bg-blue-50/80 font-bold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <FlagIcon code={lang} className="w-4.5 h-3" />
                        <span className="flex-1 text-left">{lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Deutsch'}</span>
                        {language === lang && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/auth/login" className="px-3.5 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100/80 transition-all duration-200 cursor-pointer flex items-center gap-2">
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
            <div className="md:hidden flex items-center gap-2">
              <button
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Menü"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 pt-2 space-y-1 bg-white backdrop-blur-2xl border-b border-slate-200 shadow-xl">
            {/* Mobile Services */}
            <button
              onClick={() => setMobileServicesOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:text-slate-900 font-semibold rounded-xl hover:bg-slate-100/80 transition-all duration-200"
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
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 transition-all"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: service.color }} />
                      <span className="text-sm font-medium text-slate-700">{service.label}</span>
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
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:text-slate-900 font-semibold rounded-xl hover:bg-slate-100/80 transition-all duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:text-slate-900 font-semibold rounded-xl hover:bg-slate-100/80 transition-all duration-200"
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-around py-3 border-t border-b border-slate-200 my-2 gap-2">
              {(['tr', 'en', 'de'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    language === lang 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <FlagIcon code={lang} className="w-4 h-2.5" />
                  <span>{lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Deutsch'}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/auth/login" className="w-full text-center px-4 py-3 text-sm text-slate-700 hover:text-slate-900 font-semibold rounded-xl hover:bg-slate-100/80 border border-slate-200 transition-all duration-200 flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('navbar.login')}
              </Link>
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
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
