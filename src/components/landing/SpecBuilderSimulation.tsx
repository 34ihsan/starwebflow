'use client'

import { useState, useRef, useEffect } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import Button from '@/components/ui/Button'
import { Terminal, Sparkles, CheckCircle2, FileText, Server, Lock, Calendar, Database, Cpu, Layers } from 'lucide-react'
import LeadFormModal from '@/components/services/LeadFormModal'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { createPublicLastenheft } from '@/app/actions/contract'
import type { SpecBlueprint } from '@/app/api/v1/ai/spec-preview/route'

const IDEA_PRESETS = {
  tr: [
    '🦷 Diş klinikleri için çok kiracılı (multi-tenant) online randevu ve 7/24 WhatsApp AI hasta triyaj SaaS platformu',
    '🛒 B2B toptan tekstil sipariş portalı, canlı ERP stok senkronizasyonu ve AI destekli çapraz satış öneri motoru',
    '🚚 Lojistik firmaları için AI fatura/evrak okuma (OCR), canlı kargo takip ve otomatik CRM bildirim sistemi'
  ],
  de: [
    '🦷 Multi-Tenant SaaS-Plattform für Zahnarztpraxen mit Online-Terminbuchung und 24/7 WhatsApp KI-Patienten-Triage',
    '🛒 B2B-Großhandelsportal mit Live-ERP-Bestandssynchronisation und KI-gestützter Produktempfehlungs-Engine',
    '🚚 KI-Dokumenten- & Rechnungsautomatisierung für Logistikunternehmen mit Live-Sendungsverfolgung & CRM-Sync'
  ],
  en: [
    '🦷 Multi-tenant SaaS platform for dental clinics with online booking and 24/7 WhatsApp AI patient triage',
    '🛒 B2B wholesale ordering portal with live ERP inventory sync and AI-powered cross-sell recommendation engine',
    '🚚 AI invoice & document automation for logistics companies with live shipment tracking and CRM sync'
  ]
}

