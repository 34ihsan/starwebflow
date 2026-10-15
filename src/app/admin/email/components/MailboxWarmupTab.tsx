"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Flame, CheckCircle2, Search, Pause, Activity, AlertCircle, Plus, Loader2, 
  RefreshCw, Wrench, ShieldCheck, Globe, Zap, MessageSquare, Clock, ArrowUpRight, 
  Check, X, Info, Send, Inbox, AlertTriangle, BarChart3, Trash2
} from 'lucide-react';
import { updateMailboxStatus, testMailboxConnection, verifyMailboxDns, getWarmupActivity, getEmailData, deleteEmailMailbox } from '@/app/actions/email';
import { calculateDeliverabilityScore } from '@/lib/deliverability-score';
import { computeMailboxHealth } from '@/lib/warmup/health';

interface MailboxWarmupTabProps {
  dbMailboxes: any[];
  setDbMailboxes: React.Dispatch<React.SetStateAction<any[]>>;
  setIsAddMailboxModalOpen: (v: boolean) => void;
  setSelectedMailboxDetails: (v: any) => void;
}

export default function MailboxWarmupTab({
  dbMailboxes, setDbMailboxes, setIsAddMailboxModalOpen, setSelectedMailboxDetails
}: MailboxWarmupTabProps) {
  const [isTriggeringWarmup, setIsTriggeringWarmup] = useState(false);
  const [isTriggeringForceWarmup, setIsTriggeringForceWarmup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [warmupMessage, setWarmupMessage] = useState<string | null>(null);
  const [detailedRunResult, setDetailedRunResult] = useState<any>(null);
  const [testingMailboxId, setTestingMailboxId] = useState<string | null>(null);
  const [verifyingDnsMailboxId, setVerifyingDnsMailboxId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; text: string }>>({});

  // Delete confirmation state
  const [deleteConfirmMailbox, setDeleteConfirmMailbox] = useState<any>(null);
  const [isDeletingMailboxId, setIsDeletingMailboxId] = useState<string | null>(null);

  // Canlı Isınma Konuşmaları & Logları
  const [warmupThreads, setWarmupThreads] = useState<any[]>([]);
  const [placementLogs, setPlacementLogs] = useState<any[]>([]);
  const [lastActivityTime, setLastActivityTime] = useState<any>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const erroredMailboxes = dbMailboxes.filter(m => m.status === 'ERROR' || m.isPaused);
  const activeOrWarmupCount = dbMailboxes.filter(m => m.status === 'ACTIVE' || m.status === 'WARMUP').length;

  const loadWarmupActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    try {
      const res = await getWarmupActivity();
      if (res.success && res.data) {
        setWarmupThreads(res.data.threads || []);
        setPlacementLogs(res.data.placements || []);
        setLastActivityTime(res.data.lastActivity);
      }
    } catch (err) {
      console.error('Failed to load warmup activity:', err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      const res = await getEmailData();
      if (res.success && res.data?.mailboxes) {
        setDbMailboxes(res.data.mailboxes);
      }
      await loadWarmupActivity();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWarmupActivity();
  }, [loadWarmupActivity]);

  const handleManualWarmup = async (force = false) => {
    if (force) {
      setIsTriggeringForceWarmup(true);
    } else {
      setIsTriggeringWarmup(true);
    }
    setWarmupMessage(null);
    setDetailedRunResult(null);
    try {
      const res = await fetch(`/api/cron/smart-warmup${force ? '?force=true' : ''}`);
      const json = await res.json();
      if (json.success) {
        setWarmupMessage(`✅ ${json.message}`);
        setDetailedRunResult(json);
        refreshAll();
      } else {
        setWarmupMessage(`⚠️ ${json.error || 'Isıtma hatası oluştu.'}`);
        setDetailedRunResult(json);
      }
    } catch (err: any) {
      setWarmupMessage(`❌ Bağlantı hatası: ${err.message}`);
    } finally {
      setIsTriggeringWarmup(false);
      setIsTriggeringForceWarmup(false);
    }
  };

  const handleDeleteMailbox = async (mailboxId: string) => {
    setIsDeletingMailboxId(mailboxId);
    try {
      const res = await deleteEmailMailbox(mailboxId);
      if (res.success) {
        setDbMailboxes(prev => prev.filter(m => m.id !== mailboxId));
        setDeleteConfirmMailbox(null);
      } else {
        alert('Silme başarısız: ' + (res.error || 'Bilinmeyen hata'));
      }
    } catch (err: any) {
      alert('Silme hatası: ' + err.message);
    } finally {
      setIsDeletingMailboxId(null);
    }
  };

  const handleVerifyDns = async (mailboxId: string) => {
    setVerifyingDnsMailboxId(mailboxId);
    try {
      const res = await verifyMailboxDns(mailboxId);
      if (res.success && res.data) {
        setDbMailboxes(prev => prev.map(m => m.id === mailboxId ? { 
          ...m, 
          spfStatus: res.data.spfStatus, 
          dkimStatus: res.data.dkimStatus, 
          dmarcStatus: res.data.dmarcStatus,
          status: res.data.status,
          reputation: res.data.reputation
        } : m));
        setTestResults(prev => ({
          ...prev,
          [mailboxId]: { success: true, text: res.message || 'DNS kayıtları güncellendi.' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [mailboxId]: { success: false, text: res.error || 'DNS doğrulama başarısız.' }
        }));
      }
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [mailboxId]: { success: false, text: err.message || 'DNS test hatası.' }
      }));
    } finally {
      setVerifyingDnsMailboxId(null);
    }
  };

  const handleTestConnection = async (mailboxId: string) => {
    setTestingMailboxId(mailboxId);
    try {
      const res = await testMailboxConnection(mailboxId);
      if (res.success && res.data) {
        setTestResults(prev => ({
          ...prev,
          [mailboxId]: { success: true, text: res.message || 'Bağlantı başarılı! WARMUP moduna alındı.' }
        }));
        setDbMailboxes(prev => prev.map(m => m.id === mailboxId ? { ...m, status: 'WARMUP', isPaused: false, bounceCount: 0 } : m));
      } else {
        setTestResults(prev => ({
          ...prev,
          [mailboxId]: { success: false, text: res.error || 'Bağlantı başarısız.' }
        }));
      }
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [mailboxId]: { success: false, text: err.message || 'Test hatası.' }
      }));
    } finally {
      setTestingMailboxId(null);
    }
  };

  const [measuredRate, setMeasuredRate] = useState<number | null>(null);
  const [seedMailboxId, setSeedMailboxId] = useState('');
  const [isSeedTesting, setIsSeedTesting] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadPlacement = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/email/placement');
      if (!res.ok) return;
      const json = await res.json();
      setMeasuredRate(typeof json.overallInboxRate === 'number' ? json.overallInboxRate : null);
    } catch {
      /* ölçüm opsiyonel */
    }
  }, []);

  React.useEffect(() => { loadPlacement(); }, [loadPlacement, dbMailboxes.length]);

  const handleSeedTest = async () => {
    if (!seedMailboxId) return;
    setIsSeedTesting(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/v1/email/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailboxId: seedMailboxId })
      });
      const json = await res.json();
      setSeedMessage(json.message || json.error || 'Test tamamlanamadı.');
    } catch (err: any) {
      setSeedMessage(err.message);
    } finally {
      setIsSeedTesting(false);
    }
  };

  const totalReputation = dbMailboxes.length > 0
    ? (dbMailboxes.reduce((acc, m) => acc + Math.min(100, m.reputation || 100), 0) / dbMailboxes.length)
    : 100;

  // Gerçek sağlık skoru: DNS (SPF/DKIM/DMARC) + itibar + yaş - bounce/spam cezası (ortalama)
  const inboxPlacementScore = dbMailboxes.length > 0
    ? Math.round(
        dbMailboxes.reduce((acc, m) => acc + computeMailboxHealth({
          reputation: m.reputation ?? 100,
          bounceCount: m.bounceCount || 0,
          spamCount: m.spamCount || 0,
          spammed: m.spammed || 0,
          spfStatus: !!m.spfStatus,
          dkimStatus: !!m.dkimStatus,
          dmarcStatus: !!m.dmarcStatus,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
        }), 0) / dbMailboxes.length
      )
    : 0;

  const displayedScore = measuredRate ?? inboxPlacementScore;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
              Sıfır-Spam Otonom IP & Domain Isıtma (Omni-Routing)
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Gönderim itibarınız düşmeye başladığı an sistem bunu algılar, o domaini dinlenmeye alır ve trafiği anında yedek IP'lere (Outlook, Google, SES) aktarır. Tamamen otonom spam koruması.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={refreshAll}
              disabled={isRefreshing}
              className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white px-3 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              title="Panel Verilerini ve Isınma İlerlemesini Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              Yenile
            </button>

            <button 
              onClick={() => handleManualWarmup(false)}
              disabled={isTriggeringWarmup || isTriggeringForceWarmup}
              className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              title="Organik İnsan Ritmine Uygun Otonom Döngü Çalıştır"
            >
              {isTriggeringWarmup ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Çalışıyor...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" /> Isıtma Döngüsü
                </>
              )}
            </button>

            <button 
              onClick={() => handleManualWarmup(true)}
              disabled={isTriggeringWarmup || isTriggeringForceWarmup}
              className="bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              title="Gece / Dinlenme Saatini Aşarak Anında Canlı Test Yap"
            >
              {isTriggeringForceWarmup ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Zorla Isıtılıyor...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-orange-400" /> Zorla Isıt (Anında Test)
                </>
              )}
            </button>

            <button 
              onClick={() => setIsAddMailboxModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" /> Yeni Domain Bağla
            </button>
          </div>
        </div>

        {warmupMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white flex items-center justify-between">
            <span>{warmupMessage}</span>
            <button onClick={() => setWarmupMessage(null)} className="text-[#94A3B8] hover:text-white ml-2 text-sm">✕</button>
          </div>
        )}

        {/* Detailed Run Diagnostics Result Modal / Card */}
        {detailedRunResult && (
          <div className="mt-4 p-4 rounded-xl bg-[#05050A] border border-cyan-500/30 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Son Isıtma Döngüsü Ayrıntılı Teşhis Raporu
                {detailedRunResult.forced && <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px]">ZORLA TEST MODU</span>}
              </h4>
              <button onClick={() => setDetailedRunResult(null)} className="text-[#94A3B8] hover:text-white text-xs">✕ Kapat</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span className="text-[#94A3B8] text-[10px]">IMAP Okunan Mail</span>
                <p className="text-white font-bold text-sm mt-0.5">{detailedRunResult.stats?.inboundCount || 0}</p>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span className="text-[#94A3B8] text-[10px]">Spam'den Kurtarılan</span>
                <p className="text-emerald-400 font-bold text-sm mt-0.5">{detailedRunResult.stats?.rescuedCount || 0}</p>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span className="text-[#94A3B8] text-[10px]">Gönderilen (Çapraz Ağ)</span>
                <p className="text-blue-400 font-bold text-sm mt-0.5">{detailedRunResult.stats?.outboundCount || 0}</p>
              </div>
              <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                <span className="text-[#94A3B8] text-[10px]">Tamamlanan Diyalog</span>
                <p className="text-purple-400 font-bold text-sm mt-0.5">{detailedRunResult.stats?.completedThreadsCount || 0}</p>
              </div>
            </div>

            {/* Gönderilenler veya Hatalar */}
            {detailedRunResult.sendResults && detailedRunResult.sendResults.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Gönderim Hareketleri:</span>
                {detailedRunResult.sendResults.map((sr: any, idx: number) => (
                  <div key={idx} className={`p-2 rounded-lg text-xs flex items-center justify-between border ${sr.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                    <span className="font-mono text-[11px] truncate">{sr.from} ➔ {sr.to}</span>
                    <span className="text-[10px] font-semibold">{sr.success ? `✓ "${sr.subject}"` : `✗ Hata: ${sr.error}`}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Atlanan Kutular */}
            {detailedRunResult.skippedMailboxes && detailedRunResult.skippedMailboxes.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Bu Döngüde Atlanan Hesaplar ve Nedenleri:</span>
                <div className="space-y-1">
                  {detailedRunResult.skippedMailboxes.map((sk: any, idx: number) => (
                    <div key={idx} className="p-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-[#94A3B8] flex items-center justify-between">
                      <span className="font-medium text-white">{sk.email}</span>
                      <span className="text-amber-400/90 text-[10px]">{sk.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {erroredMailboxes.length > 0 && (
        <div className="bg-red-500/10 border-l-4 border-red-500 rounded-r-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-bold">Karantinadaki Mail Kutuları ({erroredMailboxes.length} Adet Hata / Bounce)</h4>
              <p className="text-sm text-red-400/80 mt-1">
                {erroredMailboxes.length} adet mail adresi gönderim sorunları (bounce veya şifre hatası) nedeniyle sistem tarafından otonom olarak durduruldu. Aşağıdaki "Bağlantı Test Et" butonuna tıklayarak anında teşhis koyabilir ve hesabı tekrar aktifleştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pro A++ Architecture Visualizer Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0F] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <span className="text-lg">🌐</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Çapraz Domain & ESP Ağı</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold">Anti-Looping Aktif</span>
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Aynı domain içinde kısır döngüye girilmez. Google, Microsoft 365 ve kurumsal SMTP kutuları arasında çapraz itibar inşası yapılır.
          </p>
        </div>

        <div className="bg-[#0A0A0F] border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">AI B2B & Sıfır-Spam Kalkanı</h4>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-semibold">A++ Kalite</span>
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Gemini 2.5 Flash ile gerçekçi B2B senaryoları üretilir. Satış/pazarlama kelimeleri içermez, antispam algoritmalarını tetiklemez.
          </p>
        </div>

        <div className="bg-[#0A0A0F] border border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <span className="text-lg">🌱</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Dış Ağ Bülten Tohumlama</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold">Seed Network</span>
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            TLDR, Substack, Hacker Newsletter gibi küresel saygın kaynaklardan gerçek gelen kutusu trafiği sağlanır ve otonom onaylanır.
          </p>
        </div>

        <div className="bg-[#0A0A0F] border border-cyan-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <span className="text-lg">⏰</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">İnsan Ritmi & Auto-Trash</h4>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-semibold">08:00 - 19:00</span>
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Mesai saatlerine uygun rastgele zamanlama uygulanır. Isıtma mailleri 48 saat sonra arşive alınır, kutunuz dolmaz.
          </p>
        </div>
      </div>

      {/* Network Health Map */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h4 className="font-bold text-white flex items-center gap-2 mb-6 relative z-10">
          <Activity className="w-4 h-4 text-emerald-500" /> Omni-Routing Ağ Sağlığı
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
          <div className="bg-[#05050A] border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:border-emerald-500/40 transition-colors cursor-default">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">Ağ İtibarı (Network Rep.)</p>
              <p className="text-xl font-bold text-emerald-400">%{totalReputation.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          {/* Corrected Active / Warmup IP Count */}
          <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-4 flex items-center justify-between hover:border-white/[0.1] transition-colors cursor-default">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">Aktif & Isınan IP'ler</p>
              <p className="text-xl font-bold text-white">{activeOrWarmupCount} <span className="text-xs text-[#64748B] font-normal">/ {dbMailboxes.length || 0}</span></p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-[#05050A] border border-rose-500/20 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(244,63,94,0.05)] hover:border-rose-500/40 transition-colors cursor-default">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">Karantina / Hatalı</p>
              <p className="text-xl font-bold text-rose-500">{erroredMailboxes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Pause className="w-5 h-5 text-rose-500" />
            </div>
          </div>

          {/* Gerçek Inbox Yerleşimi (IMAP ile ölçülen) */}
          <div className="bg-[#05050A] border border-blue-500/20 rounded-xl p-4 flex flex-col justify-center shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:border-blue-500/40 transition-colors">
             <p className="text-xs text-[#94A3B8] mb-2">
               {measuredRate !== null ? 'Ölçülen Inbox Yerleşimi (7 gün)' : 'Ağ Sağlık Skoru (ölçüm bekleniyor)'}
             </p>
             <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
               <div className="bg-blue-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.8)] relative" style={{ width: `${displayedScore}%` }}>
                 <div className="absolute inset-0 bg-white/30 blur-[1px]"></div>
               </div>
             </div>
             <p className="text-xs font-bold text-white mt-1 text-right">%{displayedScore}</p>
             <div className="flex gap-1 mt-2">
               <select
                 value={seedMailboxId}
                 onChange={(e) => setSeedMailboxId(e.target.value)}
                 className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded text-[10px] text-white px-1 py-1"
               >
                 <option value="">Seed testi için kutu seç</option>
                 {dbMailboxes.map((m) => <option key={m.id} value={m.id}>{m.email}</option>)}
               </select>
               <button
                 onClick={handleSeedTest}
                 disabled={!seedMailboxId || isSeedTesting}
                 className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold disabled:opacity-40"
               >
                 {isSeedTesting ? '...' : 'Test'}
               </button>
             </div>
             {seedMessage && <p className="text-[10px] text-[#94A3B8] mt-1">{seedMessage}</p>}
          </div>
        </div>

        {/* Omni-Routing Active Alert */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 relative z-10">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-amber-500 mb-1">Otonom Yönlendirme Özelliği Aktif</h5>
            <p className="text-xs text-amber-500/80 leading-relaxed">
              Sistem gönderimlerinizde spam tepkisi algıladığında ilgili domaini otomatik olarak dinlenmeye alır (Warmup modu) ve trafiği anında yedek veya sağlıklı IP'lerinize yönlendirerek itibarınızı korur.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {dbMailboxes.map((box) => {
          const safeStatus = box.status?.toUpperCase() || 'WARMUP';
          const isTestingThis = testingMailboxId === box.id;
          const isVerifyingDnsThis = verifyingDnsMailboxId === box.id;
          const testResult = testResults[box.id];

          const deliv = calculateDeliverabilityScore({
            spfStatus: !!box.spfStatus,
            dkimStatus: !!box.dkimStatus,
            dmarcStatus: !!box.dmarcStatus,
            reputation: box.reputation || 100,
            bounceCount: box.bounceCount || 0,
            spamCount: box.spamCount || 0,
            sentToday: box.sentToday || 0,
            warmupDay: box.warmupDay || 1
          });

          return (
          <div key={box.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-300 relative overflow-hidden group shadow-xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/[0.1] flex items-center justify-center font-bold text-white shadow-inner">
                  {box.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm truncate max-w-[150px]">{box.email}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono">
                    <span className={`px-1.5 py-0.5 rounded ${box.spfStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      SPF {box.spfStatus ? '✓' : '✗'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${box.dkimStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      DKIM {box.dkimStatus ? '✓' : '✗'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${box.dmarcStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      DMARC {box.dmarcStatus ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  safeStatus === 'ACTIVE' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                  safeStatus === 'WARMUP' ? 'text-[#4F8EF7] bg-[#4F8EF7]/10 border-[#4F8EF7]/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                  'text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                }`}>
                  {safeStatus === 'WARMUP' ? '🔥 WARMUP' : safeStatus === 'WARNING' ? '⚠️ DİNLENİYOR' : safeStatus === 'ERROR' ? '❌ HATA / PAUSE' : safeStatus}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  deliv.grade === 'A+' || deliv.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  deliv.grade === 'B' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  Skor: {deliv.grade} (%{deliv.score})
                </span>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <div>
                <div className="flex justify-between text-xs text-[#94A3B8] mb-2 font-medium">
                  <span>Ağ İtibarı (Network Rep.)</span>
                  <span className={Math.min(100, box.reputation || 100) < 90 ? "text-red-400 font-bold" : "text-[#10B981] font-bold"}>{Math.min(100, box.reputation || 100)}/100</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden shadow-inner">
                  <div className={`h-2 rounded-full relative transition-all duration-1000 ${Math.min(100, box.reputation || 100) < 90 ? "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"}`} style={{ width: `${Math.min(100, box.reputation || 100)}%` }}>
                     <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/20 rounded-full blur-[2px]"></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end text-xs text-[#94A3B8] mb-1 font-medium">
                  <div className="flex flex-col">
                    <span>Isıtma Süreci ({box.warmupDay || 1}. Gün / 30 Gün)</span>
                    <span className="text-[10px] text-[#64748B] mt-0.5">Toplu mail gönderimi için en az %50 (15. Gün) önerilir.</span>
                  </div>
                  <span className="text-blue-400 font-bold text-base">{Math.min(100, Math.floor(((box.warmupDay || 1) / 30) * 100))}%</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden shadow-inner mt-2">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full relative shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-1000" style={{ width: `${Math.min(100, Math.floor(((box.warmupDay || 1) / 30) * 100))}%` }}>
                     <div className="absolute inset-0 bg-white/20 blur-[1px]"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.02] text-center shadow-inner hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider mb-1">Limit</div>
                  <div className="font-mono text-xs font-bold text-white">{box.limit || 50}</div>
                </div>
                <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.02] text-center shadow-inner hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider mb-1">Gönd.</div>
                  <div className="font-mono text-xs font-bold text-blue-400">{box.sentToday || 0}</div>
                </div>
                <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.02] text-center shadow-inner hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider mb-1">Gelen</div>
                  <div className="font-mono text-xs font-bold text-emerald-400">{box.receivedToday || 0}</div>
                </div>
                <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.02] text-center shadow-inner hover:bg-white/[0.04] transition-colors cursor-default">
                  <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider mb-1">Bounce</div>
                  <div className={`font-mono text-xs font-bold ${box.bounceCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {box.bounceCount || 0}
                  </div>
                </div>
              </div>

              {safeStatus === 'WARNING' && (
                <div className="p-2.5 rounded-xl text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  ⚠️ <strong>DNS Beklemede:</strong> SPF/DKIM doğrulaması henüz tamamlanmadığı için dinlenmeye alındı. Isınmayı hemen başlatmak için <strong>'Isınma Başlat'</strong> butonuna tıklayabilirsiniz.
                </div>
              )}

              {box.isPaused && (
                <div className="p-2 rounded-xl text-[11px] font-medium bg-red-500/10 border border-red-500/20 text-red-300">
                  ⏸️ <strong>Kutu Duraklatıldı:</strong> Otomatik ısıtma bu kutuyu atlayacaktır. Başlatmak için 'Isınma Başlat'a tıklayın.
                </div>
              )}

              {testResult && (
                <div className={`p-2.5 rounded-xl text-xs font-medium border ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {testResult.text}
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.05] flex gap-2 relative z-10">
              <button 
                onClick={() => setSelectedMailboxDetails(box)}
                className="py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-400 transition-colors flex items-center gap-1.5"
                title="Detaylı Gönderim İstatistikleri ve Domain Sağlık Raporu"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Rapor & İstatistik
              </button>

              <button 
                onClick={() => handleVerifyDns(box.id)}
                disabled={isVerifyingDnsThis}
                className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 transition-colors flex items-center justify-center gap-1"
                title="Canlı DNS (SPF, DKIM, DMARC) Doğrula"
              >
                {isVerifyingDnsThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                DNS
              </button>

              <button 
                onClick={() => handleTestConnection(box.id)}
                disabled={isTestingThis}
                className="py-2 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-semibold text-cyan-400 transition-colors flex items-center justify-center gap-1"
                title="SMTP/IMAP Bağlantı ve Şifre Testi Yap"
              >
                {isTestingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                Test
              </button>

              {safeStatus === "WARMUP" ? (
                <button 
                  onClick={async () => {
                    const res = await updateMailboxStatus({ id: box.id, status: 'ACTIVE' });
                    if (res.success && res.data) {
                      setDbMailboxes(prev => prev.map(m => m.id === box.id ? { ...m, status: 'ACTIVE' } : m));
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#4F8EF7]/10 hover:bg-[#4F8EF7]/20 border border-[#4F8EF7]/20 text-xs font-semibold text-[#4F8EF7] transition-colors shadow-inner"
                >
                  Durdur
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    const res = await updateMailboxStatus({ id: box.id, status: 'WARMUP' });
                    if (res.success && res.data) {
                      setDbMailboxes(prev => prev.map(m => m.id === box.id ? { ...m, status: 'WARMUP' } : m));
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-xs font-semibold text-orange-400 transition-colors shadow-inner"
                >
                  Isınma Başlat
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={() => setDeleteConfirmMailbox(box)}
                className="py-2 px-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 transition-colors flex items-center justify-center"
                title="Bu mail kutusunu kalıcı olarak sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )})}
        
        <button 
          onClick={() => setIsAddMailboxModalOpen(true)}
          className="border-2 border-dashed border-white/[0.1] rounded-2xl flex flex-col items-center justify-center p-6 text-[#64748B] hover:text-white hover:border-white/[0.2] transition-all hover:bg-white/[0.02] min-h-[350px] group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-500/10 group-hover:text-blue-400">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-semibold text-lg group-hover:text-white transition-colors">Yeni Mail Kutusu Bağla</span>
        </button>
      </div>

      {/* CANLI ISINMA DİYALOGLARI & AĞ HAREKETLERİ (WARMUP ACTIVITY FEED) */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Canlı Isınma Konuşmaları & Ağ Diyalogları (Warmup Threads)
            </h4>
            <p className="text-xs text-[#94A3B8] mt-1">
              Eklediğiniz mailler ile çapraz ağ düğümleri arasında otomatik gerçekleşen gerçek B2B diyalogları ve gelen kutusu hareketleri.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastActivityTime && (
              <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Son Aktivite: {new Date(lastActivityTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={loadWarmupActivity}
              disabled={isLoadingActivity}
              className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActivity ? 'animate-spin text-cyan-400' : ''}`} />
              Güncelle
            </button>
          </div>
        </div>

        {isLoadingActivity ? (
          <div className="p-12 text-center text-[#94A3B8] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs">Isınma geçmişi yükleniyor...</span>
          </div>
        ) : warmupThreads.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400">
              <Flame className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-semibold text-white">Henüz Kayıtlı Isınma Konuşması Bulunmuyor</h5>
            <p className="text-xs text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
              Canlı sunucuda yeni eklediğiniz hesapların ısınma sürecini başlatmak için yukarıdaki <strong>"Zorla Isıt (Anında Test)"</strong> butonuna tıklayabilirsiniz. Otomatik döngü ise Hostinger VPS üzerindeki PM2 cron servisi ile her 30 dakikada bir organik olarak çalışır.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#94A3B8] text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Gönderici Kutu</th>
                  <th className="pb-3 font-semibold">Hedef Ağ Düğümü</th>
                  <th className="pb-3 font-semibold">Konu Başlığı</th>
                  <th className="pb-3 font-semibold text-center">Diyalog Turu</th>
                  <th className="pb-3 font-semibold text-center">Durum</th>
                  <th className="pb-3 font-semibold text-right">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {warmupThreads.map((thread: any) => (
                  <tr key={thread.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                        {(thread.mailbox?.email || 'M')[0].toUpperCase()}
                      </div>
                      <span className="truncate max-w-[160px]">{thread.mailbox?.email || 'Bilinmiyor'}</span>
                    </td>
                    <td className="py-3 text-[#94A3B8] font-mono text-[11px]">
                      {thread.targetEmail}
                    </td>
                    <td className="py-3 text-white max-w-[220px] truncate font-medium">
                      {thread.subject}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-white">
                        {thread.messageCount || 1} Mesaj
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        thread.status === 'COMPLETED'
                          ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {thread.status === 'COMPLETED' ? 'Tamamlandı' : 'Diyalogda (Aktif)'}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[#64748B] text-[11px] font-mono">
                      {new Date(thread.updatedAt || thread.createdAt).toLocaleString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Canlı Sunucu / Hostinger VPS Cron Rehberi */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hostinger VPS Otonom Cron: <code>ecosystem.config.js (starwebflow-cron)</code> her 30 dakikada bir otomatik çalışır.</span>
          </div>
          <span className="text-[11px] text-[#64748B]">Gece Saatleri (22:00 - 07:00): Organik dinlenme modu aktiftir.</span>
        </div>
      </div>
    </div>

    {/* ── DELETE CONFIRMATION MODAL ── */}
    {deleteConfirmMailbox && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-[#0A0A0F] border border-red-500/30 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Mail Kutusunu Sil</h3>
              <p className="text-sm text-[#94A3B8] mt-1 leading-relaxed">
                Bu işlem geri alınamaz. Tüm ısınma diyalogları ve kayıtları da silinecektir.
              </p>
            </div>
          </div>

          {/* Mailbox info */}
          <div className="px-6 py-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-white text-sm shrink-0">
                {deleteConfirmMailbox.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{deleteConfirmMailbox.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#64748B]">
                    {deleteConfirmMailbox.warmupDay || 1}. Gün · Gelen: {deleteConfirmMailbox.receivedToday || 0}
                  </span>
                  {(deleteConfirmMailbox.warmupDay || 1) <= 1 && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                      Yeni / 1. Gün
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => setDeleteConfirmMailbox(null)}
              disabled={isDeletingMailboxId === deleteConfirmMailbox.id}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              onClick={() => handleDeleteMailbox(deleteConfirmMailbox.id)}
              disabled={isDeletingMailboxId === deleteConfirmMailbox.id}
              className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm font-bold text-red-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isDeletingMailboxId === deleteConfirmMailbox.id ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Siliniyor...</>
              ) : (
                <><Trash2 className="w-4 h-4" /> Evet, Kalıcı Sil</>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  );
}
