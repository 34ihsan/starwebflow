'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Zap,
  Share2,
  Search,
  Clock,
  PieChart,
  UserCheck,
  RotateCw,
  Eye,
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Layers,
  DollarSign,
  Users,
  Target,
  RefreshCw,
  Copy,
  ChevronRight
} from 'lucide-react';
import {
  scoreLeadWithAI,
  runCROAudit,
  createReferralCampaign,
  generateSocialShareKit,
  generateProgrammaticSeoIdeas,
  calculateSmartDaypartingSchedule,
  getAttributionInsights,
  runLtvAndChurnAudit,
  generateFlywheelPlan,
  runCompetitorPricingRadar,
  generatePlgToolConcept
} from '@/app/actions/growth';

export default function GrowthClient() {
  const [activeTab, setActiveTab] = useState('scoring');

  // Module 1: Lead Scoring State
  const [leadName, setLeadName] = useState('Ahmet Yılmaz (E-Ticaret CEO)');
  const [scoringResult, setScoringResult] = useState<any>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Module 2: CRO State
  const [croPage, setCroPage] = useState('Ana Sayfa Lead Formu');
  const [croResult, setCroResult] = useState<any>(null);
  const [isCroRunning, setIsCroRunning] = useState(false);

  // Module 3: Referral & Viral State
  const [refName, setRefName] = useState('Mehmet Demir');
  const [refEmail, setRefEmail] = useState('mehmet@teknoloji.com');
  const [refResult, setRefResult] = useState<any>(null);
  const [shareKit, setShareKit] = useState<any>(null);
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);

  // Module 4: Programmatic SEO State
  const [seoIndustry, setSeoIndustry] = useState('E-Ticaret & Ajanslar');
  const [seoResult, setSeoResult] = useState<any>(null);
  const [isSeoRunning, setIsSeoRunning] = useState(false);

  // Module 5: Dayparting State
  const [daypartingResult, setDaypartingResult] = useState<any>(null);
  const [isDaypartingRunning, setIsDaypartingRunning] = useState(false);

  // Module 6: Multi-Touch Attribution State
  const [attributionResult, setAttributionResult] = useState<any>(null);
  const [isAttributionRunning, setIsAttributionRunning] = useState(false);

  // Module 7: LTV & Churn State
  const [ltvResult, setLtvResult] = useState<any>(null);
  const [isLtvRunning, setIsLtvRunning] = useState(false);

  // Module 8: Flywheel State
  const [flywheelTopic, setFlywheelTopic] = useState('B2B Reklam Maliyetini %50 Düşürme');
  const [flywheelResult, setFlywheelResult] = useState<any>(null);
  const [isFlywheelRunning, setIsFlywheelRunning] = useState(false);

  // Module 9: Competitor Radar State
  const [compNiche, setCompNiche] = useState('Dijital Pazarlama & Ajans Yazılımları');
  const [compResult, setCompResult] = useState<any>(null);
  const [isCompRunning, setIsCompRunning] = useState(false);

  // Module 10: PLG Tool Spec State
  const [plgToolType, setPlgToolType] = useState('ROAS & Kayıp Bütçe Hesaplayıcı');
  const [plgResult, setPlgResult] = useState<any>(null);
  const [isPlgRunning, setIsPlgRunning] = useState(false);

  // Handlers
  const handleScoreLead = async () => {
    setIsScoring(true);
    try {
      const res = await scoreLeadWithAI('demo-lead-id');
      setScoringResult(res.data);
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setIsScoring(false);
    }
  };

  const handleRunCro = async () => {
    setIsCroRunning(true);
    try {
      const res = await runCROAudit(croPage);
      if (res.success) setCroResult(res.data);
    } finally {
      setIsCroRunning(false);
    }
  };

  const handleCreateReferral = async () => {
    try {
      const res = await createReferralCampaign({ referrerName: refName, referrerEmail: refEmail, rewardType: 'credit' });
      if (res.success) setRefResult(res.data);
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const handleGenerateShareKit = async () => {
    setIsGeneratingKit(true);
    try {
      const res = await generateSocialShareKit('Starwebflow');
      if (res.success) setShareKit(res.data);
    } finally {
      setIsGeneratingKit(false);
    }
  };

  const handleGenerateSeo = async () => {
    setIsSeoRunning(true);
    try {
      const res = await generateProgrammaticSeoIdeas(seoIndustry);
      if (res.success) setSeoResult(res.data);
    } finally {
      setIsSeoRunning(false);
    }
  };

  const handleCalculateDayparting = async () => {
    setIsDaypartingRunning(true);
    try {
      const res = await calculateSmartDaypartingSchedule();
      if (res.success) setDaypartingResult(res.data);
    } finally {
      setIsDaypartingRunning(false);
    }
  };

  const handleFetchAttribution = async () => {
    setIsAttributionRunning(true);
    try {
      const res = await getAttributionInsights();
      if (res.success) setAttributionResult(res.data);
    } finally {
      setIsAttributionRunning(false);
    }
  };

  const handleRunLtv = async () => {
    setIsLtvRunning(true);
    try {
      const res = await runLtvAndChurnAudit();
      if (res.success) setLtvResult(res.data);
    } finally {
      setIsLtvRunning(false);
    }
  };

  const handleRunFlywheel = async () => {
    setIsFlywheelRunning(true);
    try {
      const res = await generateFlywheelPlan(flywheelTopic);
      if (res.success) setFlywheelResult(res.data);
    } finally {
      setIsFlywheelRunning(false);
    }
  };

  const handleRunComp = async () => {
    setIsCompRunning(true);
    try {
      const res = await runCompetitorPricingRadar(compNiche);
      if (res.success) setCompResult(res.data);
    } finally {
      setIsCompRunning(false);
    }
  };

  const handleRunPlg = async () => {
    setIsPlgRunning(true);
    try {
      const res = await generatePlgToolConcept(plgToolType);
      if (res.success) setPlgResult(res.data);
    } finally {
      setIsPlgRunning(false);
    }
  };

  const tabs = [
    { id: 'scoring', name: '1. AI Lead Scoring', icon: Brain },
    { id: 'cro', name: '2. CRO Motoru', icon: Zap },
    { id: 'viral', name: '3. Viral Referans', icon: Share2 },
    { id: 'seo', name: '4. Programmatik SEO', icon: Search },
    { id: 'dayparting', name: '5. Akıllı Dayparting', icon: Clock },
    { id: 'attribution', name: '6. Çoklu Atıf (MTA)', icon: PieChart },
    { id: 'ltv', name: '7. LTV & Churn', icon: UserCheck },
    { id: 'flywheel', name: '8. İçerik Volanı', icon: RotateCw },
    { id: 'comp', name: '9. Rakip Radarı', icon: Eye },
    { id: 'plg', name: '10. PLG Ücretsiz Araç', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white font-['Outfit']">
                  APEX Büyüme Radarı
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  PRO TITAN MODE
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Minimum bütçeyle maksimum müşteri edinim ve LTV optimizasyon sistemleri (10 Entegre AI Motoru)
              </p>
            </div>
          </div>
        </div>

        {/* Top Key Metrics Header */}
        <div className="grid grid-cols-3 gap-3 border-l border-slate-800 pl-6">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Hedef CAC Düşüşü</span>
            <span className="text-lg font-black text-emerald-400">-%55</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Hedef LTV Artışı</span>
            <span className="text-lg font-black text-purple-400">3.2x</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Organik Payı</span>
            <span className="text-lg font-black text-blue-400">%68</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                  : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/50'
              }`}
            >
              <Icon size={15} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. LEAD SCORING */}
      {activeTab === 'scoring' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="text-purple-400" size={20} />
                  AI Öncü Puanlama Motoru (Lead Scoring Engine)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Gelen lead'lerin kalitesini 0-100 puanlayarak satış ekibini sadece %80+ puanlı müşterilere yönlendirir.
                </p>
              </div>
              <button
                onClick={handleScoreLead}
                disabled={isScoring}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                {isScoring ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                Lead'i AI İle Skorla
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Test Lead Profil Bilgisi</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Ad Soyad / Şirket:</span>
                    <span className="font-semibold text-slate-200">Ahmet Yılmaz (E-Ticaret CEO)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">E-Posta Uzantısı:</span>
                    <span className="font-semibold text-emerald-400">ahmet@marka.com (Kurumsal)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Tespit Edilen Eksiklik:</span>
                    <span className="font-semibold text-amber-400">Meta ROAS Düşük, Dijital Altyapı Yok</span>
                  </div>
                </div>
              </div>

              {scoringResult ? (
                <div className="bg-gradient-to-br from-purple-950/40 to-slate-950 p-5 rounded-xl border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-300">AI Skorlama Sonucu</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${scoringResult.tier === 'VIP' || scoringResult.tier === 'HOT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                      {scoringResult.tier || 'HOT'} TIER
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-black text-white">{scoringResult.score ?? 85}</span>
                    <span className="text-xs text-slate-400">/ 100 Puan</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-3">
                    💡 {scoringResult.aiInsight || 'Karar verici pozisyonunda. Anlık satış ekibine aktarılmalı.'}
                  </p>
                  <div className="text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Önerilen Otomatik Aksiyon: <span className="text-white font-bold">{scoringResult.actionTaken || 'DIRECT_SALES_CALL'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 p-6 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                  <Brain className="text-slate-600 mb-2" size={32} />
                  <p className="text-xs text-slate-400">Skorlama sonucunu görmek için 'Lead'i AI İle Skorla' butonuna tıklayın.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CRO ENGINE */}
      {activeTab === 'cro' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="text-amber-400" size={20} />
                  Dönüşüm Oran Optimizasyonu (CRO Engine)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Reklam bütçesini 1 TL bile artırmadan huni dönüşüm oranını (CR) 2 katına çıkaran A/B test ve sürtünme analisti.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={croPage}
                  onChange={(e) => setCroPage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-56 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleRunCro}
                  disabled={isCroRunning}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap"
                >
                  {isCroRunning ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                  CRO Analizi Başlat
                </button>
              </div>
            </div>

            {croResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Tespit Edilen Sürtünmeler (Friction)
                  </h3>
                  <ul className="space-y-2">
                    {croResult.criticalFrictions?.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Hızlı Kazanımlar (Quick Wins)
                  </h3>
                  <ul className="space-y-2">
                    {croResult.quickWins?.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-purple-400 uppercase mb-3 flex items-center gap-1.5">
                    <Flame size={14} /> Önerilen A/B Testi Hipotezi
                  </h3>
                  {croResult.abTestVariants?.map((v: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-2 text-xs">
                      <div className="font-bold text-purple-300 mb-1">{v.element} ({v.predictedLift})</div>
                      <div className="text-slate-400 line-through">Kontrol: {v.control}</div>
                      <div className="text-emerald-400 font-semibold mt-0.5">Varyant B: {v.challenger}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VIRAL & REFERRAL ENGINE */}
      {activeTab === 'viral' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Share2 className="text-blue-400" size={20} />
              Viral Döngü & Referans Motoru (K-Factor System)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Her müşterinizi bir pazarlamacıya dönüştüren sıfır reklam maliyetli tavsiye mekanizması.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">Özel Referans Kodu Oluştur</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Müşteri Ad Soyad</label>
                    <input type="text" value={refName} onChange={e => setRefName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Müşteri E-Posta</label>
                    <input type="email" value={refEmail} onChange={e => setRefEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
                  </div>
                  <button onClick={handleCreateReferral} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition">
                    Referans Davet Linki Üret
                  </button>
                  {refResult && (
                    <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-300">
                      ✅ Davet Kodu: <span className="font-mono font-bold text-white">{refResult.code}</span> (₺500 Kredi Hediyeli)
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Sosyal Paylaşım Kiti</h3>
                  <button onClick={handleGenerateShareKit} disabled={isGeneratingKit} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                    {isGeneratingKit ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />} Kit Üret
                  </button>
                </div>

                {shareKit ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-blue-400 block mb-1">LinkedIn Paylaşım Metni:</span>
                      <p className="text-slate-300">{shareKit.linkedinPost}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-1">WhatsApp Davet Mesajı:</span>
                      <p className="text-slate-300">{shareKit.whatsappInvite}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">Müşterilerin arkadaşlarına gönderebileceği hazır metinler için 'Kit Üret' butonuna tıklayın.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROGRAMMATIC SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="text-emerald-400" size={20} />
                  Programmatik SEO & Inbound Motoru
                </h2>
                <p className="text-xs text-slate-400 mt-1">0 TL reklam harcamasıyla arama motorlarından binlerce nitelikli organik ziyaretçi çeken içerik mimarisi.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={seoIndustry} onChange={e => setSeoIndustry(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-48" />
                <button onClick={handleGenerateSeo} disabled={isSeoRunning} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                  {isSeoRunning ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />} SEO Şablonları Türet
                </button>
              </div>
            </div>

            {seoResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 text-xs">
                  <span className="text-emerald-300 font-semibold">Hedef Niche: {seoResult.targetNiche}</span>
                  <span className="text-white font-bold">Tahmini Aylık Arama Hacmi: {seoResult.estimatedMonthlySearchVolume}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seoResult.pages?.map((p: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                      <div className="font-bold text-white mb-1">{p.title}</div>
                      <div className="font-mono text-[11px] text-emerald-400 mb-2">/{p.slug}</div>
                      <div className="text-slate-400 mb-2"><strong className="text-slate-300">Target KW:</strong> {p.targetKw}</div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-purple-300 font-medium">
                        🪝 Lead Magnet Hook: {p.leadMagnetHook}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. DAYPARTING */}
      {activeTab === 'dayparting' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="text-indigo-400" size={20} />
                  Akıllı Bütçe Günlük Saat Planlayıcısı (Dayparting Engine)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Dönüşüm olmayan saatlerde bütçe harcamayı %85 kısarak reklamlardan 3x verim elde etme.</p>
              </div>
              <button onClick={handleCalculateDayparting} disabled={isDaypartingRunning} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                {isDaypartingRunning ? <RefreshCw className="animate-spin" size={14} /> : <Clock size={14} />} Saat Planını Hesapla
              </button>
            </div>

            {daypartingResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-emerald-400 mb-3 uppercase">🔥 En Yüksek Dönüşüm Saatleri</h3>
                  <div className="space-y-2">
                    {daypartingResult.peakHours?.map((h: string, i: number) => (
                      <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-xs font-bold text-emerald-300">{h}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-red-400 mb-3 uppercase">❄️ Boşa Harcama (Ölü) Saatler</h3>
                  <div className="space-y-2">
                    {daypartingResult.wasteHours?.map((h: string, i: number) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-xs font-bold text-red-300">{h}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-purple-400 mb-3 uppercase">💡 Önerilen Otomatik Kurallar</h3>
                  <div className="space-y-2">
                    {daypartingResult.recommendedRules?.map((r: string, i: number) => (
                      <div key={i} className="bg-slate-900 p-2.5 rounded-lg text-[11px] text-slate-300 border border-slate-800">• {r}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MULTI-TOUCH ATTRIBUTION */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="text-pink-400" size={20} />
                  Çok Dokunuşlu Atıf Modeli (Multi-Touch Attribution)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Son tıklama (Last-click) tuzağına düşmeden dönüşüme katkı sağlayan tüm kanalları ağırlıklandırır.</p>
              </div>
              <button onClick={handleFetchAttribution} disabled={isAttributionRunning} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                {isAttributionRunning ? <RefreshCw className="animate-spin" size={14} /> : <PieChart size={14} />} Atıf Modelini Güncelle
              </button>
            </div>

            {attributionResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-slate-400 mb-2">First-Click (İlk Temas)</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span>Organik SEO:</span> <strong className="text-emerald-400">{attributionResult.models?.firstClick?.organic}</strong></div>
                      <div className="flex justify-between"><span>Paid Meta:</span> <strong>{attributionResult.models?.firstClick?.paidMeta}</strong></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-slate-400 mb-2">Linear (Eşit Katkı)</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span>Organik SEO:</span> <strong className="text-emerald-400">{attributionResult.models?.linear?.organic}</strong></div>
                      <div className="flex justify-between"><span>Paid Meta:</span> <strong>{attributionResult.models?.linear?.paidMeta}</strong></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-slate-400 mb-2">Last-Click (Son Tıklama)</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span>Organik SEO:</span> <strong>{attributionResult.models?.lastClick?.organic}</strong></div>
                      <div className="flex justify-between"><span>Paid Meta:</span> <strong className="text-purple-400">{attributionResult.models?.lastClick?.paidMeta}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-500/30 text-xs text-purple-200">
                  🧠 <strong>AI Bütçe Yeniden Dağıtım Önerisi:</strong> {attributionResult.recommendedBudgetShift}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. LTV & CHURN */}
      {activeTab === 'ltv' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="text-cyan-400" size={20} />
                  Müşteri Yaşam Boyu Değer (LTV) & Churn Önleme
                </h2>
                <p className="text-xs text-slate-400 mt-1">Mevcut müşterilerinizi tutundurarak LTV'yi 3x artırma ve terk riskindeki müşterileri erken uyararak kurtarma.</p>
              </div>
              <button onClick={handleRunLtv} disabled={isLtvRunning} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                {isLtvRunning ? <RefreshCw className="animate-spin" size={14} /> : <UserCheck size={14} />} LTV Audit Çalıştır
              </button>
            </div>

            {ltvResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-red-400 mb-3 uppercase flex items-center gap-1">
                    <AlertTriangle size={14} /> Churn Riski Taşıyan Müşteriler
                  </h3>
                  <div className="space-y-3">
                    {ltvResult.churnRiskAlerts?.map((c: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                        <div className="flex justify-between font-bold text-white mb-1">
                          <span>{c.client}</span>
                          <span className="text-red-400">{c.riskScore}</span>
                        </div>
                        <div className="text-slate-400 mb-1">Sebep: {c.reason}</div>
                        <div className="text-emerald-400 font-semibold">Çözüm: {c.remedy}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-purple-400 mb-3 uppercase flex items-center gap-1">
                    <Flame size={14} /> Upsell & Cross-Sell Fırsatları
                  </h3>
                  <div className="space-y-2">
                    {ltvResult.upsellTriggers?.map((u: string, idx: number) => (
                      <div key={idx} className="bg-purple-950/30 border border-purple-500/20 p-3 rounded-lg text-xs text-purple-200">
                        🚀 {u}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. FLYWHEEL */}
      {activeTab === 'flywheel' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <RotateCw className="text-amber-400" size={20} />
                  İçerik + Ücretli Reklam Volanı (Flywheel Engine)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Tek bir içerikten sürekli müşteri üreten kartopu döngüsü tasarlayıcı.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={flywheelTopic} onChange={e => setFlywheelTopic(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-64" />
                <button onClick={handleRunFlywheel} disabled={isFlywheelRunning} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2">
                  {isFlywheelRunning ? <RefreshCw className="animate-spin" size={14} /> : <RotateCw size={14} />} Volan Tasarla
                </button>
              </div>
            </div>

            {flywheelResult && (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="font-bold text-white text-sm">🎯 Odak Ana Varlık: {flywheelResult.coreAsset}</div>
                <div className="space-y-2">
                  {flywheelResult.flywheelSteps?.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">{i+1}</span>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/30 text-xs text-emerald-300 font-bold">
                  📈 Tahmini Dönüşüm ROI: {flywheelResult.expectedRoi}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. COMPETITOR RADAR */}
      {activeTab === 'comp' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="text-red-400" size={20} />
                  Rekabetçi Fiyat & Pazar Zamanlama Radarı
                </h2>
                <p className="text-xs text-slate-400 mt-1">Rakiplerin zayıf noktalarını tespit edip öldürücü tekliflerle pazar payını kapma.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={compNiche} onChange={e => setCompNiche(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-64" />
                <button onClick={handleRunComp} disabled={isCompRunning} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                  {isCompRunning ? <RefreshCw className="animate-spin" size={14} /> : <Eye size={14} />} Rakip Analizi
                </button>
              </div>
            </div>

            {compResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-red-400 uppercase">⚠️ Rakip Zayıf Noktaları</h3>
                  {compResult.competitorWeaknesses?.map((w: string, idx: number) => (
                    <div key={idx} className="bg-slate-900 p-2.5 rounded-lg text-xs text-slate-300 border border-slate-800">• {w}</div>
                  ))}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase">⚔️ Öldürücü Teklif (Killer Offer)</h3>
                  <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg text-xs text-emerald-200 font-bold">
                    {compResult.killerOffer}
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg text-xs text-purple-300 border border-slate-800">
                    💡 Market Timing Hack: {compResult.marketTimingHack}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. PLG FREEMIUM */}
      {activeTab === 'plg' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gift className="text-teal-400" size={20} />
                  PLG Ücretsiz Araç Tasarımcısı (Freemium Lead Magnet)
                </h2>
                <p className="text-xs text-slate-400 mt-1">Ziyaretçilere anında değer veren ve e-posta toplayan interaktif web aracı mimarisi.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={plgToolType} onChange={e => setPlgToolType(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-64" />
                <button onClick={handleRunPlg} disabled={isPlgRunning} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2">
                  {isPlgRunning ? <RefreshCw className="animate-spin" size={14} /> : <Gift size={14} />} Araç Tasarla
                </button>
              </div>
            </div>

            {plgResult && (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="font-bold text-white text-sm">🛠️ Araç Adı: {plgResult.toolName}</div>
                <div className="text-xs text-slate-400">Hedef Kitle: {plgResult.targetAudience}</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-teal-400 block mb-1">Giriş Alanları:</span>
                  {plgResult.inputFormFields?.map((f: string, idx: number) => (
                    <div key={idx} className="text-slate-300">• {f}</div>
                  ))}
                </div>
                <div className="bg-purple-950/40 p-3 rounded-lg border border-purple-500/30 text-xs text-purple-200 font-semibold">
                  🎁 E-Posta Yakalama Kancası (Lead Magnet Hook): {plgResult.leadCaptureHook}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
