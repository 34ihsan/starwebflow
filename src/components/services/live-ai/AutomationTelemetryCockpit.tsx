'use client'

import { useState } from 'react'
import { Zap, ShieldCheck, CheckCircle2, TrendingUp, GitBranch, AlertCircle, ArrowRight, Clock, RefreshCw, Cpu } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { tri } from './LabKit'

export default function AutomationTelemetryCockpit() {
  const { language } = useLanguage()
  const l = language as 'tr' | 'en' | 'de'
  const [activePipeline, setActivePipeline] = useState<'accounting' | 'leads' | 'logistics'>('accounting')
  const [simulating, setSimulating] = useState(false)
  const [pulseCount, setPulseCount] = useState(1482)

  const triggerTestPulse = () => {
    setSimulating(true)
    setTimeout(() => {
      setSimulating(false)
      setPulseCount((c) => c + 1)
    }, 700)
  }

  return (
    <div className="relative rounded-3xl bg-[#08120F] border border-white/[0.08] text-slate-100 p-6 sm:p-7 shadow-2xl overflow-hidden group">
      {/* Ambient gradient glow */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none bg-emerald-600" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-teal-600" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              {tri(l, 'HIGH-YIELD WORKFLOW KOKPİTİ', 'HIGH-YIELD WORKFLOW COCKPIT', 'HIGH-YIELD WORKFLOW COCKPIT')}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {tri(l, 'Otonom Pipeline, EBITDA & Finansal Telemetri', 'Autonomous Pipeline, EBITDA & Financial Telemetry', 'Autonome Pipeline, EBITDA & Finanz-Telemetrie')}
          </h3>
        </div>
        <button
          onClick={triggerTestPulse}
          disabled={simulating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-emerald-400 ${simulating ? 'animate-spin' : ''}`} />
          <span>{simulating ? tri(l, 'Paket İşleniyor…', 'Processing Payload…', 'Paket wird verarbeitet…') : tri(l, 'Test Paketi Gönder', 'Dispatch Test Event', 'Test-Event senden')}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            {tri(l, 'Yıllık EBITDA Katkısı', 'Annual EBITDA Gain', 'Jährlicher EBITDA-Gewinn')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">+€42.000</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Doğrudan net marj', 'Direct net margin', 'Direkte Nettomarge')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-400" />
            {tri(l, 'Kazanılan Yönetici Saati', 'Reclaimed Hours', 'Gewonnene Stunden')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">52s / hafta</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{tri(l, 'Katma değerli işe dönüşüm', 'Reallocated to growth', 'In Wachstum investiert')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            {tri(l, 'Hata Eliminasyonu', 'Error Elimination', 'Fehlerbeseitigung')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tracking-tight">99.8%</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Sıfır insan veri hatası', 'Zero manual typo risk', 'Keine Tippfehler mehr')}</div>
        </div>
      </div>

      {/* Pipeline Selector */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
        {[
          { id: 'accounting' as const, label: tri(l, 'Fatura & ERP Mutabakat', 'Invoice & ERP Reconcile', 'Rechnung & ERP') },
          { id: 'leads' as const, label: tri(l, 'B2B Lead Dağıtım & CRM', 'B2B Lead Routing', 'B2B-Lead-Routing') },
          { id: 'logistics' as const, label: tri(l, 'E-Ticaret & İade Botu', 'Omnichannel Returns', 'Retouren-Management') },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActivePipeline(t.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activePipeline === t.id
                ? 'bg-emerald-600/30 text-white border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Architecture Visualizer Sequence */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{tri(l, '5 Aşamalı Kurumsal İşlem Akışı', '5-Stage Enterprise Pipeline', '5-stufige Enterprise-Pipeline')}</span>
          <span className="text-emerald-400 font-bold">Processed: #{pulseCount}</span>
        </div>

        <div className="space-y-2">
          {[
            {
              stage: '01',
              title: tri(l, 'Webhook & Güvenlik Doğrulaması', 'Webhook Ingest & HMAC-SHA256', 'Webhook & HMAC-SHA256'),
              desc: tri(l, 'Gelen verinin orijinalliği kriptografik imza ile saniyede 12ms içinde doğrulanır.', 'Payload authenticated cryptographically in under 12ms.', 'Payload kryptographisch in unter 12ms verifiziert.'),
              tech: 'HMAC-SHA256',
            },
            {
              stage: '02',
              title: tri(l, 'LLM Veri Çıkarımı & Zod Tip Validasyonu', 'LLM Parsing & Zod Schema Guard', 'LLM-Parsing & Zod-Validierung'),
              desc: tri(l, 'PDF, OCR veya dağınık e-posta metni kesin şemalı JSON modeline dönüştürülür.', 'Converts unstructured emails or PDFs into strictly-typed JSON.', 'Wandelt unstrukturierte E-Mails/PDFs in typensicheres JSON um.'),
              tech: 'Zod Strict Type',
            },
            {
              stage: '03',
              title: tri(l, 'İş Mantığı & Çapraz Sistem Doğrulama', 'Cross-System Logic & Reconciliation', 'Systemübergreifende Logik'),
              desc: tri(l, 'ERP, banka cari ve vergi dairesi verileriyle anlık mutabakat sağlanır.', 'Instant cross-check against ERP accounts, tax ID and ledger balances.', 'Abgleich mit ERP-Konten, Steuer-ID und Hauptbuch.'),
              tech: 'ACID Mutex',
            },
            {
              stage: '04',
              title: tri(l, 'Otomatik Kayıt & Çift Yönlü Commit', 'Automated Dual-Write Commit', 'Automatischer Commit'),
              desc: tri(l, 'Muhasebe programı, CRM ve arşiv bulutuna tek transaction ile hatasız yazılır.', 'Atomic database transaction committed across CRM, ERP and Archive.', 'Atomare DB-Transaktion über CRM, ERP und Archiv hinweg.'),
              tech: 'Postgres / API',
            },
            {
              stage: '05',
              title: tri(l, 'Bildirim & Dead-Letter Queue (DLQ) Garantisi', 'Audit Alert & DLQ Fail-safe', 'Audit-Alert & DLQ-Sicherheit'),
              desc: tri(l, 'Yöneticiye WhatsApp/Slack teyidi iletilir. Olası API kesintilerinde veri asla kaybolmaz.', 'Executive notification dispatched; zero data loss guaranteed via DLQ.', 'Chef-Info per WhatsApp/Slack; kein Datenverlust dank DLQ.'),
              tech: 'DLQ Fail-Safe',
            },
          ].map((s) => (
            <div key={s.stage} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono text-emerald-400 font-bold flex-shrink-0">
                {s.stage}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white truncate">{s.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06] flex-shrink-0">
                    {s.tech}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Trust Guarantee */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          {tri(l, 'Self-Hosted n8n Enterprise Cluster', 'Self-Hosted n8n Enterprise Cluster', 'Self-Hosted n8n Enterprise Cluster')}
        </span>
        <span className="text-emerald-400 font-semibold">{tri(l, '%0 Sessiz Başarısızlık Garantisi', 'Zero Silent Failures SLA', 'Keine stillen Fehler')}</span>
      </div>
    </div>
  )
}
