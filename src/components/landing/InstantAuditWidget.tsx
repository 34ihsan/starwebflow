'use client';

import React, { useState } from 'react';
import {
  Search,
  Gauge,
  Smartphone,
  ShieldCheck,
  Bot,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Activity,
  Lock,
  Code2,
  Sparkles,
  Send,
  Terminal,
  TrendingUp,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CloneMessage {
  role: 'assistant' | 'user';
  content: string;
}

export default function InstantAuditWidget() {
  const { language } = useLanguage();
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Feature 1: Live AI Clone Chat State
  const [cloneMessages, setCloneMessages] = useState<CloneMessage[]>([]);
  const [cloneInput, setCloneInput] = useState('');
  const [cloneLoading, setCloneLoading] = useState(false);

  // Feature 3: Interactive Financial Loss Sliders
  const [monthlyVisitors, setMonthlyVisitors] = useState<number>(3000);
  const [dealValue, setDealValue] = useState<number>(1500);

  const isTr = language === 'tr';
  const isDe = language === 'de';

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 65) return 'text-amber-600';
    return 'text-rose-600';
  };

  const executeAudit = async (domainToScan: string) => {
    const cleanDomain = domainToScan.trim();
    if (!cleanDomain) return;

    setError('');
    setLoading(true);
    setResult(null);

    setScanStep(
      isTr
        ? 'Hedef sunucuya canlı bağlantı kuruluyor ve HTTP başlıkları taranıyor...'
        : isDe
        ? 'Live-Verbindung zum Zielserver & Prüfung der HTTP-Header...'
        : 'Connecting to target server & inspecting HTTP headers...'
    );
    await new Promise((r) => setTimeout(r, 450));

    setScanStep(
      isTr
        ? 'TTFB yanıt süresi, DOM/Script yükü ve teknoloji altyapısı analiz ediliyor...'
        : isDe
        ? 'TTFB-Antwortzeit, Skript-Last und Tech-Stack werden analysiert...'
        : 'Measuring TTFB response time, script load, and tech stack...'
    );
    await new Promise((r) => setTimeout(r, 450));

    setScanStep(
      isTr
        ? 'SEO, Schema.org (JSON-LD), GEO ve sitenize özel 7/24 AI Satış Ajanı klonu hazırlanıyor...'
        : isDe
        ? 'SEO, Schema.org, GEO & Ihr individueller 24/7 KI-Vertriebsagent-Klon werden erstellt...'
        : 'Verifying SEO, Schema.org, GEO & generating your custom 24/7 AI Sales Agent clone...'
    );

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain, language }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('starwebflow:audit-completed', {
              detail: {
                domain: data.domain,
                brandName: data.brandName,
                detectedIndustry: data.detectedIndustry,
                recommendedService: data.recommendedService,
                overallScore: data.overallScore,
                lcpTime: data.lcpTime,
                financialModel: data.financialModel,
              },
            })
          );
        }
        setCloneMessages([
          {
            role: 'assistant',
            content:
              data.aiCloneContext?.welcomeMessage ||
              (isTr
                ? `Merhaba! Ben ${data.domain} için oluşturulan örnek 7/24 AI Satış Temsilcisiyim. Beni hemen test edin!`
                : `Hello! I am the sample 24/7 AI Sales Agent created for ${data.domain}. Test me right now!`),
          },
        ]);
        if (data.financialModel) {
          setMonthlyVisitors(data.financialModel.defaultMonthlyVisitors || 3000);
          setDealValue(data.financialModel.defaultDealValue || (isTr ? 18000 : 1500));
        }
      } else {
        setError(data.error || 'Analiz yapılamadı. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Listen for trigger events from Hero or other components
  React.useEffect(() => {
    const handleTriggerAudit = (e: any) => {
      if (e.detail?.domain) {
        setDomainInput(e.detail.domain);
        executeAudit(e.detail.domain);
      }
    };
    window.addEventListener('starwebflow:trigger-audit', handleTriggerAudit);
    return () => window.removeEventListener('starwebflow:trigger-audit', handleTriggerAudit);
  }, [language, isTr, isDe]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAudit(domainInput);
  };

  const handleSendCloneMessage = async (textToSend?: string) => {
    const msg = (textToSend ?? cloneInput).trim();
    if (!msg || cloneLoading || !result) return;

    const nextMessages: CloneMessage[] = [...cloneMessages, { role: 'user', content: msg }];
    setCloneMessages(nextMessages);
    if (!textToSend) setCloneInput('');
    setCloneLoading(true);

    try {
      const res = await fetch('/api/audit/simulate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: result.domain,
          brandName: result.brandName,
          detectedIndustry: result.detectedIndustry,
          pageTitle: result.metrics?.pageTitle,
          metaDescription: result.metrics?.metaDescription,
          headings: result.metrics?.headings,
          sampleOfferings: result.sampleOfferings,
          categories: result.categories || result.aiCloneContext?.categories,
          keyPolicies: result.keyPolicies || result.aiCloneContext?.keyPolicies,
          locationInfo: result.locationInfo || result.aiCloneContext?.locationInfo,
          isEcommerce: result.isEcommerce,
          businessType: result.businessType,
          message: msg,
          history: cloneMessages.slice(-6),
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setCloneMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      // ignore
    } finally {
      setCloneLoading(false);
    }
  };

  const handleTransferToQuote = () => {
    if (!result) return;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('starwebflow:audit-prefill', {
          detail: {
            domain: result.domain,
            brandName: result.brandName,
            detectedIndustry: result.detectedIndustry,
            recommendedService: result.recommendedService,
            overallScore: result.overallScore,
            lcpTime: result.lcpTime,
          },
        })
      );
      const quoteEl = document.getElementById('quote') || document.getElementById('cta');
      if (quoteEl) {
        quoteEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Financial & Opportunity Leak Calculation (Feature 3)
  const isEcom = Boolean(result?.isEcommerce || result?.financialModel?.isEcommerce);
  const businessType = result?.businessType || result?.financialModel?.businessType || 'service';
  const terminology = result?.financialModel?.opportunityTerminology;
  const currencySymbol =
    result?.financialModel?.currencySymbol ||
    result?.locationInfo?.currencySymbol ||
    (isTr ? '₺' : '€');

  const bouncePct = result?.financialModel?.bounceRatePct ?? 32;
  const afterHoursLeakPct = result?.financialModel?.afterHoursLeakPct ?? 30;
  const lostVisitorsPerMonth = Math.round((monthlyVisitors * bouncePct) / 100);

  // Conversion rates calibrated to business archetypes
  const leadRate = isEcom ? 0.024 : businessType === 'education' ? 0.022 : businessType === 'health' ? 0.02 : 0.018;
  const missedQualifiedLeads = Math.max(
    1,
    Math.round(
      ((lostVisitorsPerMonth + Math.round((monthlyVisitors * afterHoursLeakPct) / 100)) * leadRate)
    )
  );

  // Opportunity leak calculation based on business model conversion probability
  const closingFactor = isEcom ? 1.0 : businessType === 'education' ? 0.45 : businessType === 'health' ? 0.35 : businessType === 'law' ? 0.3 : 0.25;
  const estimatedMonthlyRevenueLeak = Math.round(missedQualifiedLeads * closingFactor * dealValue);

  return (
    <section className="py-20 bg-slate-50/50 relative overflow-hidden border-t border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 mb-4 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-cyan-600" />
            {isTr ? '3 Saniyede Canlı Site Taranması & AI Klonu' : isDe ? '3-Sekunden Live-Audit & KI-Klon' : '3-Second Live Site Audit & AI Clone'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isTr ? (
              <>
                Sitenizin <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Dönüşüm & AI Açığını</span> Öğrenin
              </>
            ) : isDe ? (
              <>
                Erfahren Sie Ihre <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Conversion & KI-Lücke</span>
              </>
            ) : (
              <>
                Find Your Site&apos;s <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Conversion & AI Gap</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-normal">
            {isTr
              ? 'Web sitenizin adresini girin; gerçek sunucu yanıt süresini (TTFB), kullanılan teknolojileri, ChatGPT görünürlüğünü analiz edelim ve sitenize özel çalışan örnek bir AI Satış Ajanını 3 saniyede oluşturalım.'
              : isDe
              ? 'Geben Sie Ihre Domain ein; wir analysieren TTFB, Tech-Stack, ChatGPT-Sichtbarkeit live und erstellen in 3 Sekunden einen funktionierenden KI-Vertriebsagenten für Ihre Website.'
              : 'Enter your domain to inspect live TTFB, tech stack, ChatGPT visibility, and test a working AI Sales Agent clone trained on your site in 3 seconds.'}
          </p>
        </div>

        {/* Audit Form Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xl">
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={isTr ? 'Örn: sirketiniz.com' : isDe ? 'z.B. ihrunternehmen.de' : 'e.g. yourcompany.com'}
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                disabled={loading}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-50/50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-base shadow-2xs"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading || !domainInput.trim()}
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base transition-all duration-300 shadow-md shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isTr ? 'Taranıyor...' : isDe ? 'Wird analysiert...' : 'Scanning...'}</span>
                </>
              ) : (
                <>
                  <span>{isTr ? 'Anında Analiz Et' : isDe ? 'Jetzt Analysieren' : 'Analyze Now'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {error && <p className="mt-3 text-rose-600 text-sm text-center font-medium">{error}</p>}

          {/* Loading Animation */}
          {loading && (
            <div className="mt-8 p-6 rounded-xl bg-cyan-50/50 border border-cyan-100 text-center animate-pulse">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-cyan-700 font-semibold text-sm">{scanStep}</p>
            </div>
          )}

          {/* AUDIT RESULTS SHOWCASE */}
          {result && (
            <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in duration-500 space-y-8">
              {/* Top Summary Banner */}
              <div
                className={`flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-xl border ${
                  result.isBenchmarkOptimal
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-cyan-50/60 border-cyan-200'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        result.isBenchmarkOptimal ? 'text-emerald-700' : 'text-cyan-700'
                      }`}
                    >
                      {isTr ? 'Analiz Edilen Domain' : isDe ? 'Analysierte Domain' : 'Analyzed Domain'}
                    </span>
                    {result.isLiveScan && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isTr ? 'Canlı HTTP/DOM Taraması' : isDe ? 'Live HTTP/DOM-Scan' : 'Live HTTP/DOM Scan'}
                      </span>
                    )}
                    {result.detectedIndustry && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {result.detectedIndustry}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{result.domain}</h3>
                  {result.metrics?.pageTitle && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                      {result.metrics.pageTitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1.5 font-medium">
                    {isTr ? 'Tahmini Yüklenme Süresi (LCP): ' : isDe ? 'Geschätzte Ladezeit (LCP): ' : 'Estimated Load Time (LCP): '}
                    <span
                      className={`font-bold ${
                        parseFloat(result.lcpTime) <= 1.2
                          ? 'text-emerald-600'
                          : parseFloat(result.lcpTime) <= 2.5
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {result.lcpTime}
                    </span>{' '}
                    •{' '}
                    {isTr ? 'Potansiyel Ciro Artışı: ' : isDe ? 'Potenzielle Umsatzsteigerung: ' : 'Potential Revenue Boost: '}
                    <span className="text-emerald-700 font-bold">{result.potentialRevenueBoost}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <div className="text-center">
                    <span className="block text-xs font-medium text-slate-500">
                      {isTr ? 'Genel Sağlık Skoru' : isDe ? 'Gesundheitsscore' : 'Overall Health Score'}
                    </span>
                    <span className={`text-3xl font-extrabold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Technical Telemetry & Detected Stack */}
              {result.metrics && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div>
                        <span className="text-slate-500 block">
                          {isTr ? 'Sunucu Yanıtı (TTFB)' : isDe ? 'Server-TTFB' : 'Server TTFB'}
                        </span>
                        <span className="font-bold text-slate-900">{result.metrics.ttfbMs} ms</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-slate-500 block">
                          {isTr ? 'HTML & Harici Script' : isDe ? 'HTML & Skripte' : 'HTML & Scripts'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {result.metrics.htmlSizeKb} KB • {result.metrics.scriptCount} Script
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-slate-500 block">
                          {isTr ? 'Güvenlik & Schema' : isDe ? 'Security & Schema' : 'Security & Schema'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {result.metrics.securityHeadersCount} Header • {result.metrics.schemaCount} JSON-LD
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <span className="text-slate-500 block">
                          {isTr ? 'AI & GEO Durumu' : isDe ? 'KI & GEO Status' : 'AI & GEO Status'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {result.metrics.hasAiChat
                            ? isTr
                              ? 'Aktif'
                              : 'Active'
                            : isTr
                            ? 'Tespit Edilemedi'
                            : isDe
                            ? 'Nicht erkannt'
                            : 'Not Detected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.detectedTech && result.detectedTech.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">
                        {isTr ? 'Tespit Edilen Altyapı:' : isDe ? 'Erkannter Tech-Stack:' : 'Detected Stack:'}
                      </span>
                      {result.detectedTech.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4 Category Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Gauge className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(result.speedScore)}`} />
                  <span className="block text-xs font-semibold text-slate-600">
                    {isTr ? 'Sayfa Hızı' : isDe ? 'Ladezeit' : 'Page Speed'}
                  </span>
                  <span className={`text-xl font-bold ${getScoreColor(result.speedScore)}`}>
                    {result.speedScore} / 100
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Smartphone className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(result.mobileScore)}`} />
                  <span className="block text-xs font-semibold text-slate-600">Mobile UX</span>
                  <span className={`text-xl font-bold ${getScoreColor(result.mobileScore)}`}>
                    {result.mobileScore} / 100
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <ShieldCheck className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(result.securityScore)}`} />
                  <span className="block text-xs font-semibold text-slate-600">
                    {isTr ? 'Güvenlik & SEO' : isDe ? 'Sicherheit & SEO' : 'Security & SEO'}
                  </span>
                  <span className={`text-xl font-bold ${getScoreColor(result.securityScore)}`}>
                    {result.securityScore} / 100
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Bot className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(result.aiScore)}`} />
                  <span className="block text-xs font-semibold text-slate-600">
                    {isTr ? 'AI & Otomasyon' : isDe ? 'KI & Automation' : 'AI & Automation'}
                  </span>
                  <span className={`text-xl font-bold ${getScoreColor(result.aiScore)}`}>
                    {result.aiScore} / 100
                  </span>
                </div>
              </div>

              {/* Identified Issues or Verified Strengths */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  {result.isBenchmarkOptimal
                    ? isTr
                      ? 'Doğrulanan Üst Düzey Mimari & Aktif Sistemler'
                      : isDe
                      ? 'Verifizierte Enterprise-Architektur & Aktive Systeme'
                      : 'Verified Enterprise Architecture & Active Systems'
                    : isTr
                    ? 'Siteye Özel Tespit Edilen Bulgular & Dönüşüm Kaçakları'
                    : isDe
                    ? 'Websitespezifische Befunde & Konversionsverluste'
                    : 'Site-Specific Findings & Conversion Leaks'}
                </h4>
                {result.recommendations.map((rec: any, i: number) => {
                  const isStrength = rec.type === 'strength';
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        isStrength
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-rose-50/80 border-rose-200'
                      }`}
                    >
                      {isStrength ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{rec.title}</h5>
                          {rec.impact && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                                isStrength
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {rec.impact}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{rec.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ═══════════════════════════════════════════════════════════════════
                  WOW FEATURE 1: INSTANT AI SALES AGENT CLONE FOR THEIR OWN WEBSITE
                 ═══════════════════════════════════════════════════════════════════ */}
              {result.aiCloneContext && (
                <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/60 p-5 sm:p-6 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 relative">
                        <Bot className="w-6 h-6" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                            {isTr ? 'CANLI AI KLONU HAZIR' : isDe ? 'LIVE KI-KLON BEREIT' : 'LIVE AI CLONE READY'}
                          </span>
                          <span className="text-xs font-semibold text-purple-700">
                            {isTr ? 'Sitenizin Verileriyle Eğitildi' : isDe ? 'Trainiert mit Ihren Website-Daten' : 'Trained on Your Site Data'}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                          {result.aiCloneContext.agentName}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="my-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cloneMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed max-w-[88%] whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white font-medium rounded-tr-none'
                              : 'bg-white border border-purple-200/90 text-slate-800 shadow-2xs rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {cloneLoading && (
                      <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold pl-9">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>
                          {isTr
                            ? `${result.brandName} AI Temsilcisi yanıt yazıyor...`
                            : isDe
                            ? `${result.brandName} KI-Assistent schreibt...`
                            : `${result.brandName} AI Agent is typing...`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Prompt Chips */}
                  {result.aiCloneContext.sampleQuestions && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.aiCloneContext.sampleQuestions.map((q: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={cloneLoading}
                          onClick={() => handleSendCloneMessage(q)}
                          className="text-left text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-purple-600 text-purple-800 hover:text-white border border-purple-200/90 font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          <MessageSquare className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cloneInput}
                      onChange={(e) => setCloneInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendCloneMessage();
                        }
                      }}
                      placeholder={
                        isTr
                          ? `${result.brandName} AI Temsilcinize bir müşteri gibi soru sorun...`
                          : isDe
                          ? `Stellen Sie Ihrem ${result.brandName} KI-Agenten eine Kundenfrage...`
                          : `Ask your ${result.brandName} AI Agent a question like a customer...`
                      }
                      className="flex-1 h-11 px-4 rounded-xl bg-white border border-purple-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      disabled={cloneLoading || !cloneInput.trim()}
                      onClick={() => handleSendCloneMessage()}
                      className="h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">{isTr ? 'Test Et' : isDe ? 'Testen' : 'Test'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  WOW FEATURE 2: CHATGPT, CLAUDE & PERPLEXITY GEO X-RAY
                 ═══════════════════════════════════════════════════════════════════ */}
              {result.geoXray && (
                <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 sm:p-6 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-sm sm:text-base font-extrabold tracking-tight">
                        {isTr
                          ? 'ChatGPT, Claude & Perplexity Sitenizi Nasıl Görüyor? (Canlı GEO Röntgeni)'
                          : isDe
                          ? 'Wie sehen ChatGPT, Claude & Perplexity Ihre Website? (Live GEO Röntgen)'
                          : 'How Do ChatGPT, Claude & Perplexity See Your Site? (Live GEO X-Ray)'}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {isTr ? 'AI Arama Motoru Simülasyonu' : isDe ? 'KI-Suchmaschinen-Simulation' : 'AI Search Engine Simulation'}
                    </span>
                  </div>

                  <div className="mb-4 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300">
                    <span className="text-cyan-400 font-bold mr-1.5">
                      {isTr ? 'Örnek Müşteri Sorgusu:' : isDe ? 'Beispiel-Kundenanfrage:' : 'Sample Buyer Prompt:'}
                    </span>
                    <span className="italic">{result.geoXray.userQuery}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-xl border ${
                        result.geoXray.status === 'optimal'
                          ? 'bg-emerald-950/40 border-emerald-500/40'
                          : 'bg-rose-950/40 border-rose-500/40'
                      }`}
                    >
                      <span
                        className={`text-[11px] font-extrabold uppercase tracking-wider block mb-2 ${
                          result.geoXray.status === 'optimal' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isTr
                          ? `1. ${result.domain} Şu Anki AI Görünümü`
                          : isDe
                          ? `1. Aktuelle KI-Sicht auf ${result.domain}`
                          : `1. Current AI View of ${result.domain}`}
                      </span>
                      <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                        {result.geoXray.currentAiView}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-2">
                        {isTr
                          ? '2. StarWebFlow GEO + llms.txt Sonrası AI Önerisi'
                          : isDe
                          ? '2. Nach StarWebFlow GEO + llms.txt Upgrade'
                          : '2. After StarWebFlow GEO + llms.txt Upgrade'}
                      </span>
                      <p className="text-xs text-emerald-100 whitespace-pre-line leading-relaxed">
                        {result.geoXray.upgradedAiView}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  WOW FEATURE 3: INTERACTIVE MONTHLY REVENUE LEAK CALCULATOR
                 ═══════════════════════════════════════════════════════════════════ */}
              {!result.isBenchmarkOptimal && (
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-rose-50/50 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-5 h-5 text-rose-600" />
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {terminology?.calculatorTitle ||
                          (isTr
                            ? `${result.domain} — Masada Bırakılan Tahmini Aylık Ciro Hesaplayıcısı`
                            : isDe
                            ? `${result.domain} — Rechner für entgangenen Monatsumsatz`
                            : `${result.domain} — Estimated Monthly Revenue Leak Calculator`)}
                      </h4>
                    </div>
                    {terminology?.archetypeBadge && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        {terminology.archetypeBadge}
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                          <span>
                            {terminology?.visitorLabel ||
                              (isTr ? 'Aylık Web Sitesi Ziyaretçiniz' : isDe ? 'Monatliche Website-Besucher' : 'Monthly Website Visitors')}
                          </span>
                          <span className="text-cyan-700 font-extrabold">{monthlyVisitors.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min={500}
                          max={50000}
                          step={500}
                          value={monthlyVisitors}
                          onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                          className="w-full accent-cyan-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                          <span>
                            {terminology?.dealValueLabel ||
                              (isEcom
                                ? isTr
                                  ? `Ortalama Sipariş / Sepet Tutarı (${currencySymbol})`
                                  : isDe
                                  ? `Durchschnittlicher Warenkorb (${currencySymbol})`
                                  : `Average Order / Cart Value (${currencySymbol})`
                                : isTr
                                ? `Ortalama Müşteri / Satış Değeri (${currencySymbol})`
                                : isDe
                                ? `Durchschnittlicher Kundenwert (${currencySymbol})`
                                : `Average Customer / Deal Value (${currencySymbol})`)}
                          </span>
                          <span className="text-cyan-700 font-extrabold">
                            {currencySymbol}
                            {dealValue.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={terminology?.dealMin ?? (isEcom ? (currencySymbol === '€' ? 15 : 150) : (currencySymbol === '€' ? 200 : 2000))}
                          max={terminology?.dealMax ?? (isEcom ? (currencySymbol === '€' ? 500 : 8000) : (currencySymbol === '€' ? 15000 : 150000))}
                          step={terminology?.dealStep ?? (isEcom ? (currencySymbol === '€' ? 5 : 50) : (currencySymbol === '€' ? 100 : 1000))}
                          value={dealValue}
                          onChange={(e) => setDealValue(Number(e.target.value))}
                          className="w-full accent-cyan-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-white border border-rose-200 text-center shadow-2xs">
                        <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
                          {terminology?.lostVisitorsLabel ||
                            (isTr
                              ? `Hız & Mesai Dışı Kaçan Ziyaretçi`
                              : isDe
                              ? `Verlorene Besucher / Monat`
                              : `Lost Visitors / Month`)}
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 block">
                          ~{lostVisitorsPerMonth.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({result.lcpTime} LCP → %{bouncePct} {isTr ? 'kayıp' : isDe ? 'Verlust' : 'bounce'})
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-rose-200 text-center shadow-2xs">
                        <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
                          {terminology?.totalLeakLabel ||
                            (isTr
                              ? 'Masada Bırakılan Aylık Ciro'
                              : isDe
                              ? 'Entgangener Umsatz / Monat'
                              : 'Monthly Revenue Left on Table')}
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-rose-600 mt-1 block">
                          {currencySymbol}
                          {estimatedMonthlyRevenueLeak.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          {terminology?.missedUnitsLabel
                            ? `~${missedQualifiedLeads} ${terminology.missedUnitsLabel}`
                            : isEcom
                            ? isTr
                              ? `~${missedQualifiedLeads} kaçan sipariş/ay`
                              : isDe
                              ? `~${missedQualifiedLeads} entgangene Bestellungen/Monat`
                              : `~${missedQualifiedLeads} missed orders/mo`
                            : isTr
                            ? `~${missedQualifiedLeads} sıcak müşteri adayı/ay`
                            : isDe
                            ? `~${missedQualifiedLeads} qualifizierte Leads/Monat`
                            : `~${missedQualifiedLeads} qualified leads/mo`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════════
                  WOW FEATURE 4: BEFORE / AFTER ARCHITECTURE RESCUE PLAN
                 ═══════════════════════════════════════════════════════════════════ */}
              {result.architectureComparison && (
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      {isTr
                        ? `${result.domain} Mimari Dönüşüm Tablosu (Mevcut Durum vs. StarWebFlow 99/100)`
                        : isDe
                        ? `${result.domain} Architektur-Vergleich (Aktuell vs. StarWebFlow 99/100)`
                        : `${result.domain} Architecture Transformation (Current vs. StarWebFlow 99/100)`}
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-200/80 text-xs">
                    {result.architectureComparison.map((row: any, i: number) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3.5 items-center">
                        <div className="font-bold text-slate-800">{row.metric}</div>
                        <div
                          className={`font-medium px-2.5 py-1 rounded-lg ${
                            result.isBenchmarkOptimal
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {row.current}
                        </div>
                        <div className="font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          {row.upgraded}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action CTA with 1-Click Auto-Prefill to QuickQuoteForm */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleTransferToQuote}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base transition-all duration-300 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <span>
                    {result.isBenchmarkOptimal
                      ? isTr
                        ? 'Kendi Sitenizi de Bu 99/100 Mimariye Taşıyalım (Ücretsiz Planlama)'
                        : isDe
                        ? 'Bringen Sie Ihre Website ebenfalls auf 99/100 (Kostenlose Planung)'
                        : 'Upgrade Your Own Website to This 99/100 Architecture'
                      : isTr
                      ? `${result.domain} Eksiklerini Tek Tıkla Teklif Formuna Aktar & 99/100'e Çıkar`
                      : isDe
                      ? `${result.domain} Daten übernehmen & auf 99/100 optimieren`
                      : `Transfer ${result.domain} Audit to Quote Form & Upgrade to 99/100`}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
