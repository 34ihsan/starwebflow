'use client'

import { useState } from 'react'
import { Database, Server, ShieldCheck, Calendar, Sparkles, Layers, Cpu, ArrowRight, Activity, Building2, Zap } from 'lucide-react'
import { LabConsole, tri, CountUp, ThinkingSteps, AIEngineBadge, type LabMeta } from './LabKit'
import type { SpecBlueprint } from '@/app/api/v1/ai/spec-preview/route'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ACCENT = '#06B6D4'

const PRESETS = [
  {
    name: { tr: 'Klinik & Hasta Portalı', en: 'Clinic & Patient Portal', de: 'Klinik & Patientenportal' },
    idea: {
      tr: 'Çok doktorlu klinik için 7/24 WhatsApp randevu, online hasta geçmişi ve SMS bildirimli SaaS',
      en: 'Multi-doctor clinic SaaS with 24/7 WhatsApp booking, patient portal and SMS alerts',
      de: 'Multi-Praxis-SaaS mit 24/7 WhatsApp-Terminen, Patientenakte und SMS-Erinnerung',
    },
    icon: Activity,
    tag: 'MEDTECH & HEALTH',
  },
  {
    name: { tr: 'B2B Toptan Sipariş Portalı', en: 'B2B Wholesale Portal', de: 'B2B-Großhandelsportal' },
    idea: {
      tr: 'Bayilere özel fiyat listesi, cari hesap ekstresi ve anında Stripe/SEPA ödemeli B2B portalı',
      en: 'B2B wholesale portal with tier pricing, credit line balances and instant SEPA/Stripe checkout',
      de: 'B2B-Portal mit Händlerpreisen, Debitoren-Kontoauszug und Sofortabrechnung',
    },
    icon: Building2,
    tag: 'ENTERPRISE B2B',
  },
  {
    name: { tr: 'SaaS Abonelik Platformu', en: 'Subscription SaaS', de: 'Abo-SaaS-Plattform' },
    idea: {
      tr: 'Yapay zeka destekli içerik üretimi için rol bazlı (RBAC) çok kiracılı kurumsal SaaS',
      en: 'Multi-tenant enterprise SaaS for AI-driven generation with role-based access control',
      de: 'Multi-Tenant Enterprise-SaaS für KI-Content mit rollenbasierter Zugriffskontrolle',
    },
    icon: Zap,
    tag: 'AI PLATFORM',
  },
]

