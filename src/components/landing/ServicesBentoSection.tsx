'use client'

import React from 'react'
import Link from 'next/link'
import {
  Bot,
  Zap,
  Globe,
  Activity,
  ArrowRight,
  ShieldCheck,
  Server,
  Workflow,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ServicesBentoSection() {
  const { language } = useLanguage()
  const lang = (language as 'tr' | 'en' | 'de') || 'tr'

  return (
    <section id="services" className="py-24 bg-slate-50/70 text-slate-900 relative overflow-hidden border-t border-slate-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-4 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {lang === 'tr'
                ? 'Kurumsal Mimari Sütunları'
                : lang === 'de'
                ? 'Unternehmens-Architektur'
                : 'Enterprise Architecture Pillars'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {lang === 'tr' ? (
              <>
                Sadece Kod Yazmıyoruz.{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  Bağımsız ve Dayanıklı Sistemler
                </span>{' '}
                Kuruyoruz.
              </>
            ) : lang === 'de' ? (
              <>
                Wir bauen keine Standard-Websites.{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  Souveräne & skalierbare Systeme
                </span>{' '}
                für Ihren Erfolg.
              </>
            ) : (
              <>
                We Don't Just Write Code.{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  We Engineer Sovereign & Resilient
                </span>{' '}
                Enterprise Systems.
              </>
            )}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {lang === 'tr'
              ? 'Yavaş şablonlar ve tekellere bağımlı API kiralama yerine; mülkiyeti tamamen size ait, DSGVO uyumlu, yerel LLM destekli ve uçtan uca otomatikleşmiş altyapılar.'
              : lang === 'de'
              ? 'Keine monatlichen Lizenzfallen oder Datenlecks: Wir implementieren zukunftssichere, DSGVO-konforme und voll integrierte Softwarelösungen.'
              : 'No fragile templates or vendor lock-in: We build fully owned, GDPR-compliant, local LLM-powered and end-to-end automated infrastructures.'}
          </p>
        </div>

        {/* Bento Grid (12 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ── CARD 1: Sovereign AI Agents & Ollama Cluster (8 Cols) ── */}
          <div className="md:col-span-12 lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xl transition-all shadow-sm group">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-bold text-purple-700">
                    Ollama Cluster
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-700">
                    %100 DSGVO / KVKK
                  </span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                {lang === 'tr'
                  ? 'Sovereign AI Ajanları & Özel LLM Altyapısı'
                  : lang === 'de'
                  ? 'Souveräne KI-Agenten & Dedizierte LLMs'
                  : 'Sovereign AI Agents & Dedicated LLM Cluster'}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl font-normal">
                {lang === 'tr'
                  ? 'Müşteri konuşmalarınızı ve şirket içi bilginizi OpenAI, Anthropic veya Gemini gibi yapay zeka şirketlerinin bulutuna göndermiyoruz. Kendi dedike sunucunuzda (isteğe göre Almanya veya Türkiye) çalışan yerel Ollama modelleriyle (tüm veriler sizde kalacak şekilde) 7/24 çalışan satış, destek ve operasyon ajanları kuruyoruz.'
                  : lang === 'de'
                  ? 'Verarbeiten Sie Kundengespräche und interne Geschäftsdaten ohne Weitergabe an Anbieter wie OpenAI, Anthropic oder Gemini. Unsere autarken Ollama-Modelle laufen auf Ihrem eigenen Server (wahlweise in Deutschland oder der Türkei) – alle Daten bleiben zu 100% in Ihrem Besitz.'
                  : 'We do not send your customer conversations or proprietary company knowledge to AI clouds like OpenAI, Anthropic, or Gemini. We deploy local Ollama models on your dedicated server (in Germany or Turkey) so all data remains entirely in your control while operating 24/7 sales, support, and operations.'}
              </p>

              {/* Technical Capability Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-900">Sıfır Token Faturası</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Sınırsız yerel sorgu</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-900">18ms Yanıt Hızı</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5 font-semibold">Milisaniyelik çıkarım</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-900">CRM Entegre</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">HubSpot, Pipedrive, DB</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/hizmetler/ai-agents"
                className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-800 transition-colors"
              >
                <span>{lang === 'tr' ? 'AI Ajan Çözümünü İncele' : lang === 'de' ? 'KI-Agenten Details' : 'Explore AI Agents'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── CARD 2: Workflow & CRM Automations (4 Cols) ── */}
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xl transition-all shadow-sm group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                {lang === 'tr'
                  ? 'Uçtan Uca Süreç & CRM Otomasyonu'
                  : lang === 'de'
                  ? 'End-to-End Workflow & CRM Automatisierung'
                  : 'End-to-End Process & CRM Automation'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                {lang === 'tr'
                  ? 'n8n boru hatları, otomatik faturalama, webhook senkronizasyonu ve gelen maillerin AI ile sınıflandırılması sayesinde ekibinizin haftalık 20+ saatlik manuel işini sıfırlıyoruz.'
                  : lang === 'de'
                  ? 'Automatisieren Sie Lead-Erfassung, Rechnungsstellung und Kalendersynchronisation über sichere n8n-Pipelines ohne manuelle Eingriffe.'
                  : 'Eliminate 20+ hours of repetitive manual data entry per week with resilient n8n pipelines, webhook listeners, and auto-invoicing.'}
              </p>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Otomatik Teklif & Fatura PDF Üretimi</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Çok Kanallı Gelen Kutu & Akıllı Yanıt</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gerçek Zamanlı Webhook & API Entegrasyonu</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100">
              <Link
                href="/hizmetler/ai-otomasyon"
                className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
              >
                <span>{lang === 'tr' ? 'Otomasyonları Keşfet' : lang === 'de' ? 'Workflows Entdecken' : 'Explore Automations'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── CARD 3: Sub-Second Web & App Engineering (4 Cols) ── */}
          <div className="md:col-span-12 lg:col-span-4 rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xl transition-all shadow-sm group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                {lang === 'tr'
                  ? 'Sub-Second Web & Yazılım Mühendisliği'
                  : lang === 'de'
                  ? 'Subsekunden Web & App Engineering'
                  : 'Sub-Second Web & Application Engineering'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                {lang === 'tr'
                  ? 'Next.js 14 App Router, TypeScript ve Tailwind ile 0.8 saniyenin altında açılan, SEO skoru 100 olan ve yüksek dönüşüm getiren kurumsal web platformları.'
                  : lang === 'de'
                  ? 'Next.js 14 Plattformen mit LCP unter 0,8 Sekunden, A+ Sicherheit und perfektem PageSpeed für maximale Lead-Konvertierung.'
                  : 'Next.js 14 App Router architectures with sub-0.8s LCP, A+ security grading, and clean conversion paths.'}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-6 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-600">Largest Contentful Paint</span>
                  <span className="text-emerald-600 font-bold">&lt; 0.8s</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-600">Google Core Web Vitals</span>
                  <span className="text-emerald-600 font-bold">100 / 100</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">SSL & Header Security</span>
                  <span className="text-blue-600 font-bold">Grade A+</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100">
              <Link
                href="/hizmetler/web-gelistirme"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
              >
                <span>{lang === 'tr' ? 'Web Çözümlerini Gör' : lang === 'de' ? 'Webentwicklung Ansehen' : 'Explore Web Systems'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── CARD 4: Mission-Critical Telemetry & SLA Defense (8 Cols) ── */}
          <div className="md:col-span-12 lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xl transition-all shadow-sm group">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  %99.98 Uptime SLA Garantisi
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                {lang === 'tr'
                  ? '7/24 Kesintisiz Telemetri, Güvenlik & SLA Savunması'
                  : lang === 'de'
                  ? '24/7 Monitoring, Sicherheit & SLA-Schutz'
                  : '24/7 Telemetry, Security & Enterprise SLA Defense'}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl font-normal">
                {lang === 'tr'
                  ? 'Sisteminizi teslim edip ortadan kaybolmuyoruz. SSL sertifikası, veritabanı sorgu süreleri, API yanıtları ve sunucu yükü her 60 saniyede bir otomatik taranır. Olası bir aksamada ekibimiz müşteriniz fark etmeden müdahale eder.'
                  : lang === 'de'
                  ? 'Permanente Echtzeit-Überwachung Ihrer Server, SSL-Zertifikate und Schnittstellen. Sofortige Fehlerbeseitigung vor dem ersten Kundenkontakt.'
                  : 'Continuous real-time probing of your servers, SSL validity, API endpoints, and database latency. Proactive intervention before any customer notices.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500">Yoklama Aralığı</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">Her 60 Saniye</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500">Müdahale SLA</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">&lt; 15 Dakika</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500">Yedekleme</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">Otomatik Günlük</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500">Güvenlik Başlıkları</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">HSTS, CSP, XFO</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/hizmetler/web-uygulamasi"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <span>{lang === 'tr' ? 'SLA ve Güvenlik Altyapısı' : lang === 'de' ? 'SLA & Monitoring Details' : 'View SLA & Monitoring'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
