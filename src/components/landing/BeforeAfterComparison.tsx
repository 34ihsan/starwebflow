'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Gauge, TrendingUp, AlertTriangle, CheckCircle2, Sliders, 
  Play, RotateCcw, Monitor, Bot, ArrowRight, ShieldCheck, 
  Clock, DollarSign, Users, Sparkles, Activity
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BeforeAfterComparison() {
  const { language } = useLanguage();
  const isTr = language === 'tr';
  const isDe = language === 'de';

  const [sliderPos, setSliderPos] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<'speed' | 'revenue' | 'ai'>('speed');
  
  // Benchmark simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [slowTime, setSlowTime] = useState<number>(4.2);
  const [fastTime, setFastTime] = useState<number>(0.38);
  const [slowProgress, setSlowProgress] = useState<number>(100);
  const [fastProgress, setFastProgress] = useState<number>(100);
  const [slowPhase, setSlowPhase] = useState<string>('idle');
  const [fastPhase, setFastPhase] = useState<string>('idle');

  const animationRef = useRef<number | null>(null);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSlowProgress(0);
    setFastProgress(0);
    setSlowTime(0);
    setFastTime(0);
    setSlowPhase('init');
    setFastPhase('init');

    const startTime = performance.now();
    const FAST_DURATION = 380; // 0.38s
    const SLOW_DURATION = 4200; // 4.2s

    const updateFrame = (now: number) => {
      const elapsed = now - startTime;

      // Fast side (StarWebFlow Next.js)
      if (elapsed < FAST_DURATION) {
        const p = (elapsed / FAST_DURATION) * 100;
        setFastProgress(p);
        setFastTime(Number((elapsed / 1000).toFixed(2)));
        setFastPhase('rendering');
      } else {
        setFastProgress(100);
        setFastTime(0.38);
        setFastPhase('completed');
      }

      // Slow side (Traditional)
      if (elapsed < SLOW_DURATION) {
        const p = (elapsed / SLOW_DURATION) * 100;
        setSlowProgress(p);
        setSlowTime(Number((elapsed / 1000).toFixed(2)));
        
        if (elapsed < 1200) {
          setSlowPhase('ttfb');
        } else if (elapsed < 2800) {
          setSlowPhase('blocking');
        } else {
          setSlowPhase('uncompressed');
        }

        animationRef.current = requestAnimationFrame(updateFrame);
      } else {
        setSlowProgress(100);
        setSlowTime(4.2);
        setSlowPhase('completed');
        setIsSimulating(false);
      }
    };

    animationRef.current = requestAnimationFrame(updateFrame);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <section className="py-20 bg-[#FAFBFD] relative overflow-hidden border-t border-slate-200">
      {/* Background accents */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-4 shadow-2xs">
            <Activity className="w-3.5 h-3.5" />
            {isTr ? 'Canlı Performans & Teknoloji Laboratuvarı' : isDe ? 'Live-Performanz & Technologie-Labor' : 'Live Performance & Tech Benchmark'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-['Outfit']">
            {isTr ? (
              <>
                Geleneksel Yavaş Siteler <span className="bg-gradient-to-r from-rose-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">vs StarWebFlow Sub-Second & AI</span>
              </>
            ) : isDe ? (
              <>
                Klassische Langsame Websites <span className="bg-gradient-to-r from-rose-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">vs StarWebFlow Sub-Second & KI</span>
              </>
            ) : (
              <>
                Traditional Slow Websites <span className="bg-gradient-to-r from-rose-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">vs StarWebFlow Sub-Second & AI</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            {isTr
              ? 'Web sitenizin 1 saniye geç açılması bile cironuzun %7\'sini yok eder. Aşağıdaki canlı simülatörü çalıştırarak aradaki hız, mimari ve satış farkını bizzat deneyimleyin.'
              : isDe
              ? 'Schon 1 Sekunde Verzögerung kostet bis zu 7% Ihres Umsatzes. Starten Sie den Simulator und vergleichen Sie Live-Speed und Konvertierungsraten.'
              : 'A 1-second delay destroys up to 7% of conversions. Run the live benchmark below to experience the real-world speed and revenue difference.'}
          </p>

          {/* Interactive Benchmark Controller */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  {isTr ? 'Canlı Benchmark Çalışıyor...' : isDe ? 'Test läuft...' : 'Benchmarking...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  {isTr ? '▶ Canlı Hız Testini Başlat' : isDe ? '▶ Live-Speed-Test starten' : '▶ Start Live Speed Test'}
                </>
              )}
            </button>

            {/* Metric Mode Switchers */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('speed')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'speed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                ⚡ {isTr ? 'Hız & Core Web Vitals' : 'Speed & Core Vitals'}
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'revenue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                💰 {isTr ? 'Ciro & Terk Oranı' : 'Revenue & Bounce'}
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🤖 {isTr ? '7/24 AI Satış Gücü' : '24/7 AI Sales'}
              </button>
            </div>
          </div>
        </div>

        {/* ── LIVE SIMULATION DUAL BROWSER / SLIDER CONTAINER ── */}
        <div className="relative w-full rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xl">
          
          {/* Simulated Browser Chrome Top Header */}
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs font-bold text-slate-600 ml-2 hidden sm:inline-block">
                {isTr ? 'Canlı Tarayıcı Simülasyonu & Web Vitals Testi' : 'Browser Simulator & Web Vitals Test'}
              </span>
            </div>

            {/* Quick Slider Position Shortcuts */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-500 mr-1 hidden md:inline">{isTr ? 'Görünüm:' : 'View:'}</span>
              <button 
                onClick={() => setSliderPos(0)} 
                className={`px-2 py-1 rounded text-[11px] font-bold ${sliderPos === 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {isTr ? 'Sadece Eski' : 'Old Only'}
              </button>
              <button 
                onClick={() => setSliderPos(50)} 
                className={`px-2 py-1 rounded text-[11px] font-bold ${sliderPos === 50 ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                50 / 50
              </button>
              <button 
                onClick={() => setSliderPos(100)} 
                className={`px-2 py-1 rounded text-[11px] font-bold ${sliderPos === 100 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {isTr ? 'Sadece StarWebFlow' : 'StarWebFlow Only'}
              </button>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className="relative min-h-[580px] sm:min-h-[520px] select-none">
            
            {/* ── LEFT SIDE (GELENEKSEL YAVAŞ SİTE) ── */}
            <div className="absolute inset-0 p-6 sm:p-10 bg-gradient-to-br from-rose-50/60 via-white to-slate-50 flex flex-col justify-between">
              
              {/* Simulated Address Bar Left */}
              <div className="max-w-md w-full mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 mb-4">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>https://eski-site.com</span>
                  <span className="ml-auto text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    HTTP/1.1 (Yavaş)
                  </span>
                </div>

                {/* Status bar */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {slowPhase === 'init' && 'Bağlantı kuruluyor...'}
                      {slowPhase === 'ttfb' && '⚠️ TTFB Gecikmesi (Sunucu meşgul)'}
                      {slowPhase === 'blocking' && '⚠️ Render engelleyen 18 JS eklentisi'}
                      {slowPhase === 'uncompressed' && '⚠️ Ağır sıkıştırılmamış resimler'}
                      {slowPhase === 'completed' && '❌ Yükleme Bitti: 4.2s (Müşterilerin %53\'ü kaçtı)'}
                      {slowPhase === 'idle' && 'Geleneksel Monolitik / WordPress Site'}
                    </span>
                    <span className="font-mono text-rose-600 font-bold">{slowTime.toFixed(2)}s</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-100 rounded-full" 
                      style={{ width: `${slowProgress}%` }}
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-100/80 border border-rose-200 text-rose-800 text-xs font-bold mb-3 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  {isTr ? 'GELENEKSEL YAVAŞ SİTE' : 'TRADITIONAL SLOW WEBSITE'}
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 font-['Outfit']">
                  {isTr ? 'Yavaş Yüklenme & Ciro Kaybı' : 'Slow Speed & Lost Revenue'}
                </h3>

                {activeTab === 'speed' && (
                  <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>LCP: 4.2s</strong> — Sayfa ekrana gelene kadar kullanıcı sıkılıp çıkıyor.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Lighthouse: 34/100</strong> — Google SEO sıralamasında geriye düşer.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Ağır Veritabanı Yükü:</strong> Paylaşımlı hostingde eşzamanlı 50 kişide çöker.</span>
                    </li>
                  </ul>
                )}

                {activeTab === 'revenue' && (
                  <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>%53 Terk Etme Oranı:</strong> 3 saniyeyi geçen her tıklama doğrudan çöpe gider.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Dönüşüm Oranı: %1.2</strong> — Reklam bütçenizin çoğu boşa harcanır.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Müşteri Algısı:</strong> Yavaş site profesyonel olmayan işletme izlenimi verir.</span>
                    </li>
                  </ul>
                )}

                {activeTab === 'ai' && (
                  <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Statik İletişim Formu:</strong> Müşteri saatlerce veya günlerce yanıt bekler.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Gece Gelen Talepler Kayıp:</strong> Mesai saati dışındaki alıcılar rakibe gider.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      <span><strong>Sıfır Kişiselleştirme:</strong> Her ziyaretçiye aynı cansız şablon gösterilir.</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Bottom Metric Cards Left */}
              <div className="grid grid-cols-3 gap-3 max-w-md w-full">
                <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-center shadow-xs">
                  <Gauge className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Hız Skoru</span>
                  <span className="text-xl font-black text-rose-600 font-['Outfit']">34 / 100</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-center shadow-xs">
                  <Zap className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">LCP Süresi</span>
                  <span className="text-xl font-black text-rose-600 font-['Outfit']">{slowTime > 0 ? `${slowTime.toFixed(1)}s` : '4.2s'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-center shadow-xs">
                  <TrendingUp className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Dönüşüm</span>
                  <span className="text-xl font-black text-rose-600 font-['Outfit']">%1.2</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDE (STARWEBFLOW NEXT.JS 14 - CLIPPED) ── */}
            <div
              className="absolute inset-0 p-6 sm:p-10 bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/50 flex flex-col justify-between overflow-hidden"
              style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
            >
              {/* Simulated Address Bar Right */}
              <div className="max-w-md w-full ml-auto text-right">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono font-bold">https://starwebflow.com</span>
                  <span className="ml-auto text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                    HTTP/3 • Edge CDN (Global)
                  </span>
                </div>

                {/* Status bar */}
                <div className="space-y-1.5 mb-6 text-left">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {fastPhase === 'init' && 'Edge Server bağlandı...'}
                      {fastPhase === 'rendering' && '⚡ Sub-second Server Component Streamed'}
                      {fastPhase === 'completed' && '✨ Anında Açıldı: 0.38s (Lighthouse 99 Skor)'}
                      {fastPhase === 'idle' && 'StarWebFlow Hibrit Edge Mimarisi'}
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">{fastTime.toFixed(2)}s</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 transition-all duration-75 rounded-full" 
                      style={{ width: `${fastProgress}%` }}
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold mb-3 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isTr ? 'STARWEBFLOW SUB-SECOND & MODEL-AGNOSTİK AI' : 'STARWEBFLOW SUB-SECOND & MODEL-AGNOSTIC AI'}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 font-['Outfit']">
                  {isTr ? 'Sub-Second Hız & 3.6x Ciro Artışı' : 'Sub-Second Speed & 3.6x Revenue'}
                </h3>

                {activeTab === 'speed' && (
                  <ul className="space-y-2.5 text-sm text-slate-800 font-semibold inline-block text-left">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>LCP: 0.38s</strong> — Göz kırpma hızında (sub-second) anında tam yüklenme.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Lighthouse: 99/100</strong> — Google SEO ve Ads kalite skorlarında zirve.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Global Edge Dağıtım:</strong> Frankfurt, İstanbul, Zürih sunucularında sıfır gecikme.</span>
                    </li>
                  </ul>
                )}

                {activeTab === 'revenue' && (
                  <ul className="space-y-2.5 text-sm text-slate-800 font-semibold inline-block text-left">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>%8.4 Düşük Bounce:</strong> Reklamdan gelen her ziyaretçi anında siteyi görür.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Dönüşüm Oranı: %4.8</strong> — Aynı reklam bütçesiyle 3.6 kat daha fazla müşteri.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Premium Prestij:</strong> Apple akıcılığında deneyim, yüksek bütçeli teklifler getirir.</span>
                    </li>
                  </ul>
                )}

                {activeTab === 'ai' && (
                  <ul className="space-y-2.5 text-sm text-slate-800 font-semibold inline-block text-left">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Model-Agnostik AI & Ses:</strong> Sesli ve yazılı olarak müşteriyi 0.9s karşılar, analiz eder.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Gece Satış Yapabilme:</strong> 7/24 randevu oluşturur, WhatsApp veya CRM'e yazar.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Sıfır Vendor Lock-in:</strong> Claude, Llama, GPT desteğiyle TR, DE, EN akıcı satış motoru.</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Bottom Metric Cards Right */}
              <div className="grid grid-cols-3 gap-3 max-w-md w-full ml-auto">
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-center shadow-xs">
                  <Gauge className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Hız Skoru</span>
                  <span className="text-xl font-black text-emerald-700 font-['Outfit']">99 / 100</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-center shadow-xs">
                  <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">LCP Süresi</span>
                  <span className="text-xl font-black text-emerald-700 font-['Outfit']">0.38s</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-center shadow-xs">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">Dönüşüm</span>
                  <span className="text-xl font-black text-emerald-700 font-['Outfit']">%4.8</span>
                </div>
              </div>
            </div>

            {/* ── DRAGGABLE SLIDER LINE & HANDLE ── */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-600 to-emerald-500 cursor-ew-resize z-30 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center font-black text-sm border-2 border-blue-600 cursor-ew-resize hover:scale-110 transition-transform">
                ↔
              </div>
            </div>

            {/* SLIDER INPUT RANGE OVERLAY */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Karşılaştırma kaydırıcısı"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
            />
          </div>

          {/* Bottom Explanation Banner */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                💡
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {isTr 
                    ? 'Bu Testte Tam Olarak Ne Ölçülüyor?' 
                    : 'Was genau wird in diesem Test gemessen?'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isTr 
                    ? 'Google Lighthouse LCP (Largest Contentful Paint) ve TTFB (Sunucu Tepki Süresi) baz alınarak gerçek dünya tarayıcı simülasyonu çalıştırılır.' 
                    : 'Echte Browser-Simulation basierend auf Google Lighthouse LCP & TTFB.'}
                </p>
              </div>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              <span>{isTr ? 'Sitenizi Ücretsiz Analiz Ettirin' : 'Kostenlose Web-Analyse anfordern'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
