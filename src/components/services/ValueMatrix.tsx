'use client'

import { useRef, useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, Clock, Euro } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ValueRow {
  metric: string
  before: string
  after: string
  delta: string
  deltaPositive: boolean
}

interface ValueMatrixProps {
  title?: string
  rows: ValueRow[]
  accentColor: string
}

export default function ValueMatrix({
  title,
  rows,
  accentColor,
}: ValueMatrixProps) {
  const { language } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const headers = {
    tr: { metric: 'Metrik', before: 'Öncesi', after: 'Sonrası', delta: 'Fark', defaultTitle: 'Değer Matrisi' },
    en: { metric: 'Metric', before: 'Before', after: 'After', delta: 'Diff', defaultTitle: 'Value Matrix' },
    de: { metric: 'Metrik', before: 'Vorher', after: 'Nachher', delta: 'Fark', defaultTitle: 'Wertmatrix' }
  }
  const h = headers[language] || headers.tr
  const displayTitle = title || h.defaultTitle

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {displayTitle && (
        <h3 className="heading-md text-white mb-6 text-center">{displayTitle}</h3>
      )}

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        {/* Table header */}
        <div
          className="grid grid-cols-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748B]"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div>{h.metric}</div>
          <div className="text-center">{h.before}</div>
          <div className="text-center">{h.after}</div>
          <div className="text-center">{h.delta}</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-4 px-6 py-4 border-t border-white/[0.04] items-center"
            style={{
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <div className="text-sm text-[#94A3B8] font-medium">{row.metric}</div>
            <div className="text-center text-sm text-[#64748B] line-through">{row.before}</div>
            <div className="text-center text-sm text-white font-semibold">{row.after}</div>
            <div className="text-center">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  color: row.deltaPositive ? '#10B981' : '#EF4444',
                  background: row.deltaPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                }}
              >
                {row.deltaPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {row.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
