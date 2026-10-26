'use client'

import { useState } from 'react'
import { Sparkles, Wand2, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Scale, Stethoscope, Truck } from 'lucide-react'
import { LabConsole, useServiceLab, tri, CountUp, ThinkingSteps } from './LabKit'
import type { WebdevLabResult } from '@/app/api/v1/ai/service-lab/route'

const ACCENT = '#4F8EF7'

const PRESETS = [
  {
    business: 'Yılmaz Hukuk Bürosu',
    icon: Scale,
    tag: 'CORPORATE LAW',
    headline: { tr: 'Hukuk Büromuza Hoş Geldiniz — Güvenilir Çözümler', en: 'Welcome to our Law Firm — Reliable Solutions', de: 'Willkommen in unserer Kanzlei – Zuverlässige Lösungen' },
    audience: { tr: 'Şirket sahipleri & KOBİ’ler', en: 'Business owners & SMBs', de: 'Unternehmer & KMUs' },
    goal: { tr: 'Ücretsiz Ön Görüşme', en: 'Free Consultation', de: 'Kostenlose Erstberatung' },
  },
  {
    business: 'DentStar Poliklinik',
    icon: Stethoscope,
    tag: 'HEALTHCARE',
    headline: { tr: 'En Son Teknoloji ile Kaliteli Diş Sağlığı Hizmeti', en: 'Quality Dental Healthcare with the Latest Tech', de: 'Hochwertige Zahnmedizin mit neuester Technologie' },
    audience: { tr: 'Gülüş estetiği arayan hastalar', en: 'Patients seeking smile makeovers', de: 'Patienten für Ästhetik & Implantate' },
    goal: { tr: 'WhatsApp Randevu', en: 'WhatsApp Booking', de: 'WhatsApp-Termin' },
  },
  {
    business: 'Veloce Lojistik',
    icon: Truck,
    tag: 'LOGISTICS & SUPPLY',
    headline: { tr: 'Türkiye’den Avrupa’ya Güvenli Taşımacılık', en: 'Secure Transport from Turkey to Europe', de: 'Sicherer Transport von der Türkei nach Europa' },
    audience: { tr: 'İhracatçı firmalar', en: 'Export companies', de: 'Export- & Handelsunternehmen' },
    goal: { tr: 'Hızlı Fiyat Teklifi', en: 'Instant Quote', de: 'Sofortangebot' },
  },
]

