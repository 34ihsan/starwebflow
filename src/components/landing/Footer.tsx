'use client'

import Link from 'next/link'
import { Zap, AtSign, Link2, Code2, Mail, Phone, MapPin, Shield } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useSettings } from '@/lib/settings/SettingsContext'

const InstagramIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
)

const socials = [
  { icon: AtSign, label: 'Twitter', href: 'https://x.com/starwebflow' },
  { icon: Link2, label: 'LinkedIn', href: 'https://www.linkedin.com/in/star-webflow-496540421' },
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/starwebflow' },
  { icon: Code2, label: 'GitHub', href: 'https://github.com/starwebflow' },
]

export default function Footer() {
  const { t, language } = useLanguage()
  const { settings } = useSettings()

  const links = {
    services: [
      { label: t('footer.links.web'), href: '/hizmetler/web-gelistirme' },
      { label: t('footer.links.automation'), href: '/hizmetler/ai-otomasyon' },
      { label: t('footer.links.agents'), href: '/hizmetler/ai-agents' },
      { label: t('footer.links.marketing'), href: '/hizmetler/reklam-sosyal-medya' },
      { label: language === 'tr' ? 'SaaS Geliştirme' : language === 'de' ? 'SaaS-Entwicklung' : 'SaaS Development', href: '/hizmetler/web-uygulamasi' },
    ],
    company: [
      { label: t('footer.links.about'), href: '/#why-us' },
      { label: t('footer.links.process'), href: '/#process' },
      { label: t('footer.links.cases'), href: '/#cases' },
      { label: t('footer.links.pricing'), href: '/#pricing' },
      { label: language === 'tr' ? 'Blog' : 'Blog', href: '/blog' },
    ],
    sectors: [
      { label: language === 'tr' ? 'Sağlık & Klinik' : language === 'de' ? 'Gesundheit' : 'Healthcare', href: '/sektorler/saglik' },
      { label: language === 'tr' ? 'Hukuk & Avukat' : language === 'de' ? 'Rechtsanwalt' : 'Legal', href: '/sektorler/hukuk' },
      { label: language === 'tr' ? 'E-Ticaret' : language === 'de' ? 'E-Commerce' : 'E-Commerce', href: '/sektorler/e-ticaret' },
      { label: language === 'tr' ? 'Lojistik' : language === 'de' ? 'Logistik' : 'Logistics', href: '/sektorler/lojistik' },
    ],
    legal: [
      { label: t('footer.links.privacy'), href: '/datenschutz' },
      { label: t('footer.links.terms'), href: '/nutzungsbedingungen' },
      { label: t('footer.links.kvkk'), href: '/kvkk' },
      { label: t('footer.links.cookies'), href: '/cookie-richtlinie' },
      { label: t('footer.links.imprint'), href: '/impressum' },
    ],
  }

  const handleNavClick = (href: string) => {
    if (href === '#') return
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]">
      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <a
              href="#"
              className="flex items-center gap-2.5 mb-4 group"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >
              {settings?.preferences?.branding?.logoUrl ? (
                <img src={settings.preferences.branding.logoUrl} alt="Logo" className="h-9 object-contain" />
              ) : (
                <img src="/starwebflow_banner_1.png" alt="StarWebFlow Logo" className="h-10 object-contain" />
              )}
            </a>

            <p className="text-sm text-[#64748B] leading-relaxed mb-6 max-w-xs">
              {t('footer.desc')}
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 mb-6">
              {[
                { icon: Mail, text: 'info@starwebflow.com' },
                { icon: Phone, text: '+49 179 492 4556' },
                { icon: MapPin, text: t('footer.contact.city') },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">
                  <Icon className="w-4 h-4 text-[#4F8EF7] flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-[#64748B] hover:text-white hover:border-[#4F8EF7]/40 hover:bg-[#4F8EF7]/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.headers.services')}</h4>
            <ul className="space-y-3">
              {links.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.headers.company')}</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sectors column — GEO & internal linking */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {language === 'tr' ? 'Sektörler' : language === 'de' ? 'Branchen' : 'Industries'}
            </h4>
            <ul className="space-y-3">
              {links.sectors.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.headers.legal')}</h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#475569]">
            © {new Date().getFullYear()} StarWebFlow. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            {/* AI Accessible badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)' }}
              title="This page is optimized for AI search engines (ChatGPT, Claude, Gemini, Perplexity)"
            >
              <Shield className="w-3 h-3 text-[#4F8EF7]" aria-hidden="true" />
              <span className="text-[9px] font-bold text-[#4F8EF7] tracking-widest uppercase">AI-Accessible</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#475569]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              {t('footer.status')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
