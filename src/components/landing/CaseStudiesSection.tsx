'use client'

import { useRef, useEffect, useState } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import { TrendingUp, Users, Clock, Filter, ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type SectorId = 'all' | 'ecommerce' | 'saas' | 'fintech' | 'corporate' | 'realestate' | 'healthcare'

export default function CaseStudiesSection() {
  const { t, language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeSector, setActiveSector] = useState<SectorId>('all')

  const sectors = [
    { id: 'all' as const, label: t('caseStudies.sectors.all') },
    { id: 'ecommerce' as const, label: t('caseStudies.sectors.ecommerce') },
    { id: 'saas' as const, label: t('caseStudies.sectors.saas') },
    { id: 'fintech' as const, label: t('caseStudies.sectors.fintech') },
    { id: 'corporate' as const, label: t('caseStudies.sectors.corporate') },
    { id: 'realestate' as const, label: t('caseStudies.sectors.realestate') },
    { id: 'healthcare' as const, label: t('caseStudies.sectors.healthcare') },
  ]

  const cases = [
    {
      company: t('caseStudies.items.c1.company'),
      sector: 'ecommerce',
      industry: t('caseStudies.items.c1.industry'),
      icon: '💄',
      glowColor: 'emerald' as const,
      color: '#10B981',
      headline: t('caseStudies.items.c1.headline'),
      description: t('caseStudies.items.c1.description'),
      metric: { value: t('caseStudies.items.c1.m1Val'), label: t('caseStudies.items.c1.m1Label') },
      metric2: { value: t('caseStudies.items.c1.m2Val'), label: t('caseStudies.items.c1.m2Label') },
      tags: language === 'tr' 
        ? ['E-Ticaret AI', 'WhatsApp CRM', 'Dönüşüm']
        : language === 'de'
        ? ['E-Commerce-KI', 'WhatsApp-CRM', 'Conversion']
        : ['E-Commerce AI', 'WhatsApp CRM', 'Conversion'],
      icon2: TrendingUp,
    },
    {
      company: t('caseStudies.items.c2.company'),
      sector: 'saas',
      industry: t('caseStudies.items.c2.industry'),
      icon: '📦',
      glowColor: 'blue' as const,
      color: '#4F8EF7',
      headline: t('caseStudies.items.c2.headline'),
      description: t('caseStudies.items.c2.description'),
      metric: { value: t('caseStudies.items.c2.m1Val'), label: t('caseStudies.items.c2.m1Label') },
      metric2: { value: t('caseStudies.items.c2.m2Val'), label: t('caseStudies.items.c2.m2Label') },
      tags: language === 'tr'
        ? ['Reklam Yönetimi', 'Dinamik Kreatif', 'Google/Meta']
        : language === 'de'
        ? ['Werbemanagement', 'Dynamische Creatives', 'Google/Meta']
        : ['Ad Management', 'Dynamic Creative', 'Google/Meta'],
      icon2: Users,
    },
    {
      company: t('caseStudies.items.c3.company'),
      sector: 'ecommerce',
      industry: t('caseStudies.items.c3.industry'),
      icon: '🛍️',
      glowColor: 'emerald' as const,
      color: '#10B981',
      headline: t('caseStudies.items.c3.headline'),
      description: t('caseStudies.items.c3.description'),
      metric: { value: t('caseStudies.items.c3.m1Val'), label: t('caseStudies.items.c3.m1Label') },
      metric2: { value: t('caseStudies.items.c3.m2Val'), label: t('caseStudies.items.c3.m2Label') },
      tags: language === 'tr'
        ? ['AI Agent', 'Zendesk Entegrasyonu', 'Otomasyon']
        : language === 'de'
        ? ['KI-Agent', 'Zendesk-Integration', 'Automatisierung']
        : ['AI Agent', 'Zendesk Integration', 'Automation'],
      icon2: Clock,
    },
    {
      company: t('caseStudies.items.c4.company'),
      sector: 'fintech',
      industry: t('caseStudies.items.c4.industry'),
      icon: '🏦',
      glowColor: 'purple' as const,
      color: '#8B5CF6',
      headline: t('caseStudies.items.c4.headline'),
      description: t('caseStudies.items.c4.description'),
      metric: { value: t('caseStudies.items.c4.m1Val'), label: t('caseStudies.items.c4.m1Label') },
      metric2: { value: t('caseStudies.items.c4.m2Val'), label: t('caseStudies.items.c4.m2Label') },
      tags: ['Next.js App', 'PCI-DSS', 'Fintech MVP'],
      icon2: ShieldCheck,
    },
    {
      company: t('caseStudies.items.c5.company'),
      sector: 'corporate',
      industry: t('caseStudies.items.c5.industry'),
      icon: '🚛',
      glowColor: 'blue' as const,
      color: '#4F8EF7',
      headline: t('caseStudies.items.c5.headline'),
      description: t('caseStudies.items.c5.description'),
      metric: { value: t('caseStudies.items.c5.m1Val'), label: t('caseStudies.items.c5.m1Label') },
      metric2: { value: t('caseStudies.items.c5.m2Val'), label: t('caseStudies.items.c5.m2Label') },
      tags: ['OCR + LLM', 'Make.com', 'ERP Sync'],
      icon2: Clock,
    },
    {
      company: t('caseStudies.items.c6.company'),
      sector: 'fintech',
      industry: t('caseStudies.items.c6.industry'),
      icon: '📈',
      glowColor: 'purple' as const,
      color: '#8B5CF6',
      headline: t('caseStudies.items.c6.headline'),
      description: t('caseStudies.items.c6.description'),
      metric: { value: t('caseStudies.items.c6.m1Val'), label: t('caseStudies.items.c6.m1Label') },
      metric2: { value: t('caseStudies.items.c6.m2Val'), label: t('caseStudies.items.c6.m2Label') },
      tags: ['SaaS', 'WebSockets', 'Recharts'],
      icon2: TrendingUp,
    },
    {
      company: t('caseStudies.items.c7.company'),
      sector: 'realestate',
      industry: t('caseStudies.items.c7.industry'),
      icon: '🏢',
      glowColor: 'emerald' as const,
      color: '#10B981',
      headline: t('caseStudies.items.c7.headline'),
      description: t('caseStudies.items.c7.description'),
      metric: { value: t('caseStudies.items.c7.m1Val'), label: t('caseStudies.items.c7.m1Label') },
      metric2: { value: t('caseStudies.items.c7.m2Val'), label: t('caseStudies.items.c7.m2Label') },
      tags: ['Emlak AI', 'Lead Gen', 'WhatsApp Sunum'],
      icon2: Users,
    },
    {
      company: t('caseStudies.items.c8.company'),
      sector: 'healthcare',
      industry: t('caseStudies.items.c8.industry'),
      icon: '🏥',
      glowColor: 'blue' as const,
      color: '#4F8EF7',
      headline: t('caseStudies.items.c8.headline'),
      description: t('caseStudies.items.c8.description'),
      metric: { value: t('caseStudies.items.c8.m1Val'), label: t('caseStudies.items.c8.m1Label') },
      metric2: { value: t('caseStudies.items.c8.m2Val'), label: t('caseStudies.items.c8.m2Label') },
      tags: ['Sağlık Turizmi AI', 'Çoklu Dil', 'CRM Sync'],
      icon2: Clock,
    },
  ]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const filteredCases = activeSector === 'all'
    ? cases
    : cases.filter(c => c.sector === activeSector)

  const handleScroll = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="cases" className="section relative overflow-hidden bg-[#0A0A0F] py-24 border-t border-white/[0.02]">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-[#4F8EF7]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#8B5CF6]/5 blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="tag-badge mb-4">
            {t('caseStudies.tag')}
          </span>
          <h2 className="heading-lg text-white mt-4 mb-4">
            {t('caseStudies.title')} <span className="gradient-text font-black">{t('caseStudies.titleHighlight')}</span>
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {t('caseStudies.desc')}
          </p>
        </div>

        {/* Dynamic Sector Filter Tabs */}
        <div 
          className={`flex flex-wrap items-center justify-center gap-1.5 mb-12 transition-all duration-700 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-[#64748B] mr-2 bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-full">
            <Filter className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>
              {t('caseStudies.filterLabel')}
            </span>
          </div>
          {sectors.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSector(s.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                activeSector === s.id
                  ? 'bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] border-transparent text-white shadow-lg shadow-[#4F8EF7]/10'
                  : 'border-white/[0.04] text-[#64748B] hover:border-white/10 hover:text-[#94A3B8] bg-white/[0.01]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Cases Grid with animation key */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c, i) => (
            <div
              key={`${c.company}-${activeSector}`}
              className="transition-all duration-500 scale-100"
              style={{ 
                animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
                animationDelay: `${i * 80}ms`
              }}
            >
              <GlowCard glowColor={c.glowColor} className="p-6 h-full flex flex-col justify-between">
                <div>
                  {/* Company Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white font-['Outfit']">{c.company}</div>
                        <div className="text-xs text-[#64748B]">{c.industry}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/[0.03] text-[#94A3B8] px-2 py-0.5 rounded border border-white/[0.05]">
                      {t('caseStudies.caseBadge')}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-extrabold text-white text-base leading-snug mb-3 font-['Outfit']">
                    {c.headline}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mb-5">
                    {c.description}
                  </p>
                </div>

                <div>
                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[c.metric, c.metric2].map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl p-3 text-center transition-all bg-white/[0.02]"
                        style={{ border: `1px solid ${c.color}20` }}
                      >
                        <div className="text-xl font-black font-['Outfit']" style={{ color: c.color }}>
                          {m.value}
                        </div>
                        <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Footer tags & CTA Link */}
                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {c.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-2 py-0.5 rounded-md font-bold"
                          style={{ background: `${c.color}10`, color: c.color }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleScroll('#contact')}
                      className="text-xs font-bold text-white hover:text-[#4F8EF7] flex items-center gap-1 transition-colors"
                    >
                      {t('caseStudies.details')}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
