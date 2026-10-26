'use client'

import { useState } from 'react'
import { Megaphone, Sparkles, Copy, Check, Eye, Target, TrendingUp, Layers, Briefcase, Flame } from 'lucide-react'
import { LabConsole, useServiceLab, tri, CountUp, ThinkingSteps } from './LabKit'
import type { AdsLabResult } from '@/app/api/v1/ai/service-lab/route'

const ACCENT = '#F59E0B'

const PRESETS = [
  {
    product: { tr: 'Diş Beyazlatma & Gülüş Tasarımı', en: 'Teeth Whitening & Smile Design', de: 'Zahnaufhellung & Smile-Design' },
    audience: { tr: '22-45 yaş, özel etkinlik / düğün öncesi', en: 'Ages 22-45, pre-wedding / event goers', de: '22-45 Jahre, vor Events & Hochzeiten' },
    platform: 'Instagram',
    icon: Sparkles,
    tag: 'META ADS',
  },
  {
    product: { tr: 'B2B Bulut Muhasebe & E-Fatura', en: 'B2B Cloud Accounting & Invoicing', de: 'B2B Cloud-Buchhaltung & E-Rechnung' },
    audience: { tr: 'KOBİ kurucuları, finans müdürleri', en: 'SMB founders, finance leads', de: 'KMU-Gründer, Finanzleiter' },
    platform: 'LinkedIn',
    icon: Briefcase,
    tag: 'LINKEDIN B2B',
  },
  {
    product: { tr: 'Organik Yaşlanma Karşıtı Serum', en: 'Organic Anti-Aging Serum', de: 'Bio Anti-Aging Serum' },
    audience: { tr: '30-55 yaş kadınlar, temiz içerik arayanlar', en: 'Women 30-55 seeking clean skincare', de: 'Frauen 30-55, Clean-Beauty-Interesse' },
    platform: 'TikTok',
    icon: Flame,
    tag: 'TIKTOK D2C',
  },
]

