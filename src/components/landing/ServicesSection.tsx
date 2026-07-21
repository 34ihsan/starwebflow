'use client'

import { useRef, useEffect, useState } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import Link from 'next/link'
import { Globe, Bot, Megaphone, Cog, ArrowRight, Zap, Monitor } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function ServiceBentoCard({ service, index }: { service: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Icon = service.icon

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${service.className}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
    <Link
      href={service.href}
      className="block h-full"
    >
      <GlowCard
        glowColor={service.glowColor}
        className="p-8 h-full group cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300"
      >
        <div>
          <div className="flex justify-between items-start mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden"
              style={{ background: `${service.color}15`, border: `1px solid ${service.color}30` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${service.color}, transparent)` }} />
              <Icon className="w-7 h-7 relative z-10 transition-colors duration-300" style={{ color: service.color }} />
            </div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${service.color}15`, color: service.color, border: `1px solid ${service.color}25` }}
            >
              {service.badge}
            </span>
          </div>

          <h3 className="heading-md text-white mb-3 group-hover:text-white transition-colors">
            {service.title}
          </h3>

          <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
            {service.description}
          </p>
        </div>

        {/* --- ANIMATED VISUAL SPACE --- */}
        <div className="flex-grow flex items-center justify-center relative">
          {service.badge === 'AI Agents' && (
            <div className="relative w-full h-full min-h-[120px] flex items-center justify-center my-4">
              <div className="absolute inset-0 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
              <div className="relative w-24 h-24 rounded-full border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <div className="w-16 h-16 rounded-full border border-purple-500/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  <div className="w-2 h-2 bg-purple-500 rounded-full absolute -top-1" />
                </div>
                <div className="absolute w-8 h-8 bg-purple-500/20 rounded-full blur-md animate-pulse" />
                <Bot className="w-6 h-6 text-purple-400 relative z-10" />
              </div>
              <div className="absolute w-2 h-2 rounded-full bg-purple-400 top-2 left-1/4 animate-ping" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-300 bottom-4 right-1/3 animate-ping" style={{ animationDelay: '500ms' }} />
            </div>
          )}

          {service.badge === 'AI Otomasyon' && (
            <div className="relative w-full h-full min-h-[80px] flex items-center justify-center gap-4 my-4 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              <Cog className="w-10 h-10 text-emerald-500/50 animate-[spin_4s_linear_infinite]" />
              <div className="flex-grow max-w-[80px] h-0.5 bg-emerald-500/20 relative overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-emerald-500 animate-[translateX_2s_linear_infinite]" style={{ animationName: 'slideRight' }} />
              </div>
              <Cog className="w-7 h-7 text-emerald-400/50 animate-[spin_3s_linear_infinite_reverse]" />
              <style>{`@keyframes slideRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
            </div>
          )}

          {service.badge === 'Web Sitesi' && (
            <div className="relative w-full h-full min-h-[80px] flex items-center justify-center my-4">
              <div className="w-32 h-20 rounded-lg border border-blue-500/20 bg-blue-500/5 overflow-hidden group-hover:-translate-y-2 group-hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] transition-all duration-500">
                <div className="h-4 border-b border-blue-500/20 bg-blue-500/10 flex items-center px-2 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-1.5 w-3/4 bg-blue-500/20 rounded animate-pulse" />
                  <div className="h-1.5 w-1/2 bg-blue-500/20 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-5/6 bg-blue-500/20 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {service.badge === 'Web Uygulama' && (
            <div className="relative w-full h-full min-h-[80px] flex items-end justify-center gap-1.5 my-4 pb-2">
              {[40, 70, 50, 90, 60].map((h, i) => (
                <div 
                  key={i} 
                  className="w-3 bg-cyan-500/20 rounded-t group-hover:bg-cyan-500/40 transition-colors duration-500 relative overflow-hidden"
                  style={{ height: `${h}px` }}
                >
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-cyan-400 opacity-50"
                    style={{ 
                      height: '100%', 
                      animation: `pulse ${1.5 + i * 0.2}s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate` 
                    }} 
                  />
                </div>
              ))}
            </div>
          )}

          {service.badge === 'Reklam & Sosyal' && (
            <div className="relative w-full h-full min-h-[120px] flex items-center justify-center my-4">
              <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
              <svg className="w-full max-w-[180px] h-20 overflow-visible" viewBox="0 0 100 50">
                <path 
                  d="M0,50 Q25,45 50,25 T100,0" 
                  fill="none" 
                  stroke="rgba(245, 158, 11, 0.2)" 
                  strokeWidth="2" 
                  className="group-hover:stroke-[rgba(245,158,11,0.5)] transition-colors duration-500"
                />
                <path 
                  d="M0,50 Q25,45 50,25 T100,0" 
                  fill="none" 
                  stroke="#F59E0B" 
                  strokeWidth="2" 
                  strokeDasharray="150"
                  strokeDashoffset="150"
                  className="group-hover:animate-[drawPath_2s_ease-out_forwards]"
                />
                <circle cx="100" cy="0" r="3" fill="#F59E0B" className="animate-ping" />
                <circle cx="100" cy="0" r="1.5" fill="#fff" />
              </svg>
              <style>{`@keyframes drawPath { to { stroke-dashoffset: 0; } }`}</style>
            </div>
          )}
        </div>
        {/* ----------------------------- */}

        <div>
          <ul className="space-y-2 mb-6">
            {service.features.map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#64748B]">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: service.color }} />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 font-medium" style={{ color: service.color }}>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> {service.metric}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-auto" />
          </div>
        </div>
      </GlowCard>
    </Link>
    </div>
  )
}

export default function ServicesSection() {
  const { t, language } = useLanguage()
  const titleRef = useRef<HTMLDivElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTitleVisible(true); observer.unobserve(el) } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const services = [
    {
      icon: Bot,
      color: '#8B5CF6',
      glowColor: 'purple' as const,
      badge: 'AI Agents',
      href: '/hizmetler/ai-agents',
      title: t('services.agents.title'),
      description: t('services.agents.desc'),
      features: language === 'tr'
        ? ['GPT-4o & RAG Mimarisi (7/24 Kesintisiz Destek)', 'Canlı CRM Senkronizasyonu (Sıfır Manuel Veri Kaydı)', 'Otonom Satış & Otomatik Randevu Kaydı']
        : language === 'de'
        ? ['GPT-4o & RAG-Architektur (24/7 Support)', 'Echtzeit CRM-Synchronisation', 'Autonome Termin- & Vertriebsbuchung']
        : ['GPT-4o & RAG Architecture (24/7 Support)', 'Real-time CRM Sync', 'Autonomous Sales & Appointment Booking'],
      className: 'md:col-span-2 md:row-span-2',
      metric: language === 'tr' ? '10x İnsan Verimliliği (7/24 Aktif)' : language === 'de' ? '70% schnellere Antwort' : '70% Faster Response'
    },
    {
      icon: Cog,
      color: '#10B981',
      glowColor: 'emerald' as const,
      badge: 'AI Otomasyon',
      href: '/hizmetler/ai-otomasyon',
      title: t('services.automation.title'),
      description: t('services.automation.desc'),
      features: language === 'tr'
        ? ['n8n & Webhook Entegrasyonu (Angaryaları Sıfırlama)', 'REST API / Veritabanı Senkronizasyonu (Hatasız İşlem)']
        : language === 'de'
        ? ['n8n & Webhook-Integration', 'REST API & Datenbank-Synchronisation']
        : ['n8n & Webhook Integration', 'REST API & Database Sync'],
      className: 'md:col-span-1',
      metric: language === 'tr' ? '100+ Saat/Ay Tasarruf' : language === 'de' ? '30+ Std. Ersparnis' : '30+ Hours Saved'
    },
    {
      icon: Globe,
      color: '#4F8EF7',
      glowColor: 'blue' as const,
      badge: 'Web Sitesi',
      href: '/hizmetler/web-gelistirme',
      title: t('services.web.title'),
      description: t('services.web.desc'),
      features: language === 'tr'
        ? ['Next.js 14 & SSR (0.4s Işık Hızında Yüklenme)', 'Conversion UX (Siteden Kaçanları Müşteriye Dönüştürme)']
        : language === 'de'
        ? ['Next.js 14 & SSR (Unter 0,4s Ladezeit)', 'Conversion UX & Absprungschutz']
        : ['Next.js 14 & SSR (Sub-0.4s Speed)', 'Conversion UX & Bounce Prevention'],
      className: 'md:col-span-1',
      metric: language === 'tr' ? '3x Ziyaretçi Dönüşümü' : language === 'de' ? '3x Conversion-Rate' : '3x Conversion Rate'
    },
    {
      icon: Monitor,
      color: '#06B6D4',
      glowColor: 'cyan' as const,
      badge: 'Web Uygulama',
      href: '/hizmetler/web-uygulamasi',
      title: t('services.saas.title'),
      description: t('services.saas.desc'),
      features: language === 'tr'
        ? ['PostgreSQL & Cloud-Native (Sınırsız Ölçeklenme)', 'Özel Yönetim Paneli (Excel Kalabalığına Son)']
        : language === 'de'
        ? ['PostgreSQL & Cloud-Native (Unbegrenzte Skalierung)', 'Maßgeschneidertes Admin-Dashboard']
        : ['PostgreSQL & Cloud-Native (Unlimited Scaling)', 'Custom Admin Dashboard'],
      className: 'md:col-span-1',
      metric: language === 'tr' ? '%99.9 Uptime Garantisi' : '99.9% Uptime'
    },
    {
      icon: Megaphone,
      color: '#F59E0B',
      glowColor: 'amber' as const,
      badge: 'Reklam & Sosyal',
      href: '/hizmetler/reklam-sosyal-medya',
      title: t('services.marketing.title'),
      description: t('services.marketing.desc'),
      features: language === 'tr'
        ? ['Meta CAPI & Google Ads Entegrasyonu', 'Algoritmik Reklam Yönetimi (Nokta Atışı Müşteri)']
        : language === 'de'
        ? ['Meta CAPI & Google Ads Entegration', 'Algorithmisches Anzeigenmanagement']
        : ['Meta CAPI & Google Ads Integration', 'Algorithmic Ad Management'],
      className: 'md:col-span-2',
      metric: language === 'tr' ? 'Sektör Lideri ROAS' : '4.8x ROAS'
    },
  ]

  return (
    <section id="services" className="section relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={titleRef}
          className={`text-center mb-16 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="tag-badge mb-4">
            {language === 'tr' ? 'Mimarimiz' : language === 'de' ? 'Unsere Architektur' : 'Our Architecture'}
          </span>
          <h2 className="heading-lg text-white mt-4 mb-4">
            {language === 'tr' ? (
              <>Sadece Web Sitesi Değil, <span className="gradient-text">Verimlilik Makinesi</span> Kuruyoruz</>
            ) : language === 'de' ? (
              <>Nicht nur eine Website, wir bauen eine <span className="gradient-text">Effizienzmaschine</span></>
            ) : (
              <>Not Just a Website, We Build an <span className="gradient-text">Efficiency Machine</span></>
            )}
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
            {language === 'tr' ? (
              <>Geleneksel ajanslar size hizmet satar; biz size <span className="text-white font-semibold"> operasyonel güç ve ROI</span> satıyoruz.</>
            ) : language === 'de' ? (
              <>Klassische Agenturen verkaufen Ihnen Dienstleistungen; wir verkaufen Ihnen <span className="text-white font-semibold">operative Stärke und ROI</span>.</>
            ) : (
              <>Traditional agencies sell you services; we sell you <span className="text-white font-semibold">operational power and ROI</span>.</>
            )}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceBentoCard key={service.badge} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
