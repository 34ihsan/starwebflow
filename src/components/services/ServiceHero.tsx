import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight, Sparkles, ChevronDown, Shield, Clock, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export interface ServiceHeroProps {
  badge: string
  headline: string
  headlineGradient: string
  subheadline: string
  painStatement: string
  accentColor: string
  gradientFrom: string
  gradientTo: string
  stats: Array<{ value: string; label: string; icon: React.ElementType }>
  floatingBadges: Array<{ label: string; icon: string; style: React.CSSProperties }>
  ctaPrimary?: string
  ctaSecondary?: string
  simulationId?: string
}

export default function ServiceHero({
  badge,
  headline,
  headlineGradient,
  subheadline,
  painStatement,
  accentColor,
  gradientFrom,
  gradientTo,
  stats,
  floatingBadges,
  ctaPrimary = 'Ücretsiz Analiz Al',
  ctaSecondary = 'Simülasyonu Dene',
  simulationId = 'simulation',
}: ServiceHeroProps) {
  const { language } = useLanguage()
  const [cursorPos, setCursorPos] = useState({ x: -400, y: -400 })
  const [visible, setVisible] = useState(false)

  const content = {
    tr: {
      ctaPrimary: 'Ücretsiz Analiz Al',
      ctaSecondary: 'Simülasyonu Dene',
      guarantee: '30 gün memnuniyet garantisi · Ücretsiz strateji görüşmesi',
      explore: 'Keşfet'
    },
    en: {
      ctaPrimary: 'Get Free Analysis',
      ctaSecondary: 'Try Simulation',
      guarantee: '30-day satisfaction guarantee · Free strategy consultation',
      explore: 'Explore'
    },
    de: {
      ctaPrimary: 'Kostenlose Analyse',
      ctaSecondary: 'Simulation testen',
      guarantee: '30 Tage Zufriedenheitsgarantie · Kostenlose Strategieberatung',
      explore: 'Entdecken'
    }
  }
  const c = content[language] || content.tr

  const displayCtaPrimary = ctaPrimary === 'Ücretsiz Analiz Al' ? c.ctaPrimary : ctaPrimary
  const displayCtaSecondary = ctaSecondary === 'Simülasyonu Dene' ? c.ctaSecondary : ctaSecondary

  useEffect(() => {
    setVisible(true)
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToSimulation = () => {
    const el = document.getElementById(simulationId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToContact = () => {
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else window.location.href = '/#contact'
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg grid-pattern pt-20">
      {/* Cursor glow */}
      <div
        className="cursor-glow"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: gradientFrom }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-3xl opacity-8"
          style={{ background: gradientTo }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-5"
          style={{ background: `radial-gradient(circle, ${gradientFrom}, transparent)` }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Content */}
          <div
            className={`text-center lg:text-left transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border"
                style={{
                  background: `${accentColor}15`,
                  borderColor: `${accentColor}30`,
                  color: accentColor,
                }}
              >
                <Sparkles className="w-3 h-3" />
                {badge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="heading-xl text-white mb-4">
              {headline}{' '}
              <span
                className="block"
                style={{
                  background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {headlineGradient}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#94A3B8] mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subheadline}
            </p>

            {/* Pain statement — psychological hook */}
            <div
              className="mb-8 p-4 rounded-xl border-l-2 text-sm text-[#94A3B8] italic"
              style={{
                borderColor: accentColor,
                background: `${accentColor}08`,
              }}
            >
              {painStatement}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToContact}
                className="group"
                style={{
                  background: accentColor,
                  borderColor: accentColor,
                }}
              >
                <Sparkles className="w-5 h-5" />
                {displayCtaPrimary}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={scrollToSimulation}
              >
                {displayCtaSecondary}
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={i}
                    className="text-center lg:text-left p-3 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span className="text-xs text-[#64748B] uppercase tracking-wide">{stat.label}</span>
                    </div>
                    <div className="text-xl font-bold text-white font-['Outfit']">{stat.value}</div>
                  </div>
                )
              })}
            </div>

            {/* Guarantee micro-badge */}
            <div className="mt-6 flex items-center gap-2 justify-center lg:justify-start text-xs text-[#64748B]">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              {c.guarantee}
            </div>
          </div>

          {/* Right — Neural Orb */}
          <div
            className={`flex items-center justify-center transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              {/* Orb rings */}
              <div
                className="orb-ring absolute inset-0"
                style={{
                  borderColor: `${accentColor}20`,
                  animationDuration: '20s',
                }}
              />
              <div
                className="orb-ring orb-ring-reverse absolute inset-4"
                style={{
                  borderColor: `${gradientTo}15`,
                  animationDuration: '15s',
                }}
              />
              <div
                className="orb-ring absolute inset-8"
                style={{
                  borderColor: `${accentColor}10`,
                  animationDuration: '25s',
                }}
              />

              {/* Orbit dot */}
              <div
                className="absolute inset-0"
                style={{ animation: 'orbRotate 8s linear infinite' }}
              >
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}` }}
                />
              </div>
              <div
                className="absolute inset-0"
                style={{ animation: 'orbRotateReverse 12s linear infinite' }}
              >
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: gradientTo, boxShadow: `0 0 10px ${gradientTo}` }}
                />
              </div>

              {/* Core orb */}
              <div
                className="absolute inset-16 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${accentColor}60 0%, ${gradientTo}40 40%, ${accentColor}20 70%, transparent 100%)`,
                  boxShadow: `0 0 60px ${accentColor}30, 0 0 120px ${accentColor}10, inset 0 0 40px rgba(255,255,255,0.05)`,
                  animation: 'orbPulse 4s ease-in-out infinite',
                }}
              >
                <div
                  className="w-20 h-20 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, ${accentColor}30 50%, transparent 100%)`,
                    animation: 'orbPulse 4s ease-in-out infinite 1s',
                  }}
                />
              </div>

              {/* Floating tech badges */}
              {floatingBadges.map((badge, i) => (
                <div
                  key={i}
                  className="absolute glass rounded-xl px-3 py-2 flex items-center gap-2 border border-white/10 shadow-lg"
                  style={badge.style}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span className="text-xs font-semibold text-white/90 whitespace-nowrap">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#475569] cursor-pointer"
          onClick={scrollToSimulation}
        >
          <span className="text-xs font-medium tracking-widest uppercase">{c.explore}</span>
          <div className="w-5 h-8 rounded-full border border-[#475569]/50 flex items-start justify-center pt-1.5 hover:border-opacity-80 transition-colors">
            <div
              className="w-1 h-2 rounded-full"
              style={{ background: accentColor, animation: 'float 1.5s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
