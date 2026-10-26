'use client'

import { useState } from 'react'
import { Zap, Gauge, Award, Globe, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Cpu } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { tri } from './LabKit'

export default function WebdevTelemetryCockpit() {
  const { language } = useLanguage()
  const l = language as 'tr' | 'en' | 'de'
  const [comparing, setComparing] = useState<'vitals' | 'roi' | 'stack'>('vitals')
  const [benchmarking, setBenchmarking] = useState(false)
  const [scoreLcp, setScoreLcp] = useState('0.38s')

  const retestVitals = () => {
    setBenchmarking(true)
    setTimeout(() => {
      setBenchmarking(false)
      setScoreLcp('0.34s')
    }, 750)
  }

  return (
    <div className="relative rounded-3xl bg-[#080E1C] border border-white/[0.08] text-slate-100 p-6 sm:p-7 shadow-2xl overflow-hidden group">
      {/* Ambient gradient glow */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none bg-blue-600" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-indigo-600" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-semibold">
              {tri(l, 'SILICON VALLEY TIER-1 KOKPİTİ', 'SILICON VALLEY TIER-1 COCKPIT', 'SILICON VALLEY TIER-1 COCKPIT')}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {tri(l, 'Core Web Vitals & Dönüşüm Laboratuvarı', 'Core Web Vitals & Conversion Lab', 'Core Web Vitals & Conversion-Labor')}
          </h3>
        </div>
        <button
          onClick={retestVitals}
          disabled={benchmarking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-blue-400 ${benchmarking ? 'animate-spin' : ''}`} />
          <span>{benchmarking ? tri(l, 'Test Ediliyor…', 'Auditing Vitals…', 'Wird geprüft…') : tri(l, 'Canlı Vitals Testi', 'Run Vitals Audit', 'Live-Vitals Test')}</span>
        </button>
      </div>

      {/* Primary KPI Grid (Core Web Vitals) */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            LCP (Açılış Hızı)
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">{scoreLcp}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Global Top %1 Dilim', 'Top 1% Worldwide', 'Top 1 % weltweit')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-blue-400" />
            INP (Etkileşim Gecikmesi)
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">18ms</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{tri(l, 'Sıfır tıklama gecikmesi', 'Zero input delay', 'Null Klick-Verzögerung')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            Lighthouse Skoru
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 tracking-tight">100 / 100</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Sözleşmeli Garanti', 'Contractual Guarantee', 'Vertraglich garantiert')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
        {[
          { id: 'vitals' as const, label: tri(l, 'Hız & Core Vitals', 'Vitals Benchmark', 'Vitals Benchmark') },
          { id: 'roi' as const, label: tri(l, 'Ciro & Reklam Tasarrufu', 'Revenue & CAC Impact', 'Umsatz & Ad-Effizienz') },
          { id: 'stack' as const, label: tri(l, 'Teknoloji & Edge CDN', 'Edge Infrastructure', 'Edge-Infrastruktur') },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setComparing(t.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              comparing === t.id
                ? 'bg-blue-600/30 text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {comparing === 'vitals' && (
        <div className="space-y-2.5">
          {[
            {
              metric: 'LCP (Largest Contentful Paint)',
              traditional: '3.4s — 4.8s (Kırmızı)',
              star: '0.38s (Mükemmel Yeşil)',
              benefit: tri(l, 'Ziyaretçi gözünü kırpmadan sayfa tam ekran hazırdır.', 'Page renders before the user even finishes blinking.', 'Seite lädt, bevor der Nutzer blinzelt.'),
            },
            {
              metric: 'CLS (Cumulative Layout Shift)',
              traditional: '0.24 (Göz yoran kaymalar)',
              star: '0.000 (Sıfır Kayma)',
              benefit: tri(l, 'Tıklarken butonun yer değiştirmesi veya içerik zıplaması imkansızdır.', 'Zero jarring layout shifts; buttons never jump during click.', 'Keine springenden Buttons oder störenden Layout-Shifts.'),
            },
            {
              metric: 'TTFB (Time To First Byte)',
              traditional: '850ms — 1.6s',
              star: '12ms — 35ms',
              benefit: tri(l, 'Frankfurt, Londra ve İstanbul Edge düğümlerinde anında sunulur.', 'Served instantly from nearest Anycast edge point of presence.', 'Auslieferung direkt vom nächsten Anycast Edge-Knoten.'),
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                <span>{item.metric}</span>
                <span className="text-emerald-400 font-mono text-[11px]">{item.star}</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{item.benefit}</div>
              <div className="mt-1 text-[10px] font-mono text-rose-400/80">
                {tri(l, 'Klasik Ajans (WordPress/Elementor):', 'Conventional Agency:', 'Klassische Agentur:')} {item.traditional}
              </div>
            </div>
          ))}
        </div>
      )}

      {comparing === 'roi' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, 'Google Ads Kalite Skoru & -%30 TBM İndirimi', 'Google Ads Quality Score Advantage', 'Google Ads Qualitätsfaktor-Vorteil'),
              desc: tri(l, '100/100 hız skoru sayesinde Google reklam maliyetinizi (CPC) otomatik %20 ila %35 düşürür.', 'High landing page speed directly slashes Google Ads CPC by 20-35%.', 'Hohe Geschwindigkeit senkt Google Ads CPC automatisch um 20-35 %.'),
              tag: '-%30 CPC',
            },
            {
              title: tri(l, 'Hemen Çıkma Oranında (Bounce Rate) -%44 Düşüş', '-44% Bounce Rate Reduction', '-44 % Absprungrate'),
              desc: tri(l, '3 saniye bekleyen mobil kullanıcıların %53\'ü siteyi terk eder. StarWebFlow ile sıfır kayıp.', '53% of mobile visits abandon after 3s delay. Sub-second speed retains everyone.', '53 % der mobilen Nutzer springen nach 3s ab. Null Verlust bei uns.'),
              tag: '+%98 Tutunma',
            },
            {
              title: tri(l, 'Doğrudan Ciro ve Dönüşüm Artışı', 'Direct Bottom-line Revenue Multiplier', 'Direkter Umsatz-Multiplikator'),
              desc: tri(l, 'Amazon verisine göre her 100ms hızlanma satışları %1 artırır; StarWebFlow siteleri 3 kat daha hızlıdır.', 'Every 100ms speed boost adds 1% conversion revenue at scale.', 'Jede 100ms Beschleunigung steigert die Conversion um 1 %.'),
              tag: '2.4x Dönüşüm',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 whitespace-nowrap">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      )}

      {comparing === 'stack' && (
        <div className="space-y-2.5">
          {[
            {
              title: 'Next.js 15 App Router & React 19 Server Components',
              desc: tri(l, 'Sıfır gereksiz istemci JavaScript paketi. Sayfalar sunucu tarafında ultra optimize derlenir.', 'Zero client JS bloat. Pages pre-rendered on the edge with streamed hydration.', 'Kein überflüssiger Client-JS-Ballast; Streaming Edge-SSR.'),
              label: 'SSR Edge',
            },
            {
              title: tri(l, 'AVIF / WebP Otomatik Görsel Optimizasyonu', 'AVIF / WebP Next-Gen Image Engine', 'AVIF / WebP Bild-Engine'),
              desc: tri(l, 'Müşteri cihazına göre çözünürlük ve sıkıştırma anlık ayarlanır; megabaytlarca veri 40KB\'a iner.', 'Responsive images dynamically downscaled and served in modern formats.', 'Bilder dynamisch komprimiert auf Bruchteile der Originalgröße.'),
              label: 'Brotli 11',
            },
            {
              title: tri(l, 'Global Anycast Edge CDN Ağı', 'Global Anycast CDN (300+ PoPs)', 'Globales Anycast CDN'),
              desc: tri(l, 'Dünyanın neresinden girilirse girilsin en yakın veri merkezinden servis edilir.', 'Low latency routing via points of presence in Frankfurt, London, Istanbul & NY.', 'Auslieferung über weltweite Rechenzentren mit minimaler Latenz.'),
              label: 'Cloudflare',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Trust */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          {tri(l, 'Sözleşmeli 100/100 Lighthouse Garantisi', 'Contractual 100/100 Lighthouse Guarantee', 'Vertragliche 100/100 Lighthouse-Garantie')}
        </span>
        <span className="text-emerald-400 font-semibold">{tri(l, 'Sıfır Şişkinlik / Sıfır WordPress', 'Zero Bloat / No WordPress', 'Kein WordPress-Ballast')}</span>
      </div>
    </div>
  )
}
