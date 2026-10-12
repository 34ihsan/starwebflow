'use client';

import React, { useState } from 'react';
import { Search, Gauge, Smartphone, ShieldCheck, Bot, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function InstantAuditWidget() {
  const { language } = useLanguage();
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const isTr = language === 'tr';
  const isDe = language === 'de';

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    setError('');
    setLoading(true);
    setResult(null);

    setScanStep(isTr ? 'Web sitesi taranıyor...' : isDe ? 'Website wird gescannt...' : 'Scanning website...');
    await new Promise((r) => setTimeout(r, 600));

    setScanStep(isTr ? 'Sayfa hızı ve LCP değerleri ölçülüyor...' : isDe ? 'Geschwindigkeit wird gemessen...' : 'Measuring speed metrics...');
    await new Promise((r) => setTimeout(r, 700));

    setScanStep(isTr ? 'AI & Otomasyon dönüşüm açığı hesaplanıyor...' : isDe ? 'KI-Potenzial wird berechnet...' : 'Calculating AI conversion gap...');
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput, language }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analiz yapılamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-slate-50/50 relative overflow-hidden border-t border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 mb-4 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-cyan-600" />
            {isTr ? '3 Saniyede Anında Site Taranması' : isDe ? '3-Sekunden Sofort-Audit' : '3-Second Instant Site Audit'}
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
                Find Your Site's <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Conversion & AI Gap</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-normal">
            {isTr
              ? 'Web sitenizin adresini girin; sayfa hızı, mobil uyumluluk ve müşteri kaçırma oranlarını anında ücretsiz analiz edelim.'
              : isDe
              ? 'Geben Sie Ihre Domain ein und analysieren Sie Ladezeit, mobile UX und Konversionsverluste sofort kostenlos.'
              : 'Enter your domain to analyze page speed, mobile UX, and customer leaks instantly for free.'}
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
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base transition-all duration-300 shadow-md shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
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
            <div className="mt-8 pt-8 border-t border-slate-200 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 p-6 rounded-xl bg-cyan-50/60 border border-cyan-200">
                <div>
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                    {isTr ? 'Analiz Edilen Domain' : isDe ? 'Analysierte Domain' : 'Analyzed Domain'}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{result.domain}</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {isTr ? 'Tahmini Yüklenme Süresi: ' : isDe ? 'Geschätzte Ladezeit: ' : 'Estimated Load Time: '}
                    <span className="text-rose-600 font-bold">{result.lcpTime}</span> •{' '}
                    {isTr ? 'Potansiyel Ciro Artışı: ' : isDe ? 'Potenzielle Umsatzsteigerung: ' : 'Potential Revenue Boost: '}
                    <span className="text-emerald-700 font-bold">{result.potentialRevenueBoost}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-center">
                    <span className="block text-xs font-medium text-slate-500">
                      {isTr ? 'Genel Sağlık Skoru' : isDe ? 'Gesundheitsscore' : 'Overall Health Score'}
                    </span>
                    <span className="text-3xl font-extrabold text-amber-600">{result.overallScore} / 100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Gauge className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-600">
                    {isTr ? 'Sayfa Hızı' : isDe ? 'Ladezeit' : 'Page Speed'}
                  </span>
                  <span className="text-xl font-bold text-rose-600">{result.speedScore} / 100</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Smartphone className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-600">Mobile UX</span>
                  <span className="text-xl font-bold text-amber-600">{result.mobileScore} / 100</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-600">
                    {isTr ? 'Güvenlik & SEO' : isDe ? 'Sicherheit & SEO' : 'Security & SEO'}
                  </span>
                  <span className="text-xl font-bold text-cyan-600">{result.securityScore} / 100</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Bot className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-slate-600">
                    {isTr ? 'AI & Otomasyon' : isDe ? 'KI & Automation' : 'AI & Automation'}
                  </span>
                  <span className="text-xl font-bold text-purple-600">{result.aiScore} / 100</span>
                </div>
              </div>

              {/* Identified Issues */}
              <div className="space-y-3 mb-8">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  {isTr ? 'Tespit Edilen Dönüşüm Kaçakları' : isDe ? 'Erkannte Konversionsverluste' : 'Identified Conversion Leaks'}
                </h4>
                {result.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{rec.title}</h5>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base transition-all duration-300 shadow-md shadow-emerald-600/20"
                >
                  <span>
                    {isTr
                      ? "Bu Skorları 99/100'e Çıkaralım (Ücretsiz Rapor Alın)"
                      : isDe
                      ? 'Optimieren Sie Ihre Werte auf 99/100 (Kostenloser Report)'
                      : 'Upgrade Your Scores to 99/100 (Free Report)'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
