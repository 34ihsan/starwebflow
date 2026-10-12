'use client'

import { useRef, useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ComparisonRow {
  feature: string
  traditional: string | boolean
  starwebflow: string | boolean
}

interface ComparisonTableProps {
  rows: ComparisonRow[]
  accentColor: string
}

export default function ComparisonTable({ rows, accentColor }: ComparisonTableProps) {
  const { language } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const content = {
    tr: { traditional: 'Geleneksel Ajans', recommended: '✦ Önerilen' },
    en: { traditional: 'Traditional Agency', recommended: '✦ Recommended' },
    de: { traditional: 'Traditionelle Agentur', recommended: '✦ Empfohlen' }
  }
  const c = content[language] || content.tr

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

  const renderCell = (val: string | boolean, accent?: string) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check className="w-5 h-5 mx-auto" style={{ color: accent || '#10B981' }} />
      ) : (
        <X className="w-5 h-5 mx-auto text-[#EF4444]" />
      )
    }
    return <span className="text-sm">{val}</span>
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-3">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50" />
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-center">
            <span className="text-sm font-bold text-slate-600">{c.traditional}</span>
          </div>
          <div
            className="px-6 py-4 border-b text-center relative"
            style={{
              background: `${accentColor}10`,
              borderColor: `${accentColor}25`,
            }}
          >
            {/* Popular badge */}
            <div
              className="absolute -top-px inset-x-0 h-1"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            />
            <span className="text-sm font-extrabold text-slate-900">StarWebFlow</span>
            <div
              className="text-[11px] mt-0.5 font-bold"
              style={{ color: accentColor }}
            >
              {c.recommended}
            </div>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-3 border-t border-slate-200"
            style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}
          >
            <div className="px-6 py-4 text-sm text-slate-800 font-semibold flex items-center">
              {row.feature}
            </div>
            <div className="px-6 py-4 flex items-center justify-center text-slate-600">
              {renderCell(row.traditional)}
            </div>
            <div
              className="px-6 py-4 flex items-center justify-center font-bold text-slate-900"
              style={{
                background: `${accentColor}08`,
                color: typeof row.starwebflow === 'string' ? '#0F172A' : undefined,
              }}
            >
              {renderCell(row.starwebflow, accentColor)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
