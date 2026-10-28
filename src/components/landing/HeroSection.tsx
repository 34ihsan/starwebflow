'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Server,
  Activity,
  CheckCircle2,
  Lock,
  Search,
  Cpu,
  Terminal,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ── Metrics Ticker Data ──────────────────────────────────────────────────
const TICKER_METRICS = [
  { icon: TrendingUp, value: '+312%', label: { tr: 'Ortalama ROI Artışı', en: 'Avg. ROI Increase', de: 'Ø ROI-Steigerung' }, color: '#059669' },
  { icon: Zap,         value: '0.8s',  label: { tr: 'LCP Hız Garantisi',   en: 'LCP Guarantee',    de: 'LCP Garantie'    }, color: '#2563EB' },
  { icon: Server,      value: '100%',  label: { tr: 'Özel Sunucu (Ollama)', en: 'Private Server',   de: 'Private Server'  }, color: '#7C3AED' },
  { icon: Shield,      value: 'A+',    label: { tr: 'Güvenlik & SSL',      en: 'Security Score',   de: 'Sicherheitswert' }, color: '#0891B2' },
  { icon: Users,       value: '50+',   label: { tr: 'Kurumsal Referans',   en: 'Happy Clients',    de: 'Kunden'          }, color: '#D97706' },
  { icon: Lock,        value: 'DSGVO', label: { tr: 'KVKK & GDPR Uyumlu',  en: 'GDPR Compliant',   de: 'DSGVO Konform'   }, color: '#059669' },
]

