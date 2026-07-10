"use client";

import React, { useState, useCallback } from 'react';
import {
  Shield, ShieldCheck, ShieldX, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, Search, Zap, BarChart3, Globe,
  AlertCircle, TrendingUp, Eye, FileText
} from 'lucide-react';
import { calculateDeliverabilityScore } from '@/lib/deliverability-score';

interface Mailbox {
  id: string;
  email: string;
  reputation: number;
  bounceCount: number;
  spamCount: number;
  spfStatus: boolean;
  dkimStatus: boolean;
  dmarcStatus: boolean;
  warmupDay: number;
  sentToday: number;
  status: string;
}

interface DeliverabilityTabProps {
  dbMailboxes: Mailbox[];
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-400',
  'A': 'text-green-400',
  'B': 'text-yellow-400',
  'C': 'text-orange-400',
  'D': 'text-red-400',
  'F': 'text-red-600',
};

const SCORE_GRADIENT: Record<string, string> = {
  emerald: 'from-emerald-500 to-teal-400',
  green: 'from-green-500 to-emerald-400',
  yellow: 'from-yellow-500 to-amber-400',
  orange: 'from-orange-500 to-amber-500',
  red: 'from-red-500 to-rose-500',
};

export default function DeliverabilityTab({ dbMailboxes }: DeliverabilityTabProps) {
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(dbMailboxes[0] || null);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [blacklistResult, setBlacklistResult] = useState<any>(null);
  const [spamCheckLoading, setSpamCheckLoading] = useState(false);
  const [spamCheckResult, setSpamCheckResult] = useState<any>(null);
  const [spamSubject, setSpamSubject] = useState('');
  const [spamBody, setSpamBody] = useState('');
  const [activePanel, setActivePanel] = useState<'overview' | 'blacklist' | 'spam'>('overview');

  const deliverability = selectedMailbox
    ? calculateDeliverabilityScore({
        spfStatus: selectedMailbox.spfStatus,
        dkimStatus: selectedMailbox.dkimStatus,
        dmarcStatus: selectedMailbox.dmarcStatus,
        reputation: selectedMailbox.reputation,
        bounceCount: selectedMailbox.bounceCount,
        spamCount: selectedMailbox.spamCount,
        sentToday: selectedMailbox.sentToday,
        warmupDay: selectedMailbox.warmupDay,
      })
    : null;

  const checkBlacklist = useCallback(async () => {
    if (!selectedMailbox) return;
    setBlacklistLoading(true);
    setBlacklistResult(null);
    try {
      const domain = selectedMailbox.email.split('@')[1];
      const res = await fetch(`/api/email/check-blacklist?domain=${domain}`);
      const data = await res.json();
      setBlacklistResult(data);
    } catch (e) {
      setBlacklistResult({ error: 'Sorgu başarısız' });
    } finally {
      setBlacklistLoading(false);
    }
  }, [selectedMailbox]);

  const checkSpam = useCallback(async () => {
    if (!spamSubject && !spamBody) return;
    setSpamCheckLoading(true);
    setSpamCheckResult(null);
    try {
      const res = await fetch('/api/email/spam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: spamSubject, body: spamBody }),
      });
      const data = await res.json();
      setSpamCheckResult(data);
    } catch (e) {
      setSpamCheckResult({ error: 'Analiz başarısız' });
    } finally {
      setSpamCheckLoading(false);
    }
  }, [spamSubject, spamBody]);

  if (dbMailboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-[#64748B]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Henüz Mailbox Yok</h3>
        <p className="text-[#64748B] max-w-sm">
          Deliverability analizi için önce &quot;Akıllı IP/Domain Isıtma&quot; sekmesinden bir mailbox ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
              Deliverability Intelligence
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Her mailbox&apos;ın teslim edilebilirlik puanı, blacklist durumu ve spam skoru gerçek zamanlı analiz edilir.
            </p>
          </div>
          {/* Mailbox Selector */}
          <select
            value={selectedMailbox?.id || ''}
            onChange={(e) => {
              const mb = dbMailboxes.find(m => m.id === e.target.value);
              setSelectedMailbox(mb || null);
              setBlacklistResult(null);
              setSpamCheckResult(null);
            }}
            className="bg-[#05050A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 min-w-[220px] shrink-0"
          >
            {dbMailboxes.map(mb => (
              <option key={mb.id} value={mb.id}>{mb.email}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedMailbox && deliverability && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Big Score Card */}
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br from-${deliverability.color}-500/5 to-transparent`} />
              <div className="relative z-10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-4">Deliverability Skoru</p>
                {/* Circular gauge */}
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle
                      cx="80" cy="80" r="64"
                      fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(deliverability.score / 100) * 402} 402`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={deliverability.color === 'emerald' ? '#10b981' : deliverability.color === 'yellow' ? '#eab308' : deliverability.color === 'orange' ? '#f97316' : '#ef4444'} />
                        <stop offset="100%" stopColor={deliverability.color === 'emerald' ? '#14b8a6' : deliverability.color === 'yellow' ? '#f59e0b' : deliverability.color === 'orange' ? '#f59e0b' : '#e11d48'} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black ${GRADE_COLORS[deliverability.grade]}`}>{deliverability.score}</span>
                    <span className={`text-lg font-bold ${GRADE_COLORS[deliverability.grade]}`}>{deliverability.grade}</span>
                  </div>
                </div>
                <p className="text-sm text-[#64748B]">{selectedMailbox.email}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Puan Dağılımı
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'SPF Kaydı', value: deliverability.breakdown.spf, max: 20, ok: selectedMailbox.spfStatus },
                  { label: 'DKIM Kaydı', value: deliverability.breakdown.dkim, max: 20, ok: selectedMailbox.dkimStatus },
                  { label: 'DMARC Politikası', value: deliverability.breakdown.dmarc, max: 20, ok: selectedMailbox.dmarcStatus },
                  { label: 'İtibar Puanı', value: deliverability.breakdown.reputation, max: 25, ok: deliverability.breakdown.reputation > 15 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#94A3B8] flex items-center gap-1.5">
                        {item.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                        {item.label}
                      </span>
                      <span className="text-white font-mono">{item.value}/{item.max}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {deliverability.breakdown.bouncePenalty > 0 && (
                  <div className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    Bounce cezası: -{deliverability.breakdown.bouncePenalty} puan
                  </div>
                )}
                {deliverability.breakdown.spamPenalty > 0 && (
                  <div className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    Spam cezası: -{deliverability.breakdown.spamPenalty} puan
                  </div>
                )}
              </div>
            </div>

            {/* DNS Status Panel */}
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> DNS Sağlık Durumu
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'SPF', ok: selectedMailbox.spfStatus, hint: 'Gönderici doğrulaması' },
                  { label: 'DKIM', ok: selectedMailbox.dkimStatus, hint: 'E-posta imzalama' },
                  { label: 'DMARC', ok: selectedMailbox.dmarcStatus, hint: 'Politika tanımlı' },
                ].map(item => (
                  <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border ${item.ok ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        {item.ok
                          ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          : <ShieldX className="w-4 h-4 text-red-400" />}
                        <span className="font-bold text-white text-sm">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] ml-6">{item.hint}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {item.ok ? 'DOĞRULANMIŞ' : 'EKSİK'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{selectedMailbox.reputation}</div>
                  <div className="text-[10px] text-[#64748B]">İtibar</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{selectedMailbox.bounceCount}</div>
                  <div className="text-[10px] text-[#64748B]">Bounce</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{selectedMailbox.spamCount}</div>
                  <div className="text-[10px] text-[#64748B]">Spam Şikayet</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {deliverability.recommendations.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <h4 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Öneriler ({deliverability.recommendations.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {deliverability.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel Switcher */}
          <div className="flex gap-3">
            {[
              { id: 'blacklist', label: 'Blacklist Kontrolü', icon: ShieldX, color: 'rose' },
              { id: 'spam', label: 'Spam Kelime Tarayıcı', icon: Eye, color: 'orange' },
            ].map(panel => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(activePanel === panel.id as any ? 'overview' : panel.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  activePanel === panel.id
                    ? 'bg-white/[0.08] border-white/20 text-white'
                    : 'border-white/[0.05] text-[#64748B] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <panel.icon className="w-4 h-4" />
                {panel.label}
              </button>
            ))}
          </div>

          {/* Blacklist Panel */}
          {activePanel === 'blacklist' && (
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <ShieldX className="w-4 h-4 text-rose-400" /> Blacklist Monitör
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">
                    {selectedMailbox.email.split('@')[1]} — Spamhaus, Barracuda, SORBS, SpamCop, URIBL
                  </p>
                </div>
                <button
                  onClick={checkBlacklist}
                  disabled={blacklistLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                >
                  {blacklistLoading
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Search className="w-4 h-4" />}
                  {blacklistLoading ? 'Sorgulanıyor...' : 'Şimdi Sorgula'}
                </button>
              </div>

              {!blacklistResult && !blacklistLoading && (
                <div className="text-center py-12 text-[#64748B] text-sm">
                  Domain&apos;inizi 6 büyük blacklist veritabanına karşı kontrol etmek için butona tıklayın.
                </div>
              )}

              {blacklistLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Spamhaus ZEN', 'Spamhaus DBL', 'Barracuda BRBL', 'SORBS SPAM', 'SpamCop', 'URIBL'].map(name => (
                    <div key={name} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 bg-white/5 rounded-full" />
                      <div>
                        <div className="h-3 bg-white/10 rounded w-20 mb-1" />
                        <div className="h-2 bg-white/5 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {blacklistResult && !blacklistResult.error && (
                <>
                  <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${blacklistResult.isClean ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    {blacklistResult.isClean
                      ? <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                      : <ShieldX className="w-6 h-6 text-red-400 shrink-0" />}
                    <div>
                      <div className="font-bold text-white">
                        {blacklistResult.isClean ? '✅ Temiz — Hiçbir listede değilsiniz!' : `⚠️ ${blacklistResult.listedCount} listede tespit edildiniz`}
                      </div>
                      <div className="text-xs text-[#94A3B8]">
                        {blacklistResult.totalChecked} liste kontrol edildi
                        {blacklistResult.ip && ` · IP: ${blacklistResult.ip}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {blacklistResult.blacklists?.map((bl: any) => (
                      <div key={bl.name} className={`border rounded-xl p-3 flex items-center gap-3 ${bl.listed ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                        {bl.listed
                          ? <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                          : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                        <div>
                          <div className="text-sm font-medium text-white">{bl.name}</div>
                          <div className={`text-[10px] font-bold ${bl.listed ? 'text-red-400' : 'text-emerald-400'}`}>
                            {bl.listed ? 'LİSTELİ' : 'TEMİZ'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DNS Records */}
                  {blacklistResult.dnsRecords && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Gerçek DNS Kayıtları</p>
                      <div className="space-y-2">
                        {blacklistResult.dnsRecords.spf.exists && (
                          <div className="bg-white/[0.02] rounded-lg p-3">
                            <span className="text-xs font-bold text-emerald-400">SPF: </span>
                            <span className="text-xs text-[#94A3B8] font-mono">{blacklistResult.dnsRecords.spf.record}</span>
                          </div>
                        )}
                        {blacklistResult.dnsRecords.dmarc.exists && (
                          <div className="bg-white/[0.02] rounded-lg p-3">
                            <span className="text-xs font-bold text-emerald-400">DMARC: </span>
                            <span className="text-xs text-[#94A3B8] font-mono">{blacklistResult.dnsRecords.dmarc.record}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Spam Check Panel */}
          {activePanel === 'spam' && (
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl animate-in fade-in">
              <h4 className="font-bold text-white flex items-center gap-2 mb-6">
                <Eye className="w-4 h-4 text-orange-400" /> Spam Kelime Tarayıcı
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Konu Başlığı</label>
                    <input
                      type="text"
                      value={spamSubject}
                      onChange={e => setSpamSubject(e.target.value)}
                      placeholder="Örn: Size Özel Ücretsiz Teklif!"
                      className="w-full bg-[#05050A] border border-white/[0.05] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">E-Posta İçeriği</label>
                    <textarea
                      value={spamBody}
                      onChange={e => setSpamBody(e.target.value)}
                      placeholder="E-posta gövdenizi buraya yapıştırın..."
                      rows={6}
                      className="w-full bg-[#05050A] border border-white/[0.05] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 resize-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={checkSpam}
                    disabled={spamCheckLoading || (!spamSubject && !spamBody)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  >
                    {spamCheckLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {spamCheckLoading ? 'Analiz Ediliyor...' : 'Spam Analizi Başlat'}
                  </button>
                </div>

                <div>
                  {!spamCheckResult && !spamCheckLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-[#64748B] text-sm border border-dashed border-white/10 rounded-xl p-8">
                      <FileText className="w-10 h-10 mb-3 text-[#334155]" />
                      İçeriğinizi analiz etmek için soldaki formu doldurun.
                    </div>
                  )}

                  {spamCheckResult && spamCheckResult.success && (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Risk Score Gauge */}
                      <div className={`p-4 rounded-xl border ${
                        spamCheckResult.riskLevel === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/20' :
                        spamCheckResult.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/20' :
                        spamCheckResult.riskLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20' :
                        'bg-red-500/10 border-red-500/20'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-white">Spam Risk Skoru</span>
                          <span className={`text-2xl font-black ${
                            spamCheckResult.riskLevel === 'LOW' ? 'text-emerald-400' :
                            spamCheckResult.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                            spamCheckResult.riskLevel === 'HIGH' ? 'text-orange-400' : 'text-red-400'
                          }`}>{spamCheckResult.riskScore}/100</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              spamCheckResult.riskLevel === 'LOW' ? 'bg-emerald-400' :
                              spamCheckResult.riskLevel === 'MEDIUM' ? 'bg-yellow-400' :
                              spamCheckResult.riskLevel === 'HIGH' ? 'bg-orange-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${spamCheckResult.riskScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#94A3B8]">{spamCheckResult.message}</p>
                      </div>

                      {/* Found Keywords */}
                      {spamCheckResult.spamKeywordsFound?.length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                          <p className="text-xs font-bold text-red-400 mb-2">Riskli Kelimeler</p>
                          <div className="flex flex-wrap gap-2">
                            {spamCheckResult.spamKeywordsFound.map((kw: string, i: number) => (
                              <span key={i} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded border border-red-500/20">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Kelime', value: spamCheckResult.stats?.wordCount },
                          { label: 'Link', value: spamCheckResult.stats?.linkCount },
                          { label: 'Büyük Harf %', value: `${spamCheckResult.stats?.capsRatio}%` },
                        ].map(s => (
                          <div key={s.label} className="bg-white/[0.02] rounded-lg p-3 text-center">
                            <div className="text-white font-bold">{s.value}</div>
                            <div className="text-[10px] text-[#64748B]">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Suggestions */}
                      {spamCheckResult.suggestions?.length > 0 && (
                        <div className="space-y-2">
                          {spamCheckResult.suggestions.map((s: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
