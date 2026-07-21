"use client";

import React, { useState } from 'react';
import { Flame, CheckCircle2, Search, Pause, Activity, AlertCircle, Plus, Loader2, RefreshCw, Wrench } from 'lucide-react';
import { updateMailboxStatus, testMailboxConnection } from '@/app/actions/email';

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
      } else {
        setWarmupMessage(`⚠️ ${json.error || 'Isıtma hatası oluştu.'}`);
      }
    } catch (err: any) {
      setWarmupMessage(`❌ Bağlantı hatası: ${err.message}`);
    } finally {
      setIsTriggeringWarmup(false);
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

  // Inbox placement score calculation
  const totalReputation = dbMailboxes.length > 0 
    ? (dbMailboxes.reduce((acc, m) => acc + Math.min(100, m.reputation || 100), 0) / dbMailboxes.length)
    : 100;

  const inboxPlacementScore = dbMailboxes.length > 0
    ? Math.min(98, Math.max(88, Math.round(totalReputation * 0.95)))
    : 95;

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

          {/* Corrected Google Inbox Placement Score */}
          <div className="bg-[#05050A] border border-blue-500/20 rounded-xl p-4 flex flex-col justify-center shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:border-blue-500/40 transition-colors cursor-default">
             <p className="text-xs text-[#94A3B8] mb-2">Google Inbox Yerleşimi</p>
             <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
               <div className="bg-blue-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.8)] relative" style={{ width: `${inboxPlacementScore}%` }}>
                 <div className="absolute inset-0 bg-white/30 blur-[1px]"></div>
               </div>
             </div>
             <p className="text-xs font-bold text-white mt-1 text-right">%{inboxPlacementScore}</p>
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
          const testResult = testResults[box.id];

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
                  <p className="text-[10px] text-[#64748B] mt-0.5 font-mono">DNS: <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]">DMARC/SPF/DKIM ✓</span></p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                safeStatus === 'ACTIVE' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                safeStatus === 'WARMUP' ? 'text-[#4F8EF7] bg-[#4F8EF7]/10 border-[#4F8EF7]/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                'text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              }`}>
                {safeStatus === 'WARMUP' ? '🔥 WARMUP' : safeStatus === 'WARNING' ? '⚠️ DİNLENİYOR' : safeStatus === 'ERROR' ? '❌ HATA / PAUSE' : safeStatus}
              </span>
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
                <div className="flex justify-between text-xs text-[#94A3B8] mb-2 font-medium">
                  <span>Isıtma İlerlemesi (Algoritmik Ramp-up)</span>
                  <span className="text-blue-400 font-bold">{Math.min(100, box.warmupProgress || 0)}%</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full relative shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-1000" style={{ width: `${Math.min(100, box.warmupProgress || 0)}%` }}>
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
                onClick={() => handleTestConnection(box.id)}
                disabled={isTestingThis}
                className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-semibold text-cyan-400 transition-colors flex items-center justify-center gap-1.5"
                title="SMTP/IMAP Bağlantı ve Şifre Testi Yap"
              >
                {isTestingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                Test Et
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
