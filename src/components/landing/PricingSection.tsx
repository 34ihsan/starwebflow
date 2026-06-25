'use client'

import { useRef, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Check, Sparkles, Zap, Building2, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function PricingSection() {
  const { t, language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const plans = [
    {
      id: 'starter',
      name: t('pricing.starter.title'),
      icon: Zap,
      color: '#10B981',
      priceText: t('pricing.starter.price'),
      priceSubText: t('pricing.starter.subtitle'),
      description: language === 'tr'
        ? 'Dijital varlığını oluşturmak ve ilk adımı atmak isteyen küçük ve orta ölçekli işletmeler için ideal.'
        : language === 'de'
        ? 'Ideal für kleine und mittlere Unternehmen, die ihre digitale Präsenz aufbauen und den ersten Schritt machen möchten.'
        : 'Ideal for small and medium businesses looking to build their digital presence and take the first step.',
      badge: null,
      features: language === 'tr'
        ? [
            '1 AI Agent (Müşteri Destek)',
            'Landing page + 5 sayfa web sitesi',
            'Temel SEO optimizasyonu',
            'Google Ads yönetimi (Temel bütçe)',
            'Aylık performans raporu',
            '1 revizyon hakkı / ay',
            'E-posta destek (48 saat)',
          ]
        : language === 'de'
        ? [
            '1 KI-Agent (Kundensupport)',
            'Landingpage + 5-seitige Website',
            'Grundlegende SEO-Optimierung',
            'Google Ads-Management (Basisbudget)',
            'Monatlicher Leistungsbericht',
            '1 Revisionsrecht / Monat',
            'E-Mail-Support (48 Stunden)',
          ]
        : [
            '1 AI Agent (Customer Support)',
            'Landing page + 5 pages website',
            'Basic SEO optimization',
            'Google Ads management (Base budget)',
            'Monthly performance report',
            '1 revision request / month',
            'Email support (48 hours)',
          ],
      cta: language === 'tr' ? 'Bilgi Al & Başla' : language === 'de' ? 'Infos holen & Starten' : 'Get Info & Start',
      ctaVariant: 'secondary' as const,
    },
    {
      id: 'growth',
      name: t('pricing.growth.title'),
      icon: Sparkles,
      color: '#4F8EF7',
      priceText: t('pricing.growth.price'),
      priceSubText: t('pricing.growth.subtitle'),
      description: language === 'tr'
        ? 'Büyümeyi hızlandırmak, süreçleri otomatize etmek ve rekabette öne geçmek isteyen işletmeler için.'
        : language === 'de'
        ? 'Für Unternehmen, die ihr Wachstum beschleunigen, Prozesse automatisieren und sich im Wettbewerb behaupten wollen.'
        : 'For businesses looking to accelerate growth, automate workflows, and stand out in competition.',
      badge: language === 'tr' ? '⭐ En Popüler' : language === 'de' ? '⭐ Am beliebtesten' : '⭐ Most Popular',
      features: language === 'tr'
        ? [
            '3 AI Agent (Satış + Destek + İçerik)',
            'Web uygulaması geliştirme (Next.js)',
            'Gelişmiş AI otomasyon pipeline\'ları',
            'Meta + Google Ads yönetimi',
            'CRM entegrasyonu (HubSpot/Pipedrive)',
            'Haftalık analitik raporları',
            '5 revizyon hakkı / ay',
            '7/24 öncelikli destek',
          ]
        : language === 'de'
        ? [
            '3 KI-Agenten (Vertrieb + Support + Content)',
            'Webanwendungsentwicklung (Next.js)',
            'Erweiterte KI-Automatisierungs-Pipelines',
            'Meta + Google Ads Management',
            'CRM-Integration (Hubspot/Pipedrive)',
            'Wöchentliche Analyseberichte',
            '5 Revisionsrechte / Monat',
            '24/7 Priority-Support',
          ]
        : [
            '3 AI Agents (Sales + Support + Content)',
            'Web app development (Next.js)',
            'Advanced AI automation pipelines',
            'Meta + Google Ads management',
            'CRM integration (Hubspot/Pipedrive)',
            'Weekly analytics reports',
            '5 revision requests / month',
            '24/7 priority support',
          ],
      cta: language === 'tr' ? 'Verimlilik Analizi İste' : language === 'de' ? 'Effizienzanalyse anfordern' : 'Request Efficiency Analysis',
      ctaVariant: 'primary' as const,
    },
    {
      id: 'enterprise',
      name: t('pricing.enterprise.title'),
      icon: Building2,
      color: '#8B5CF6',
      priceText: t('pricing.enterprise.price'),
      priceSubText: t('pricing.enterprise.subtitle'),
      description: language === 'tr'
        ? 'Tam özelleştirilmiş çözümler, özel SLA ve kurumsal düzeyde güvenlik gereksinimleri için.'
        : language === 'de'
        ? 'Für voll kundenspezifische Lösungen, dedizierten SLA-Support und Sicherheitsanforderungen auf Enterprise-Niveau.'
        : 'For fully customized solutions, dedicated SLA, and enterprise-grade security requirements.',
      badge: null,
      features: language === 'tr'
        ? [
            'Sınırsız AI Agent',
            'Özel yazılım geliştirme',
            'Full-stack otomasyon ekosistemi',
            'Beyaz etiket (White-label) seçenek',
            'Dedicated hesap yöneticisi',
            'Özel SLA & uptime garantisi',
            'On-premise veya özel cloud',
            'Lastenheft / Pflichtenheft ile yönetim',
          ]
        : language === 'de'
        ? [
            'Unbegrenzte KI-Agenten',
            'Kundenspezifische Softwareentwicklung',
            'Full-Stack-Automatisierungs-Ökosystem',
            'White-Label-Optionen',
            'Dedizierter Account-Manager',
            'Spezielle SLA- & Uptime-Garantie',
            'On-Premise oder private Cloud',
            'Steuerung über Lastenheft / Pflichtenheft',
          ]
        : [
            'Unlimited AI Agents',
            'Custom software development',
            'Full-stack automation ecosystem',
            'White-label options',
            'Dedicated account manager',
            'Custom SLA & uptime guarantee',
            'On-premise or private cloud',
            'Management via Lastenheft / Pflichtenheft',
          ],
      cta: language === 'tr' ? 'Özel Teklif Al' : language === 'de' ? 'Individuelles Angebot' : 'Get Custom Quote',
      ctaVariant: 'outline' as const,
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

  const handleScroll = () => {
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else window.location.href = '/#contact'
  }

  return (
    <section id="pricing" className="section relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="tag-badge mb-4">
            {language === 'tr' ? 'Fiyatlandırma' : language === 'de' ? 'Preise' : 'Pricing'}
          </span>
          <h2 className="heading-lg text-white mt-4 mb-4">
            {language === 'tr' ? (
              <>AI Agent Hizmet <span className="gradient-text">Paketleri</span></>
            ) : language === 'de' ? (
              <>KI-Agenten Service-<span className="gradient-text">Pakete</span></>
            ) : (
              <>AI Agent Service <span className="gradient-text">Packages</span></>
            )}
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto mb-8">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            const isPopular = plan.badge !== null

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${
                  isPopular
                    ? 'border-[#4F8EF7]/40 bg-gradient-to-b from-[#4F8EF7]/10 to-[#8B5CF6]/5 shadow-[0_0_40px_rgba(79,142,247,0.15)]'
                    : 'border-white/[0.06] bg-[#0F0F1A]/80'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 lg:p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Icon & Name */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg font-['Outfit']">{plan.name}</h3>
                      </div>
                    </div>

                    {/* Price text (Curiosity / ROI based) */}
                    <div className="mb-6">
                      <div className="text-xl font-bold font-['Outfit'] text-white leading-snug">
                        {plan.priceText}
                      </div>
                      <p className="text-xs text-[#10B981] mt-1.5 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        {plan.priceSubText}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div>
                    {/* CTA */}
                    <Button
                      variant={plan.ctaVariant}
                      size="md"
                      className="w-full mb-6"
                      onClick={handleScroll}
                      id={`pricing-cta-${plan.id}`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.06] mb-6" />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                          <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[#475569] text-sm">
            {language === 'tr' ? (
              <>
                Tüm çözümlerimizde şeffaf süreç, esnek SLA ve 30 gün önceden bildirim esası uygulanır.{' '}
                <span className="text-[#4F8EF7] cursor-pointer hover:underline" onClick={handleScroll}>
                  Sözleşme şartlarını incele
                </span>
              </>
            ) : language === 'de' ? (
              <>
                Transparenter Prozess, flexible SLA und 30 Tage Kündigungsfrist gelten für alle unsere Lösungen.{' '}
                <span className="text-[#4F8EF7] cursor-pointer hover:underline" onClick={handleScroll}>
                  Vertragsbedingungen prüfen
                </span>
              </>
            ) : (
              <>
                Transparent process, flexible SLA, and 30-day notice apply to all our solutions.{' '}
                <span className="text-[#4F8EF7] cursor-pointer hover:underline" onClick={handleScroll}>
                  Review contract terms
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

