'use client'

import { useRef, useEffect, useState } from 'react'
import { TrendingUp, Shield, Zap, Users } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function StatCounter({ value, suffix, label, icon: Icon, color, isVisible }: {
  value: number; suffix: string; label: string; icon: React.ElementType; color: string; isVisible: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    let start: number | null = null
    const duration = 2200

    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isVisible, value])

  return (
    <div className="flex flex-col items-center text-center p-6 group">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div
        className="text-4xl font-black font-['Outfit'] mb-1 transition-all duration-300"
        style={{ color }}
      >
        {isVisible ? count : 0}{suffix}
      </div>
      <p className="text-sm text-[#94A3B8] font-medium leading-tight max-w-24">{label}</p>
    </div>
  )
}

export default function WhyUsSection() {
  const { t, language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const stats = [
    { value: 40, suffix: '%', label: t('whyUsExtra.stat1'), icon: TrendingUp, color: '#10B981' },
    { value: 3,  suffix: 'x',  label: t('whyUsExtra.stat2'), icon: Users,       color: '#4F8EF7' },
    { value: 48, suffix: language === 'tr' ? 'sa' : language === 'de' ? 'Std.' : 'hrs', label: t('whyUsExtra.stat3'), icon: Zap, color: '#8B5CF6' },
    { value: 99, suffix: '%',  label: t('whyUsExtra.stat4'), icon: Shield,      color: '#06B6D4' },
  ]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="why-us" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#4F8EF7]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#8B5CF6]/5 blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <span className="tag-badge mb-4">
              {t('whyUsExtra.tag')}
            </span>
            <h2 className="heading-lg text-white mt-4 mb-6">
              {t('whyUsExtra.heading')}{' '}
              <span className="block sm:inline gradient-text">{t('whyUsExtra.headingHighlight')}</span>
            </h2>

            <blockquote className="relative mb-8">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#4F8EF7] to-[#8B5CF6] rounded-full" />
              <p className="pl-6 text-lg text-[#94A3B8] leading-relaxed italic">
                {language === 'tr' ? (
                  <>
                    "Geleneksel ajanslar size sadece hizmet satar; biz size bir{' '}
                    <span className="text-white font-semibold not-italic">operasyonel güç</span> sunuyoruz. İnsan hatasını minimize eden, yapay zekayı bir çalışan gibi konumlandıran ve{' '}
                    <span className="text-white font-semibold not-italic">veriyi nakde dönüştüren</span> bir ekosistem."
                  </>
                ) : language === 'de' ? (
                  <>
                    "Klassische Agenturen verkaufen Ihnen nur eine Dienstleistung; wir bieten Ihnen eine{' '}
                    <span className="text-white font-semibold not-italic">operative Stärke</span> an. Ein Ökosystem, das menschliche Fehler minimiert, KI wie einen Mitarbeiter positioniert und{' '}
                    <span className="text-white font-semibold not-italic">Daten in Bargeld verwandelt</span>."
                  </>
                ) : (
                  <>
                    "Traditional agencies only sell you a service; we offer you an{' '}
                    <span className="text-white font-semibold not-italic">operational power</span>. An ecosystem that minimizes human error, positions AI like an employee, and{' '}
                    <span className="text-white font-semibold not-italic">turns data into cash</span>."
                  </>
                )}
              </p>
            </blockquote>

            <div className="space-y-4">
              {[
                { title: t('whyUsExtra.f1Title'), desc: t('whyUsExtra.f1Desc') },
                { title: t('whyUsExtra.f2Title'), desc: t('whyUsExtra.f2Desc') },
                { title: t('whyUsExtra.f3Title'), desc: t('whyUsExtra.f3Desc') },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`flex gap-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: `${200 + i * 150}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#4F8EF7]/20 border border-[#4F8EF7]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#4F8EF7]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats */}
          <div
            className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="relative rounded-3xl border border-white/[0.06] bg-[#0F0F1A]/80 backdrop-blur-sm overflow-hidden">
              {/* Top glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/40 to-transparent" />

              <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06]">
                {stats.map((stat, i) => (
                  <StatCounter
                    key={stat.label}
                    {...stat}
                    isVisible={visible}
                  />
                ))}
              </div>

              {/* Bottom label */}
              <div className="px-6 py-4 border-t border-white/[0.06] text-center">
                <p className="text-xs text-[#475569]">
                  {t('whyUsExtra.statFooter')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