export default function SpecBuilderSimulation() {
  const { language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  const [projectIdea, setProjectIdea] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [progress, setProgress] = useState(0)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [blueprint, setBlueprint] = useState<SpecBlueprint | null>(null)

  // Lead capture for PDF Download
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [leadData, setLeadData] = useState({ name: '', email: '' })

  const handleLeadSubmitSuccess = async (data: { name: string; email: string }) => {
    setLeadData(data)
    setIsDownloaded(true)
    setIsModalOpen(false)

    try {
      await createPublicLastenheft({
        name: data.name,
        email: data.email,
        idea: projectIdea
      })
    } catch (e) {
      console.error('Error saving public Lastenheft:', e)
    }

    window.location.href = `/api/v1/pdf/lastenheft?name=${encodeURIComponent(data.name)}&email=${encodeURIComponent(data.email)}&idea=${encodeURIComponent(projectIdea)}`
  }

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

  const handleSimulate = async (overrideIdea?: string) => {
    const targetIdea = (overrideIdea ?? projectIdea).trim()
    if (!targetIdea) return
    if (overrideIdea) setProjectIdea(overrideIdea)

    setIsAnalyzing(true)
    setShowResult(false)
    setProgress(10)

    const initLogs = language === 'tr'
      ? ['[SYSTEM] starwebflow-webdev:latest CTO Motoru başlatılıyor...', '[AI] Proje gereksinimleri ve sektör bağlamı ayrıştırılıyor...']
      : language === 'de'
      ? ['[SYSTEM] starwebflow-webdev:latest CTO-Engine wird gestartet...', '[AI] Projektanforderungen & Branchenkontext werden analysiert...']
      : ['[SYSTEM] Starting starwebflow-webdev:latest CTO Engine...', '[AI] Parsing project requirements & industry context...']

    setTerminalLogs(initLogs)

    const stepTimers: ReturnType<typeof setTimeout>[] = []
    const steps = language === 'tr' ? [
      { p: 35, log: '[DB] PostgreSQL & Prisma veritabanı tabloları modelleniyor...' },
      { p: 65, log: '[ARCH] Next.js 15 App Router & n8n AI ajan modülleri kurgulanıyor...' },
      { p: 88, log: '[SEC] KVKK / DSGVO (GDPR) ve AES-256 güvenlik katmanı doğrulanıyor...' }
    ] : language === 'de' ? [
      { p: 35, log: '[DB] PostgreSQL & Prisma Datenbank-Tabellen werden modelliert...' },
      { p: 65, log: '[ARCH] Next.js 15 App Router & n8n KI-Agenten-Module werden entworfen...' },
      { p: 88, log: '[SEC] DSGVO / GDPR & AES-256 Sicherheitslayer wird verifiziert...' }
    ] : [
      { p: 35, log: '[DB] Modeling PostgreSQL & Prisma database schema...' },
      { p: 65, log: '[ARCH] Designing Next.js 15 App Router & n8n AI agent modules...' },
      { p: 88, log: '[SEC] Verifying GDPR / DSGVO & AES-256 security layer...' }
    ]

    steps.forEach((step, idx) => {
      const t = setTimeout(() => {
        setProgress(step.p)
        setTerminalLogs(prev => [...prev, step.log])
      }, (idx + 1) * 550)
      stepTimers.push(t)
    })

    try {
      const res = await fetch('/api/v1/ai/spec-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: targetIdea, language })
      })
      const data = await res.json()
      if (data.success && data.blueprint) {
        setBlueprint(data.blueprint)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('starwebflow:spec-generated', {
              detail: {
                idea: targetIdea,
                projectTitle: data.blueprint.projectTitle,
                scopeSummary: data.blueprint.scopeSummary
              }
            })
          )
        }
      }
    } catch (err) {
      console.error('Spec preview error:', err)
    } finally {
      stepTimers.forEach(clearTimeout)
      setProgress(100)
      setTerminalLogs(prev => [
        ...prev,
        language === 'tr'
          ? '[SUCCESS] CTO Mimari Planı ve Lastenheft Şeması hazırlandı!'
          : language === 'de'
          ? '[SUCCESS] CTO-Architekturplan & Lastenheft-Schema erstellt!'
          : '[SUCCESS] CTO Architecture Blueprint & Lastenheft Schema ready!'
      ])
      setTimeout(() => {
        setIsAnalyzing(false)
        setShowResult(true)
      }, 350)
    }
  }

  const activePresets = IDEA_PRESETS[language as keyof typeof IDEA_PRESETS] || IDEA_PRESETS.tr

  return (
    <section id="spec-builder" className="section relative overflow-hidden bg-white py-24">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 mb-4 shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>starwebflow-webdev:latest • Live CTO Spec Engine</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight font-['Outfit']">
            {language === 'tr' ? (
              <>Projenizi Saniyeler İçinde <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">CTO Seviyesinde Mimariye Dönüştürün</span></>
            ) : language === 'de' ? (
              <>Verwandeln Sie Ihre Idee in Sekunden in eine <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">CTO-Softwarearchitektur</span></>
            ) : (
              <>Turn Your Idea into a <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">CTO-Grade Architecture</span> in Seconds</>
            )}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            {language === 'tr'
              ? 'Proje fikrinizi yazın veya örnek senaryolardan birini seçin; uzman yazılım mimarisi modelimiz (starwebflow-webdev) veritabanı tablolarınızı, modüllerinizi ve Lastenheft şartnamenizi canlı olarak çıkarsın.'
              : language === 'de'
              ? 'Beschreiben Sie Ihre Projektidee oder wählen Sie ein Szenario: Unser spezialisiertes Architektur-Modell (starwebflow-webdev) entwirft live Ihre Datenbanktabellen, Module und Ihr Lastenheft.'
              : 'Describe your project idea or pick a sample scenario: our specialized architecture model (starwebflow-webdev) designs your live database schema, modules, and Lastenheft spec.'}
          </p>
        </div>

        <div className={`max-w-5xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <GlowCard glowColor="purple" className="p-1 lg:p-1 bg-white border border-slate-200 shadow-xl rounded-2xl">
            <div className="bg-white rounded-[1.2rem] border border-slate-200 overflow-hidden">

              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-3 text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    starwebflow/cto-architect-studio ~ model: starwebflow-webdev:latest
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LOCAL AI ONLINE
                </span>
              </div>

              <div className="p-6 md:p-8">
                {/* Quick Preset Chips */}
                <div className="mb-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {language === 'tr' ? '⚡ Tek Tıkla Örnek Proje Senaryoları:' : language === 'de' ? '⚡ 1-Klick Beispiel-Szenarien:' : '⚡ 1-Click Sample Project Scenarios:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSimulate(preset)}
                        disabled={isAnalyzing}
                        className="text-left text-xs bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-xl px-3 py-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {language === 'tr' ? 'Proje Fikrinizi veya İstediğiniz Sistemi Yazın' : language === 'de' ? 'Beschreiben Sie Ihre Projektidee oder Ihr Wunschsystem' : 'Describe Your Project Idea or System'}
                  </label>
                  <div className="relative">
                    <textarea
                      value={projectIdea}
                      onChange={(e) => setProjectIdea(e.target.value)}
                      placeholder={language === 'tr'
                        ? "Örn: Almanya'daki klinikler için çok kiracılı online randevu, WhatsApp AI asistanı ve otomatik faturalandırma sistemi..."
                        : language === 'de'
                        ? "z. B. Multi-Tenant Online-Terminbuchung, WhatsApp KI-Assistent und automatische Abrechnung für Kliniken..."
                        : "e.g. Multi-tenant online booking, WhatsApp AI assistant, and automated billing system for clinics..."}
                      className="w-full bg-slate-50/50 border border-slate-300 rounded-xl p-4 pb-16 sm:pb-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all resize-none h-32 sm:h-28 shadow-2xs text-sm sm:text-base"
                    />
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                      <Button
                        variant="primary"
                        onClick={() => handleSimulate()}
                        disabled={isAnalyzing || !projectIdea.trim()}
                        className="group disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-600/20 text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 font-bold"
                      >
                        {isAnalyzing ? (
                          <span className="flex items-center gap-2">
                            {language === 'tr' ? 'CTO Mimarisi Çıkarılıyor...' : language === 'de' ? 'CTO-Architektur wird erstellt...' : 'Building CTO Architecture...'}
                            <span className="animate-spin text-lg leading-none">⟳</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {language === 'tr' ? 'Canlı Mimari & Lastenheft Üret' : language === 'de' ? 'Live-Architektur & Lastenheft' : 'Generate Live Architecture'}
                            <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Loading State & Terminal */}
                {isAnalyzing && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs sm:text-sm text-emerald-400 shadow-inner">
                    <div className="flex justify-between items-center mb-3 text-slate-400 text-xs">
                      <span>STARWEBFLOW_WEBDEV_3B_CTO_ENGINE</span>
                      <span>%{progress}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="space-y-1.5">
                      {terminalLogs.map((log, i) => (
                        <div key={i} className="animate-fade-in">&gt; {log}</div>
                      ))}
                      <div className="animate-pulse">&gt; _</div>
                    </div>
                  </div>
                )}

                {/* Result State */}
                {showResult && blueprint && (
                  <div className="animate-fade-in-up border-t border-slate-200 pt-8 space-y-6">
                    {/* Title & Scope Banner */}
                    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 shadow-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-purple-200">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'tr' ? 'Canlı CTO Mimari Şeması' : language === 'de' ? 'Live CTO-Architektur-Blueprint' : 'Live CTO Architecture Blueprint'}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                          ⚡ {blueprint.modelUsed}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white mb-2">
                        {blueprint.projectTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {blueprint.scopeSummary}
                      </p>
                    </div>

                    {/* Core Modules & DB Schema Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Core Modules */}
                      <div className="bg-slate-50/90 rounded-xl p-5 border border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-2 mb-3 text-purple-700">
                          <Layers className="w-4 h-4" />
                          <h4 className="font-bold text-sm">
                            {language === 'tr' ? 'Özel Fonksiyonel Modüller' : language === 'de' ? 'Spezifische Funktionsmodule' : 'Custom Functional Modules'}
                          </h4>
                        </div>
                        <div className="space-y-2.5">
                          {blueprint.coreModules.map((mod, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="text-xs font-semibold text-slate-800">{mod.title}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 shrink-0">
                                {mod.badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Database Schema Preview */}
                      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-2xs font-mono">
                        <div className="flex items-center justify-between mb-3 text-emerald-400">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            <h4 className="font-bold text-xs uppercase tracking-wider">
                              {language === 'tr' ? 'PostgreSQL / Prisma Veri Şeması' : language === 'de' ? 'PostgreSQL / Prisma Datenschema' : 'PostgreSQL / Prisma Data Schema'}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-400">schema.prisma</span>
                        </div>
                        <div className="space-y-2.5">
                          {blueprint.dbTables.map((tb, i) => (
                            <div key={i} className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
                              <div className="text-xs font-bold text-cyan-400 mb-1">
                                model {tb.tableName} {'{'}
                              </div>
                              <div className="flex flex-wrap gap-1.5 pl-3">
                                {tb.columns.map((col, cIdx) => (
                                  <span key={cIdx} className="text-[10px] bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded">
                                    {col}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs font-bold text-cyan-400 mt-0.5">{'}'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack, Security & Sprint Plan */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2.5 text-blue-600">
                          <Server className="w-4 h-4" />
                          <h4 className="font-bold text-xs uppercase tracking-wider">Tech Stack</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {blueprint.techStack.map((tech, i) => (
                            <span key={i} className="text-xs font-medium bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2.5 text-emerald-600">
                          <Lock className="w-4 h-4" />
                          <h4 className="font-bold text-xs uppercase tracking-wider">
                            {language === 'tr' ? 'Güvenlik & KVKK/DSGVO' : language === 'de' ? 'Sicherheit & DSGVO' : 'Security & GDPR'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {blueprint.securityCompliance}
                        </p>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2.5 text-amber-600">
                          <Calendar className="w-4 h-4" />
                          <h4 className="font-bold text-xs uppercase tracking-wider">
                            {language === 'tr' ? 'Sprint Teslimat Planı' : language === 'de' ? 'Sprint-Lieferplan' : 'Sprint Delivery Plan'}
                          </h4>
                        </div>
                        <div className="space-y-1.5">
                          {blueprint.sprintPlan.map((sp, i) => (
                            <div key={i} className="text-xs flex items-start justify-between gap-2 border-b border-slate-200/60 pb-1 last:border-0">
                              <span className="font-bold text-slate-800 shrink-0">{sp.phase} ({sp.duration}):</span>
                              <span className="text-slate-600 text-right">{sp.deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PDF Download CTA Bar */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div>
                        <span className="block text-sm text-slate-900 font-bold text-center sm:text-left">
                          {isDownloaded
                            ? (language === 'tr' ? '✅ Resmi Lastenheft PDF belgeniz oluşturuldu ve indirildi!' : language === 'de' ? '✅ Ihr offizielles Lastenheft-PDF wurde erstellt und heruntergeladen!' : '✅ Your official Lastenheft PDF was generated and downloaded!')
                            : (language === 'tr' ? '📄 Bu Mimarinin Tam Kapsamlı Resmi Lastenheft (Gereksinim) PDF Raporunu İndirin' : language === 'de' ? '📄 Laden Sie das vollständige offizielle Lastenheft als PDF herunter' : '📄 Download the Full Official Lastenheft PDF Report for This Architecture')}
                        </span>
                        <span className="block text-xs text-slate-600 mt-0.5 text-center sm:text-left">
                          {language === 'tr'
                            ? 'Yönetici özeti, modül kırılımı, SLA garantileri ve teslimat takvimi içeren çok sayfalı PDF.'
                            : language === 'de'
                            ? 'Mehrseitiges PDF inkl. Management-Summary, Modulaufbaustruktur, SLA-Garantien & Zeitplan.'
                            : 'Multi-page PDF with executive summary, module breakdown, SLA guarantees, and timeline.'}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isDownloaded ? (
                          <a
                            href={`/api/v1/pdf/lastenheft?name=${encodeURIComponent(leadData.name)}&email=${encodeURIComponent(leadData.email)}&idea=${encodeURIComponent(projectIdea)}`}
                            download
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm"
                          >
                            {language === 'tr' ? 'PDF Tekrar İndir' : language === 'de' ? 'PDF erneut herunterladen' : 'Download PDF Again'}
                          </a>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs shadow-md shadow-purple-600/20 px-4 py-2.5"
                            onClick={() => setIsModalOpen(true)}
                          >
                            {language === 'tr' ? 'Lastenheft PDF İndir' : language === 'de' ? 'Lastenheft PDF herunterladen' : 'Download Lastenheft PDF'}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5"
                          onClick={() => {
                            const el = document.querySelector('#quote') || document.querySelector('#cta')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          {language === 'tr' ? 'Teklif & Görüşme Planla' : language === 'de' ? 'Angebot & Gespräch' : 'Get Quote & Call'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlowCard>
        </div>
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        title={language === 'tr' ? 'Lastenheft PDF Raporunu İndir' : language === 'de' ? 'Lastenheft PDF herunterladen' : 'Download Lastenheft PDF'}
        subtitle={language === 'tr'
          ? 'Oluşturulan gereksinim belgesi PDF kopyasını indirmek ve projenizi kaydetmek için bilgilerinizi doğrulayın.'
          : language === 'de'
          ? 'Bestätigen Sie Ihre Angaben, um die PDF-Kopie des erstellten Lastenhefts herunterzuladen und Ihr Projekt zu speichern.'
          : 'Verify your details to download the PDF copy of the generated Lastenheft and save your project.'}
        source="Spec Builder Simulation"
        onSubmitSuccess={handleLeadSubmitSuccess}
      />
    </section>
  )
}
