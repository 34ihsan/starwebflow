'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ShieldCheck, Server, Award, CheckCircle2, Zap } from 'lucide-react'

export default function TrustBar() {
  const { language } = useLanguage()
  const lang = (language as 'tr' | 'en' | 'de') || 'tr'

  const trustBadges = [
    {
      title: lang === 'tr' ? 'DSGVO / KVKK Uyumlu' : lang === 'de' ? '100% DSGVO-Konform' : '100% GDPR Compliant',
      desc: lang === 'tr' ? 'Veriler Frankfurt & TR sunucularında kalır' : lang === 'de' ? 'Hosting im Frankfurter Rechenzentrum' : 'EU Datacenter Data Residency',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: lang === 'tr' ? 'DIN ISO 25010 Standardı' : lang === 'de' ? 'DIN ISO 25010 Standard' : 'DIN ISO 25010 Standard',
      desc: lang === 'tr' ? 'Yazılım kalitesi & mimari şartname' : lang === 'de' ? 'Geprüfte Software-Architektur' : 'Software Quality Architecture',
      icon: Award,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: lang === 'tr' ? 'Dedicated VPS & Ollama' : lang === 'de' ? 'Dedizierte VPS & Ollama' : 'Dedicated VPS & Ollama',
      desc: lang === 'tr' ? 'İzole sunucu, sıfır token vergisi' : lang === 'de' ? 'Isoliert, keine API-Token-Kosten' : 'Isolated, Zero Token API tax',
      icon: Server,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: lang === 'tr' ? '%99.98 Uptime SLA' : lang === 'de' ? '99,98% Uptime SLA' : '99.98% Uptime SLA',
      desc: lang === 'tr' ? '7/24 Kesintisiz izleme ve telemetri' : lang === 'de' ? '24/7 Monitoring & Sofort-Alarm' : '24/7 Monitoring & Instant Alert',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ]

  const enterpriseClients = [
    'DentalPro Klinik',
    'Bavaria Logistics GmbH',
    'Nordic Retail & Commerce',
    'Atlas Hukuk & Danışmanlık',
    'EuroTurk Expansions AG',
    'Vanguard Real Estate',
  ]

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top: 4 Key Enterprise Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className={`p-2 rounded-lg border shrink-0 ${badge.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{badge.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">{badge.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom: Client Proof & Industry Logos */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'tr'
                ? 'DACH & Türkiye Genelinde 50+ Aktif Kurumsal Sistem'
                : lang === 'de'
                ? 'Über 50 produktive Systeme in DACH & Türkei'
                : 'Over 50 Live Production Systems across DACH & TR'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {enterpriseClients.map((client, i) => (
              <span
                key={i}
                className="text-xs sm:text-sm font-semibold font-mono text-slate-600 hover:text-slate-900 transition-colors"
              >
                {client}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