export default function LiveSpecArchitect() {
  const { language } = useLanguage()
  const l = language as 'tr' | 'en' | 'de'
  const [idea, setIdea] = useState(PRESETS[0].idea[l] || PRESETS[0].idea.tr)
  const [blueprint, setBlueprint] = useState<SpecBlueprint | null>(null)
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState<LabMeta | null>(null)
  const [activeTab, setActiveTab] = useState<'modules' | 'db' | 'sprints'>('modules')

  const applyPreset = (idx: number) => {
    setIdea(PRESETS[idx].idea[l] || PRESETS[idx].idea.tr)
  }

  const generateBlueprint = async () => {
    if (!idea.trim() || loading) return
    setLoading(true)
    const t0 = performance.now()
    try {
      const res = await fetch('/api/v1/ai/spec-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, language }),
      })
      const json = await res.json()
      if (json.blueprint) {
        setBlueprint(json.blueprint)
        setMeta({
          provider: json.provider || 'ollama',
          model: json.blueprint.modelUsed || 'starwebflow-webdev',
          latencyMs: Math.round(performance.now() - t0),
          live: json.provider !== 'contextual-webdev',
        })
      }
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  return (
    <LabConsole
      title={tri(l, 'CTO Lastenheft & Mimari Motoru', 'CTO Architecture & Spec Engine', 'CTO Lastenheft- & Architektur-Engine')}
      accent={ACCENT}
      meta={meta}
      loading={loading}
    >
      <div className="space-y-6">
        {/* Intro */}
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Server className="w-3.5 h-3.5" />
            {tri(l, 'Yerel WebDev AI Mimarı', 'Local WebDev AI Architect', 'Lokaler WebDev KI-Architekt')}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {tri(l, 'Web uygulamanızın teknik mimarisini koddan önce görün.', 'Preview your web app technical architecture before code.', 'Sehen Sie die technische Architektur vor der ersten Codezeile.')}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {tri(
              l,
              'Fikrinizi yazın. Yerel model veritabanı tablolarını, mikro-modülleri, teknoloji yığınını ve sprint planını saniyeler içinde çıkarsın.',
              'Type your SaaS idea. The local model drafts database entities, micro-modules, tech stack and sprint plan in seconds.',
              'Geben Sie Ihre SaaS-Idee ein. Das lokale Modell entwirft Datenbanktabellen, Module, Tech-Stack und Sprint-Plan.'
            )}
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((p, i) => {
            const Icon = p.icon
            const isSelected = idea === (p.idea[l] || p.idea.tr)
            return (
              <button
                key={i}
                onClick={() => applyPreset(i)}
                className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-sm shadow-cyan-500/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {p.tag}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{p.name[l] || p.name.tr}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{tri(l, 'Mimari & Şema Çıkar', 'Inspect Architecture', 'Architektur prüfen')}</div>
              </button>
            )
          })}
        </div>

        {/* Input */}
        <div className="space-y-3">
          <textarea
            id="spec-input-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 resize-none"
            placeholder={tri(l, 'Fikrinizi açıklayın...', 'Describe your SaaS idea...', 'Beschreiben Sie Ihre SaaS-Idee...')}
          />

          <button
            id="spec-run-btn"
            onClick={generateBlueprint}
            disabled={loading || !idea.trim()}
            className="w-full group relative overflow-hidden rounded-xl py-3.5 font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #2563EB)` }}
          >
            <span className="relative flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {tri(l, 'CTO Mimarisi & Veritabanı Şemasını Çıkar', 'Generate CTO Architecture & DB Blueprint', 'CTO-Architektur & DB-Blueprint generieren')}
            </span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
            <ThinkingSteps
              accent={ACCENT}
              steps={[
                tri(l, 'Prisma PostgreSQL veri modeli ayrıştırılıyor...', 'Drafting Prisma PostgreSQL relational model...', 'Prisma PostgreSQL Datenmodell entwerfen...'),
                tri(l, 'Next.js 15 SSR & RBAC yetkilendirme modülleri seçiliyor...', 'Configuring Next.js 15 SSR & RBAC modules...', 'Next.js 15 SSR & RBAC Module konfigurieren...'),
                tri(l, 'KVKK/DSGVO güvenlik ve sprint takvimi hazırlanıyor...', 'Compiling GDPR compliance & 3-sprint plan...', 'DSGVO-Compliance & 3-Sprint-Plan erstellen...'),
              ]}
            />
          </div>
        )}

        {/* Results */}
        {blueprint && !loading && (
          <div className="space-y-4 pt-2" style={{ animation: 'fadeInUp 0.5s ease both' }}>
            {/* Header info */}
            <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/20">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block mb-1">
                📐 {tri(l, 'Mimari Kapsam', 'Architecture Scope', 'Architektur-Umfang')}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">{blueprint.projectTitle}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{blueprint.scopeSummary}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-2">
              <button
                onClick={() => setActiveTab('modules')}
                className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'modules' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                {tri(l, 'Çekirdek Modüller', 'Core Modules', 'Kernmodule')}
              </button>
              <button
                onClick={() => setActiveTab('db')}
                className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'db' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                <Database className="w-3.5 h-3.5" />
                {tri(l, 'Prisma Veritabanı', 'Prisma DB Tables', 'Prisma-Tabellen')}
              </button>
              <button
                onClick={() => setActiveTab('sprints')}
                className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${activeTab === 'sprints' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {tri(l, 'Sprint Takvimi', 'Sprint Roadmap', 'Sprint-Plan')}
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'modules' && (
              <div className="grid sm:grid-cols-3 gap-2.5">
                {blueprint.coreModules.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 inline-block mb-1.5">
                      {m.badge}
                    </span>
                    <div className="text-xs font-semibold text-white leading-snug">{m.title}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'db' && (
              <div className="grid sm:grid-cols-3 gap-2.5">
                {blueprint.dbTables.map((t, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                    <div className="text-xs font-mono font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-cyan-400" />
                      {t.tableName}
                    </div>
                    <ul className="space-y-1">
                      {t.columns.map((c, j) => (
                        <li key={j} className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <span className="text-cyan-500">·</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'sprints' && (
              <div className="space-y-2">
                {blueprint.sprintPlan.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white mr-2">{s.phase}</span>
                        <span className="text-slate-400">{s.deliverable}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">{s.duration}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Tech Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold mr-1">Stack:</span>
              {blueprint.techStack.map((tech, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </LabConsole>
  )
}
