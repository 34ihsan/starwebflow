'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { ArrowRight, Sparkles, ChevronDown, TrendingUp, Shield, Zap, Users } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ── Metrics Ticker Data ──────────────────────────────────────────────────
const TICKER_METRICS = [
  { icon: TrendingUp, value: '+312%', label: { tr: 'Ortalama ROI Artışı', en: 'Avg. ROI Increase', de: 'Ø ROI-Steigerung' }, color: '#10B981' },
  { icon: Zap,         value: '0.8s',  label: { tr: 'LCP Garanti',        en: 'LCP Guarantee',    de: 'LCP Garantie'    }, color: '#4F8EF7' },
  { icon: Users,       value: '50+',   label: { tr: 'Mutlu Müşteri',      en: 'Happy Clients',    de: 'Kunden'          }, color: '#8B5CF6' },
  { icon: Shield,      value: 'A+',    label: { tr: 'Güvenlik Skoru',     en: 'Security Score',   de: 'Sicherheitswert' }, color: '#06B6D4' },
  { icon: TrendingUp,  value: '4.9★',  label: { tr: 'Müşteri Puanı',     en: 'Client Rating',    de: 'Kundenbewertung' }, color: '#F59E0B' },
  { icon: Zap,         value: '100%',  label: { tr: 'GDPR Uyumlu',       en: 'GDPR Compliant',   de: 'DSGVO Konform'   }, color: '#10B981' },
]

