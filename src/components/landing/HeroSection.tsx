'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function HeroSection() {
  const { t, language } = useLanguage()
  const particleRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg grid-pattern"
    >
      {/* Cursor glow */}
      <div
        id="cursor-glow"
        className="cursor-glow"
        style={{ left: '50%', top: '50%' }}
      />

      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {mounted && [...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle bg-[#4F8EF7]/20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 8 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        {/* Large ambient blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#4F8EF7]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#8B5CF6]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#06B6D4]/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="text-center lg:text-left" style={{ animation: 'fadeInLeft 0.8s ease both' }}>
            {/* Badge */}
            <div className="inline-flex items-center mb-6">
              <span className="tag-badge">
                <Sparkles className="w-3 h-3" />
                {t('hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="heading-xl text-white mb-6">
              {t('hero.title')}{' '}
              <span className="block gradient-text">{t('hero.titleHighlight')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#94A3B8] mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.desc')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleScroll('#contact')}
                className="group"
                id="hero-cta-primary"
              >
                <Sparkles className="w-5 h-5" />
                {t('hero.ctaPrimary')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleScroll('#services')}
                id="hero-cta-secondary"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['#4F8EF7', '#8B5CF6', '#06B6D4', '#10B981'].map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: color }}
                    >
                      {['A', 'B', 'C', 'D'][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[#94A3B8]">
                  <span className="text-white font-semibold">50+</span>{' '}
                  {language === 'tr' ? 'mutlu müşteri' : language === 'de' ? 'zufriedene Kunden' : 'happy clients'}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-[#94A3B8]">
                  5.0 {language === 'tr' ? 'puan' : language === 'de' ? 'Sterne' : 'rating'}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Neural Orb */}
          <div className="flex items-center justify-center" style={{ animation: 'fadeInRight 0.8s ease both 0.2s', animationFillMode: 'both' }}>
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              {/* Outer rings */}
              <div
                className="orb-ring absolute inset-0 border-[#4F8EF7]/20"
                style={{ animationDuration: '20s' }}
              />
              <div
                className="orb-ring orb-ring-reverse absolute inset-4 border-[#8B5CF6]/15"
                style={{ animationDuration: '15s' }}
              />
              <div
                className="orb-ring absolute inset-8 border-[#06B6D4]/10"
                style={{ animationDuration: '25s' }}
              />

              {/* Rotating dashed orbit */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-[#4F8EF7]/10"
                style={{ animation: 'orbRotate 30s linear infinite' }}
              />

              {/* Orbit dots */}
              <div
                className="absolute inset-0"
                style={{ animation: 'orbRotate 8s linear infinite' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4F8EF7] shadow-[0_0_12px_rgba(79,142,247,0.8)]" />
              </div>
              <div
                className="absolute inset-0"
                style={{ animation: 'orbRotateReverse 12s linear infinite' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              </div>
              <div
                className="absolute inset-8"
                style={{ animation: 'orbRotate 6s linear infinite' }}
              >
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#06B6D4] shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              </div>

              {/* Core orb */}
              <div
                className="absolute inset-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(79,142,247,0.6) 0%, rgba(139,92,246,0.4) 40%, rgba(6,182,212,0.2) 70%, transparent 100%)',
                  boxShadow: '0 0 60px rgba(79,142,247,0.3), 0 0 120px rgba(79,142,247,0.1), inset 0 0 40px rgba(255,255,255,0.05)',
                  animation: 'orbPulse 4s ease-in-out infinite',
                }}
              >
                {/* Inner glow */}
                <div
                  className="w-20 h-20 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(79,142,247,0.3) 50%, transparent 100%)',
                    animation: 'orbPulse 4s ease-in-out infinite 1s',
                  }}
                />
              </div>

              {/* Floating tech badges */}
              <TechBadge label="AI Agent" icon="🤖" style={{ top: '5%', right: '0%', animation: 'float 7s ease-in-out infinite' }} />
              <TechBadge label="Next.js" icon="▲" style={{ bottom: '8%', left: '2%', animation: 'float 5s ease-in-out infinite 1s' }} />
              <TechBadge label="OpenAI" icon="⚡" style={{ top: '40%', left: '-5%', animation: 'float 6s ease-in-out infinite 0.5s' }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#475569]">
          <span className="text-xs font-medium tracking-widest uppercase">
            {language === 'tr' ? 'Keşfet' : language === 'de' ? 'Entdecken' : 'Explore'}
          </span>
          <div
            className="w-5 h-8 rounded-full border border-[#475569]/50 flex items-start justify-center pt-1.5 cursor-pointer hover:border-[#4F8EF7]/50 transition-colors"
            onClick={() => handleScroll('#trust-bar')}
          >
            <div
              className="w-1 h-2 bg-[#4F8EF7] rounded-full"
              style={{ animation: 'float 1.5s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function TechBadge({
  label,
  icon,
  style,
}: {
  label: string
  icon: string
  style: React.CSSProperties
}) {
  return (
    <div
      className="absolute glass rounded-xl px-3 py-2 flex items-center gap-2 border border-white/10 shadow-lg"
      style={style}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-semibold text-white/90 whitespace-nowrap">{label}</span>
    </div>
  )
}
