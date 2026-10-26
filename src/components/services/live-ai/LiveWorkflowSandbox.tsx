'use client'

import { useState } from 'react'
import { Zap, Play, ArrowRight, ShieldCheck, CheckCircle2, Clock, Sparkles, Building2, Layers, FileSpreadsheet, MessageSquare, Boxes, GitBranch } from 'lucide-react'
import { LabConsole, useServiceLab, tri, CountUp, ThinkingSteps } from './LabKit'
import type { AutomationLabResult } from '@/app/api/v1/ai/service-lab/route'

const ACCENT = '#10B981'

const PRESETS = [
  {
    name: { tr: 'Fatura & Muhasebe', en: 'Invoice & Accounting', de: 'Rechnung & Buchhaltung' },
    icon: FileSpreadsheet,
    tag: 'ERP & FINTECH',
    process: {
      tr: 'Gelen PDF faturaları e-postadan indirip Excel’e elle giriyoruz, ERP ile eşleştirip onay bekliyoruz',
      en: 'We download PDF invoices from email, type them manually into spreadsheets, and wait for manager sign-off',
      de: 'Wir laden PDF-Rechnungen aus Mails, tippen sie manuell in Excel und warten auf die Freigabe',
    },
    hours: 14,
    staff: 2,
    rate: 32,
  },
  {
    name: { tr: 'WhatsApp & Randevu', en: 'WhatsApp & Booking', de: 'WhatsApp & Termine' },
    icon: MessageSquare,
    tag: 'OMNICHANNEL',
    process: {
      tr: 'Müşteriler gece ve hafta sonu WhatsApp’tan yazıyor, sabah tek tek dönüp takvim ayarlamaya çalışıyoruz',
      en: 'Clients message on WhatsApp after hours; we manually reply in the morning and juggle calendars',
      de: 'Kunden schreiben abends auf WhatsApp; morgens antworten wir mühsam einzeln und gleichen Kalender ab',
    },
    hours: 18,
    staff: 2,
    rate: 28,
  },
  {
    name: { tr: 'E-Ticaret & İadeler', en: 'E-Commerce Returns', de: 'E-Commerce Retouren' },
    icon: Boxes,
    tag: 'LOGISTICS',
    process: {
      tr: 'İade talepleri e-posta ve WhatsApp’tan geliyor, kargo takip kodunu elle arayıp kargo firmasına bakıyoruz',
      en: 'Return requests arrive via email and WhatsApp; we look up tracking codes and status manually',
      de: 'Retourenanfragen kommen per Mail und WhatsApp; wir prüfen Tracking-Codes mühsam von Hand',
    },
    hours: 12,
    staff: 1,
    rate: 26,
  },
  {
    name: { tr: 'B2B Lead Takibi', en: 'B2B Lead Follow-up', de: 'B2B Lead Follow-up' },
    icon: GitBranch,
    tag: 'SALES PIPELINE',
    process: {
      tr: 'Web sitesinden gelen formları CRM’e elle kopyalayıp ilgili satış temsilcisine 4 saat sonra yönlendiriyoruz',
      en: 'Form submissions are copy-pasted into CRM and assigned to reps with a 4-hour delay',
      de: 'Website-Formulare werden ins CRM kopiert und mit 4 Stunden Verzögerung an Vertriebler verteilt',
    },
    hours: 16,
    staff: 3,
    rate: 35,
  },
]

