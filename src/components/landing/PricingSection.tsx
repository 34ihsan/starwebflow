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
      priceText: language === 'tr' ? 'Maaş ve SGK Yükü Olmadan' : language === 'de' ? 'Ohne Personalnebenkosten' : 'No Payroll & Taxes',
      priceSubText: language === 'tr' ? 'Yarım çalışan maliyetinin altına tam dijital varlık' : language === 'de' ? 'Digitale Präsenz für weniger als einen halben Mitarbeiter' : 'Full digital presence for less than half a headcount',
      description: language === 'tr'
        ? 'Riski minimize ederek dijital varlığını güçlendirmek ve 7/24 satış odaklı bir altyapı kurmak isteyen işletmeler için.'
        : language === 'de'
        ? 'Für Unternehmen, die ihr Risiko minimieren, ihre digitale Präsenz stärken und eine 24/7-Vertriebsinfrastruktur aufbauen möchten.'
        : 'For businesses looking to minimize risk, strengthen their digital presence, and build a 24/7 sales infrastructure.',
      badge: null,
      features: language === 'tr'
        ? [
            '1 AI Agent (7/24 Müşteri Destek & Lead Toplama)',
            'Next.js Kurumsal Web Sitesi (5 Sayfa + Landing Page)',
            'Google İşletme Profili (GMB) & Temel SEO',
            'Google Ads Yönetimi (Kurulum & Optimizasyon)',
            'Temel CRM Kurulumu ve Lead Havuzu',
            'Aylık Kapsamlı Performans & ROI Raporu',
            '48 Saat SLA E-posta Destek & Ayda 1 Revizyon',
          ]
        : language === 'de'
        ? [
            '1 KI-Agent (24/7 Support & Lead-Erfassung)',
            'Next.js Unternehmenswebsite (5 Seiten + Landingpage)',
            'Google Unternehmensprofil & Basis-SEO-Setup',
            'Google Ads Management (Setup & Optimierung)',
            'Basis-CRM-Setup & Lead-Pool-Erstellung',
            'Monatlicher umfassender Leistungs- & ROI-Bericht',
            '48h E-Mail-Support SLA & 1 Revision/Monat',
          ]
        : [
            '1 AI Agent (24/7 Support & Lead Capture)',
            'Next.js Corporate Website (5 Pages + Landing Page)',
            'Google Business Profile & Core SEO Setup',
            'Google Ads Management (Setup & Optimization)',
            'Core CRM Setup & Lead Pool Creation',
            'Monthly Comprehensive Performance & ROI Report',
            '48-Hour Email Support SLA & 1 Revision/Month',
          ],
      cta: language === 'tr' ? 'Bilgi Al & Başla' : language === 'de' ? 'Infos holen & Starten' : 'Get Info & Start',
      ctaVariant: 'secondary' as const,
    },
    {
      id: 'growth',
      name: t('pricing.growth.title'),
      icon: Sparkles,
      color: '#4F8EF7',
      priceText: language === 'tr' ? 'Tek Personel Bütçesiyle' : language === 'de' ? 'Budget eines Mitarbeiters' : 'Single Employee Budget',
      priceSubText: language === 'tr' ? '3 Yapay Zeka Ajanı + Tam Kapsamlı Growth Ekibi' : language === 'de' ? '3 KI-Agenten + Vollwertiges Growth-Team' : '3 AI Agents + Full-Scale Growth Team',
      description: language === 'tr'
        ? 'Operasyonel süreçleri 10x hızlandırmak, müşteri deneyimini otomatize etmek ve sektörde agresif büyümek isteyenler için.'
        : language === 'de'
        ? 'Für alle, die operative Prozesse 10x beschleunigen, das Kundenerlebnis automatisieren und aggressiv wachsen wollen.'
        : 'For those aiming to accelerate operations 10x, automate customer experience, and achieve aggressive growth.',
      badge: language === 'tr' ? '⭐ En Popüler' : language === 'de' ? '⭐ Am beliebtesten' : '⭐ Most Popular',
      features: language === 'tr'
        ? [
            '3 Özel AI Agent (7/24 Satış, Destek, Randevu)',
            'Dinamik Web Uygulaması ve Müşteri Paneli',
            'Otomatize Edilmiş Sosyal Medya İçerik Pipeline\'ı',
            'Meta + Google Ads İleri Seviye Pazarlama',
            'Gelişmiş CRM Entegrasyonu (HubSpot/Pipedrive vb.)',
            'A/B Testleri & CRO (Dönüşüm Optimizasyonu)',
            'Haftalık Strateji & Canlı Analitik Dashboard',
            '7/24 Öncelikli Teknik Destek & Ayda 5 Revizyon',
          ]
        : language === 'de'
        ? [
            '3 KI-Agenten (24/7 Vertrieb, Support, Terminierung)',
            'Dynamische Webanwendung & Kundenportal',
            'Automatisierte Social Media Content-Pipeline',
            'Meta + Google Ads Advanced Performance Marketing',
            'Erweiterte CRM-Integration (HubSpot/Pipedrive)',
            'A/B-Testing & Conversion-Rate-Optimierung (CRO)',
            'Wöchentliche Strategie & Live-Analytics-Dashboard',
            '24/7 Priority-Technik-Support & 5 Revisionen/Monat',
          ]
        : [
            '3 Custom AI Agents (24/7 Sales, Support, Booking)',
            'Dynamic Web Application & Client Portal',
            'Automated Social Media Content Pipeline',
            'Meta + Google Ads Advanced Performance Marketing',
            'Advanced CRM Integration (HubSpot/Pipedrive)',
            'A/B Testing & Conversion Rate Optimization (CRO)',
            'Weekly Strategy Calls & Live Analytics Dashboard',
            '24/7 Priority Technical Support & 5 Revisions/Month',
          ],
      cta: language === 'tr' ? 'Verimlilik Analizi İste' : language === 'de' ? 'Effizienzanalyse anfordern' : 'Request Efficiency Analysis',
      ctaVariant: 'primary' as const,
    },
    {
      id: 'enterprise',
      name: t('pricing.enterprise.title'),
      icon: Building2,
      color: '#8B5CF6',
      priceText: language === 'tr' ? 'Ölçeklenebilir Kurumsal ROI' : language === 'de' ? 'Skalierbarer Enterprise-ROI' : 'Scalable Enterprise ROI',
      priceSubText: language === 'tr' ? 'Yatırımınızın 10x katını hedefleyen performans bazlı yapı' : language === 'de' ? 'Leistungsorientierte Struktur mit Fokus auf 10x Rendite' : 'Performance-driven structure targeting 10x returns',
      description: language === 'tr'
        ? 'Tam özelleştirilmiş çözümler, benzersiz yazılım mimarisi ve kurumsal düzeyde güvenlik gereksinimleri olan vizyoner markalar için.'
        : language === 'de'
        ? 'Für visionäre Marken mit maßgeschneiderten Lösungen, einzigartiger Softwarearchitektur und höchsten Sicherheitsanforderungen.'
        : 'For visionary brands requiring customized solutions, unique software architecture, and enterprise-grade security.',
      badge: null,
      features: language === 'tr'
        ? [
            'Sınırsız AI Ajan Ekosistemi (Özel Eğitilmiş LLM)',
            'Tam Özelleştirilmiş Mimari ile Yazılım Geliştirme',
            'Uçtan Uca Full-Stack Operasyonel Otomasyon',
            'White-Label (Kendi Markanızla) Hizmet İmkanı',
            'ERP, SAP ve Özel Sistemlerle %100 Entegrasyon',
            'Dedicated Account Manager & Başarı Yöneticisi',
            'ISO 27001 Uyumlu, On-Premise/Private Cloud',
            '%99.9 Uptime Garantisi ve <1 Saat Yanıt SLA\'i',
          ]
        : language === 'de'
        ? [
            'Unbegrenztes KI-Ökosystem (Individuelle LLMs)',
            'Einzigartige Softwareentwicklung & Architektur',
            'End-to-End Full-Stack Betriebsautomatisierung',
            'White-Label-Optionen für Ihre eigene Marke',
            '100%ige Integration mit ERP, SAP & Legacy-Systemen',
            'Dedizierter Account- & Success-Manager',
            'ISO 27001-konform, On-Premise / Private Cloud',
            '99,9% Uptime-Garantie & Reaktionszeit < 1 Stunde',
          ]
        : [
            'Unlimited AI Ecosystem (Custom Trained LLMs)',
            'Unique Software Development & Architecture',
            'End-to-End Full-Stack Operational Automation',
            'White-Label Capability for Your Own Brand',
            '100% Integration with ERP, SAP & Legacy Systems',
            'Dedicated Account & Success Manager',
            'ISO 27001 Compliant, On-Premise/Private Cloud',
            '99.9% Uptime Guarantee & Sub-1-Hour Response SLA',
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
    <section id="pricing" className="section relative overflow-hidden bg-[#FAFBFD]">
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="tag-badge mb-4">
            {language === 'tr' ? 'Fiyatlandırma' : language === 'de' ? 'Preise' : 'Pricing'}
          </span>
          <h2 className="heading-lg text-slate-900 mt-4 mb-4">
            {language === 'tr' ? (
              <><span className="text-slate-900 font-extrabold">AI Agent Hizmet</span> <span className="text-blue-600 font-extrabold">Paketleri</span></>
            ) : language === 'de' ? (
              <><span className="text-slate-900 font-extrabold">KI-Agenten Service-</span><span className="text-blue-600 font-extrabold">Pakete</span></>
            ) : (
              <><span className="text-slate-900 font-extrabold">AI Agent Service </span><span className="text-blue-600 font-extrabold">Packages</span></>
            )}
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto mb-8 font-normal">
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
                className={`relative rounded-2xl border transition-all duration-700 hover:-translate-y-1.5 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${
                  isPopular
                    ? 'border-blue-500 bg-white shadow-[0_12px_40px_-8px_rgba(37,99,235,0.18)] ring-2 ring-blue-500/20'
                    : 'border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05),0_8px_24px_-6px_rgba(0,0,0,0.03)] hover:shadow-lg'
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 lg:p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Icon & Name */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                        style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}35` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg font-['Outfit']">{plan.name}</h3>
                      </div>
                    </div>

                    {/* Price text (Curiosity / ROI based) */}
                    <div className="mb-6">
                      <div className="text-xl font-bold font-['Outfit'] text-slate-900 leading-snug">
                        {plan.priceText}
                      </div>
                      <p className="text-xs text-emerald-700 mt-1.5 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {plan.priceSubText}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed font-normal">
                      {plan.description}
                    </p>
                  </div>

                  <div>
                    {/* CTA */}
                    <Button
                      variant={plan.ctaVariant}
                      size="md"
                      className="w-full mb-6 font-bold shadow-xs"
                      onClick={handleScroll}
                      id={`pricing-cta-${plan.id}`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    {/* Divider */}
                    <div className="h-px bg-slate-200/80 mb-6" />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
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
          <p className="text-slate-600 text-sm font-medium">
            {language === 'tr' ? (
              <>
                Tüm çözümlerimizde şeffaf süreç, esnek SLA ve 30 gün önceden bildirim esası uygulanır.{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={handleScroll}>
                  Sözleşme şartlarını incele
                </span>
              </>
            ) : language === 'de' ? (
              <>
                Transparenter Prozess, flexible SLA und 30 Tage Kündigungsfrist gelten für alle unsere Lösungen.{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={handleScroll}>
                  Vertragsbedingungen prüfen
                </span>
              </>
            ) : (
              <>
                Transparent process, flexible SLA, and 30-day notice apply to all our solutions.{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={handleScroll}>
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

