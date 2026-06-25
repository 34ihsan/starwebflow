import { useRef, useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { ArrowRight, Shield, Clock, Star, Zap, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ServiceCTAProps {
  headline?: string
  subheadline?: string
  accentColor: string
  urgencyText?: string
  guaranteeText?: string
  primaryLabel?: string
  secondaryLabel?: string
}

export default function ServiceCTA({
  headline = 'Sistemini Kurmaya Başla',
  subheadline = '30 dakika içinde ücretsiz teknik analiz. Sözleşme yok, zorunluluk yok.',
  accentColor,
  urgencyText = 'Bu ay yalnızca 2 proje kapasitemiz kaldı',
  guaranteeText = '30 gün memnuniyet garantisi — ya çalışır, ya geri öderiz.',
  primaryLabel = 'Ücretsiz Strateji Görüşmesi',
  secondaryLabel = 'Lastenheft Oluştur',
}: ServiceCTAProps) {
  const { language } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const content = {
    tr: {
      headline: 'Sistemini Kurmaya Başla',
      subheadline: '30 dakika içinde ücretsiz teknik analiz. Sözleşme yok, zorunluluk yok.',
      urgencyText: 'Bu ay yalnızca 2 proje kapasitemiz kaldı',
      guaranteeText: '30 gün memnuniyet garantisi — ya çalışır, ya geri öderiz.',
      primaryLabel: 'Ücretsiz Strateji Görüşmesi',
      secondaryLabel: 'Lastenheft Oluştur',
      firstResponse: 'İlk yanıt 2 saat içinde',
      stats: '5.0 puan · 50+ proje'
    },
    en: {
      headline: 'Start Building Your System',
      subheadline: 'Free technical analysis within 30 minutes. No contract, no obligation.',
      urgencyText: 'Only 2 project capacities left this month',
      guaranteeText: '30-day satisfaction guarantee — it works, or we refund.',
      primaryLabel: 'Free Strategy Call',
      secondaryLabel: 'Generate Lastenheft',
      firstResponse: 'First response in 2 hours',
      stats: '5.0 rating · 50+ projects'
    },
    de: {
      headline: 'Beginnen Sie mit dem Bau Ihres Systems',
      subheadline: 'Kostenlose technische Analyse innerhalb von 30 Minuten. Kein Vertrag, keine Verpflichtung.',
      urgencyText: 'Nur noch 2 Projektkapazitäten in diesem Monat frei',
      guaranteeText: '30 Tage Zufriedenheitsgarantie — es funktioniert oder Geld zurück.',
      primaryLabel: 'Kostenloses Strategiegespräch',
      secondaryLabel: 'Lastenheft generieren',
      firstResponse: 'Erste Antwort in 2 Stunden',
      stats: '5.0 Bewertung · 50+ Projekte'
    }
  }
  const c = content[language] || content.tr

  const displayHeadline = headline === 'Sistemini Kurmaya Başla' ? c.headline : headline
  const displaySubheadline = subheadline === '30 dakika içinde ücretsiz teknik analiz. Sözleşme yok, zorunluluk yok.' ? c.subheadline : subheadline
  const displayUrgencyText = urgencyText === 'Bu ay yalnızca 2 proje kapasitemiz kaldı' ? c.urgencyText : urgencyText
  const displayGuaranteeText = guaranteeText === '30 gün memnuniyet garantisi — ya çalışır, ya geri öderiz.' ? c.guaranteeText : guaranteeText
  const displayPrimaryLabel = primaryLabel === 'Ücretsiz Strateji Görüşmesi' ? c.primaryLabel : primaryLabel
  const displaySecondaryLabel = secondaryLabel === 'Lastenheft Oluştur' ? c.secondaryLabel : secondaryLabel

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section relative overflow-hidden" id="contact">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${accentColor}08 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Urgency badge — scarcity trigger */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border"
              style={{
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.25)',
                color: '#EF4444',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              {displayUrgencyText}
            </div>
          </div>

          {/* Headline */}
          <h2 className="heading-lg text-white text-center mb-4">
            {displayHeadline}
          </h2>
          <p className="text-[#94A3B8] text-center text-lg mb-10 max-w-2xl mx-auto">
            {displaySubheadline}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/#contact">
              <Button
                variant="primary"
                size="lg"
                className="group w-full sm:w-auto"
                style={{ background: accentColor, borderColor: accentColor }}
              >
                <Calendar className="w-5 h-5" />
                {displayPrimaryLabel}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Zap className="w-5 h-5" />
                {displaySecondaryLabel}
              </Button>
            </Link>
          </div>

          {/* Trust signals row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, text: displayGuaranteeText, color: '#10B981' },
              { icon: Clock, text: c.firstResponse, color: accentColor },
              { icon: Star, text: c.stats, color: '#F59E0B' },
            ].map(({ icon: Icon, text, color }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs text-[#94A3B8] leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
