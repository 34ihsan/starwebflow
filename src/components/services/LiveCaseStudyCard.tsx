'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp } from 'lucide-react'
import { CaseStudyData } from './ServiceLayout'

export default function LiveCaseStudyCard({
  company,
  industry,
  metric,
  detail,
  accentColor,
}: CaseStudyData) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const onScroll = () => {
      if (window.scrollY > 600 && !dismissed) {
        setVisible(true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  if (dismissed) return null

  return (
    <div
      className="fixed bottom-6 left-6 z-40 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        pointerEvents: visible ? 'auto' : 'none',
        maxWidth: '300px',
      }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-xl overflow-hidden">
        {/* Dismiss */}
        <button
          onClick={() => { setDismissed(true); setVisible(false) }}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Accent line */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        {/* Pulse indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Canlı Başarı Hikayesi</span>
        </div>

        {/* Company info */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-slate-900 flex-shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}
          >
            {company.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{company}</div>
            <div className="text-xs text-slate-500">{industry}</div>
          </div>
        </div>

        {/* Metric */}
        <div
          className="p-3 rounded-xl mb-2"
          style={{ background: `${accentColor}0c`, border: `1px solid ${accentColor}25` }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
            <span className="text-sm font-bold" style={{ color: accentColor }}>{metric}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{detail}</p>
        </div>

        <div className="text-[10px] text-slate-500 font-medium">3 ay içinde elde edilen sonuç</div>
      </div>
    </div>
  )
}