export default function HeroSection() {
  const { language } = useLanguage()
  const lang = (language as 'tr' | 'en' | 'de') || 'tr'

  const [domainInput, setDomainInput] = useState('')
  const [activeLogIndex, setActiveLogIndex] = useState(0)

  // Simulation pipeline logs cycling every 2.8s
  const pipelineLogs = [
    {
      time: '12:04:12',
      tag: 'LEAD INGEST',
      color: 'text-sky-300 border-sky-400/30 bg-sky-500/10',
      text: lang === 'tr' ? 'Yeni kurumsal talep yakalandı → Niyet analizi yapıldı' : lang === 'de' ? 'Neue Lead-Anfrage erfasst → Intent-Analyse abgeschlossen' : 'Inbound lead captured → Intent classified',
    },
    {
      time: '12:04:13',
      tag: 'OLLAMA AI',
      color: 'text-purple-300 border-purple-400/30 bg-purple-500/10',
      text: lang === 'tr' ? 'starwebflow-agent yerel LLM yanıt üretti (18ms latency)' : lang === 'de' ? 'starwebflow-agent lokales LLM generiert Antwort (18ms)' : 'starwebflow-agent local LLM generated response (18ms)',
    },
    {
      time: '12:04:14',
      tag: 'CRM & SLATE',
      color: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
      text: lang === 'tr' ? 'Takvim randevusu onaylandı & PDF şartname iletildi ✓' : lang === 'de' ? 'Kalenderslot bestätigt & Lastenheft-PDF versendet ✓' : 'Calendar meeting confirmed & tech spec PDF dispatched ✓',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % pipelineLogs.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [pipelineLogs.length])

  const handleQuickAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetDomain = domainInput.trim()
    const el = document.querySelector('#audit')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    if (targetDomain && typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('starwebflow:trigger-audit', {
            detail: { domain: targetDomain },
          })
        )
      }, 500)
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pt-36 pb-16 sm:pt-44 sm:pb-24 border-b border-slate-200/80"
      data-speakable="true"
    >
      {/* ── Light Ambient Grid Background ───────────────────────────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Subtle Glow Spheres */}
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] rounded-full bg-blue-100/60 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] rounded-full bg-purple-100/60 blur-[140px] pointer-events-none" />

      {/* ── Main Content Container ──────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* ── Left Column: High-Ticket B2B Positioning (7 Cols) ────── */}
          <div className="lg:col-span-7 text-center lg:text-left">
            
            {/* Live Sovereign Node Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 tracking-wide">
                {lang === 'tr'
                  ? 'Sovereign AI Node: Aktif · Frankfurt & Istanbul · %100 DSGVO / KVKK'
                  : lang === 'de'
                  ? 'Sovereign AI Node: Aktiv · Frankfurt Rechenzentrum · 100% DSGVO'
                  : 'Sovereign AI Node: Active · Frankfurt Datacenter · 100% GDPR'}
              </span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.14] mb-6">
              {lang === 'tr' ? (
                <>
                  İşletmenizin Operasyonlarını <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    Özel Sunuculu Yapay Zeka & Web Mimarisiyle
                  </span>{' '}
                  Otopilota Alın.
                </>
              ) : lang === 'de' ? (
                <>
                  Skalieren Sie Ihre Workflows mit <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    dedizierter KI & Hochgeschwindigkeits-Web
                  </span>{' '}
                  auf Autopilot.
                </>
              ) : (
                <>
                  Autopilot Your Business with <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    Private Sovereign AI & Sub-Second Web
                  </span>{' '}
                  Architecture.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal mb-8">
              {lang === 'tr'
                ? 'Müşteri verilerinizi üçüncü taraf bulut tekellerine teslim etmeden; kendi sunucunuzda çalışan bağımsız Ollama LLM modelleri, milisaniyelik Next.js 14 sistemleri ve 7/24 çalışan dijital operasyon ekipleri kuruyoruz.'
                : lang === 'de'
                ? 'Keine Datenabflüsse an US-Cloudanbieter: Wir implementieren autarke Ollama-LLMs auf dedizierten Servern, subsekundenschnelle Next.js Plattformen und vollautomatische CRM-Workflows.'
                : 'Zero data leakage to third-party cloud monopolies: We deploy sovereign Ollama LLMs on dedicated VPS, sub-second Next.js enterprise systems, and 24/7 autonomous workflow pipelines.'}
            </p>

            {/* CRO Weapon: Hero Fast Audit Input Bar */}
            <form
              onSubmit={handleQuickAuditSubmit}
              className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-300 shadow-xl shadow-slate-200/60 max-w-xl mx-auto lg:mx-0 mb-6 flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder={
                    lang === 'tr'
                      ? 'sirketiniz.com (veya rakibinizin sitesi)'
                      : lang === 'de'
                      ? 'ihre-domain.de (oder Wettbewerber)'
                      : 'yourdomain.com (or competitor)'
                  }
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-slate-900 text-sm placeholder-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="font-bold whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md shadow-blue-600/20"
              >
                <span>{lang === 'tr' ? 'Canlı Analiz Et' : lang === 'de' ? 'Live Analysieren' : 'Scan Live Site'}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Proof Signals */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {lang === 'tr' ? 'Kredi kartı gerekmez' : lang === 'de' ? 'Keine Kreditkarte' : 'No credit card'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {lang === 'tr' ? '3 Saniyede Gerçek HTTP & SSL Taraması' : lang === 'de' ? 'Echter Live-Scan in 3 Sek.' : 'Real HTTP & SSL scan in 3s'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {lang === 'tr' ? 'DIN ISO 25010 Uyumlu' : lang === 'de' ? 'DIN ISO 25010 konform' : 'DIN ISO 25010 Standard'}
              </span>
            </div>
          </div>

          {/* ── Right Column: Autonomous Command Center (5 Cols) ─────── */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl shadow-slate-950/20">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                  <span className="text-xs font-mono text-slate-300 ml-2">starwebflow-node-01 [DEDICATED VPS • TIER-4 ISO 27001]</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                  <Activity className="w-3 h-3 animate-pulse" />
                  99.98% SLA
                </div>
              </div>

              {/* Module 1: Dedicated Ollama Cluster */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Private Ollama Cluster</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Local Inference
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400">Model</p>
                    <p className="text-xs font-mono font-bold text-slate-200 truncate">starwebflow</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400">Latency</p>
                    <p className="text-xs font-mono font-bold text-emerald-400">18ms</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400">Data Leakage</p>
                    <p className="text-xs font-mono font-bold text-emerald-400">0.00%</p>
                  </div>
                </div>
              </div>

              {/* Module 2: Sub-Second Telemetry */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-semibold text-slate-300">LCP Benchmark</span>
                  </div>
                  <p className="text-lg font-bold text-white font-mono">0.68s</p>
                  <p className="text-[10px] text-emerald-400 font-medium">● 4.2x faster than WP</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-slate-300">Enterprise Privacy</span>
                  </div>
                  <p className="text-lg font-bold text-white font-mono">DSGVO A+</p>
                  <p className="text-[10px] text-slate-400">Frankfurt Datacenter</p>
                </div>
              </div>

              {/* Module 3: Real-Time Event Pipeline Simulator */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    Live Autonomous Event Stream
                  </span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Sync
                  </span>
                </div>
                <div className="space-y-1.5">
                  {pipelineLogs.map((log, index) => {
                    const isActive = index === activeLogIndex
                    return (
                      <div
                        key={index}
                        className={`p-1.5 rounded-lg transition-all duration-300 flex items-start gap-2 ${
                          isActive
                            ? 'bg-slate-850 border border-slate-700 text-white'
                            : 'opacity-40 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${log.color}`}>
                          {log.tag}
                        </span>
                        <span className="truncate text-[10px]">{log.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Metrics Ticker (Light Theme) ───────────────────────────── */}
        <div className="mt-14 sm:mt-18 relative w-full overflow-hidden max-w-full" aria-label="Key performance metrics">
          <div className="overflow-hidden w-full">
            <div className="metrics-ticker flex gap-4 sm:gap-6 w-max">
              {[...TICKER_METRICS, ...TICKER_METRICS].map((metric, i) => {
                const Icon = metric.icon
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-sm shrink-0"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${metric.color}15`, border: `1px solid ${metric.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: metric.color }} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-black font-mono text-slate-900" style={{ color: metric.color }}>
                        {metric.value}
                      </p>
                      <p className="text-[11px] text-slate-600 font-semibold whitespace-nowrap">
                        {metric.label[lang] || metric.label.tr}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
