'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Cpu, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export interface LabMeta {
  provider: string
  model: string
  latencyMs: number
  live: boolean
}

type Lang = 'tr' | 'en' | 'de'
export const tri = (l: string, tr: string, en: string, de: string) => (l === 'de' ? de : l === 'en' ? en : tr)

/**
 * Generic hook for /api/v1/ai/service-lab calls with abort + timeout handling.
 */
export function useServiceLab<T>(kind: 'agent' | 'automation' | 'webdev' | 'ads') {
  const { language } = useLanguage()
  const [data, setData] = useState<T | null>(null)
  const [meta, setMeta] = useState<LabMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(
    async (payload: Record<string, unknown>): Promise<{ data: T; meta: LabMeta } | null> => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      const timer = setTimeout(() => ctrl.abort(), 60000)
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/v1/ai/service-lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, language, payload }),
          signal: ctrl.signal,
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'error')
        setData(json.data)
        setMeta(json.meta)
        return { data: json.data, meta: json.meta }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(tri(language, 'Bağlantı yoğun, lütfen tekrar deneyin.', 'Engine is busy, please try again.', 'Engine ausgelastet, bitte erneut versuchen.'))
        }
        return null
      } finally {
        clearTimeout(timer)
        setLoading(false)
      }
    },
    [kind, language]
  )

  useEffect(() => () => abortRef.current?.abort(), [])

  return { data, meta, loading, error, run, setData, language: language as Lang }
}

/** Animated count-up number */
export function CountUp({ value, duration = 1400, prefix = '', suffix = '', decimals = 0 }: { value: number; duration?: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return (
    <>
      {prefix}
      {display.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </>
  )
}

/** Typewriter reveal for AI text */
export function Typewriter({ text, speed = 14, className = '' }: { text: string; speed?: number; className?: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const id = setInterval(() => {
      i += 2
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return (
    <span className={className}>
      {shown}
      {shown.length < text.length && <span className="inline-block w-[2px] h-[1em] align-middle bg-current ml-0.5 animate-pulse" />}
    </span>
  )
}

/**
 * Live engine badge — shows the local LLM status and, after a run, provider/model/latency.
 */
export function AIEngineBadge({ meta, loading, accent = '#8B5CF6' }: { meta: LabMeta | null; loading?: boolean; accent?: string }) {
  const { language } = useLanguage()
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((j) => alive && setOnline(!!j?.ollama?.online))
      .catch(() => alive && setOnline(false))
    return () => {
      alive = false
    }
  }, [])

  const isLive = meta ? meta.live : online
  const label = loading
    ? tri(language, 'Model düşünüyor…', 'Model is thinking…', 'Modell denkt nach…')
    : meta
    ? meta.live
      ? `${meta.model.replace(':latest', '')} · ${(meta.latencyMs / 1000).toFixed(1)}s`
      : tri(language, 'Akıllı şablon modu', 'Smart template mode', 'Smart-Template-Modus')
    : online
    ? tri(language, 'Yerel LLM çevrimiçi', 'Local LLM online', 'Lokales LLM online')
    : online === false
    ? tri(language, 'Hibrit AI motoru', 'Hybrid AI engine', 'Hybride KI-Engine')
    : tri(language, 'Motor kontrol ediliyor…', 'Checking engine…', 'Engine wird geprüft…')

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono text-slate-300 backdrop-blur">
      <span className="relative flex h-2 w-2">
        {(loading || isLive) && <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: loading ? '#F59E0B' : '#10B981' }} />}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: loading ? '#F59E0B' : isLive ? '#10B981' : '#64748B' }} />
      </span>
      {loading ? <Zap className="w-3 h-3" style={{ color: accent }} /> : <Cpu className="w-3 h-3" style={{ color: accent }} />}
      <span>{label}</span>
    </div>
  )
}

/** Dark premium console frame used by every live lab */
export function LabConsole({
  title,
  accent,
  meta,
  loading,
  children,
}: {
  title: string
  accent: string
  meta: LabMeta | null
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative group">
      <div
        className="absolute -inset-[1px] rounded-3xl opacity-70 blur-[2px] transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${accent}, transparent 40%, transparent 60%, ${accent})`, backgroundSize: '200% 200%', animation: 'gradientShift 6s ease infinite' }}
      />
      <div className="relative rounded-3xl bg-[#0B1020] text-slate-100 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: accent }} />
        <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-slate-300">{title}</span>
          </div>
          <AIEngineBadge meta={meta} loading={loading} accent={accent} />
        </div>
        <div className="relative p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

/** Thinking skeleton with rotating steps */
export function ThinkingSteps({ steps, accent }: { steps: string[]; accent: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => Math.min(v + 1, steps.length - 1)), 1600)
    return () => clearInterval(id)
  }, [steps.length])
  return (
    <div className="space-y-2.5 py-2">
      {steps.map((st, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm transition-all" style={{ opacity: idx <= i ? 1 : 0.25 }}>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: idx < i ? accent : 'transparent', border: `1.5px solid ${accent}`, color: idx < i ? '#0B1020' : accent }}
          >
            {idx < i ? '✓' : idx === i ? <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: accent }} /> : idx + 1}
          </span>
          <span className={idx === i ? 'text-white font-medium' : 'text-slate-400'}>{st}</span>
        </div>
      ))}
      <div className="h-1 mt-3 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-[1500ms] ease-out" style={{ width: `${((i + 1) / steps.length) * 100}%`, background: accent }} />
      </div>
    </div>
  )
}