export default function LiveWorkflowSandbox() {
  const lab = useServiceLab<AutomationLabResult>('automation')
  const l = lab.language
  const [processText, setProcessText] = useState(PRESETS[0].process[l] || PRESETS[0].process.tr)
  const [weeklyHours, setWeeklyHours] = useState(PRESETS[0].hours)
  const [staff, setStaff] = useState(PRESETS[0].staff)
  const [hourlyCost, setHourlyCost] = useState(PRESETS[0].rate)

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx]
    setProcessText(p.process[l] || p.process.tr)
    setWeeklyHours(p.hours)
    setStaff(p.staff)
    setHourlyCost(p.rate)
  }

  const runSimulation = () => {
    if (!processText.trim() || lab.loading) return
    lab.run({ process: processText, weeklyHours, staff, hourlyCost })
  }

  const result = lab.data

  return (
    <LabConsole
      title={tri(l, 'Otonom Süreç Simülatörü', 'Autonomous Workflow Simulator', 'Autonomer Workflow-Simulator')}
      accent={ACCENT}
      meta={lab.meta}
      loading={lab.loading}
    >
      <div className="space-y-6">
        {/* Intro */}
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Zap className="w-3.5 h-3.5" />
            {tri(l, 'Yerel AI Süreç Motoru', 'Local AI Process Engine', 'Lokale KI-Prozess-Engine')}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {tri(l, 'Hangi manuel işiniz saatlerinizi çalıyor?', 'Which manual task is stealing your hours?', 'Welche manuelle Aufgabe raubt Ihnen Zeit?')}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {tri(
              l,
              'Sürecinizi doğal dille yazın. Star AI saniyeler içinde otonom iş akışını, araç zincirini ve tasarruf hesabını çıkarsın.',
              'Describe your workflow in plain words. Star AI maps the autonomous chain, tools and financial ROI in seconds.',
              'Beschreiben Sie Ihren Ablauf in eigenen Worten. Star AI berechnet die autonome Kette, Tools und Einsparung.'
            )}
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((p, i) => {
            const Icon = p.icon
            const isSelected = processText === (p.process[l] || p.process.tr)
            return (
              <button
                key={i}
                onClick={() => applyPreset(i)}
                className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/15 shadow-sm shadow-emerald-500/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {p.tag}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{p.name[l] || p.name.tr}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">~{p.hours}s / hafta</div>
              </button>
            )
          })}
        </div>

        {/* Input box */}
        <div className="space-y-3">
          <textarea
            id="workflow-input-process"
            value={processText}
            onChange={(e) => setProcessText(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 resize-none"
            placeholder={tri(l, 'Örn: Faturaları PDF olarak alıp tek tek ERP’ye işliyoruz...', 'e.g. We take PDF invoices and manually type them into ERP...', 'z.B. Wir erhalten PDF-Rechnungen und tippen sie einzeln ins ERP...')}
          />

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{tri(l, 'Haftalık Harcanan Saat', 'Weekly Hours Spent', 'Wöchentliche Stunden')}</span>
                <span className="font-mono text-emerald-400 font-bold">{weeklyHours}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{tri(l, 'Uğraşan Personel', 'Staff Involved', 'Beteiligte Mitarbeiter')}</span>
                <span className="font-mono text-emerald-400 font-bold">{staff} {tri(l, 'kişi', 'people', 'Pers.')}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={staff}
                onChange={(e) => setStaff(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{tri(l, 'Saatlik Maliyet', 'Hourly Cost', 'Stundensatz')}</span>
                <span className="font-mono text-emerald-400 font-bold">€{hourlyCost}/s</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button
            id="workflow-run-btn"
            onClick={runSimulation}
            disabled={lab.loading || !processText.trim()}
            className="w-full group relative overflow-hidden rounded-xl py-3.5 font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #059669)` }}
          >
            <span className="relative flex items-center justify-center gap-2">
              <Play className="w-4 h-4 fill-white" />
              {tri(l, 'İş Akışını Otonomlaştır & Tasarrufu Hesapla', 'Automate Workflow & Calculate Savings', 'Workflow automatisieren & Einsparung berechnen')}
            </span>
          </button>
        </div>

        {/* Loading state */}
        {lab.loading && (
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
            <ThinkingSteps
              accent={ACCENT}
              steps={[
                tri(l, 'Manuel adımlar ayrıştırılıyor...', 'Deconstructing manual steps...', 'Manuelle Schritte analysieren...'),
                tri(l, 'Star AI & n8n entegrasyon düğümleri bağlanıyor...', 'Connecting Star AI & n8n integration nodes...', 'Star AI & n8n Knoten verbinden...'),
                tri(l, 'Saat ve maliyet tasarrufu simüle ediliyor...', 'Simulating time and financial ROI...', 'Zeit- und Kosten-ROI berechnen...'),
              ]}
            />
          </div>
        )}

        {/* Results */}
        {result && !lab.loading && (
          <div className="space-y-4 pt-2" style={{ animation: 'fadeInUp 0.5s ease both' }}>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{tri(l, 'Aylık Kazanılan', 'Monthly Hours Saved', 'Monatl. Stunden')}</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                  +<CountUp value={result.hoursSavedPerMonth} /> <span className="text-xs font-normal text-slate-400">{tri(l, 'saat', 'hrs', 'Std.')}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{tri(l, 'Aylık Net Tasarruf', 'Monthly Savings', 'Monatl. Ersparnis')}</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  €<CountUp value={result.monthlySavingEur} />
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{tri(l, 'Yıllık Tasarruf', 'Annual Savings', 'Jahresersparnis')}</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                  €<CountUp value={result.yearlySavingEur} />
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{tri(l, 'Hata Azalışı', 'Error Drop', 'Fehlerreduktion')}</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  -%<CountUp value={result.errorReduction} />
                </div>
              </div>
            </div>

            {/* Architecture Node Chain */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/15">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  {result.title}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {Math.round(result.automationRate * 100)}% {tri(l, 'Otonom', 'Autonomous', 'Autonom')}
                </span>
              </div>

              {/* Connected node badges */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {result.nodes.map((node, i) => (
                  <div key={i} className="relative group p-3 rounded-xl border border-white/10 bg-white/[0.04] text-center">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">{node.app}</div>
                    <div className="text-xs text-white font-medium leading-tight">{node.label}</div>
                    {i < result.nodes.length - 1 && (
                      <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-emerald-400 text-xs">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
                💡 <span className="font-semibold text-white">{tri(l, 'Star AI Analizi:', 'Star AI Insight:', 'Star AI Einblick:')}</span> {result.insight}
              </div>
            </div>
          </div>
        )}
      </div>
    </LabConsole>
  )
}
