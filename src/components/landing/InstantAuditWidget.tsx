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
        body: JSON.stringify({ domain: domainInput }),
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
    <section className="py-20 bg-[#0A0A0F] relative overflow-hidden border-t border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-4">
            <Search className="w-3.5 h-3.5" />
            {isTr ? '3 Saniyede Anında Site Taraması' : isDe ? '3-Sekunden Sofort-Audit' : '3-Second Instant Site Audit'}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isTr ? (
              <>
                Sitenizin <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Dönüşüm & AI Açığını</span> Öğrenin
              </>
            ) : isDe ? (
              <>
                Erfahren Sie Ihre <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Conversion & KI-Lücke</span>
              </>
            ) : (
              <>
                Find Your Site's <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Conversion & AI Gap</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-[#94A3B8] text-sm sm:text-base">
            {isTr
              ? 'Web sitenizin adresini girin; sayfa hızı, mobil uyumluluk ve müşteri kaçırma oranlarını anında ücretsiz analiz edelim.'
              : isDe
              ? 'Geben Sie Ihre Domain ein und analysieren Sie Ladezeit, mobile UX und Konversionsverluste sofort kostenlos.'
              : 'Enter your domain to analyze page speed, mobile UX, and customer leaks instantly for free.'}
          </p>
        </div>

        {/* Audit Form Box */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0E0E17] shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={isTr ? 'Örn: sirketiniz.com' : isDe ? 'z.B. ihrunternehmen.de' : 'e.g. yourcompany.com'}
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                disabled={loading}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748B] focus:outline-none focus:border-cyan-500 transition-colors text-base"
              />
              <Search className="w-5 h-5 text-[#64748B] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading || !domainInput.trim()}
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isTr ? 'Taranıyor...' : 'Scanning...'}</span>
                </>
              ) : (
                <>
                  <span>{isTr ? 'Anında Analiz Et' : isDe ? 'Jetzt Analysieren' : 'Analyze Now'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {error && <p className="mt-3 text-rose-400 text-sm text-center">{error}</p>}

          {/* Loading Animation */}
          {loading && (
            <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center animate-pulse">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-cyan-300 font-semibold text-sm">{scanStep}</p>
            </div>
          )}

          {/* AUDIT RESULTS SHOWCASE */}
          {result && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 p-6 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div>
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    {isTr ? 'Analiz Edilen Domain' : 'Analyzed Domain'}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">{result.domain}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Tahmini Yüklenme Süresi: <span className="text-rose-400 font-bold">{result.lcpTime}</span> • Potansiyel Ciro Artışı:{' '}
                    <span className="text-emerald-400 font-bold">{result.potentialRevenueBoost}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-[#0A0A0F] px-6 py-4 rounded-xl border border-white/10">
                  <div className="text-center">
                    <span className="block text-xs text-[#94A3B8]">Genel Sağlık Skoru</span>
                    <span className="text-3xl font-extrabold text-amber-400">{result.overallScore} / 100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <Gauge className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                  <span className="block text-xs text-[#94A3B8]">Sayfa Hızı</span>
                  <span className="text-xl font-bold text-rose-400">{result.speedScore} / 100</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <Smartphone className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <span className="block text-xs text-[#94A3B8]">Mobil UX</span>
                  <span className="text-xl font-bold text-amber-400">{result.mobileScore} / 100</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <span className="block text-xs text-[#94A3B8]">Güvenlik & SEO</span>
                  <span className="text-xl font-bold text-cyan-400">{result.securityScore} / 100</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                  <Bot className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="block text-xs text-[#94A3B8]">AI & Otomasyon</span>
                  <span className="text-xl font-bold text-purple-400">{result.aiScore} / 100</span>
                </div>
              </div>

              {/* Identified Issues */}
              <div className="space-y-3 mb-8">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  {isTr ? 'Tespit Edilen Dönüşüm Kaçakları' : 'Identified Conversion Leaks'}
                </h4>
                {result.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-semibold text-white">{rec.title}</h5>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{rec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-500/20"
                >
                  <span>{isTr ? 'Bu Skorları 99/100\'e Çıkaralım (Ücretsiz Rapor Alın)' : 'Upgrade Your Scores to 99/100'}</span>
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
