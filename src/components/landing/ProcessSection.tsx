'use client'

import { useRef, useEffect, useState } from 'react'
import { FileText, Lightbulb, Code2, Rocket, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ProcessSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const steps = [
    {
      icon: Lightbulb,
      color: '#FBBF24',
      step: t('processSection.steps.s1.step'),
      title: t('processSection.steps.s1.title'),
      description: t('processSection.steps.s1.desc'),
      badge: t('processSection.steps.s1.badge'),
    },
    {
      icon: FileText,
      color: '#4F8EF7',
      step: t('processSection.steps.s2.step'),
      title: t('processSection.steps.s2.title'),
      description: t('processSection.steps.s2.desc'),
      badge: t('processSection.steps.s2.badge'),
    },
    {
      icon: Code2,
      color: '#8B5CF6',
      step: t('processSection.steps.s3.step'),
      title: t('processSection.steps.s3.title'),
      description: t('processSection.steps.s3.desc'),
      badge: t('processSection.steps.s3.badge'),
    },
    {
      icon: CheckCircle2,
      color: '#10B981',
      step: t('processSection.steps.s4.step'),
      title: t('processSection.steps.s4.title'),
      description: t('processSection.steps.s4.desc'),
      badge: t('processSection.steps.s4.badge'),
    },
    {
      icon: Rocket,
      color: '#06B6D4',
      step: t('processSection.steps.s5.step'),
      title: t('processSection.steps.s5.title'),
      description: t('processSection.steps.s5.desc'),
      badge: t('processSection.steps.s5.badge'),
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

  return (
    <section id="process" className="section relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="tag-badge mb-4">
            {t('processSection.tag')}
          </span>
          <h2 className="heading-lg text-slate-900 mt-4 mb-4">
            {t('processSection.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">{t('processSection.titleHighlight')}</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto font-normal">
            {t('processSection.desc1')}{' '}
            <span className="text-slate-900 font-bold">{t('processSection.desc2')}</span>
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none hidden md:block">
            <div className={`w-full transition-all duration-1000 ${visible ? 'h-full' : 'h-0'} timeline-line`} />
          </div>

          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isLeft = i % 2 === 0

              return (
                <div
                  key={step.step}
                  className={`relative flex items-center gap-6 lg:gap-0 transition-all duration-700 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  } ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Content card */}
                  <div className={`flex-1 lg:w-[calc(50%-3rem)] ${isLeft ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05),0_8px_24px_-6px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-400/50 transition-all duration-300 group">
                      {/* Badge */}
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-xs"
                        style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}30` }}
                      >
                        {step.badge}
                      </span>

                      <h3 className="font-bold text-slate-900 text-lg mb-2 font-['Outfit']">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border z-10 relative transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: `${step.color}15`,
                        borderColor: `${step.color}40`,
                        boxShadow: `0 0 20px ${step.color}20`,
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Step number - opposite side */}
                  <div className={`hidden lg:flex flex-1 items-center ${isLeft ? 'justify-start pl-12' : 'justify-end pr-12'}`}>
                    <span
                      className="text-4xl xl:text-6xl font-black font-['Outfit'] opacity-20 select-none tracking-tight whitespace-nowrap"
                      style={{ color: step.color }}
                    >
                      {step.step}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
