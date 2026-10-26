'use client'

import { useState } from 'react'
import { Megaphone, TrendingUp, Target, ShieldCheck, CheckCircle2, Eye, Flame, RefreshCw, BarChart3, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { tri } from './LabKit'

export default function AdsTelemetryCockpit() {
  const { language } = useLanguage()
  const l = language as 'tr' | 'en' | 'de'
  const [activeTab, setActiveTab] = useState<'attribution' | 'fatigue' | 'roas'>('attribution')
  const [testingCapi, setTestingCapi] = useState(false)
  const [eventMatchQuality, setEventMatchQuality] = useState('9.4 / 10')

  const auditCapiSignal = () => {
    setTestingCapi(true)
    setTimeout(() => {
      setTestingCapi(false)
      setEventMatchQuality('9.8 / 10 (Elite)')
    }, 650)
  }

  return (
    <div className="relative rounded-3xl bg-[#140D07] border border-white/[0.08] text-slate-100 p-6 sm:p-7 shadow-2xl overflow-hidden group">
      {/* Ambient gradient glow */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none bg-amber-600" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-rose-600" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
              {tri(l, 'PERFORMANS ATTRIBUTION KOMUTA MERKEZİ', 'PERFORMANCE ATTRIBUTION ENGINE', 'PERFORMANCE ATTRIBUTION ENGINE')}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {tri(l, 'Meta CAPI, Sinyal Kurtarma & ROAS Telemetrisi', 'Meta CAPI, Signal Recovery & ROAS Telemetry', 'Meta CAPI, Signal-Wiederherstellung & ROAS')}
          </h3>
        </div>
        <button
          onClick={auditCapiSignal}
          disabled={testingCapi}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-amber-400 ${testingCapi ? 'animate-spin' : ''}`} />
          <span>{testingCapi ? tri(l, 'CAPI Sinyali Taranıyor…', 'Scanning CAPI…', 'CAPI wird geprüft…') : tri(l, 'CAPI Sağlık Testi', 'Audit CAPI Health', 'CAPI-Signal prüfen')}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Target className="w-3 h-3 text-amber-400" />
            Sinyal Kurtarma
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 tracking-tight">+34.8%</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'iOS 14.5+ kayıpları geri alındı', 'iOS 14.5+ signal recovered', 'iOS 14.5+ Signal gerettet')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-emerald-400" />
            Thumb-Stop Rate
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">&gt; 38.4%</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Sektör medyanı: %14.2', 'Industry median: 14.2%', 'Branchenmedian: 14,2 %')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-rose-400" />
            Blended ROAS
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">4.2x — 6.8x</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{tri(l, 'Ölçeklenen hesap ortalaması', 'Scale account average', 'Skalierter Account-Schnitt')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
        {[
          { id: 'attribution' as const, label: tri(l, 'Meta CAPI & Sunucu Takip', 'Server-Side CAPI', 'Server-Side CAPI') },
          { id: 'fatigue' as const, label: tri(l, 'Kreatif Yorulma Radarı', 'Creative Fatigue', 'Creative-Ermüdung') },
          { id: 'roas' as const, label: tri(l, 'Bütçe & Skalalama Matrisi', 'Scaling Matrix', 'Skalierungs-Matrix') },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-amber-600/30 text-white border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'attribution' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, 'Meta Conversions API (CAPI) & Gateway', 'Meta Conversions API (CAPI) Gateway', 'Meta Conversions API (CAPI) Gateway'),
              desc: tri(l, 'Tarayıcı ad-blocker\'larına takılmadan sunucudan sunucuya (Edge) doğrudan Meta ve TikTok yapay zekasına besleme.', 'Direct server-to-server event dispatch bypassing browser ad-blockers.', 'Direkte Server-zu-Server-Events ohne Verluste durch Ad-Blocker.'),
              stat: `Event Match: ${eventMatchQuality}`,
            },
            {
              title: tri(l, 'Gelişmiş Eşleme (Advanced Matching) & Çerez Ömrü', 'First-Party Cookies & Advanced Matching', 'First-Party Cookies & Matching'),
              desc: tri(l, 'Apple Safari ITP 7 günlük çerez kısıtlamasını aşan first-party HTTP-Only çerez altyapısı.', 'Bypasses Safari 7-day cookie limits via secure HTTP-only domain cookies.', 'Überwindet Safari-Beschränkungen mit sicheren HTTP-Only-Cookies.'),
              stat: 'ITP 100% Bypass',
            },
            {
              title: tri(l, 'Google Ads Gelişmiş Dönüşümler (Enhanced)', 'Google Enhanced Conversions Protocol', 'Google Enhanced Conversions'),
              desc: tri(l, 'Kriptografik SHA-256 hash ile müşteri verisi anonimleştirilerek Google algoritmasına öğretilir.', 'Cryptographically hashes customer data to train Google bidding AI.', 'Sichere SHA-256 Hashes für optimierte Google AI-Gebote.'),
              stat: '+%18 Kurtarma',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                {item.stat}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'fatigue' && (
        <div className="space-y-2.5">
          {[
            {
              metric: tri(l, 'İlk 1.5 Saniye Kanca Skoru (Hook Rate)', '1.5-Second Hook Thumb-Stop Rate', '1,5s Hook Thumb-Stop Rate'),
              standard: '%12 - %15 (Standart reklam ajansı)',
              star: '> %38.4 (StarWebFlow Psikolojik Kanca)',
              desc: tri(l, 'Hedef kitlenin acısını ilk 1.5 saniyede adlandıran açılarla kaydırmayı anında durdurur.', 'Stops thumb scroll in its tracks by calling out pain points immediately.', 'Stoppt den Daumen sofort durch präzise Ansprache des Schmerzpunkts.'),
            },
            {
              metric: tri(l, 'Kreatif Yorulma (Ad Fatigue) Erken Uyarısı', 'Automated Ad Fatigue Detection', 'Früherkennung von Ad-Fatigue'),
              standard: tri(l, 'Para yandıktan günler sonra fark edilir', 'Noticed days after budget is wasted', 'Tage nach Budgetverschwendung bemerkt'),
              star: tri(l, 'CTR < %1.8 düştüğü an otomatik rotasyon', 'Auto-rotates immediately when CTR drops', 'Automatische Rotation bei CTR-Abfall'),
              desc: tri(l, 'Algoritma bir kreatiften sıkılmaya başladığında sistem yeni varyantı devreye sokar.', 'Proactively injects fresh creative angles before CPA spikes.', 'Aktiviert neue Varianten, bevor der CPA ansteigt.'),
            },
            {
              metric: tri(l, 'Çoklu Açı Test Çerçevesi (3x2x2 Matrisi)', 'Multi-Angle 3x2x2 Testing Matrix', 'Multi-Angle 3x2x2 Test-Matrix'),
              standard: '1 video, 1 metin (yüksek risk)',
              star: '12 dinamik kombinasyon aynı anda',
              desc: tri(l, 'Acı noktası, sosyal kanıt ve teklif kancaları eşzamanlı çarpıştırılarak kazanan seçilir.', 'Tests pain, proof, and scarcity hooks concurrently to crown winners.', 'Kombiniert Schmerz-, Social-Proof- und Rabatt-Hooks parallel.'),
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-xs font-semibold text-white mb-0.5">{item.metric}</div>
              <div className="text-[11px] text-emerald-400 font-mono">{item.star}</div>
              <div className="text-[10px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              <div className="mt-1 text-[10px] font-mono text-rose-400/80">
                {tri(l, 'Piyasa Ortalaması:', 'Industry Avg:', 'Markt-Schnitt:')} {item.standard}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'roas' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, 'Skalalama Protokolü: Ad-Set Düzeyi vs CBO/ASC+', 'Advantage+ & CBO Budget Scaling', 'Advantage+ & CBO Budget-Skalierung'),
              desc: tri(l, 'Günde €100 harcarken çalışan kreatif ile €3.000 harcarken çalışan kreatif aynı değildir. Algoritmaya uygun geniş kitle kreatifleri üretilir.', 'Engineers broad-appeal creative assets that thrive at 5-figure daily budgets.', 'Erstellt Creatives, die auch bei fünfstelligem Tagesbudget konvertieren.'),
              tag: '€50k+/ay Skala',
            },
            {
              title: tri(l, 'Dönüşüm Hunisi Uyumu (Top-Funnel vs Retargeting)', 'Full-Funnel Lifecycle Architecture', 'Full-Funnel Architektur'),
              desc: tri(l, 'Soğuk kitleye hikaye ve problem; sepette kalan sıcak kitleye doğrudan itiraz kırıcı ve garanti gösterilir.', 'Cold traffic gets problem education; cart abandoners see ironclad proof.', 'Kalter Traffic lernt das Problem kennen; warme Leads sehen Beweise.'),
              tag: 'Dönüşüm +%48',
            },
            {
              title: tri(l, 'Platformlar Arası Bütünleşik Büyüme (Meta + Google)', 'Blended Omni-Attribution Modeling', 'Plattformübergreifende Attribution'),
              desc: tri(l, 'Meta reklamları talep yaratır; Google Search o talebi toplar. İkisi tek veri havuzunda birleştirilir.', 'Meta generates initial demand; Google captures intent. Synchronized.', 'Meta weckt Nachfrage; Google Search fängt Kaufabsichten ab.'),
              tag: 'Blended ROAS',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Trust */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          {tri(l, 'Resmi Meta & Google Partner Standartları', 'Official Meta & Google Partner Standards', 'Offizielle Meta & Google Partner-Standards')}
        </span>
        <span className="text-emerald-400 font-semibold">{tri(l, 'Sıfır Kör Harcama', 'Zero Blind Spend', 'Keine Blindausgaben')}</span>
      </div>
    </div>
  )
}
