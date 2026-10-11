'use client'

import { useEffect, useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Menu, X, Zap, LogIn, UserPlus, Globe, Bot, Megaphone, Cog, Monitor, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSettings } from '@/lib/settings/SettingsContext'

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
      badge: 'SSR / Ultra Hız',
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
      subLabel: 'LLM & RAG Mimarisi',
      desc: language === 'de' ? 'Rund-um-die-Uhr Kundenbetreuung, automatische Angebotserstellung und Terminbuchung.' : language === 'en' ? '24/7 client inquiries, automated proposals, and direct calendar appointments.' : '7/24 kesintisiz müşteri yanıtı, teklif sunma ve otomatik randevu alımı.',
      href: '/hizmetler/ai-agents',
      color: '#8B5CF6',
      badge: 'GPT-4o / RAG',
    },
    {
      icon: Cog,
      label: language === 'de' ? 'Kognitive Workflow-Automatisierung' : language === 'en' ? 'Cognitive Workflow Automation' : 'Kognitif İş Akışı Otomasyonu',
      subLabel: 'n8n & API Entegrasyonu',
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
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0A0A0F]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
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
                <img src={settings.preferences.branding.logoUrl} alt="Logo" className="h-9 object-contain" />
              ) : (
                <img src="/starwebflow_banner_1.png" alt="StarWebFlow Logo" className="h-10 lg:h-12 object-contain" />
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] rounded-3xl border border-white/[0.1] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(79,142,247,0.15)] font-sans"
                    style={{
                      background: 'rgba(10, 10, 18, 0.96)',
                      backdropFilter: 'blur(24px)',
                      animation: 'fadeInUp 0.2s ease both',
                    }}
                  >
                    {/* Top Accent Line */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4F8EF7] via-[#8B5CF6] to-[#06B6D4]" />

                    {/* Dropdown Header */}
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7] block mb-0.5">
                          {t('navbar.portfolioTitle')}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-none">
                          {language === 'de' ? 'Ingenieurskunst + Messbarer Geschäftserfolg' : language === 'en' ? 'Engineering Power + Concrete Business ROI' : 'Mühendislik Gücü + Somut İşletme Kazancı'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        ● {language === 'de' ? 'Systeme aktiv' : language === 'en' ? 'Systems Active' : 'Sistemler Aktif'}
                      </span>
                    </div>

                    {/* Services Grid (2 Columns) */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {services.map((service) => {
                        const Icon = service.icon
                        return (
                          <Link
                            key={service.href}
                            href={service.href}
                            onClick={() => setServicesOpen(false)}
                            className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all duration-200 group"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mt-0.5"
                              style={{
                                background: `${service.color}15`,
                                border: `1px solid ${service.color}30`,
                              }}
                            >
                              <Icon className="w-5 h-5" style={{ color: service.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-white group-hover:text-[#4F8EF7] transition-colors truncate">
                                  {service.label}
                                </span>
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-300 bg-white/[0.05] border border-white/[0.08] flex-shrink-0"
                                >
                                  {service.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#94A3B8] leading-tight line-clamp-2">
                                {service.desc}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Dropdown Footer Banner */}
                    <div className="px-6 py-3.5 border-t border-white/[0.06] bg-[#07070F] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{language === 'de' ? 'Nicht sicher, welche Lösung Sie brauchen?' : language === 'en' ? 'Not sure which solution fits your needs?' : 'Hangi çözüme ihtiyacınız olduğundan emin değil misiniz?'}</span>
                      </div>
                      <Link
                        href="/#services"
                        onClick={() => setServicesOpen(false)}
                        className="text-xs font-bold text-[#4F8EF7] hover:text-white transition-colors flex items-center gap-1"
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
