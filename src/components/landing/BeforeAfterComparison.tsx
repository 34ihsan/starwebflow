'use client';

import React, { useState } from 'react';
import { Zap, Gauge, TrendingUp, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BeforeAfterComparison() {
  const { language } = useLanguage();
  const [sliderPos, setSliderPos] = useState<number>(50);

  const isTr = language === 'tr';
  const isDe = language === 'de';

  return (
    <section className="py-20 bg-[#0A0A0F] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border border-white/10 text-xs font-semibold text-purple-300 mb-4">
            <Sliders className="w-3.5 h-3.5" />
            {isTr ? 'Canlı Performans Karşılaştırması' : isDe ? 'Live-Performanzvergleich' : 'Live Performance Comparison'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isTr ? (
              <>
                Geleneksel Yavaş Siteler <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">vs StarWebFlow Next.js 14</span>
              </>
            ) : isDe ? (
              <>
                Klassische Langsame Websites <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">vs StarWebFlow Next.js 14</span>
              </>
            ) : (
              <>
                Traditional Slow Websites <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">vs StarWebFlow Next.js 14</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-[#94A3B8] text-base sm:text-lg">
            {isTr
              ? 'Aşağıdaki kaydırıcıyı çekerek eski teknolojiler ile StarWebFlow hibrit mimarisinin hız, dönüşüm ve müşteri memnuniyeti farkını canlı görün.'
              : isDe
              ? 'Ziehen Sie den Regler, um den Unterschied in Geschwindigkeit, Conversion und Kundenzufriedenheit live zu vergleichen.'
              : 'Drag the slider below to see the live difference in speed, conversion rate, and customer satisfaction.'}
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div className="relative w-full rounded-2xl border border-white/10 bg-[#0D0D14] overflow-hidden shadow-2xl min-h-[480px]">
          {/* BEFORE CARD (Background Left) */}
          <div className="absolute inset-0 p-6 sm:p-10 bg-gradient-to-br from-rose-950/20 via-[#0A0A0F] to-transparent flex flex-col justify-between">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-6">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isTr ? 'GELENEKSEL YAVAŞ SİTE' : isDe ? 'KLASSISCHE TRÄGE WEBSITE' : 'TRADITIONAL SLOW SITE'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isTr ? 'Yavaş Yüklenme & Müşteri Kaybı' : isDe ? 'Langsame Ladezeit & Kundenverlust' : 'Slow Speed & Lost Prospects'}
              </h3>
              <ul className="space-y-3 text-sm text-[#94A3B8]">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  {isTr ? 'Yüklenme Süresi: 4.2 saniye (Ziyaretçilerin %53\'ü kaçıyor)' : isDe ? 'Ladezeit: 4,2s (53% Abbrüche)' : 'Load Time: 4.2s (53% bounce rate)'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  {isTr ? 'Lighthouse Performans Skoru: 34 / 100' : isDe ? 'Lighthouse-Score: 34 / 100' : 'Lighthouse Score: 34 / 100'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  {isTr ? 'Satış Dönüşüm Oranı: %1.2 (Düşük Bütçeli Müşteri)' : isDe ? 'Conversion-Rate: 1.2%' : 'Conversion Rate: 1.2%'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  {isTr ? '7/24 Yanıt Yok: Gece gelen talepler cevapsız kalıyor' : isDe ? 'Keine 24/7 Antwort: Anfragen bleiben unbeantwortet' : 'No 24/7 Response: Night leads left unserved'}
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
                <Gauge className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <span className="block text-xs text-[#94A3B8]">Hız Skoru</span>
                <span className="text-lg font-bold text-rose-400">34 / 100</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
                <Zap className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <span className="block text-xs text-[#94A3B8]">LCP Süresi</span>
                <span className="text-lg font-bold text-rose-400">4.2s</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
                <TrendingUp className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <span className="block text-xs text-[#94A3B8]">Dönüşüm</span>
                <span className="text-lg font-bold text-rose-400">%1.2</span>
              </div>
            </div>
          </div>

          {/* AFTER CARD (Clipped Right Over Before) */}
          <div
            className="absolute inset-0 p-6 sm:p-10 bg-gradient-to-br from-emerald-950/40 via-[#0B1510] to-[#0A0A0F] flex flex-col justify-between overflow-hidden"
            style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
          >
            <div className="max-w-md ml-auto text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isTr ? 'STARWEBFLOW NEXT.JS 14' : isDe ? 'STARWEBFLOW NEXT.JS 14' : 'STARWEBFLOW NEXT.JS 14'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {isTr ? 'Sub-Second Hız & 3x Müşteri Dönüşümü' : isDe ? 'Sub-Second Speed & 3x Conversion' : 'Sub-Second Speed & 3x Conversion'}
              </h3>
              <ul className="space-y-3 text-sm text-[#94A3B8] inline-block text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {isTr ? 'Yüklenme Süresi: 0.38 saniye (Anında açılma)' : isDe ? 'Ladezeit: 0,38s (Sofort)' : 'Load Time: 0.38s (Instant)'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {isTr ? 'Lighthouse Skoru: 99 / 100 (Google Sıralama Lideri)' : isDe ? 'Lighthouse-Score: 99 / 100' : 'Lighthouse Score: 99 / 100'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {isTr ? 'Satış Dönüşüm Oranı: %4.8 (3x Rekor Ciro)' : isDe ? 'Conversion-Rate: 4.8% (3x Umsatz)' : 'Conversion Rate: 4.8% (3x Revenue)'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {isTr ? '7/24 Otonom AI Ajanı: Gece gelen talepleri anında satışa çevirir' : isDe ? '24/7 Autonomer KI-Agent: Wandelt Nacht-Leads sofort um' : '24/7 Autonomous AI Agent: Converts p.m. leads instantly'}
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 max-w-md ml-auto">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <Gauge className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="block text-xs text-[#94A3B8]">Hız Skoru</span>
                <span className="text-lg font-bold text-emerald-400">99 / 100</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="block text-xs text-[#94A3B8]">LCP Süresi</span>
                <span className="text-lg font-bold text-emerald-400">0.38s</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="block text-xs text-[#94A3B8]">Dönüşüm</span>
                <span className="text-lg font-bold text-emerald-400">%4.8</span>
              </div>
            </div>
          </div>

          {/* SLIDER HANDLE LINE */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-emerald-400 to-purple-500 cursor-ew-resize z-30"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 rounded-full bg-white text-black shadow-xl flex items-center justify-center font-bold text-xs border-2 border-purple-500">
              ↔
            </div>
          </div>

          {/* SLIDER INPUT RANGE */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
          />
        </div>
      </div>
    </section>
  );
}
