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
  Workflow,
  ShieldCheck,
  Activity,
  FileCheck2,
  Search,
  BarChart3,
  PhoneCall,
  Users,
  Layers
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ─── INTERACTIVE VISUAL 1: 7/24 AI DIGITAL EMPLOYEES & VOICE AGENTS ──────────
function AIAgentsInteractiveVisual({ language }: { language: string }) {
  const [activeStep, setActiveStep] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 3600)
    return () => clearInterval(timer)
  }, [paused])

  const scenarios = [
    {
      channel:
        language === 'tr'
          ? 'Telefon & Sesli Asistan · Gece 03:15'
          : language === 'de'
          ? 'KI-Telefonassistent · 03:15 Uhr'
          : 'Voice AI Receptionist · 03:15 AM',
      userMsg:
        language === 'tr'
          ? '“Merhaba, 50 kişilik ekibimiz için kurumsal paket fiyatlarınızı öğrenebilir miyim? Yarın görüşebilir miyiz?”'
          : language === 'de'
          ? '„Hallo, was kostet das Paket für 50 Mitarbeiter? Können wir morgen sprechen?“'
          : '“Hi, can I get pricing for our 50-person team and book a call for tomorrow?”',
      aiProcess:
        language === 'tr'
          ? 'Şirket Bilgi Bankası Tarandı · Müşteri Bütçesi Analiz Edildi · Uygun Randevu Saati Bulundu'
          : language === 'de'
          ? 'Firmendaten geprüft · Budget analysiert · Freier Kalenderslot gefunden'
          : 'Company Knowledge Scanned · Budget Qualified · Open Calendar Slot Found',
      action:
        language === 'tr'
          ? 'Sesli Yanıt Verildi ➔ WhatsApp’tan PDF Teklif Gönderildi & Yarına Randevu İşlendi'
          : language === 'de'
          ? 'Per Stimme beantwortet ➔ PDF-Angebot via WhatsApp & Termin im Kalender gebucht'
          : 'Answered by Voice ➔ PDF Quote Sent via WhatsApp & Meeting Booked in Calendar',
      badge:
        language === 'tr'
          ? '🔥 Sıcak Satış Fırsatı Yakalandı'
          : language === 'de'
          ? '🔥 Qualifizierter Deal gesichert'
          : '🔥 High-Value Lead Captured',
      speed: '0.8s',
    },
    {
      channel:
        language === 'tr'
          ? 'WhatsApp, Instagram & Web Canlı Destek'
          : language === 'de'
          ? 'WhatsApp, Instagram & Live-Chat'
          : 'WhatsApp, Instagram & Web Live Chat',
      userMsg:
        language === 'tr'
          ? '“Stokta bu ürünün 200 adet toptan teslimatı var mı? Özel iskonto uyguluyor musunuz?”'
          : language === 'de'
          ? '„Haben Sie 200 Stück auf Lager und gibt es einen B2B-Mengenrabatt?“'
          : '“Do you have 200 units in stock for wholesale, and what is the bulk discount?”',
      aiProcess:
        language === 'tr'
          ? 'Canlı Stok & Fiyat Listesi Kontrol Edildi · Toptan İskonto Oranı Otomatik Hesaplandı'
          : language === 'de'
          ? 'Live-Bestand & Preisliste geprüft · B2B-Rabatt automatisch berechnet'
          : 'Live Inventory & Price List Checked · Wholesale Discount Auto-Calculated',
      action:
        language === 'tr'
          ? 'Anında Sipariş Bağlantısı İletildi ➔ Müşteri Kartı CRM’e Otomatik Kaydedildi'
          : language === 'de'
          ? 'Sofort-Bestelllink gesendet ➔ Kundenprofil automatisch im CRM angelegt'
          : 'Instant Checkout Link Sent ➔ Customer Profile Auto-Saved to CRM',
      badge:
        language === 'tr'
          ? '⚡ 0 Saniye Bekleme Süresi'
          : language === 'de'
          ? '⚡ 0 Sekunden Wartezeit'
          : '⚡ Zero Waiting Time',
      speed: '0.7s',
    },
    {
      channel:
        language === 'tr'
          ? 'Kurumsal E-Posta & Teklif Talepleri'
          : language === 'de'
          ? 'B2B E-Mail & Angebotsanfragen'
          : 'Corporate Email & Quote Requests',
      userMsg:
        language === 'tr'
          ? '“Verilerimiz şirket dışına çıkmadan, kendi sunucumuzda güvenli yapay zeka kurulumu istiyoruz.”'
          : language === 'de'
          ? '„Wir benötigen eine 100% DSGVO-konforme KI-Lösung auf unseren eigenen Servern.“'
          : '“We need a 100% private AI solution running on our own servers with full data privacy.”',
      aiProcess:
        language === 'tr'
          ? 'Hibrit & Yerel (On-Premise / Local LLM) Mimari Eşleştirildi · Kurumsal Teklif Hazırlandı'
          : language === 'de'
          ? 'Hybrid & On-Premise KI-Architektur zugeordnet · Maßgeschneidertes Angebot erstellt'
          : 'Hybrid & Private Local AI Architecture Matched · Custom Proposal Generated',
      action:
        language === 'tr'
          ? 'Kişiselleştirilmiş Sözleşme Taslağı Gönderildi ➔ Satış Ekibine Anlık Bildirim'
          : language === 'de'
          ? 'Individuelles Angebot versendet ➔ Sofort-Benachrichtigung an Vertriebsteam'
          : 'Custom Proposal Dispatched ➔ Instant Priority Alert Sent to Sales Team',
      badge:
        language === 'tr'
          ? '🔒 %100 Veri Gizliliği Garantisi'
          : language === 'de'
          ? '🔒 100% Datenschutz-Garantie'
          : '🔒 100% Data Privacy Guaranteed',
      speed: '0.9s',
    },
  ]

  const current = scenarios[activeStep]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="w-full my-5 rounded-2xl bg-gradient-to-b from-purple-50/90 via-white to-indigo-50/40 border border-purple-200/90 p-4 sm:p-5 shadow-[0_8px_30px_-6px_rgba(124,58,237,0.12)] relative overflow-hidden"
    >
      {/* Ambient Soft Glow */}
      <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3.5 border-b border-purple-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="font-mono font-extrabold text-purple-950 tracking-wide">
            {language === 'tr'
              ? 'CANLI DİJİTAL ÇALIŞAN SİMÜLASYONU'
              : language === 'de'
              ? 'LIVE KI-MITARBEITER SIMULATION'
              : 'LIVE AI EMPLOYEE SIMULATION'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-semibold border border-purple-200">
            {language === 'tr'
              ? 'Bulut AI + Yerel (Local) AI Gücü'
              : language === 'de'
              ? 'Cloud-KI + Lokale (On-Premise) KI'
              : 'Cloud AI + Private Local AI'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            ⚡ {current.speed} {language === 'tr' ? 'Anında Yanıt' : language === 'de' ? 'Antwort' : 'Response'}
          </span>
          <span className="text-purple-800 font-bold hidden sm:inline">
            {language === 'tr' ? '7/24 Kesintisiz' : language === 'de' ? '24/7 Aktiv' : '24/7 Non-Stop'}
          </span>
        </div>
      </div>

      {/* Main 12-Col Interactive Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: Interactive Channel Selector */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 justify-between">
          {[
            {
              name:
                language === 'tr'
                  ? 'Sesli Telefon Asistanı'
                  : language === 'de'
                  ? 'KI-Telefonassistent'
                  : 'Voice Phone Assistant',
              sub: language === 'tr' ? 'Aramaları Karşılar' : 'Answers Calls 24/7',
              icon: PhoneCall,
              idx: 0,
            },
            {
              name: 'WhatsApp & Instagram',
              sub: language === 'tr' ? 'Anında Mesaj & Satış' : 'Instant Chat & Sales',
              icon: MessageSquare,
              idx: 1,
            },
            {
              name:
                language === 'tr'
                  ? 'E-Posta & Teklif'
                  : language === 'de'
                  ? 'E-Mail & Angebote'
                  : 'Email & Proposals',
              sub: language === 'tr' ? 'Otomatik Dosya/PDF' : 'Auto Quote & PDF',
              icon: Send,
              idx: 2,
            },
          ].map((ch) => {
            const Icon = ch.icon
            const isActive = activeStep === ch.idx
            return (
              <button
                key={ch.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveStep(ch.idx)
                }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-300 border flex-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white border-purple-700 shadow-[0_6px_18px_rgba(124,58,237,0.28)] scale-[1.01]'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-purple-300 shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold truncate">{ch.name}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-purple-100' : 'text-slate-400'
                    }`}
                  >
                    {ch.sub}
                  </div>
                </div>
                {isActive && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Center: Live Conversation & Action */}
        <div className="lg:col-span-6 bg-white rounded-xl p-3.5 border border-purple-200/80 shadow-sm flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-purple-800 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              {current.channel}
            </span>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-extrabold">
              {current.badge}
            </span>
          </div>

          {/* Customer Message */}
          <div className="text-xs text-slate-800 font-medium italic bg-slate-50/90 p-2.5 rounded-lg border border-slate-200/70 leading-relaxed">
            {current.userMsg}
          </div>

          {/* AI Reasoning */}
          <div className="flex items-start gap-2 text-[11px] text-purple-950 bg-purple-50/90 border border-purple-200 px-2.5 py-2 rounded-lg">
            <Cpu className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
            <span className="leading-snug font-semibold">{current.aiProcess}</span>
          </div>

          {/* Result Action */}
          <div className="flex items-center gap-2 text-[11px] text-emerald-950 bg-emerald-50/90 border border-emerald-300 px-2.5 py-2 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="leading-tight truncate font-bold">{current.action}</span>
          </div>
        </div>

        {/* Right: Concrete Business Outcomes */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 justify-between">
          {[
            {
              title:
                language === 'tr'
                  ? 'Takvime Onaylı Randevu'
                  : language === 'de'
                  ? 'Gebuchte Termine'
                  : 'Confirmed Meetings',
              sub:
                language === 'tr'
                  ? 'Otomatik Toplantı Kaydı'
                  : language === 'de'
                  ? 'Automatisch im Kalender'
                  : 'Auto-Synced to Calendar',
              icon: Calendar,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50/90 border-emerald-200',
            },
            {
              title:
                language === 'tr'
                  ? 'Sıfır Tekel (Esnek AI)'
                  : language === 'de'
                  ? 'Flexible KI-Auswahl'
                  : 'Flexible Multi-AI',
              sub:
                language === 'tr'
                  ? 'GPT, Claude, Gemini & Local AI'
                  : 'GPT, Claude, Gemini & Local',
              icon: Layers,
              color: 'text-purple-700',
              bg: 'bg-purple-50/90 border-purple-200',
            },
            {
              title:
                language === 'tr'
                  ? '%100 Veri Güvenliği'
                  : language === 'de'
                  ? '100% Datensicherheit'
                  : '100% Data Privacy',
              sub:
                language === 'tr'
                  ? 'Şirket İçi Kurulum İmkanı'
                  : language === 'de'
                  ? 'On-Premise Option (DSGVO)'
                  : 'Private Server Option',
              icon: ShieldCheck,
              color: 'text-blue-700',
              bg: 'bg-blue-50/90 border-blue-200',
            },
          ].map((out) => {
            const Icon = out.icon
            return (
              <div
                key={out.title}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${out.bg} border text-slate-900 shadow-xs flex-1`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${out.color}`} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">{out.title}</div>
                  <div className="text-[10px] text-slate-600 truncate">{out.sub}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-purple-100 h-1.5 rounded-full mt-3.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${((activeStep + 1) / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ─── INTERACTIVE VISUAL 2: WORKFLOW AUTOMATION & ERP SYNC ────────────────────
function AutomationInteractiveVisual({ language }: { language: string }) {
  const [activeTask, setActiveTask] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTask((prev) => (prev + 1) % 3)
    }, 3200)
    return () => clearInterval(timer)
  }, [])

  const payloads = [
    {
      name:
        language === 'tr'
          ? 'Sipariş Geldi ➔ Otomatik Fatura Kesildi & Muhasebeye İşlendi'
          : language === 'de'
          ? 'Bestellung ➔ Rechnung automatisch erstellt & verbucht'
          : 'New Order ➔ Auto-Invoiced & Synced to Accounting',
      stat: language === 'tr' ? '0 İnsan Hatası' : '0 Errors',
    },
    {
      name:
        language === 'tr'
          ? 'Form Dolduruldu ➔ CRM Kaydı Açıldı & Satış Ekibine Bildirildi'
          : language === 'de'
          ? 'Formular ➔ CRM-Eintrag & Slack-Info an Vertrieb'
          : 'Web Lead ➔ CRM Deal Created & Sales Team Alerted',
      stat: '0.14 Sn',
    },
    {
      name:
        language === 'tr'
          ? 'Haftalık Raporlar & Stok Durumu ➔ Yöneticinin WhatsApp’ına İletildi'
          : language === 'de'
          ? 'Wochenbericht & Bestand ➔ Automatisch per WhatsApp an CEO'
          : 'Weekly KPI & Stock Summary ➔ Sent to CEO via WhatsApp',
      stat: '+18 Saat/Hafta',
    },
  ]

  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-emerald-50/85 to-white border border-emerald-200/90 p-3.5 shadow-[0_6px_24px_-4px_rgba(5,150,105,0.1)] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-emerald-100 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Workflow className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-bold text-emerald-950 truncate">
            {language === 'tr'
              ? 'OTOMATİK İŞ AKIŞI MERKEZİ'
              : language === 'de'
              ? 'AUTOMATISIERUNGS-ENGINE'
              : 'WORKFLOW AUTOMATION HUB'}
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold shrink-0">
          {language === 'tr' ? 'Sıfır Angarya' : language === 'de' ? 'Keine Routinearbeit' : 'Zero Busywork'}
        </span>
      </div>

      {/* Nodes Chain */}
      <div className="flex items-center justify-between gap-1 relative my-2.5">
        {/* Node 1 */}
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-emerald-200 flex-1 shadow-xs">
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-900 font-bold leading-tight">
            {language === 'tr' ? 'Müşteri / Sipariş' : language === 'de' ? 'Kunde / Auftrag' : 'Lead / Order'}
          </span>
          <span className="text-[9px] text-slate-500 leading-none mt-0.5 font-medium">
            {language === 'tr' ? 'Web, Mail, WhatsApp' : 'Web, Mail, WhatsApp'}
          </span>
        </div>

        {/* Connector 1 */}
        <div className="flex-1 max-w-[24px] h-1 bg-emerald-100 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500 animate-[slideRight_1.4s_infinite_linear]" />
        </div>

        {/* Node 2 */}
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex-1 shadow-[0_4px_14px_rgba(5,150,105,0.3)]">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white mb-1 animate-[spin_8s_linear_infinite]">
            <Cog className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-white font-extrabold leading-tight">
            {language === 'tr' ? 'Akıllı Otomasyon' : language === 'de' ? 'KI-Workflow' : 'AI Automation'}
          </span>
          <span className="text-[9px] text-emerald-100 leading-none mt-0.5">
            {language === 'tr' ? 'Anında İşleme' : 'Instant Processing'}
          </span>
        </div>

        {/* Connector 2 */}
        <div className="flex-1 max-w-[24px] h-1 bg-emerald-100 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-emerald-500 animate-[slideRight_1.4s_infinite_linear_0.7s]" />
        </div>

        {/* Node 3 */}
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-emerald-200 flex-1 shadow-xs">
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
            <Database className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-900 font-bold leading-tight">
            {language === 'tr' ? 'ERP, CRM & Fatura' : language === 'de' ? 'ERP, CRM & Rechnung' : 'ERP, CRM & Invoice'}
          </span>
          <span className="text-[9px] text-slate-500 leading-none mt-0.5 font-medium">
            {language === 'tr' ? 'Otomatik Kayıt' : 'Auto-Synced'}
          </span>
        </div>
      </div>

      {/* Live Task Ticker */}
      <div className="mt-2 bg-emerald-950 text-emerald-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px]">
        <span className="truncate flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          {payloads[activeTask].name}
        </span>
        <span className="text-emerald-300 font-bold shrink-0 ml-2 font-mono">
          {payloads[activeTask].stat}
        </span>
      </div>
    </div>
  )
}

// ─── INTERACTIVE VISUAL 3: ULTRA-FAST WEB & CONVERSION ARCHITECTURE ──────────
function WebEcosystemInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-blue-50/85 to-white border border-blue-200/90 p-3.5 shadow-[0_6px_24px_-4px_rgba(37,99,235,0.1)] relative overflow-hidden">
      {/* Browser Chrome Bar */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-blue-100 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-[10px] font-mono text-blue-950 border border-blue-200 shadow-2xs font-bold truncate">
            <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
            sirketiniz.com
          </div>
        </div>
        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
          {language === 'tr' ? '0.38 Sn Açılış Hızı' : language === 'de' ? '0,38s Ladezeit' : '0.38s Load Speed'}
        </span>
      </div>

      {/* Speed & Google Scoreboard */}
      <div className="flex items-center justify-between gap-2 my-2 bg-white p-2.5 rounded-lg border border-blue-100 shadow-xs">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
            {language === 'tr' ? 'Satışa Dönüşüm Etkisi' : language === 'de' ? 'Umsatz-Steigerung' : 'Conversion Impact'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono">
              3.6x
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700">
              {language === 'tr' ? 'Daha Fazla Müşteri' : language === 'de' ? 'Mehr Anfragen' : 'More Sales'}
            </span>
          </div>
        </div>

        {/* 4 Google 100/100 Badges */}
        <div className="flex items-center gap-1.5">
          {[
            { label: language === 'tr' ? 'HIZ' : 'SPEED', val: '100' },
            { label: 'SEO', val: '100' },
            { label: 'UX', val: '100' },
            { label: language === 'tr' ? 'GÜVEN' : 'TRUST', val: '100' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-700 border-2 border-emerald-500 bg-emerald-50 shadow-2xs">
                {item.val}
              </div>
              <span className="text-[8px] font-mono text-slate-600 mt-0.5 font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Comparison Bar */}
      <div className="mt-2 bg-blue-950 text-blue-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1.5 truncate font-medium">
          <FileCheck2 className="w-3 h-3 text-blue-400 shrink-0" />
          {language === 'tr'
            ? 'Müşteri Beklemez, Siteden Kaçmaz, Doğrudan Teklif İster'
            : language === 'de'
            ? 'Keine Ladeverzögerung – Besucher werden direkt zu Kunden'
            : 'Zero Bounce Rate — Turns Visitors Into Paying Clients'}
        </span>
      </div>
    </div>
  )
}

// ─── INTERACTIVE VISUAL 4: B2B DEALER PORTAL & CUSTOM SOFTWARE ───────────────
function CloudSaaSInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-cyan-50/85 to-white border border-cyan-200/90 p-3.5 shadow-[0_6px_24px_-4px_rgba(8,145,178,0.1)] relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-cyan-100 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Monitor className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
          <span className="font-bold text-cyan-950 truncate">
            {language === 'tr'
              ? 'MÜŞTERİ & BAYİ YÖNETİM PANELİ'
              : language === 'de'
              ? 'KUNDEN- & HÄNDLERPORTAL'
              : 'CLIENT & DEALER PORTAL'}
          </span>
        </div>
        <span className="text-[10px] text-cyan-900 bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded-full font-bold shrink-0">
          {language === 'tr' ? 'Excel’e Son' : language === 'de' ? 'Kein Excel mehr' : 'Zero Excel'}
        </span>
      </div>

      {/* Portal Benefits Grid */}
      <div className="grid grid-cols-3 gap-2 my-2">
        <div className="bg-white p-2 rounded-lg border border-cyan-200 text-center shadow-2xs">
          <div className="text-[9px] text-slate-500 font-bold uppercase">
            {language === 'tr' ? 'Bayi & Müşteri' : language === 'de' ? 'Kunden & Partner' : 'Clients & Dealers'}
          </div>
          <div className="text-xs font-extrabold text-cyan-900 mt-0.5">
            {language === 'tr' ? 'Online Sipariş' : language === 'de' ? 'Self-Service' : 'Self-Service'}
          </div>
          <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
            {language === 'tr' ? '7/24 Panel' : '24/7 Portal'}
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-cyan-200 text-center shadow-2xs">
          <div className="text-[9px] text-slate-500 font-bold uppercase">
            {language === 'tr' ? 'Yönetim' : language === 'de' ? 'Steuerung' : 'Management'}
          </div>
          <div className="text-xs font-extrabold text-cyan-900 mt-0.5">
            {language === 'tr' ? 'Tek Ekran' : language === 'de' ? '1 Dashboard' : '1 Dashboard'}
          </div>
          <div className="text-[9px] text-emerald-700 font-bold mt-0.5">
            {language === 'tr' ? 'Canlı Stok/Cari' : 'Live Tracking'}
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-cyan-200 text-center shadow-2xs">
          <div className="text-[9px] text-slate-500 font-bold uppercase">
            {language === 'tr' ? 'Altyapı' : language === 'de' ? 'System' : 'System'}
          </div>
          <div className="text-xs font-extrabold text-cyan-900 mt-0.5">
            {language === 'tr' ? 'Size Özel' : language === 'de' ? 'Maßarbeit' : 'Custom Built'}
          </div>
          <div className="text-[9px] text-amber-700 font-extrabold mt-0.5">
            %99.9 Açık
          </div>
        </div>
      </div>

      {/* Live Executive Summary Bar */}
      <div className="mt-2 bg-cyan-950 text-cyan-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1.5 truncate font-medium">
          <Activity className="w-3 h-3 text-cyan-400 shrink-0" />
          {language === 'tr'
            ? 'Telefon ve WhatsApp Sipariş Karmaşasını Bitiren Özel Sistem'
            : language === 'de'
            ? 'Beendet das Chaos aus Excel-Listen und Telefonbestellungen'
            : 'Replaces Chaotic Spreadsheets & Phone Orders With One Portal'}
        </span>
      </div>
    </div>
  )
}

// ─── INTERACTIVE VISUAL 5: ADS, SEO & AI SEARCH (GEO) DOMINANCE ──────────────
function GrowthMarketingInteractiveVisual({ language }: { language: string }) {
  return (
    <div className="w-full my-4 rounded-xl bg-gradient-to-b from-amber-50/85 via-white to-orange-50/30 border border-amber-200/90 p-4 shadow-[0_6px_24px_-4px_rgba(217,119,6,0.1)] relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-amber-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span className="font-extrabold text-amber-950">
            {language === 'tr'
              ? 'MÜŞTERİ KAZANIM & AI ARAMA (GEO) KOKPİTİ'
              : language === 'de'
              ? 'KUNDENGEWINNUNG & KI-SUCHE (GEO) COCKPIT'
              : 'CUSTOMER ACQUISITION & AI SEARCH (GEO) COCKPIT'}
          </span>
        </div>
        <div className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
          5.4x {language === 'tr' ? 'Reklam Getirisi (ROAS)' : 'ROAS (+340% Leads)'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        {/* Left: Channels */}
        <div className="md:col-span-6 flex flex-col gap-1.5">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs shadow-2xs">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold truncate">
              <Search className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ChatGPT, Perplexity & Google AI
            </span>
            <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0">
              {language === 'tr' ? '#1 Önerilen Marka' : language === 'de' ? '#1 Empfehlung' : '#1 Recommended'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs shadow-2xs">
            <span className="flex items-center gap-1.5 text-slate-800 font-semibold truncate">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Google Ads & Meta (Instagram/FB)
            </span>
            <span className="text-emerald-700 text-[11px] font-extrabold shrink-0">
              {language === 'tr' ? 'Nokta Atışı Müşteri' : language === 'de' ? 'Kaufbereite Leads' : 'High-Intent Buyers'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200 text-xs shadow-2xs">
            <span className="flex items-center gap-1.5 text-slate-800 font-semibold truncate">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {language === 'tr'
                ? 'Müşteri Edinme Maliyeti'
                : language === 'de'
                ? 'Kundenakquise-Kosten'
                : 'Customer Acquisition Cost'}
            </span>
            <span className="text-emerald-700 text-[11px] font-extrabold shrink-0">
              {language === 'tr' ? '%45 Daha Düşük Maliyet' : language === 'de' ? '-45% Günstiger' : '-45% Lower Cost'}
            </span>
          </div>
        </div>

        {/* Right: Dynamic Growth SVG Curve */}
        <div className="md:col-span-6 relative flex flex-col justify-between bg-white rounded-xl p-3 border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-slate-600 mb-1">
            <span className="font-bold text-slate-800">
              {language === 'tr'
                ? 'Nitelikli Müşteri & Satış Artış Grafiği'
                : language === 'de'
                ? 'Qualifizierte Anfragen & Umsatzwachstum'
                : 'Qualified Leads & Revenue Growth'}
            </span>
            <span className="text-emerald-700 font-extrabold font-mono">+340%</span>
          </div>

          <svg className="w-full h-20 overflow-visible" viewBox="0 0 200 60">
            <defs>
              <linearGradient id="growthGradientRoyal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M0,55 Q50,50 100,28 T200,6 L200,60 L0,60 Z"
              fill="url(#growthGradientRoyal)"
            />
            <path
              d="M0,55 Q50,50 100,28 T200,6"
              fill="none"
              stroke="rgba(245, 158, 11, 0.35)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M0,55 Q50,50 100,28 T200,6"
              fill="none"
              stroke="#D97706"
              strokeWidth="3.5"
            />
            <circle cx="100" cy="28" r="3.5" fill="#D97706" />
            <circle cx="200" cy="6" r="6" fill="#F59E0B" className="animate-ping opacity-75" />
            <circle cx="200" cy="6" r="4.5" fill="#D97706" />
            <circle cx="200" cy="6" r="2" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pt-2.5 mt-2.5 border-t border-amber-100">
        <span className="text-amber-950 font-bold">
          {language === 'tr'
            ? '🎯 Müşteriler Google veya ChatGPT’de Sektörünüzü Aradığında İlk Sizin Markanız Çıkar'
            : language === 'de'
            ? '🎯 Wenn Kunden auf Google oder ChatGPT suchen, steht Ihre Marke auf Platz 1'
            : '🎯 When Buyers Search Google or Ask ChatGPT, Your Brand Appears #1'}
        </span>
        <span className="text-emerald-700 font-extrabold">
          {language === 'tr' ? 'Boşa Giden Bütçe Yok' : language === 'de' ? '0% Streuverlust' : 'Zero Wasted Budget'}
        </span>
      </div>
    </div>
  )
}

// ─── SINGLE SERVICE BENTO CARD COMPONENT ─────────────────────────────────────
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
  const [visible, setVisible] = useState(true)

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
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <Link href={service.href} className="block h-full group">
        <GlowCard
          glowColor={service.glowColor}
          className="p-6 sm:p-8 h-full cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05),0_10px_35px_-8px_rgba(0,0,0,0.04)] relative overflow-hidden"
        >
          {/* Subtle top-right ambient colored tint */}
          <div
            className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none"
            style={{ background: service.color }}
          />

          <div>
            {/* Card Header: Icon + Clear Business Badge + AI Engine Sub-pill */}
            <div className="flex flex-wrap justify-between items-start gap-2 mb-5">
              <div
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden shadow-sm"
                style={{
                  background: `${service.color}14`,
                  border: `1px solid ${service.color}38`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${service.color}, transparent)`,
                  }}
                />
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 transition-colors duration-300"
                  style={{ color: service.color }}
                />
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-2xs"
                  style={{
                    background: `${service.color}15`,
                    color: service.color,
                    border: `1px solid ${service.color}35`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: service.color }} />
                  {service.badge}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {service.techPower}
                </span>
              </div>
            </div>

            {/* Crystal-Clear Customer-Facing Title */}
            <h3 className="heading-md text-slate-900 mb-2.5 transition-colors group-hover:text-blue-700">
              {service.title}
            </h3>

            {/* Clear, Persuasive Business Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-3.5 font-normal">
              {service.description}
            </p>

            {/* Executive Value / AHA Callout Box */}
            <div
              className="rounded-xl px-3.5 py-2.5 mb-2 text-xs font-semibold leading-relaxed flex items-start gap-2 border"
              style={{
                background: `${service.color}08`,
                borderColor: `${service.color}28`,
                color: '#0F172A',
              }}
            >
              <Sparkles
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: service.color }}
              />
              <span>{service.ahaPitch}</span>
            </div>
          </div>

          {/* --- INTERACTIVE VISUAL CANVASES --- */}
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
                <Zap className="w-4 h-4 shrink-0" />
                <span>{service.metric}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-xs font-bold shrink-0 ml-2">
                {language === 'tr' ? 'Detayları Gör' : language === 'de' ? 'Details' : 'Explore'}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </div>
          </div>
        </GlowCard>
      </Link>
    </div>
  )
}