export default function LiveConversionRewriter() {
  const lab = useServiceLab<WebdevLabResult>('webdev')
  const l = lab.language
  const [business, setBusiness] = useState(PRESETS[0].business)
  const [headline, setHeadline] = useState(PRESETS[0].headline[l] || PRESETS[0].headline.tr)
  const [audience, setAudience] = useState(PRESETS[0].audience[l] || PRESETS[0].audience.tr)
  const [goal, setGoal] = useState(PRESETS[0].goal[l] || PRESETS[0].goal.tr)

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx]
    setBusiness(p.business)
    setHeadline(p.headline[l] || p.headline.tr)
    setAudience(p.audience[l] || p.audience.tr)
    setGoal(p.goal[l] || p.goal.tr)
  }

  const runDoctor = () => {
    if (!business.trim() || lab.loading) return
    lab.run({ business, headline, audience, goal })
  }

  const result = lab.data

  return (
    <LabConsole
      title={tri(l, 'Canlı Dönüşüm & Hero Doktoru', 'Live Conversion & Hero Doctor', 'Live-Conversion & Hero-Doktor')}
      accent={ACCENT}
      meta={lab.meta}
      loading={lab.loading}
    >
      <div className="space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            {tri(l, 'Yerel AI CRO Analizcisi', 'Local AI CRO Engine', 'Lokale KI-CRO-Engine')}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {tri(l, 'Web sitenizin ana başlığı müşteri kaçırıyor mu?', 'Is your homepage headline leaking customers?', 'Verliert Ihre Startseite wertvolle Kunden?')}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {tri(
              l,
              'Mevcut başlığınızı girin. Yerel AI saniyeler içinde zayıf noktaları tespit edip Stripe/Linear kalitesinde yüksek dönüşümlü kopyaya dönüştürsün.',
              'Type your current headline. Our local AI diagnoses conversion leaks and turns it into Stripe-tier copy in seconds.',
              'Geben Sie Ihre Headline ein. Unsere lokale KI erkennt Conversion-Lücken und verwandelt sie in Top-Copy.'
            )}
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((p, i) => {
            const Icon = p.icon
            const isSelected = business === p.business
            return (
              <button
                key={i}
                onClick={() => applyPreset(i)}
                className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? 'border-blue-400 bg-blue-500/15 shadow-sm shadow-blue-500/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {p.tag}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{p.business}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{p.audience[l] || p.audience.tr}</div>
              </button>
            )
          })}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              id="webdev-input-business"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder={tri(l, 'İşletme adı', 'Business name', 'Firmenname')}
              className="rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400"
            />
            <input
              id="webdev-input-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder={tri(l, 'Hedef kitle (Örn: KOBİ sahipleri)', 'Target audience (e.g. SMB owners)', 'Zielgruppe (z.B. KMU-Inhaber)')}
              className="rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400"
            />
          </div>
          <textarea
            id="webdev-input-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            rows={2}
            placeholder={tri(l, 'Mevcut ana başlığınız (Örn: Kaliteli hizmette lider kuruluş)', 'Current headline (e.g. Welcome to our quality service)', 'Aktuelle Headline (z.B. Willkommen bei Ihrem Partner)')}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400 resize-none"
          />

          <button
            id="webdev-run-btn"
            onClick={runDoctor}
            disabled={lab.loading || !business.trim()}
            className="w-full group relative overflow-hidden rounded-xl py-3.5 font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #2563EB)` }}
          >
            <span className="relative flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {tri(l, 'Dönüşüm Skorunu Analiz Et & Başlığı Yeniden Yaz', 'Audit Conversion Score & Rewrite Hero', 'Conversion-Score prüfen & Hero neu schreiben')}
            </span>
          </button>
        </div>

        {/* Loading */}
        {lab.loading && (
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
            <ThinkingSteps
              accent={ACCENT}
              steps={[
                tri(l, 'Mevcut başlığın psikolojik zayıflıkları taranıyor...', 'Scanning headline psychological leaks...', 'Psychologische Schwachstellen analysieren...'),
                tri(l, 'Hedef kitlenin acı noktasına göre yeniden konumlandırılıyor...', 'Repositioning to target audience pain points...', 'Auf Zielgruppen-Schmerzpunkte neu positionieren...'),
                tri(l, 'Dönüşüm artış yüzdesi hesaplanıyor...', 'Calculating projected conversion lift...', 'Prognostizierten Conversion-Lift berechnen...'),
              ]}
            />
          </div>
        )}

        {/* Results */}
        {result && !lab.loading && (
          <div className="space-y-4 pt-2" style={{ animation: 'fadeInUp 0.5s ease both' }}>
            {/* Score & Issues */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col justify-center items-center text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{tri(l, 'Mevcut Başlık Skoru', 'Current Score', 'Aktueller Score')}</span>
                <div className="text-3xl font-black text-rose-400 mt-1 font-mono">
                  <CountUp value={result.score} />/100
                </div>
                <span className="text-[10px] text-rose-300 mt-0.5">⚠️ {tri(l, 'Müşteri Kaçırıyor', 'Leaking Leads', 'Verliert Kunden')}</span>
              </div>
              <div className="sm:col-span-2 p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">{tri(l, 'Tespit Edilen Dönüşüm Engelleri', 'Detected Leaks', 'Erkannte Lücken')}</span>
                {result.issues.map((iss, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">{iss.title}:</strong> {iss.fix}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transformed Hero Mockup */}
            <div className="p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-black/40 to-slate-950/60 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  ✨ {tri(l, 'Yeni Hero (Star AI Dönüşüm Formatı)', 'New Hero (Star AI High-Converting)', 'Neuer Hero (Star AI High-Converting)')}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  +<CountUp value={result.projectedLift} />% {tri(l, 'Tahmini Dönüşüm Artışı', 'Est. Lift', 'Geschätzter Lift')}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  {result.newHeadline}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {result.newSubheadline}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button className="px-5 py-2.5 rounded-xl font-bold text-white text-xs sm:text-sm shadow-lg shadow-blue-500/25" style={{ background: ACCENT }}>
                    {result.cta}
                  </button>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {result.trustLine}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LabConsole>
  )
}