export default function HeroSection() {
  const { t, language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const lang = language as 'tr' | 'en' | 'de'

  useEffect(() => {
    setMounted(true)
    // Cursor glow follow effect
    const glow = document.getElementById('cursor-glow')
    if (!glow) return
    const handleMouseMove = (e: MouseEvent) => {
      glow.style.left = `${e.clientX}px`
      glow.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleScroll = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-speakable="true"
    >
      {/* ── Aurora + Grid Background ──────────────────────────────────── */}
      <div className="absolute inset-0 bg-white dark:bg-[#0A0A0F] transition-colors duration-200" />
      <div className="aurora-bg absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="grid-pattern absolute inset-0 pointer-events-none opacity-40" aria-hidden="true" />

      {/* Cursor glow */}
      <div id="cursor-glow" className="cursor-glow" style={{ left: '50%', top: '50%' }} />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[#4F8EF7]/6 blur-[120px] animate-[orbPulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/6 blur-[100px] animate-[orbPulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#06B6D4]/3 blur-[150px]" />
        {/* Floating particles */}
        {mounted && [...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#4F8EF7', '#8B5CF6', '#06B6D4', '#10B981'][Math.floor(Math.random() * 4)] + '40',
              animationDuration: `${Math.random() * 10 + 8}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full min-w-0">

          {/* Left — Text */}
          <div className="text-center lg:text-left min-w-0 w-full" style={{ animation: 'fadeInLeft 0.8s ease both' }}>

            {/* Badge */}
            <div className="inline-flex items-center mb-6">
              <span className="tag-badge">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                {t('hero.badge')}
              </span>
            </div>

            {/* H1 — SEO optimized */}
            <h1 className="heading-xl text-slate-900 dark:text-white mb-5 sm:mb-6 break-words" data-speakable="true">
              {t('hero.title')}{' '}
              <span className="block gradient-text mt-1">{t('hero.titleHighlight')}</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-[#94A3B8] mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('hero.desc')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleScroll('#contact')}
                className="group relative overflow-hidden w-full sm:w-auto font-bold"
                id="hero-cta-primary"
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <Sparkles className="w-5 h-5 relative z-10" aria-hidden="true" />
                <span className="relative z-10">{t('hero.ctaPrimary')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" aria-hidden="true" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleScroll('#services')}
                id="hero-cta-secondary"
                className="group w-full sm:w-auto font-bold"
              >
                <span>{t('hero.ctaSecondary')}</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6 justify-center lg:justify-start">
              {/* Avatars */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    { bg: 'linear-gradient(135deg,#4F8EF7,#06B6D4)', label: 'AK' },
                    { bg: 'linear-gradient(135deg,#8B5CF6,#EC4899)', label: 'MD' },
                    { bg: 'linear-gradient(135deg,#10B981,#06B6D4)', label: 'ZA' },
                    { bg: 'linear-gradient(135deg,#F59E0B,#EF4444)', label: 'EY' },
                  ].map(({ bg, label }, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                      style={{ background: bg }}
                      aria-hidden="true"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">50+</p>
                  <p className="text-xs text-slate-600 font-medium">
                    {lang === 'tr' ? 'mutlu müşteri' : lang === 'de' ? 'Kunden' : 'happy clients'}
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              {/* Stars */}
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">4.9</p>
                  <p className="text-xs text-slate-600 font-medium">
                    {lang === 'tr' ? 'puan (38 yorum)' : lang === 'de' ? 'Sterne (38)' : 'rating (38)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Neural Orb Visual */}
          <div
            className="flex items-center justify-center min-w-0 w-full max-w-full overflow-hidden sm:overflow-visible py-4"
            style={{ animation: 'fadeInRight 0.8s ease both 0.2s', animationFillMode: 'both' }}
          >
            <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px] max-w-full">
              {/* Outer rings */}
              <div className="orb-ring absolute inset-0 border-[#4F8EF7]/20" style={{ animationDuration: '20s' }} />
              <div className="orb-ring orb-ring-reverse absolute inset-3 sm:inset-4 border-[#8B5CF6]/15" style={{ animationDuration: '15s' }} />
              <div className="orb-ring absolute inset-6 sm:inset-8 border-[#06B6D4]/10" style={{ animationDuration: '25s' }} />

              {/* Dashed orbit */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-[#4F8EF7]/10"
                style={{ animation: 'orbRotate 30s linear infinite' }}
              />

              {/* Orbit dots */}
              <div className="absolute inset-0" style={{ animation: 'orbRotate 8s linear infinite' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4F8EF7] shadow-[0_0_15px_rgba(79,142,247,0.9)]" />
              </div>
              <div className="absolute inset-0" style={{ animation: 'orbRotateReverse 12s linear infinite' }}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.9)]" />
              </div>
              <div className="absolute inset-8" style={{ animation: 'orbRotate 6s linear infinite' }}>
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
              </div>
              <div className="absolute inset-12" style={{ animation: 'orbRotateReverse 9s linear infinite' }}>
                <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              </div>

              {/* Core orb */}
              <div
                className="absolute inset-12 sm:inset-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(79,142,247,0.7) 0%, rgba(139,92,246,0.5) 40%, rgba(6,182,212,0.2) 70%, transparent 100%)',
                  boxShadow: '0 0 80px rgba(79,142,247,0.35), 0 0 160px rgba(79,142,247,0.12), inset 0 0 50px rgba(255,255,255,0.06)',
                  animation: 'orbPulse 4s ease-in-out infinite',
                }}
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(79,142,247,0.4) 50%, transparent 100%)',
                    animation: 'orbPulse 4s ease-in-out infinite 1s',
                  }}
                />
              </div>

              {/* Floating Tech Badges - Positioned within bounds for mobile */}
              <TechBadge label="AI Agent" icon="🤖" color="#8B5CF6" style={{ top: '4%', right: '2%', animation: 'float 7s ease-in-out infinite' }} />
              <TechBadge label="Next.js" icon="▲" color="#4F8EF7" style={{ bottom: '6%', left: '4%', animation: 'float 5s ease-in-out infinite 1s' }} />
              <TechBadge label="OpenAI" icon="⚡" color="#10B981" style={{ top: '38%', left: '2%', animation: 'float 6s ease-in-out infinite 0.5s' }} />
              <TechBadge label="n8n" icon="🔄" color="#F59E0B" style={{ top: '8%', left: '18%', animation: 'float 8s ease-in-out infinite 2s' }} />
            </div>
          </div>
        </div>

        {/* ── Metrics Ticker ─────────────────────────────────────────── */}
        <div className="mt-16 sm:mt-20 relative w-full overflow-hidden max-w-full" aria-label="Key performance metrics">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 w-12 sm:w-20 h-full bg-gradient-to-r from-white dark:from-[#0A0A0F] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 w-12 sm:w-20 h-full bg-gradient-to-l from-white dark:from-[#0A0A0F] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden w-full">
            <div className="metrics-ticker flex gap-4 sm:gap-8 w-max">
              {[...TICKER_METRICS, ...TICKER_METRICS].map((metric, i) => {
                const Icon = metric.icon
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-6 py-3 glass rounded-xl border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-300 group shrink-0 shadow-sm"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${metric.color}15`, border: `1px solid ${metric.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: metric.color }} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white font-['Outfit']" style={{ color: metric.color }}>
                        {metric.value}
                      </p>
                      <p className="text-[10px] text-[#64748B] font-medium whitespace-nowrap">
                        {metric.label[lang] || metric.label.tr}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#475569]">
          <span className="text-xs font-medium tracking-widest uppercase">
            {lang === 'tr' ? 'Keşfet' : lang === 'de' ? 'Entdecken' : 'Explore'}
          </span>
          <div
            className="w-5 h-8 rounded-full border border-[#475569]/50 flex items-start justify-center pt-1.5 cursor-pointer hover:border-[#4F8EF7]/50 transition-colors"
            onClick={() => handleScroll('#trust')}
            role="button"
            aria-label="Scroll down"
            tabIndex={0}
          >
            <div className="w-1 h-2 bg-[#4F8EF7] rounded-full" style={{ animation: 'float 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Tech Badge Component ─────────────────────────────────────────────────
function TechBadge({
  label, icon, color, style,
}: {
  label: string; icon: string; color: string; style: React.CSSProperties
}) {
  return (
    <div
      className="absolute bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-200/90 shadow-md backdrop-blur-md"
      style={{
        ...style,
        borderColor: `${color}40`,
        boxShadow: `0 8px 24px -4px ${color}20, 0 2px 8px rgba(0,0,0,0.06)`,
      }}
    >
      <span className="text-sm" aria-hidden="true">{icon}</span>
      <span className="text-xs font-bold text-slate-800 whitespace-nowrap">{label}</span>
      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
    </div>
  )
}
