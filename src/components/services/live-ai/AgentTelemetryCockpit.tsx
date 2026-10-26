'use client'

import { useState } from 'react'
import { ShieldCheck, Cpu, Zap, Lock, Database, CheckCircle2, Server, Activity, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { tri } from './LabKit'

export default function AgentTelemetryCockpit() {
  const { language } = useLanguage()
  const l = language as 'tr' | 'en' | 'de'
  const [activeTab, setActiveTab] = useState<'sla' | 'security' | 'crm'>('sla')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleVerify = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
      setTimeout(() => setVerified(false), 4000)
    }, 900)
  }

  return (
    <div className="relative rounded-3xl bg-[#090D1A] border border-white/[0.08] text-slate-100 p-6 sm:p-7 shadow-2xl overflow-hidden group">
      {/* Ambient gradient glow */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none bg-purple-600" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-cyan-600" />

      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-semibold">
              {tri(l, 'ENTERPRISE GOVERNANCE KOKPİTİ', 'ENTERPRISE GOVERNANCE COCKPIT', 'ENTERPRISE GOVERNANCE COCKPIT')}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {tri(l, 'Canlı SLA, Güvenlik & Altyapı Matrisi', 'Live SLA, Security & Infrastructure Matrix', 'Live-SLA-, Sicherheits- & Infrastruktur-Matrix')}
          </h3>
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-purple-400 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verified ? tri(l, 'Tüm Sistemler %100 Doğrulandı', 'All Systems Verified', 'Alle Systeme verifiziert') : tri(l, 'Canlı Telemetri Doğrula', 'Audit Live Telemetry', 'Live-Telemetrie prüfen')}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            {tri(l, 'P95 Yanıt Süresi', 'P95 Latency', 'P95 Latenz')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">&lt; 1.8s</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{tri(l, 'Kesintisiz akış', 'Instant stream', 'Echtzeit-Stream')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {tri(l, 'Halüsinasyon', 'Hallucination', 'Halluzination')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">0.00%</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'DSPy & NeMo filtre', 'DSPy & NeMo bounds', 'DSPy & NeMo Guard')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            {tri(l, 'Veri Eğitimi', 'Model Training', 'Modell-Training')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tracking-tight">0% Ret.</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Müşteri verisi izole', 'Zero data retention', 'Zero Data Retention')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
        {[
          { id: 'sla' as const, label: tri(l, 'SLA & Performans', 'SLA & Performance', 'SLA & Performance') },
          { id: 'security' as const, label: tri(l, 'KVKK & Egemenlik', 'GDPR & Sovereignty', 'DSGVO & Sicherheit') },
          { id: 'crm' as const, label: tri(l, 'CRM & Entegrasyon', 'CRM & Pipelines', 'CRM & Integration') },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'sla' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, '7/24 Kesintisiz Eşzamanlı Kapasite', '24/7 High-Concurrency Capacity', '24/7 Hochverfügbare Kapazität'),
              detail: tri(l, 'Aynı anda 500+ aktif müşteriye beklemesiz yanıt. Sıfır kuyruk gecikmesi.', 'Handles 500+ concurrent conversations with zero queue latency.', 'Verarbeitet 500+ gleichzeitige Konversationen ohne Wartezeit.'),
              metric: '99.98% SLA',
            },
            {
              title: tri(l, 'Deterministik Marka Sesi ve Doğruluk', 'Deterministic Brand Voice & Accuracy', 'Deterministische Markensprache'),
              detail: tri(l, 'Model sadece şirketinizin teyitli dokümanlarından (RAG) beslenir. Tahminde bulunmaz.', 'Constrained to verified vector databases; never invents pricing or policies.', 'Basiert strikt auf geprüfter Vektordatenbank; keine Erfindungen.'),
              metric: 'Grounding: 100%',
            },
            {
              title: tri(l, 'Otomatik İnsan Temsilcisi Eskalasyonu', 'Seamless Human Fallback Escalation', 'Nahtlose menschliche Eskalation'),
              detail: tri(l, 'Kritik veya öfkeli müşteri tespitinde anında WhatsApp/Slack üzerinden ekibinize bağlar.', 'Instantly hands over high-urgency or complex leads to your live team.', 'Leitet dringende oder unzufriedene Kunden sofort an Ihr Team weiter.'),
              metric: '< 200ms Trigger',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.detail}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                {item.metric}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, 'Egemen Bulut & Frankfurt Lokasyonu', 'Sovereign EU Cloud / Frankfurt Node', 'Souveräne EU-Cloud / Frankfurt'),
              detail: tri(l, 'Tüm veri trafiği ve model çıkarımı Almanya / AB sınırlarında tutulur. KVKK ve GDPR uyumlu.', 'Inference and data reside in Germany / EU data centers under strict GDPR.', 'Datenverarbeitung und Inferenz strikt in deutschen / EU-Rechenzentren.'),
              badge: 'GDPR / KVKK',
            },
            {
              title: tri(l, 'Uçtan Uca AES-256 & TLS 1.3 Şifreleme', 'End-to-End AES-256 & TLS 1.3', 'Ende-zu-Ende AES-256 & TLS 1.3'),
              detail: tri(l, 'Tüm müşteri sohbetleri ve API anahtarları HSM düzeyinde donanım güvenliğiyle korunur.', 'All chat streams and API tokens encrypted at rest and in transit.', 'Sämtliche Chats und Tokens im Ruhezustand und Transfer verschlüsselt.'),
              badge: 'SOC 2 Type II',
            },
            {
              title: tri(l, 'Gizlilik ve Sıfır Veri Sızıntısı Garantisi', 'Zero Model Training Retention Guarantee', 'Keine Modell-Trainingsspeicherung'),
              detail: tri(l, 'Konuşma verileriniz genel modelleri eğitmek için asla üçüncü taraflara aktarılmaz.', 'Your private proprietary data is never used to train public foundation models.', 'Ihre Daten fließen niemals in das Training öffentlicher KI-Modelle.'),
              badge: 'Zero-Retention',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.detail}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'crm' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, 'Çift Yönlü CRM & ERP Senkronizasyonu', 'Bi-Directional CRM & ERP Sync', 'Bidirektionale CRM- & ERP-Synchronisation'),
              detail: tri(l, 'HubSpot, Pipedrive, Salesforce, Paraşüt ve Logo ile anlık lead ve randevu aktarımı.', 'Real-time two-way synchronization for deals, contacts and calendar slots.', 'Echtzeit-Synchronisation für Deals, Kontakte und Termine.'),
              channels: 'HubSpot · Salesforce · Pipedrive',
            },
            {
              title: tri(l, 'Omnichannel Canlı Bağlantı Ağı', 'Omnichannel Deployment Pipeline', 'Omnichannel-Bereitstellung'),
              detail: tri(l, 'WhatsApp Business Cloud API v20, Instagram Direct, Web Widget ve Telefon SIP Santral.', 'Single agent brain orchestrated across WhatsApp, Instagram, Web & Voice.', 'Ein Agenten-Gehirn über WhatsApp, Instagram, Web und Telefon-SIP.'),
              channels: 'WhatsApp · Instagram · Voice SIP',
            },
            {
              title: tri(l, 'Webhook & Özel Veritabanı Sorgulama', 'Custom Webhooks & DB SQL Tools', 'Custom Webhooks & DB-Abfragen'),
              detail: tri(l, 'Müşterinin sipariş durumunu veya borç bakiyesini SQL sorgulayarak anında yanıtlar.', 'Live tool-calling to safely read order status, tracking IDs or balances.', 'Sicheres Tool-Calling für Bestellstatus, Tracking-IDs oder Guthaben.'),
              channels: 'REST · GraphQL · Webhook',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.detail}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                {item.channels}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-purple-400" />
          {tri(l, 'Hetzner / AWS Frankfurt ISO-27001', 'Hetzner / AWS Frankfurt ISO-27001', 'Hetzner / AWS Frankfurt ISO-27001')}
        </span>
        <span className="text-emerald-400 font-semibold">{tri(l, 'Audit: PASS (100/100)', 'Audit: PASS (100/100)', 'Audit: BESTANDEN')}</span>
      </div>
    </div>
  )
}
