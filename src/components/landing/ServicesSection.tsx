'use client'

import { useRef, useEffect, useState } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import Link from 'next/link'
import {
  Globe,
  Bot,
  Megaphone,
  Cog,
  ArrowRight,
  Zap,
  Monitor,
  CheckCircle2,
  Cpu,
  TrendingUp,
  Sparkles,
  Database,
  Calendar,
  MessageSquare,
  Send,
  Lock,
  Workflow
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// --- INTERACTIVE VISUAL 1: AI AGENTS (Hero Bento - Pure Light Mode) ---
function AIAgentsInteractiveVisual({ language }: { language: string }) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 3400)
    return () => clearInterval(timer)
  }, [])

  const scenarios = [
    {
      channel: language === 'tr' ? 'Sesli AI Santral' : language === 'de' ? 'KI-Telefonzentrale' : 'Voice AI Reception',
      userMsg: language === 'tr' ? '“Merhaba, haftalık 500 fatura işleyen bir ERP otomasyonu için maliyet alabilir miyim?”' : language === 'de' ? '„Hallo, was kostet eine ERP-Automatisierung für 500 Rechnungen/Woche?“' : '“Hi, what does an ERP automation cost for 500 invoices/week?”',
      thought: language === 'tr' ? 'Ses Analizi & RAG Veritabanı · 65ms · Model-Agnostik Hibrit Yönlendirme (Llama & Claude)' : language === 'de' ? 'Sprachanalyse & RAG · 65ms · Modell-Agnostisches Routing (Llama & Claude)' : 'Voice Audio & RAG · 65ms · Model-Agnostic Routing (Llama & Claude)',
      action: language === 'tr' ? 'Sesli Fiyat Açıklandı ➔ WhatsApp ile PDF Teklif İletildi & Randevu Alındı' : language === 'de' ? 'Angebot per Stimme erklärt ➔ PDF via WhatsApp gesendet & Termin gebucht' : 'Voice Quote Delivered ➔ PDF sent via WhatsApp & Meeting Booked',
      output: language === 'tr' ? 'Sesli Randevu & Lead Eşlendi' : language === 'de' ? 'Termin & Lead synchronisiert' : 'Voice Meeting & Lead Synced'
    },
    {
      channel: language === 'tr' ? 'Canlı Web Chat & WhatsApp' : language === 'de' ? 'Live Web Chat & WhatsApp' : 'Live Web Chat & WhatsApp',
      userMsg: language === 'tr' ? '“Gece 03:00’te API entegrasyonu ve kurum içi özel AI kurulumu hakkında bilgi alabilir miyim?”' : language === 'de' ? '„Gibt es Infos zu On-Premise KI & API-Integration um 03:00 Uhr?“' : '“Can I get info about On-Premise Private AI & API integration at 3:00 AM?”',
      thought: language === 'tr' ? 'Kurumsal Bilgi Bankası Çözümlendi · On-Premise & Çoklu LLM Orkestrasyonu' : language === 'de' ? 'Wissensdatenbank analysiert · On-Premise & Multi-LLM Orchestrierung' : 'Knowledge Bank Parsed · On-Premise & Multi-LLM Orchestration',
      action: language === 'tr' ? 'Anında Teknik Yanıt Verildi (0.9s) ➔ CRM Müşteri Kartı Açıldı' : language === 'de' ? 'Sofortige Antwort (0.9s) ➔ CRM-Kunde angelegt' : 'Instant Answer (0.9s) ➔ CRM Prospect Created',
      output: language === 'tr' ? '0 Manuel Veri Girişi' : language === 'de' ? 'Keine manuelle Eingabe' : 'Zero Manual Entry'
    },
    {
      channel: language === 'tr' ? 'Gelen E-posta & Talep' : language === 'de' ? 'E-Mail Anfrage' : 'Inbound Email',
      userMsg: language === 'tr' ? '“50 kişilik ekibimiz için özel B2B portal ve otonom iş akışı teklifi rica ederiz.”' : language === 'de' ? '„Bitte um Angebot für maßgeschneidertes B2B-Portal & Workflows für 50 Personen.“' : '“Please send a custom B2B portal & automation quote for 50 team members.”',
      thought: language === 'tr' ? 'Kapasite ve Koltuk Analizi Tamamlandı · Sıfır Vendor Lock-in Modeli Eşleşti' : language === 'de' ? 'Teamgröße analysiert · Zero Vendor Lock-in Modell zugeordnet' : 'Capacity Analyzed · Zero Vendor Lock-in Architecture Matched',
      action: language === 'tr' ? 'Kişiselleştirilmiş Sözleşme İletildi ➔ Satış Ekibine Sıcak Bildirim' : language === 'de' ? 'Vertrag versendet ➔ Vertriebsteam benachrichtigt' : 'Custom Deal Sent ➔ High-Intent Alert to Sales',
      output: language === 'tr' ? 'Skor: 99/100 Sıcak Lead' : language === 'de' ? 'Score: 99/100 Hot Lead' : 'Score: 99/100 Hot Lead'
    }
  ]

  const current = scenarios[activeStep]

  return (
    <div className="w-full my-5 rounded-2xl bg-gradient-to-b from-purple-50/70 to-white border border-purple-200/90 p-4 sm:p-5 shadow-[0_4px_24px_-4px_rgba(139,92,246,0.12)] relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-purple-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="font-mono font-bold text-emerald-700 tracking-wider">
            {language === 'tr' ? 'OTONOM AJAN MERKEZİ' : language === 'de' ? 'AUTONOMES AGENTEN-ZENTRUM' : 'AUTONOMOUS AGENT CORE'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200">
            {language === 'tr' ? 'Model-Agnostik & RAG v4.2' : language === 'de' ? 'Modell-Agnostisch & RAG v4.2' : 'Model-Agnostic & RAG v4.2'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="hidden sm:inline font-medium text-slate-700">
            {language === 'tr' ? 'Multi-LLM + Sesli AI + On-Premise' : language === 'de' ? 'Multi-LLM + Voice-KI + On-Premise' : 'Multi-LLM + Voice AI + On-Premise'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span className="text-purple-700 font-semibold">
            {language === 'tr' ? '7/24 Kesintisiz' : language === 'de' ? '24/7 Non-Stop' : '24/7 Always-On'}
          </span>
        </div>
      </div>

      {/* Main Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left Inputs (Channels) */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1.5 justify-between">
          {[
            { name: language === 'tr' ? 'Sesli Ajan (Telefon)' : language === 'de' ? 'Voice-Agent (Telefon)' : 'Voice Agent (Phone)', icon: Bot, active: activeStep === 0 },
            { name: 'Live Chat & WhatsApp', icon: MessageSquare, active: activeStep === 1 },
            { name: language === 'tr' ? 'E-posta & Webhook' : 'E-Mail & Webhook', icon: Send, active: activeStep === 2 },
          ].map((ch) => {
            const Icon = ch.icon
            return (
              <div
                key={ch.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                  ch.active
                    ? 'bg-purple-600 text-white border-purple-600 shadow-[0_4px_14px_rgba(147,51,234,0.3)]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300 shadow-sm'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${ch.active ? 'text-white' : 'text-slate-500'}`} />
                <span className="font-mono text-[11px]">{ch.name}</span>
                {ch.active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </div>
            )
          })}
        </div>

        {/* Center Live Simulation Stream */}
        <div className="lg:col-span-6 bg-white rounded-xl p-3.5 border border-purple-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-purple-700 font-mono font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              {current.channel}
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono border border-emerald-200 font-bold">
              ⚡ 1.1s {language === 'tr' ? 'Yanıt' : language === 'de' ? 'Antwort' : 'Response'}
            </span>
          </div>

          <div className="text-xs text-slate-800 font-medium italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {current.userMsg}
          </div>

          {/* Reasoning / RAG step */}
          <div className="flex items-start gap-1.5 text-[11px] text-purple-900 font-mono bg-purple-50/90 border border-purple-200/70 px-2.5 py-1.5 rounded-lg">
            <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
            <span className="leading-tight font-medium">{current.thought}</span>
          </div>

          {/* Action executed */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="leading-tight truncate font-semibold">{current.action}</span>
          </div>
        </div>

        {/* Right Outputs (Deliverables) */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1.5 justify-between">
          {[
            { name: language === 'tr' ? 'Lead Skor: 98/100' : language === 'de' ? 'Lead-Score: 98/100' : 'Lead Score: 98/100', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { name: language === 'tr' ? 'Takvim Randevusu' : language === 'de' ? 'Terminbuchung' : 'Calendar Booking', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { name: language === 'tr' ? 'Kişiselleştirilmiş PDF' : language === 'de' ? 'Individuelles PDF-Angebot' : 'Custom PDF Proposal', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          ].map((out) => {
            const Icon = out.icon
            return (
              <div
                key={out.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${out.bg} border text-slate-800 shadow-sm transition-all`}
              >
                <Icon className={`w-3.5 h-3.5 ${out.color}`} />
                <span className="font-mono text-[11px] truncate font-medium">{out.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${((activeStep + 1) / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

// --- INTERACTIVE VISUAL 2: AI OTOMASYON (n8n & Enterprise API - Pure Light Mode) ---
function AutomationInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-emerald-50/70 to-white border border-emerald-200/90 p-3.5 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] relative overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-emerald-100 text-[11px]">
        <div className="flex items-center gap-2">
          <Workflow className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono font-bold text-emerald-800">
            {language === 'tr' ? 'n8n KOGNİTİF MESH' : language === 'de' ? 'n8n WORKFLOW ENGINE' : 'n8n WORKFLOW MESH'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 font-semibold">
          140ms · {language === 'tr' ? '0 Hata' : language === 'de' ? '0 Fehler' : '0 Errors'}
        </span>
      </div>

      {/* Nodes Chain */}
      <div className="flex items-center justify-between gap-1 relative my-2">
        {/* Node 1 */}
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-emerald-200 flex-1 shadow-sm">
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-mono text-slate-800 font-bold leading-tight">Webhook</span>
          <span className="text-[9px] text-slate-500 leading-none mt-0.5 font-medium">
            {language === 'tr' ? 'Lead / Form' : language === 'de' ? 'Lead / Formular' : 'Inbound Lead'}
          </span>
        </div>

        {/* Connector 1 */}
        <div className="flex-1 max-w-[28px] h-1 bg-emerald-100 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500 animate-[slideRight_1.5s_infinite_linear]" />
        </div>

        {/* Node 2 */}
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-emerald-600 text-white flex-1 shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white mb-1 animate-[spin_8s_linear_infinite]">
            <Cog className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-mono text-white font-bold leading-tight">
            {language === 'tr' ? 'n8n AI Motor' : language === 'de' ? 'n8n KI-Engine' : 'n8n AI Engine'}
          </span>
          <span className="text-[9px] text-emerald-100 leading-none mt-0.5 font-medium">
            {language === 'tr' ? 'Kognitif Ayrıştırma' : language === 'de' ? 'Kognitive Analyse' : 'Cognitive Parsing'}
          </span>
        </div>

        {/* Connector 2 */}
        <div className="flex-1 max-w-[28px] h-1 bg-emerald-100 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500 animate-[slideRight_1.5s_infinite_linear_0.75s]" />
        </div>

        {/* Node 3 */}
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-emerald-200 flex-1 shadow-sm">
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-mono text-slate-800 font-bold leading-tight">ERP / CRM</span>
          <span className="text-[9px] text-slate-500 leading-none mt-0.5 font-medium">
            {language === 'tr' ? 'Otomatik Fatura' : language === 'de' ? 'Auto-Rechnung' : 'Auto Invoicing'}
          </span>
        </div>
      </div>

      <div className="mt-2 text-[10px] font-mono text-slate-600 flex items-center justify-between pt-1.5 border-t border-emerald-100">
        <span className="text-emerald-700 font-bold">
          ⚡ {language === 'tr' ? 'Haftalık +15 Saat Tasarruf' : language === 'de' ? 'Wöchentlich +15 Std. gespart' : 'Weekly +15h Saved'}
        </span>
        <span className="text-slate-500 font-medium">REST API Sync</span>
      </div>
    </div>
  )
}

// --- INTERACTIVE VISUAL 3: SUB-SECOND WEB ECOSYSTEM (Next.js 14/15 SSR - Pure Light Mode) ---
function WebEcosystemInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-blue-50/70 to-white border border-blue-200/90 p-3.5 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] relative overflow-hidden">
      {/* Browser Chrome Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-100 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[10px] font-mono text-blue-900 border border-blue-200 shadow-xs font-medium">
            <Lock className="w-2.5 h-2.5 text-emerald-600" />
            starwebflow.com
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
          0.38s TTFB
        </span>
      </div>

      {/* Speed Dial & Lighthouse Scoreboard */}
      <div className="flex items-center justify-between gap-3 my-2 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
        {/* Speed Highlight */}
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold">
            {language === 'tr' ? 'Yüklenme Hızı' : language === 'de' ? 'Ladezeit' : 'Load Speed'}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono">
              0.4s
            </span>
            <span className="text-[10px] font-bold text-emerald-700 font-mono">
              {language === 'tr' ? 'Işık Hızı' : language === 'de' ? 'Lichtgeschwindigkeit' : 'Lightning Fast'}
            </span>
          </div>
        </div>

        {/* 4 Lighthouse 100/100 Badges */}
        <div className="flex items-center gap-2">
          {[
            { label: 'PERF', val: '100' },
            { label: 'SEO', val: '100' },
            { label: 'A11Y', val: '100' },
            { label: 'BEST', val: '100' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-700 border-2 border-emerald-500 bg-emerald-50 shadow-xs">
                {item.val}
              </div>
              <span className="text-[8px] font-mono text-slate-600 mt-0.5 font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pt-1">
        <span className="text-blue-700 font-semibold">Next.js 14/15 & SSR Edge Cache</span>
        <span className="text-emerald-700 font-bold">
          {language === 'tr' ? '3x Satış Dönüşümü' : language === 'de' ? '3x Mehr Conversions' : '3x Sales Conversion'}
        </span>
      </div>
    </div>
  )
}

// --- INTERACTIVE VISUAL 4: CLOUD-NATIVE & SAAS (Docker & PostgreSQL - Pure Light Mode) ---
function CloudSaaSInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-cyan-50/70 to-white border border-cyan-200/90 p-3.5 shadow-[0_4px_20px_-4px_rgba(6,182,212,0.1)] relative overflow-hidden">
      {/* Header Comparison Badge */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-100 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-cyan-600" />
          <span className="font-mono font-bold text-cyan-900">
            {language === 'tr' ? 'ÖZEL SAAS & BULUT KONTROL' : language === 'de' ? 'CUSTOM SAAS & CLOUD-PORTAL' : 'CUSTOM SAAS PORTAL'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-300 font-semibold">
          {language === 'tr' ? '%99.9 Uptime' : '99.9% Uptime'}
        </span>
      </div>

      {/* Architecture Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 my-2">
        <div className="bg-white p-2 rounded-lg border border-cyan-200 text-center shadow-xs">
          <div className="text-[9px] text-slate-500 font-mono font-semibold uppercase">
            {language === 'tr' ? 'Veritabanı' : language === 'de' ? 'Datenbank' : 'Database'}
          </div>
          <div className="text-xs font-bold font-mono text-cyan-800 mt-0.5">PostgreSQL</div>
          <div className="text-[9px] text-emerald-700 font-medium mt-0.5">3.2ms Latency</div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-cyan-200 text-center shadow-xs">
          <div className="text-[9px] text-slate-500 font-mono font-semibold uppercase">
            {language === 'tr' ? 'Yalıtım' : language === 'de' ? 'Deployment' : 'Deploy'}
          </div>
          <div className="text-xs font-bold font-mono text-cyan-800 mt-0.5">Docker VPS</div>
          <div className="text-[9px] text-emerald-700 font-medium mt-0.5">Cloud-Native</div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-cyan-200 text-center shadow-xs">
          <div className="text-[9px] text-slate-500 font-mono font-semibold uppercase">
            {language === 'tr' ? 'Yönetim' : language === 'de' ? 'Steuerung' : 'Control'}
          </div>
          <div className="text-xs font-bold font-mono text-cyan-800 mt-0.5">
            {language === 'tr' ? 'Tek Panel' : language === 'de' ? 'Ein Dashboard' : 'Single Dashboard'}
          </div>
          <div className="text-[9px] text-amber-700 font-bold mt-0.5">
            {language === 'tr' ? 'Sıfır Excel' : language === 'de' ? 'Kein Excel' : 'Zero Excel'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pt-1 border-t border-cyan-100">
        <span className="text-cyan-800 font-bold">
          {language === 'tr' ? 'Excel Kalabalığına Son' : language === 'de' ? 'Schluss mit Excel-Listen' : 'No More Excel Clutter'}
        </span>
        <span className="text-slate-500 font-medium">
          {language === 'tr' ? 'Sınırsız Ölçeklenebilir' : language === 'de' ? 'Grenzenlos skalierbar' : 'Infinitely Scalable'}
        </span>
      </div>
    </div>
  )
}

// --- INTERACTIVE VISUAL 5: GROWTH MARKETING (Meta CAPI & Google Ads - Pure Light Mode) ---
function GrowthMarketingInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-amber-50/70 to-white border border-amber-200/90 p-4 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)] relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-amber-100 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span className="font-mono font-bold text-amber-900">
            {language === 'tr' ? 'ALGORİTMİK GROWTH KOKPİTİ' : language === 'de' ? 'ALGORITHMISCHE GROWTH-ENGINE' : 'ALGORITHMIC GROWTH ENGINE'}
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-semibold border border-amber-300">
            Meta CAPI + Google Ads
          </span>
        </div>
        <div className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
          5.4x ROAS (+340%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Attribution Tags */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs font-mono shadow-xs">
            <span className="text-slate-800 font-medium">Meta CAPI (Server-Side)</span>
            <span className="text-emerald-700 text-[11px] font-bold">
              {language === 'tr' ? '1st-Party Veri' : language === 'de' ? 'First-Party-Daten' : '1st-Party Data'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs font-mono shadow-xs">
            <span className="text-slate-800 font-medium">Google Ads Enhanced</span>
            <span className="text-emerald-700 text-[11px] font-bold">Offline Sync</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs font-mono shadow-xs">
            <span className="text-slate-800 font-medium">
              {language === 'tr' ? 'Edinme Maliyeti (CAC)' : language === 'de' ? 'Akquisekosten (CAC)' : 'Acquisition Cost (CAC)'}
            </span>
            <span className="text-emerald-700 text-[11px] font-bold">
              {language === 'tr' ? '-45% Tasarruf' : language === 'de' ? '-45% Ersparnis' : '-45% Saved'}
            </span>
          </div>
        </div>

        {/* Dynamic Growth SVG Curve */}
        <div className="md:col-span-7 relative flex items-center justify-center py-1">
          <svg className="w-full h-24 overflow-visible" viewBox="0 0 200 60">
            <defs>
              <linearGradient id="growthGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Filled area under curve */}
            <path
              d="M0,55 Q50,52 100,32 T200,6 L200,60 L0,60 Z"
              fill="url(#growthGradientLight)"
            />
            {/* Guide curve line */}
            <path
              d="M0,55 Q50,52 100,32 T200,6"
              fill="none"
              stroke="rgba(245, 158, 11, 0.4)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Highlighted active growth line */}
            <path
              d="M0,55 Q50,52 100,32 T200,6"
              fill="none"
              stroke="#D97706"
              strokeWidth="3.5"
            />
            {/* Beacon at peak */}
            <circle cx="200" cy="6" r="6" fill="#F59E0B" className="animate-ping opacity-75" />
            <circle cx="200" cy="6" r="4.5" fill="#D97706" />
            <circle cx="200" cy="6" r="2" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-2 border-t border-amber-100">
        <span className="text-amber-800 font-semibold">
          {language === 'tr'
            ? 'Boşa Bütçe Harcamadan Nokta Atışı Müşteri Akışı'
            : language === 'de'
            ? 'Gezielter Kundenstrom ohne Budgetverschwendung'
            : 'Targeted Inbound Without Wasted Ad Spend'}
        </span>
        <span className="text-emerald-700 font-bold">
          {language === 'tr' ? 'Sektör Lideri ROAS' : language === 'de' ? 'Branchenführender ROAS' : 'Industry-Leading ROAS'}
        </span>
      </div>
    </div>
  )
}

// --- SINGLE SERVICE BENTO CARD COMPONENT (Pure Light Mode) ---
function ServiceBentoCard({
  service,
  index,
  language,
}: {
  service: any
  index: number
  language: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Icon = service.icon

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${service.className}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link href={service.href} className="block h-full group">
        <GlowCard
          glowColor={service.glowColor}
          className="p-6 sm:p-8 h-full cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 border border-slate-200 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05),0_10px_35px_-8px_rgba(0,0,0,0.04)] relative overflow-hidden"
        >
          {/* Subtle top-right ambient colored tint */}
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none"
            style={{ background: service.color }}
          />

          <div>
            {/* Card Header: Icon + Badge */}
            <div className="flex justify-between items-start mb-5">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden shadow-sm"
                style={{
                  background: `${service.color}15`,
                  border: `1px solid ${service.color}35`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${service.color}, transparent)`,
                  }}
                />
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 transition-colors duration-300"
                  style={{ color: service.color }}
                />
              </div>

              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide shadow-xs"
                style={{
                  background: `${service.color}15`,
                  color: service.color,
                  border: `1px solid ${service.color}35`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: service.color }} />
                {service.badge}
              </span>
            </div>

            {/* Card Titles & Explanations */}
            <h3 className="heading-md text-slate-900 mb-2.5 transition-colors group-hover:text-blue-700">
              {service.title}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-4 font-normal">
              {service.description}
            </p>
          </div>

          {/* --- HYPER-ADVANCED LIGHT THEME INTERACTIVE VISUAL CANVASES --- */}
          <div className="flex-grow flex items-center justify-center relative">
            {service.id === 'agents' && <AIAgentsInteractiveVisual language={language} />}
            {service.id === 'automation' && <AutomationInteractiveVisual language={language} />}
            {service.id === 'web' && <WebEcosystemInteractiveVisual language={language} />}
            {service.id === 'saas' && <CloudSaaSInteractiveVisual language={language} />}
            {service.id === 'marketing' && <GrowthMarketingInteractiveVisual language={language} />}
          </div>

          {/* Features Checklist & Metric Callout */}
          <div className="pt-4 border-t border-slate-100">
            <ul className="space-y-2.5 mb-5">
              {service.features.map((f: string) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium"
                >
                  <CheckCircle2
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: service.color }}
                  />
                  <span className="leading-tight">{f}</span>
                </li>
              ))}
            </ul>

            {/* Metric Banner + Arrow */}
            <div
              className="mt-3 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm font-bold transition-all duration-300 group-hover:shadow-md"
              style={{
                background: `${service.color}12`,
                color: service.color,
                border: `1px solid ${service.color}30`,
              }}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {service.metric}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs font-bold">
                {language === 'tr' ? 'Keşfet' : language === 'de' ? 'Details' : 'Explore'}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </div>
          </div>
        </GlowCard>
      </Link>
    </div>
  )
}

// --- MAIN SERVICES SECTION (Pure Light Mode) ---
export default function ServicesSection() {
  const { t, language } = useLanguage()
  const titleRef = useRef<HTMLDivElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const services = [
    {
      id: 'agents',
      icon: Bot,
      color: '#7C3AED',
      glowColor: 'purple' as const,
      badge: language === 'de' ? 'Multi-LLM & Voice AI' : language === 'en' ? 'Multi-LLM & Voice AI' : 'Model-Agnostik AI & Ses',
      href: '/hizmetler/ai-agents',
      title: language === 'tr' ? 'Model-Agnostik Hibrit AI & Sesli Ajanlar' : t('services.agents.title'),
      description:
        language === 'tr'
          ? 'Tek bir modele mahkum olmadan (Claude, Llama, DeepSeek, GPT); bulutta veya kurum içi yerel sunucunuzda (On-Premise) çalışan otonom sesli ve yazılı temsilciler. Gece 03:00\'te bile müşterilerinize anında yanıt verir, fiyat sunar ve onaylı randevuyu takviminize işler.'
          : t('services.agents.desc'),
      features:
        language === 'tr'
          ? [
              'Model-Agnostik Hibrit Zeka (Sıfır Vendor Lock-in)',
              'Sesli AI Santral & WhatsApp/Web Çoklu Kanal',
              'Kurum İçi / On-Premise Seçeneği (KVKK & Tam Veri Egemenliği)',
            ]
          : language === 'de'
          ? [
              'Modell-Agnostische Architektur (Kein Vendor Lock-in)',
              'KI-Sprachagenten & WhatsApp/Web Omnichannel',
              'On-Premise DSGVO-Option (Volle Datensouveränität)',
            ]
          : [
              'Model-Agnostic Multi-LLM (Zero Vendor Lock-in)',
              'Voice AI Reception & Omnichannel WhatsApp/Web',
              'On-Premise Option (GDPR & Full Data Sovereignty)',
            ],
      className: 'md:col-span-2 md:row-span-2',
      metric:
        language === 'tr'
          ? '%60+ Operasyonel Tasarruf (7/24 Kesintisiz)'
          : language === 'de'
          ? '60%+ Operative Ersparnis (24/7 Aktiv)'
          : '60%+ Operational Savings (24/7 Active)',
    },
    {
      id: 'automation',
      icon: Cog,
      color: '#059669',
      glowColor: 'emerald' as const,
      badge: language === 'de' ? 'ERP & n8n Mesh' : language === 'en' ? 'ERP & n8n Mesh' : 'n8n & ERP Mesh',
      href: '/hizmetler/ai-otomasyon',
      title: language === 'tr' ? 'Kognitif İş Akışı & ERP Entegrasyonu (n8n & API)' : t('services.automation.title'),
      description:
        language === 'tr'
          ? 'n8n, Webhook ve kurumsal ERP/CRM sistemlerinizi konuşturan otonom iş akışları. Fatura kesme, lead kaydetme ve operasyonel veri senkronizasyonunu sıfırlayarak ekibinize haftalık 15+ saat işgücü kazandırır.'
          : t('services.automation.desc'),
      features:
        language === 'tr'
          ? [
              'n8n & Webhook Entegrasyonu (Angaryaları Sıfırlama)',
              'ERP, CRM & Muhasebe Senkronizasyonu (Sıfır İnsan Hatası)',
            ]
          : language === 'de'
          ? [
              'n8n & Webhook-Integration (Routineaufgaben eliminieren)',
              'ERP, CRM & Buchhaltung synchronisiert (Fehlerfrei)',
            ]
          : [
              'n8n & Webhook Integration (Eliminate Busywork)',
              'ERP, CRM & Accounting Sync (Zero Human Errors)',
            ],
      className: 'md:col-span-1',
      metric:
        language === 'tr'
          ? 'Haftalık 15+ Saat Tasarruf'
          : language === 'de'
          ? '15+ Std./Woche Ersparnis'
          : '15+ Hours/Week Saved',
    },
    {
      id: 'web',
      icon: Globe,
      color: '#2563EB',
      glowColor: 'blue' as const,
      badge: language === 'de' ? 'Edge Web & Speed' : language === 'en' ? 'Edge Web & Speed' : 'Sub-Second Edge Web',
      href: '/hizmetler/web-gelistirme',
      title: language === 'tr' ? 'Sub-Second Modern Edge Web & Headless Mimari' : t('services.web.title'),
      description:
        language === 'tr'
          ? 'Global Edge CDN ve headless mimariyle 0.38 saniyede açılan ışık hızında dijital vitrin. Ziyaretçilerin kaçmasını önler ve reklamdan gelen trafiği 3.6 kat daha fazla satışa dönüştürür.'
          : t('services.web.desc'),
      features:
        language === 'tr'
          ? [
              'Sub-Second Yüklenme: 0.38s (Google Lighthouse 99/100)',
              'Conversion UX (3.6x Satış Dönüşüm Çarpanı)',
            ]
          : language === 'de'
          ? [
              'Sub-Second Ladezeit: 0,38s (Google Lighthouse 99/100)',
              'Conversion UX (3,6x höhere Abschlussquote)',
            ]
          : [
              'Sub-Second Load: 0.38s (Google Lighthouse 99/100)',
              'Conversion UX (3.6x Sales Conversion Multiplier)',
            ],
      className: 'md:col-span-1',
      metric:
        language === 'tr'
          ? '0.38s Hız & 3.6x Ciro'
          : language === 'de'
          ? '0,38s Speed & 3,6x Umsatz'
          : '0.38s Speed & 3.6x Revenue',
    },
    {
      id: 'saas',
      icon: Monitor,
      color: '#0891B2',
      glowColor: 'cyan' as const,
      badge: language === 'de' ? 'B2B-Portale & SaaS' : language === 'en' ? 'B2B Portals & SaaS' : 'Özel B2B Portal & SaaS',
      href: '/hizmetler/web-uygulamasi',
      title: language === 'tr' ? 'Özel B2B Müşteri Portalları & Cloud-Native SaaS' : t('services.saas.title'),
      description:
        language === 'tr'
          ? 'PostgreSQL ve Docker tabanlı, sınırsız ölçeklenebilir özel yazılım altyapısı. Müşterilerinize self-servis portal, bayilerinize sipariş paneli sunarak Excel ve telefon karmaşasını sıfırlar.'
          : t('services.saas.desc'),
      features:
        language === 'tr'
          ? [
              'B2B Müşteri & Bayi Self-Servis Portalı (Sıfır Excel)',
              'PostgreSQL & Cloud-Native (%99.9 Uptime & Tam İzolasyon)',
            ]
          : language === 'de'
          ? [
              'B2B Kunden- & Partnerportal (Schluss mit Excel-Listen)',
              'PostgreSQL & Cloud-Native (99.9% Uptime & Isolation)',
            ]
          : [
              'B2B Client & Partner Self-Service Hub (Zero Excel)',
              'PostgreSQL & Cloud-Native (99.9% Uptime SLA)',
            ],
      className: 'md:col-span-1',
      metric:
        language === 'tr'
          ? '%99.9 Uptime & Sıfır Excel'
          : language === 'de'
          ? '99.9% Uptime & 0 Excel'
          : '99.9% Uptime & Zero Excel',
    },
    {
      id: 'marketing',
      icon: Megaphone,
      color: '#D97706',
      glowColor: 'amber' as const,
      badge: language === 'de' ? 'Growth & GEO (AEO)' : language === 'en' ? 'Growth & GEO (AEO)' : 'Growth Marketing & GEO',
      href: '/hizmetler/reklam-sosyal-medya',
      title: language === 'tr' ? 'Veri Odaklı Büyüme & GEO (AI Arama Motoru Optimizasyonu)' : t('services.marketing.title'),
      description:
        language === 'tr'
          ? 'Meta CAPI, Google Ads ve ChatGPT/Perplexity/Claude gibi yapay zeka arama motorlarında markanızı 1. sıraya taşıyan GEO optimizasyonu. Boşa bütçe harcamadan yüksek bütçeli B2B müşterileri doğrudan içeri çeker.'
          : t('services.marketing.desc'),
      features:
        language === 'tr'
          ? [
              'GEO (ChatGPT, Perplexity & Claude AI Arama Hakimiyeti)',
              'Meta CAPI & Google Ads Entegrasyonu (Nokta Atışı B2B Lead)',
            ]
          : language === 'de'
          ? [
              'GEO (Dominanz in ChatGPT, Perplexity & Claude Suche)',
              'Meta CAPI & Google Ads (Server-Side B2B Lead Generierung)',
            ]
          : [
              'GEO (Dominance in ChatGPT, Perplexity & Claude AI Search)',
              'Meta CAPI & Google Ads (Laser-Targeted B2B Inbound)',
            ],
      className: 'md:col-span-2',
      metric:
        language === 'tr'
          ? '5.4x ROAS & AI Arama Lideri'
          : language === 'de'
          ? '5.4x ROAS & KI-Suche-Leader'
          : '5.4x ROAS & AI Search Leader',
    },
  ]

  return (
    <section
      id="services"
      className="section relative overflow-hidden py-24 sm:py-32 bg-[#FAFBFD]"
      aria-label={
        language === 'de'
          ? 'StarWebFlow Dienstleistungen'
          : language === 'en'
          ? 'StarWebFlow Services'
          : 'StarWebFlow Hizmetler'
      }
    >
      {/* Subtle ambient light mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div
          ref={titleRef}
          className={`text-center mb-16 sm:mb-20 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>
              {language === 'tr'
                ? 'Mühendislik & Verimlilik Mimarisi'
                : language === 'de'
                ? 'Ingenieurskunst & Effizienz-Architektur'
                : 'Engineering & Efficiency Architecture'}
            </span>
          </div>

          <h2 className="heading-lg text-slate-900 mt-2 mb-4 tracking-tight">
            {language === 'tr' ? (
              <>
                Sadece Web Sitesi Değil,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-black">
                  Verimlilik Makinesi
                </span>{' '}
                Kuruyoruz
              </>
            ) : language === 'de' ? (
              <>
                Nicht nur eine Website, wir bauen eine{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-black">
                  Effizienzmaschine
                </span>
              </>
            ) : (
              <>
                Not Just a Website, We Build an{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-black">
                  Efficiency Machine
                </span>
              </>
            )}
          </h2>

          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            {language === 'tr' ? (
              <>
                Geleneksel ajanslar size hizmet satar; biz size{' '}
                <span className="text-slate-900 font-bold">
                  operasyonel güç ve ROI
                </span>{' '}
                satıyoruz.
              </>
            ) : language === 'de' ? (
              <>
                Klassische Agenturen verkaufen Ihnen Dienstleistungen; wir verkaufen Ihnen{' '}
                <span className="text-slate-900 font-bold">
                  operative Stärke und messbaren ROI
                </span>
                .
              </>
            ) : (
              <>
                Traditional agencies sell you services; we sell you{' '}
                <span className="text-slate-900 font-bold">
                  operational power and measurable ROI
                </span>
                .
              </>
            )}
          </p>
        </div>

        {/* High-Impact Bento Grid */}
        <div className="grid md:grid-cols-3 auto-rows-auto gap-6 sm:gap-8">
          {services.map((service, i) => (
            <ServiceBentoCard
              key={service.id}
              service={service}
              index={i}
              language={language}
            />
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div
          className={`text-center mt-16 sm:mt-20 transition-all duration-700 delay-500 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            href="/#services"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(37,99,235,0.3)] group"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            }}
          >
            <Zap className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <span className="tracking-wide">
              {language === 'tr'
                ? 'Tüm Hizmet Ekosistemini İncele'
                : language === 'de'
                ? 'Alle Leistungen ansehen'
                : 'Explore All Services'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" aria-hidden="true" />
          </Link>

          <p className="mt-3.5 text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'tr'
              ? 'Ücretsiz teknik mimari analizi · Taahhüt gerektirmez · 24 saat içinde yanıt'
              : language === 'de'
              ? 'Kostenlose Architekturanalyse · Unverbindlich · Antwort innerhalb von 24h'
              : 'Free architecture audit · No commitment · 24h response'}
          </p>
        </div>
      </div>
    </section>
  )
}
