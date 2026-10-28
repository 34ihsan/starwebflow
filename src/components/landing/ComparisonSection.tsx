'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { XCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ComparisonSection() {
  const { language } = useLanguage()
  const lang = (language as 'tr' | 'en' | 'de') || 'tr'

  const comparisonData = [
    {
      feature: lang === 'tr' ? 'Veri Gizliliği & Egemenlik' : lang === 'de' ? 'Datensouveränität & DSGVO' : 'Data Privacy & Sovereignty',
      traditional:
        lang === 'tr'
          ? 'Müşteri verileri kontrolsüz yabancı bulutlara ve açık API’lere sızdırılır (Büyük KVKK/DSGVO riski).'
          : lang === 'de'
          ? 'Kundendaten fließen ungeprüft in US-Clouds und Drittanbieter-APIs (DSGVO-Haftungsrisiko).'
          : 'Customer data leaks to unvetted third-party US clouds and APIs (Severe GDPR compliance risk).',
      starwebflow:
        lang === 'tr'
          ? 'Verileriniz Frankfurt/TR dedike sunucunuzda kalır. Yerel Ollama modelleri ile %100 izole çalışır.'
          : lang === 'de'
          ? 'Dedizierte deutsche Server & lokale Ollama-Modelle. 100% DSGVO-konform und datensicher.'
          : 'Dedicated EU datacenter VPS & local Ollama models. 100% isolated and GDPR compliant.',
    },
    {
      feature: lang === 'tr' ? 'Müşteri Yanıt Hızı' : lang === 'de' ? 'Reaktionszeit auf Leads' : 'Inbound Lead Response',
      traditional:
        lang === 'tr'
          ? 'İletişim formu doldurulur; ekip ertesi gün yanıt verene kadar müşteri rakibe gitmiştir.'
          : lang === 'de'
          ? 'Kontaktformular wird erst am nächsten Werktag beantwortet. Der Interessent kauft beim Wettbewerb.'
          : 'Lead fills out a form; sales responds next day while the lead has already moved to a competitor.',
      starwebflow:
        lang === 'tr'
          ? 'Sitedeyken veya WhatsApp’tan 3 saniyede yanıt verilir, itirazlar giderilir ve takvime randevu işlenir.'
          : lang === 'de'
          ? 'KI antwortet in unter 3 Sekunden, qualifiziert das Budget und bucht den Termin direkt in Ihren Kalender.'
          : 'Responds within 3 seconds, qualifies budget, and schedules a meeting directly into your calendar.',
    },
    {
      feature: lang === 'tr' ? 'Web Platform Altyapısı' : lang === 'de' ? 'Web-Infrastruktur' : 'Web Infrastructure',
      traditional:
        lang === 'tr'
          ? 'Şişkin WordPress veya ağır eklentiler: 3.5+ saniye açılış süresi ve yüksek sepet/lead terk oranı.'
          : lang === 'de'
          ? 'Überladenes WordPress mit 30 Plugins: Über 3,5s Ladezeit und hohe Absprungraten.'
          : 'Bloated WordPress or legacy CMS: 3.5s+ loading times and high mobile bounce rates.',
      starwebflow:
        lang === 'tr'
          ? 'Next.js 14 App Router: 0.8 saniyenin altında açılış (LCP), Grade A+ güvenlik ve kusursuz mobil deneyim.'
          : lang === 'de'
          ? 'Next.js 14 App Router: LCP unter 0,8 Sekunden, Grade A+ Sicherheit und maximale Conversion.'
          : 'Next.js 14 App Router: Sub-0.8s LCP, Grade A+ security, and frictionless mobile conversion.',
    },
    {
      feature: lang === 'tr' ? 'Maliyet ve Lisans Modeli' : lang === 'de' ? 'Kosten & Lizenzmodell' : 'Cost & Licensing Model',
      traditional:
        lang === 'tr'
          ? 'Kullanıcı başına SaaS lisansları ve kontrolsüz API token faturalarıyla her ay katlanan maliyet.'
          : lang === 'de'
          ? 'Teure User-Lizenzen und unkalkulierbare API-Token-Rechnungen, die monatlich steigen.'
          : 'Unpredictable per-seat SaaS subscriptions and spiraling per-token API recurring costs.',
      starwebflow:
        lang === 'tr'
          ? 'Sistemin mülkiyeti size aittir. Kendi sunucunuzda sınırsız yerel sorgu ve sabit altyapı maliyeti.'
          : lang === 'de'
          ? 'Volles Eigentum am System. Unbegrenzte lokale Anfragen auf eigener Infrastruktur ohne Lizenzfalle.'
          : 'You own the system. Unlimited local inference on your own dedicated VPS with predictable cost.',
    },
    {
      feature: lang === 'tr' ? 'Operasyonel Destek & SLA' : lang === 'de' ? 'Wartung & SLA-Schutz' : 'Maintenance & SLA Support',
      traditional:
        lang === 'tr'
          ? 'Site teslim edilir ve ajans kaybolur. SSL veya sunucu çöktüğünde saatlerce haberiniz olmaz.'
          : lang === 'de'
          ? 'Agentur liefert ab und ist unerreichbar. Systemausfälle werden erst von Kunden bemerkt.'
          : 'Agency delivers and disappears. Server crashes or expired SSL go unnoticed for days.',
      starwebflow:
        lang === 'tr'
          ? 'Her 60 saniyede otomatik sağlık yoklaması, 15 dakika müdahale SLA’sı ve proaktif kalkan.'
          : lang === 'de'
          ? 'Automatischer Health-Check alle 60 Sekunden, 15 Minuten Interventions-SLA und proaktiver Schutz.'
          : 'Automated 60-second health probes, 15-minute intervention SLA, and proactive defense.',
    },
  ]

  return (
    <section id="comparison" className="py-24 bg-white border-t border-slate-200 text-slate-900 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-4 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {lang === 'tr' ? 'Stratejik Karar Matrisi' : lang === 'de' ? 'Entscheidungsmatrix' : 'Strategic Decision Matrix'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {lang === 'tr' ? (
              <>
                Geleneksel Ajans Modeli vs.{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Starwebflow Egemen Mimarisi
                </span>
              </>
            ) : lang === 'de' ? (
              <>
                Klassische Agenturen vs.{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Starwebflow Souveräne Architektur
                </span>
              </>
            ) : (
              <>
                Traditional Agencies vs.{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Starwebflow Sovereign Architecture
                </span>
              </>
            )}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {lang === 'tr'
              ? 'Şirketinizin dijital altyapısını kurarken karşılaşacağınız gerçek farklar ve uzun vadeli yatırım getirisi.'
              : lang === 'de'
              ? 'Der direkte Vergleich zwischen fragmentierten Altsystemen und unserer integrierten Unternehmensplattform.'
              : 'The direct comparison between fragmented legacy models and our sovereign enterprise architecture.'}
          </p>
        </div>

        {/* Matrix Table Cards */}
        <div className="space-y-4">
          {comparisonData.map((row, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl bg-slate-50/70 border border-slate-200 p-6 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {/* Feature Title (3 Cols) */}
              <div className="md:col-span-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                  Kriter 0{idx + 1}
                </span>
                <h4 className="text-base font-bold text-slate-900">{row.feature}</h4>
              </div>

              {/* Traditional Agency (4 Cols) */}
              <div className="md:col-span-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-xs">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{lang === 'tr' ? 'Geleneksel Ajans / Manuel' : lang === 'de' ? 'Klassische Agentur' : 'Traditional Agency'}</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">{row.traditional}</p>
              </div>

              {/* Starwebflow Model (5 Cols) */}
              <div className="md:col-span-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{lang === 'tr' ? 'Starwebflow Sovereign Altyapısı' : lang === 'de' ? 'Starwebflow Plattform' : 'Starwebflow Sovereign Platform'}</span>
                </div>
                <p className="text-xs text-emerald-950 font-semibold leading-relaxed">{row.starwebflow}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