// ─── MAIN SERVICES SECTION ───────────────────────────────────────────────────
export default function ServicesSection() {
  const { language } = useLanguage()
  const titleRef = useRef<HTMLDivElement>(null)
  const [titleVisible, setTitleVisible] = useState(true)

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
      { threshold: 0.15 }
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
      badge:
        language === 'de'
          ? '24/7 KI-Vertrieb & Telefon'
          : language === 'en'
          ? '24/7 AI Sales & Voice Agent'
          : '7/24 AI Satış & Sesli Asistan',
      techPower:
        language === 'tr'
          ? 'Bulut AI + Kurum İçi Özel (Local LLM) Altyapı'
          : language === 'de'
          ? 'Cloud-KI + Eigene Lokale KI (DSGVO)'
          : 'Cloud AI + Private Local LLM Engine',
      href: '/hizmetler/ai-agents',
      title:
        language === 'tr'
          ? '7/24 Konuşan AI Satış Temsilcileri & Sesli Müşteri Asistanları'
          : language === 'de'
          ? '24/7 KI-Vertriebsmitarbeiter & Intelligente Telefonassistenten'
          : '24/7 AI Sales Representatives & Voice Customer Assistants',
      description:
        language === 'tr'
          ? 'Telefon aramalarınızı, WhatsApp, Instagram ve web sitesi mesajlarınızı gece 03:00’te bile insan doğallığında karşılayan dijital çalışanlar. Müşterinizin sorusunu anlar, fiyat teklifi sunar ve onaylı randevuyu doğrudan takviminize işler.'
          : language === 'de'
          ? 'Digitale Mitarbeiter, die Telefonanrufe, WhatsApp und Website-Chats rund um die Uhr in natürlicher Sprache beantworten. Sie beraten Kunden, senden Angebote und buchen bestätigte Termine direkt in Ihren Kalender.'
          : 'Digital team members that answer phone calls, WhatsApp, and website chats 24/7 with human-like fluency. They qualify buyers, send custom quotes, and book confirmed meetings straight into your calendar.',
      ahaPitch:
        language === 'tr'
          ? 'Neden Farklıyız? Sizi tek bir yapay zeka markasına veya aylık yüksek mesaj faturalarına mahkum etmiyoruz. İster en güçlü global AI modellerini, ister verileriniz şirket dışına çıkmadan kendi sunucunuzda çalışan Özel Yerel AI (Local LLM) sistemimizi kullanın.'
          : language === 'de'
          ? 'Unser Vorteil: Keine Abhängigkeit von einem einzelnen KI-Anbieter. Nutzen Sie führende Cloud-KI oder unsere lokale On-Premise-KI direkt auf Ihren eigenen Servern – ohne laufende Token-Kosten und 100% DSGVO-konform.'
          : 'Unfair Advantage: Zero lock-in to a single AI vendor. Run top global models or deploy our Private Local LLM on your own servers with zero per-message fees and 100% data privacy.',
      features:
        language === 'tr'
          ? [
              'Telefon, WhatsApp, Instagram ve Web’de 7/24 Anında Karşılama & Satış',
              'Teklif Hazırlama, Takvime Randevu İşleme ve CRM’e Otomatik Müşteri Kaydı',
              'Kurum İçi Özel AI (Local LLM / On-Premise) veya Hibrit Bulut Seçeneği (%100 KVKK/GDPR)',
            ]
          : language === 'de'
          ? [
              '24/7 Kundenbetreuung & Verkauf über Telefon, WhatsApp, Instagram & Web',
              'Automatische Angebotserstellung, Terminbuchung & CRM-Synchronisation',
              'Wahlweise Cloud-Hybrid oder eigene lokale KI (100% DSGVO-Datensouveränität)',
            ]
          : [
              '24/7 Instant Reception & Sales Across Phone, WhatsApp, Instagram & Web',
              'Automated Quote Generation, Calendar Booking & CRM Lead Sync',
              'Choice of Hybrid Cloud or Private Local LLM Server (100% GDPR Sovereignty)',
            ],
      className: 'md:col-span-2 md:row-span-2',
      metric:
        language === 'tr'
          ? '%60+ Maliyet Tasarrufu & Sıfır Kaçan Müşteri'
          : language === 'de'
          ? '60%+ Kostenersparnis & 0 Verlorene Anfragen'
          : '60%+ Cost Savings & Zero Missed Leads',
    },
    {
      id: 'automation',
      icon: Cog,
      color: '#059669',
      glowColor: 'emerald' as const,
      badge:
        language === 'de'
          ? 'Prozess- & ERP-Automatisierung'
          : language === 'en'
          ? 'Workflow & ERP Automation'
          : 'İş Akışı & Sistem Entegrasyonu',
      techPower:
        language === 'tr'
          ? 'n8n + ERP / Muhasebe + Akıllı AI Motoru'
          : language === 'de'
          ? 'n8n + ERP / Buchhaltung + KI'
          : 'n8n + ERP / CRM + AI Workflow',
      href: '/hizmetler/ai-otomasyon',
      title:
        language === 'tr'
          ? 'İş Süreçleri Otomasyonu & ERP / CRM Entegrasyonu'
          : language === 'de'
          ? 'Geschäftsprozess-Automatisierung & ERP / CRM Integration'
          : 'Business Process Automation & ERP / CRM Integration',
      description:
        language === 'tr'
          ? 'Kullandığınız muhasebe, ERP, CRM, e-posta ve WhatsApp sistemlerini birbirine bağlayarak tüm kopyala-yapıştır angaryalarını bitiriyoruz. Fatura kesme, sipariş aktarma ve müşteri takibi insan eli değmeden otomatik yürür.'
          : language === 'de'
          ? 'Wir verbinden Ihr ERP, CRM, Ihre Buchhaltung und WhatsApp zu einem vollautomatischen System. Rechnungen, Aufträge und Kundendaten werden ohne manuelles Abtippen fehlerfrei synchronisiert.'
          : 'We connect your ERP, accounting, CRM, email, and WhatsApp into one self-running workflow. Invoicing, order routing, and data entry happen automatically without human copy-pasting.',
      ahaPitch:
        language === 'tr'
          ? 'Net Kazanç: Ekibinizin her gün saatlerce uğraştığı evrak, fatura ve veri girişi işlerini saniyeler içinde sıfır insan hatasıyla tamamlar.'
          : language === 'de'
          ? 'Ihr Gewinn: Eliminiert stundenlange manuelle Dateneingaben und Übertragungsfehler in Sekundenbruchteilen.'
          : 'Bottom-Line Impact: Eliminates hours of repetitive manual data entry and human copy-paste errors in milliseconds.',
      features:
        language === 'tr'
          ? [
              'Fatura, Sipariş, Teklif ve Raporlamaların Tamamen Otomatikleşmesi',
              'Mevcut Yazılımlarınızla (SAP, Logo, Mikro, HubSpot vb.) Kusursuz Konuşma',
            ]
          : language === 'de'
          ? [
              'Vollautomatische Rechnungs-, Auftrags- und Berichtserstellung',
              'Nahtlose Anbindung an Ihre bestehenden Systeme (SAP, DATEV, HubSpot etc.)',
            ]
          : [
              'End-to-End Automated Invoicing, Order Processing & Executive Reporting',
              'Seamless Integration With Your Existing ERP, Accounting & CRM Stack',
            ],
      className: 'md:col-span-1',
      metric:
        language === 'tr'
          ? 'Haftalık 15+ Saat Net Zaman Kazancı'
          : language === 'de'
          ? '15+ Std./Woche Zeitersparnis'
          : '15+ Hours/Week Saved',
    },
    {
      id: 'web',
      icon: Globe,
      color: '#2563EB',
      glowColor: 'blue' as const,
      badge:
        language === 'de'
          ? 'High-Speed Web & Conversion'
          : language === 'en'
          ? 'High-Speed Web & Conversion'
          : 'Yüksek Dönüşümlü Web Mimarisi',
      techPower:
        language === 'tr'
          ? '0.38s Işık Hızında Next.js Altyapısı'
          : language === 'de'
          ? '0,38s Next.js Edge-Architektur'
          : '0.38s Next.js Edge Architecture',
      href: '/hizmetler/web-gelistirme',
      title:
        language === 'tr'
          ? 'Ultra Hızlı Kurumsal Web Siteleri & Satış Odaklı Dijital Vitrin'
          : language === 'de'
          ? 'Ultraschnelle Unternehmens-Websites & Verkaufsstarke Plattformen'
          : 'Ultra-Fast Corporate Websites & High-Converting Digital Storefronts',
      description:
        language === 'tr'
          ? 'Tıkladığınız anda (0.38 saniyede) açılan, markanıza prestij katan ve ziyaretçiyi müşteriye dönüştürmek için tasarlanmış modern web siteleri. Yavaş açılan siteler yüzünden kaybettiğiniz müşterileri doğrudan satışa çevirir.'
          : language === 'de'
          ? 'Moderne Websites, die in 0,38 Sekunden laden, Vertrauen aufbauen und Besucher gezielt in zahlende Kunden verwandeln. Kein Kundenverlust mehr durch langsame Ladezeiten.'
          : 'Modern websites that load in 0.38 seconds, elevate your brand authority, and are engineered to turn visitors into high-value inquiries.',
      ahaPitch:
        language === 'tr'
          ? 'Net Kazanç: Rakibinizin yavaş sitesi daha yüklenmeye çalışırken, müşteriniz sizin sitenizde teklif formunu çoktan doldurmuş olur.'
          : language === 'de'
          ? 'Ihr Gewinn: Während die Website Ihrer Konkurrenz noch lädt, hat der Kunde bei Ihnen bereits angefragt.'
          : 'Bottom-Line Impact: While your competitor’s slow website is still loading, your visitor has already requested a quote from you.',
      features:
        language === 'tr'
          ? [
              '0.38 Saniyede Açılan Hız & Google’da 100/100 Tam Performans Puanı',
              'Ziyaretçiyi Müşteriye Dönüştüren Satış Psikolojisi (3.6 Kat Daha Fazla Talep)',
            ]
          : language === 'de'
          ? [
              '0,38s Ladezeit & 100/100 Google-Performance für Top-Rankings',
              'Verkaufspsychologisches UX-Design (3,6x höhere Anfragequote)',
            ]
          : [
              '0.38s Instant Load Time & 100/100 Google Performance Score',
              'Conversion-Engineered UX (3.6x Higher Customer Inquiry Rate)',
            ],
      className: 'md:col-span-1',
      metric:
        language === 'tr'
          ? '0.38s Açılış Hızı & 3.6x Satış Artışı'
          : language === 'de'
          ? '0,38s Speed & 3,6x Mehr Anfragen'
          : '0.38s Speed & 3.6x More Conversions',
    },
    {
      id: 'saas',
      icon: Monitor,
      color: '#0891B2',
      glowColor: 'cyan' as const,
      badge:
        language === 'de'
          ? 'B2B-Portale & Individualsoftware'
          : language === 'en'
          ? 'B2B Portals & Custom Software'
          : 'Özel Yazılım & B2B Portal',
      techPower:
        language === 'tr'
          ? 'Bulut Tabanlı Güvenli Özel Yazılım'
          : language === 'de'
          ? 'Skalierbare Cloud-Software'
          : 'Scalable Custom Cloud Software',
      href: '/hizmetler/web-uygulamasi',
      title:
        language === 'tr'
          ? 'Özel B2B Müşteri / Bayi Portalları & Web Uygulamaları (SaaS)'
          : language === 'de'
          ? 'Maßgeschneiderte B2B-Kundenportale & Web-Applikationen (SaaS)'
          : 'Custom B2B Client / Dealer Portals & Web Applications (SaaS)',
      description:
        language === 'tr'
          ? 'Bayilerinizin ve müşterilerinizin kendi şifreleriyle girip sipariş verebildiği, cari hesaplarını, tekliflerini ve kargolarını canlı takip edebildiği size özel yazılım panelleri. Excel dosyaları ve telefonla sipariş alma karmaşasını tamamen bitirir.'
          : language === 'de'
          ? 'Individuelle Online-Portale, in denen Ihre Kunden und Händler selbstständig bestellen, Preise einsehen und Aufträge live verfolgen können – Schluss mit unübersichtlichen Excel-Listen.'
          : 'Custom-built portals where your dealers and clients log in to place orders, track shipments, and manage invoices on their own—ending spreadsheet and phone chaos.',
      ahaPitch:
        language === 'tr'
          ? 'Net Kazanç: Telefonda fiyat sorma ve WhatsApp’tan sipariş listesi gönderme devrini kapatır; tüm operasyonunuzu tek ekrandan yönetirsiniz.'
          : language === 'de'
          ? 'Ihr Gewinn: Keine endlosen Preis-Telefonate mehr – Ihre Partner bestellen 24/7 selbstständig über Ihr eigenes Portal.'
          : 'Bottom-Line Impact: Replaces endless phone quotes and messy spreadsheets with a 24/7 self-service ordering platform.',
      features:
        language === 'tr'
          ? [
              'Bayi & Müşteri Self-Servis Sipariş, Cari Takip ve Yönetim Paneli',
              'İşletmenize Özel Geliştirilen, Sınırsız Büyüyebilen Güvenli Bulut Altyapısı',
            ]
          : language === 'de'
          ? [
              'Self-Service Bestell-, Auftrags- und Kundenportal für B2B-Partner',
              'Maßgeschneiderte, ausfallsichere Cloud-Architektur (99,9% Verfügbarkeit)',
            ]
          : [
              'Self-Service Ordering, Account Tracking & Management Portal for B2B Partners',
              'Custom-Engineered, Infinitely Scalable Cloud Architecture (99.9% Uptime)',
            ],
      className: 'md:col-span-1',
      metric:
        language === 'tr'
          ? '%99.9 Kesintisiz Altyapı & Sıfır Excel'
          : language === 'de'
          ? '99,9% Verfügbarkeit & 0% Excel'
          : '99.9% Uptime & Zero Excel Chaos',
    },
    {
      id: 'marketing',
      icon: Megaphone,
      color: '#D97706',
      glowColor: 'amber' as const,
      badge:
        language === 'de'
          ? 'Performance-Marketing, SEO & KI-Suche'
          : language === 'en'
          ? 'Growth Ads, SEO & AI Search'
          : 'Reklam Yönetimi, SEO & AI Arama',
      techPower:
        language === 'tr'
          ? 'Google/Meta Reklam + ChatGPT & AI SEO (GEO)'
          : language === 'de'
          ? 'Google/Meta Ads + ChatGPT & KI-SEO (GEO)'
          : 'Google/Meta Ads + ChatGPT & AI SEO (GEO)',
      href: '/hizmetler/reklam-sosyal-medya',
      title:
        language === 'tr'
          ? 'Dijital Reklam Yönetimi, SEO & Yapay Zeka Arama (GEO) Liderliği'
          : language === 'de'
          ? 'Performance-Marketing, SEO & KI-Suchmaschinen-Optimierung (GEO)'
          : 'Performance Advertising, SEO & AI Search Engine (GEO) Dominance',
      description:
        language === 'tr'
          ? 'Sadece Google ve Instagram/Meta reklamlarıyla değil; artık müşterilerin soru sorduğu ChatGPT, Perplexity ve Google AI gibi yapay zeka arama motorlarında da markanızı 1. sıraya taşıyoruz. Reklam bütçenizi boşa harcamadan doğrudan satın almaya hazır müşterileri getiriyoruz.'
          : language === 'de'
          ? 'Wir bringen Ihre Marke nicht nur bei Google Ads und Meta nach vorne, sondern sorgen durch GEO dafür, dass ChatGPT, Perplexity und Google KI Ihr Unternehmen als Nr. 1 empfehlen.'
          : 'We don’t just scale your Google and Meta Ads—we optimize your brand (GEO) so ChatGPT, Perplexity, and Google AI recommend your company #1 when buyers search.',
      ahaPitch:
        language === 'tr'
          ? 'Net Kazanç: Potansiyel bir müşteri Google’da arama yaptığında veya ChatGPT’ye “Bu alanda en güvenilir firma kim?” diye sorduğunda ilk önerilen marka siz olursunuz.'
          : language === 'de'
          ? 'Ihr Gewinn: Wenn potenzielle Kunden bei Google suchen oder ChatGPT nach dem besten Anbieter fragen, wird Ihr Unternehmen zuerst genannt.'
          : 'Bottom-Line Impact: When decision-makers search Google or ask ChatGPT for the best company in your sector, your brand is recommended first.',
      features:
        language === 'tr'
          ? [
              'GEO & Yeni Nesil SEO: ChatGPT, Perplexity ve Google’da 1. Sıra Görünürlük',
              'Google Ads & Meta (Instagram/Facebook) ile Nokta Atışı Müşteri Kazanımı',
              'Veriye Dayalı Dönüşüm Takibi ile %45 Daha Düşük Müşteri Edinme Maliyeti',
            ]
          : language === 'de'
          ? [
              'GEO & Modernes SEO: Top-Platzierung in Google, ChatGPT & Perplexity',
              'Profitable Google Ads & Meta-Kampagnen ohne Budgetverschwendung',
              'Server-Side Tracking für 45% geringere Kundenakquise-Kosten (CAC)',
            ]
          : [
              'GEO & Next-Gen SEO: #1 Visibility Across Google, ChatGPT & Perplexity',
              'High-ROI Google Ads & Meta Campaigns With Zero Wasted Ad Spend',
              'Precision Attribution Tracking Delivering 45% Lower Acquisition Costs',
            ],
      className: 'md:col-span-2',
      metric:
        language === 'tr'
          ? '5.4x Reklam Getirisi (ROAS) & #1 AI Görünürlük'
          : language === 'de'
          ? '5,4x ROAS & #1 in Google & KI-Suche'
          : '5.4x Ad ROAS & #1 AI Search Visibility',
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[480px] bg-gradient-to-r from-blue-200/20 via-purple-200/25 to-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div
          ref={titleRef}
          className={`text-center mb-14 sm:mb-18 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 text-purple-900 border border-purple-200/90 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>
              {language === 'tr'
                ? 'Uçtan Uca Dijital Büyüme & Yapay Zeka Çözümleri'
                : language === 'de'
                ? 'Ganzheitliches Digitales Wachstum & KI-Lösungen'
                : 'End-to-End Digital Growth & AI Solutions'}
            </span>
          </div>

          <h2 className="heading-lg text-slate-900 mt-2 mb-4 tracking-tight">
            {language === 'tr' ? (
              <>
                Sadece Web Sitesi Değil,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-black">
                  Satış & Verimlilik Makinesi
                </span>{' '}
                Kuruyoruz
              </>
            ) : language === 'de' ? (
              <>
                Nicht nur eine Website – wir bauen Ihre{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-black">
                  Umsatz- & Effizienzmaschine
                </span>
              </>
            ) : (
              <>
                Not Just a Website — We Build Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-black">
                  Sales & Efficiency Machine
                </span>
              </>
            )}
          </h2>

          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            {language === 'tr' ? (
              <>
                Geleneksel ajanslar size sadece tasarım teslim eder; biz işletmenize{' '}
                <span className="text-slate-900 font-extrabold">
                  yeni müşteriler kazandıran, iş yükünüzü otomatikleştiren ve doğrudan cironuzu artıran
                </span>{' '}
                tam entegre sistemler kuruyoruz.
              </>
            ) : language === 'de' ? (
              <>
                Klassische Agenturen liefern nur Design; wir bauen für Ihr Unternehmen{' '}
                <span className="text-slate-900 font-extrabold">
                  Systeme, die automatisch neue Kunden gewinnen, Routinearbeit abschaffen und Ihren Umsatz messbar steigern
                </span>
                .
              </>
            ) : (
              <>
                Traditional agencies just hand over a design; we build{' '}
                <span className="text-slate-900 font-extrabold">
                  integrated systems that win new clients, automate your daily workload, and directly grow your revenue
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
            href="/randevu"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-[0_12px_34px_rgba(124,58,237,0.32)] group"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 55%, #059669 100%)',
            }}
          >
            <Calendar className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <span className="tracking-wide">
              {language === 'tr'
                ? '15 Dakikalık Ücretsiz Mimari & Strateji Randevusu Alın'
                : language === 'de'
                ? '15-Minütigen Kostenlosen Architekturtermin Buchen'
                : 'Book a 15-Minute Free Architecture Strategy Call'}
            </span>
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-1.5 transition-transform"
              aria-hidden="true"
            />
          </Link>

          <p className="mt-3.5 text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'tr'
              ? 'Ücretsiz analiz · Taahhüt gerektirmez · 24 saat içinde size özel çözüm planı'
              : language === 'de'
              ? 'Kostenlose Analyse · Unverbindlich · Individueller Lösungsplan innerhalb von 24h'
              : 'Free analysis · No commitment · Custom action plan within 24 hours'}
          </p>
        </div>
      </div>
    </section>
  )
}
