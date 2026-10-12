"use client";

import React, { useState } from 'react';
import { Flame, CheckCircle2, Search, Pause, Activity, AlertCircle, Plus, Loader2, RefreshCw, Wrench, ShieldCheck, Globe } from 'lucide-react';
import { updateMailboxStatus, testMailboxConnection, verifyMailboxDns } from '@/app/actions/email';
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
  const [warmupMessage, setWarmupMessage] = useState<string | null>(null);
  const [testingMailboxId, setTestingMailboxId] = useState<string | null>(null);
  const [verifyingDnsMailboxId, setVerifyingDnsMailboxId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; text: string }>>({});

  const erroredMailboxes = dbMailboxes.filter(m => m.status === 'ERROR' || m.isPaused);
  const activeOrWarmupCount = dbMailboxes.filter(m => m.status === 'ACTIVE' || m.status === 'WARMUP').length;

  const handleManualWarmup = async () => {
    setIsTriggeringWarmup(true);
    setWarmupMessage(null);
    try {
      const res = await fetch('/api/cron/smart-warmup');
      const json = await res.json();
      if (json.success) {
        setWarmupMessage(`✅ ${json.message}`);
        loadPlacement();
      } else {
        setWarmupMessage(`⚠️ ${json.error || 'Isıtma hatası oluştu.'}`);
      }
    } catch (err: any) {
      setWarmupMessage(`❌ Bağlantı hatası: ${err.message}`);
    } finally {
      setIsTriggeringWarmup(false);
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
              <Flame className="w-7 h-7 text-orange-500" />
              Sıfır-Spam Otonom IP Isıtma (Omni-Routing)
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Gönderim itibarınız düşmeye başladığı an sistem bunu algılar, o domaini dinlenmeye alır ve trafiği anında yedek IP'lere (Outlook, Google, SES) aktarır. Tamamen otonom spam koruması.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleManualWarmup}
              disabled={isTriggeringWarmup}
              className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isTriggeringWarmup ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Manuel Isıtılıyor...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Isıtma Döngüsü Çalıştır
                </>
              )}
            </button>
            <button 
              onClick={() => setIsAddMailboxModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" /> Yeni Domain Bağla
            </button>
          </div>
        </div>

        {warmupMessage && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white">
            {warmupMessage}
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

              {testResult && (
                <div className={`p-2.5 rounded-xl text-xs font-medium border ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {testResult.text}
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.05] flex gap-2 relative z-10">
              <button 
                onClick={() => setSelectedMailboxDetails(box)}
                className="py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-xs font-semibold text-white transition-colors"
              >
                Detaylar
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
    </div>
  );
}