export default function LiveCreativeStudio() {
  const lab = useServiceLab<AdsLabResult>('ads')
  const l = lab.language
  const [product, setProduct] = useState(PRESETS[0].product[l] || PRESETS[0].product.tr)
  const [audience, setAudience] = useState(PRESETS[0].audience[l] || PRESETS[0].audience.tr)
  const [platform, setPlatform] = useState(PRESETS[0].platform)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [selectedVariant, setSelectedVariant] = useState(0)

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx]
    setProduct(p.product[l] || p.product.tr)
    setAudience(p.audience[l] || p.audience.tr)
    setPlatform(p.platform)
  }

  const generateAds = () => {
    if (!product.trim() || lab.loading) return
    lab.run({ product, audience, platform, goal: 'conversion' })
  }

  const copyAd = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const result = lab.data

  return (
    <LabConsole
      title={tri(l, 'Performans Kreatif Stüdyosu', 'Performance Creative Studio', 'Performance-Creative-Studio')}
      accent={ACCENT}
      meta={lab.meta}
      loading={lab.loading}
    >
      <div className="space-y-6">
        {/* Intro */}
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            {tri(l, 'Yerel Büyüme & Reklam AI Motoru', 'Local Growth & Ads AI Engine', 'Lokale Growth & Ads KI-Engine')}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {tri(l, 'Reklam bütçenizi çöpe atmayan kreatif açılar üretin.', 'Generate ad angles that don’t waste your ad spend.', 'Generieren Sie Ad-Angles, die Ihr Budget nicht verbrennen.')}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {tri(
              l,
              'Ürününüzü yazın. Yerel model 3 farklı psikolojik açıdan (acı noktası, sosyal kanıt, teklif) ilk 1.5 saniye kancalarını ve tahmini CTR’ı hesaplasın.',
              'Type your offer. The local model crafts 3 psychological angles (pain point, social proof, offer) with 1.5s hooks and predicted CTR.',
              'Geben Sie Ihr Produkt ein. Das lokale Modell entwirft 3 psychologische Angles mit Hooks und geschätzter CTR.'
            )}
          </p>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESETS.map((p, i) => {
            const Icon = p.icon
            const isSelected = product === (p.product[l] || p.product.tr)
            return (
              <button
                key={i}
                onClick={() => applyPreset(i)}
                className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 shadow-sm shadow-amber-500/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {p.tag}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{p.product[l] || p.product.tr}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{p.platform} · {p.audience[l] || p.audience.tr}</div>
              </button>
            )
          })}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              id="ads-input-product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder={tri(l, 'Ürün veya Hizmet', 'Product or Service', 'Produkt oder Leistung')}
              className="sm:col-span-2 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
            <select
              id="ads-select-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-xl bg-[#0B1020] border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Instagram">Instagram / Meta</option>
              <option value="TikTok">TikTok</option>
              <option value="LinkedIn">LinkedIn B2B</option>
              <option value="Google Ads">Google Ads</option>
            </select>
          </div>
          <input
            id="ads-input-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={tri(l, 'Hedef Kitle (Örn: 25-45 yaş profesyoneller)', 'Target Audience (e.g. 25-45 professionals)', 'Zielgruppe (z.B. 25-45 Berufstätige)')}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
          />

          <button
            id="ads-run-btn"
            onClick={generateAds}
            disabled={lab.loading || !product.trim()}
            className="w-full group relative overflow-hidden rounded-xl py-3.5 font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #D97706)` }}
          >
            <span className="relative flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {tri(l, '3 Yüksek Dönüşümlü Reklam Açısı Üret', 'Generate 3 High-Converting Ad Angles', '3 High-Converting Ad-Angles generieren')}
            </span>
          </button>
        </div>

        {/* Loading */}
        {lab.loading && (
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
            <ThinkingSteps
              accent={ACCENT}
              steps={[
                tri(l, 'Hedef kitlenin satın alma bariyerleri taranıyor...', 'Analyzing audience purchase barriers...', 'Kaufbarrieren der Zielgruppe scannen...'),
                tri(l, 'Acı noktası, sosyal kanıt ve teklif kancaları yazılıyor...', 'Drafting pain point, social proof and offer hooks...', 'Schmerzpunkt-, Social-Proof- und Angebots-Hooks texten...'),
                tri(l, 'Sektörel CTR tahminleri simüle ediliyor...', 'Simulating industry CTR benchmarks...', 'Branchen-CTR simulieren...'),
              ]}
            />
          </div>
        )}

        {/* Results */}
        {result && !lab.loading && (
          <div className="space-y-4 pt-2" style={{ animation: 'fadeInUp 0.5s ease both' }}>
            {/* Audience insight */}
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/20 text-xs text-amber-200 leading-relaxed">
              💡 <strong className="text-white">{tri(l, 'Kitle Psikolojisi:', 'Audience Psychology:', 'Zielgruppen-Psychologie:')}</strong> {result.audienceInsight}
            </div>

            {/* 3 Angle Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {result.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(i)}
                  className={`p-3 rounded-xl border text-left transition-all ${selectedVariant === i ? 'border-amber-400 bg-amber-500/15' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 truncate">{v.angle}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      ~{v.predictedCtr}% CTR
                    </span>
                  </div>
                  <div className="text-xs text-white font-medium truncate">{v.hook}</div>
                </button>
              ))}
            </div>

            {/* Selected Ad Preview Card */}
            {result.variants[selectedVariant] && (
              <div className="p-5 rounded-2xl border border-white/10 bg-black/40 relative">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center font-black text-black text-xs">
                      S
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">starwebflow_ads</div>
                      <div className="text-[10px] text-slate-400">{platform} Sponsored</div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      copyAd(
                        `${result.variants[selectedVariant].hook}\n\n${result.variants[selectedVariant].primaryText}\n\n👉 ${result.variants[selectedVariant].cta}`,
                        selectedVariant
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300 hover:text-white hover:border-amber-400 transition-colors"
                  >
                    {copiedIdx === selectedVariant ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> {tri(l, 'Kopyalandı', 'Copied', 'Kopiert')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> {tri(l, 'Metni Kopyala', 'Copy Copy', 'Text kopieren')}
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-bold text-amber-300 leading-snug">
                    {result.variants[selectedVariant].hook}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {result.variants[selectedVariant].primaryText}
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      ⚡ {tri(l, 'Tahmini Tıklama:', 'Est. CTR:', 'Geschätzte CTR:')} <strong className="text-emerald-400 font-mono">%{result.variants[selectedVariant].predictedCtr}</strong>
                    </span>
                    <button className="px-4 py-2 rounded-lg text-xs font-bold text-black" style={{ background: ACCENT }}>
                      {result.variants[selectedVariant].cta} →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </LabConsole>
  )
}
