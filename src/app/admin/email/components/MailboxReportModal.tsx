"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, BarChart3, ShieldCheck, Mail, Send, Activity, Flame, CheckCircle2, 
  AlertTriangle, RefreshCw, Loader2, Wrench, Globe, ArrowUpRight, 
  MessageSquare, Clock, Copy, Check, Sparkles, AlertCircle, Info, Database,
  Settings2, Pause, Play
} from 'lucide-react';
import { getMailboxReport, verifyMailboxDns, testMailboxConnection, updateMailboxStatus } from '@/app/actions/email';

interface MailboxReportModalProps {
  mailbox: any;
  onClose: () => void;
  onEditSettings: (mailbox: any) => void;
  onStatusChange?: (mailboxId: string, newStatus: string) => void;
}

export default function MailboxReportModal({
  mailbox,
  onClose,
  onEditSettings,
  onStatusChange
}: MailboxReportModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sent' | 'domain'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live actions inside modal
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentMailbox, setCurrentMailbox] = useState(mailbox);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMailboxReport(mailbox.id);
      if (res.success && res.data) {
        setReportData(res.data);
        if (res.data.mailbox) {
          setCurrentMailbox(res.data.mailbox);
        }
      }
    } catch (err) {
      console.error('Failed to load mailbox report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mailbox.id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerifyDnsModal = async () => {
    setIsVerifyingDns(true);
    setActionMessage(null);
    try {
      const res = await verifyMailboxDns(currentMailbox.id);
      if (res.success && res.data) {
        setActionMessage({ type: 'success', text: res.message || 'DNS kayıtları başarıyla doğrulandı.' });
        setCurrentMailbox((prev: any) => ({ ...prev, ...res.data }));
        loadReport();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'DNS doğrulama başarısız oldu.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'DNS sorgu hatası.' });
    } finally {
      setIsVerifyingDns(false);
    }
  };

  const handleTestConnectionModal = async () => {
    setIsTestingConnection(true);
    setActionMessage(null);
    try {
      const res = await testMailboxConnection(currentMailbox.id);
      if (res.success && res.data) {
        setActionMessage({ type: 'success', text: res.message || 'SMTP & IMAP bağlantısı başarılı!' });
        setCurrentMailbox((prev: any) => ({ ...prev, status: 'WARMUP', isPaused: false }));
        loadReport();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Bağlantı testi başarısız oldu.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Bağlantı hatası.' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const toggleWarmupStatus = async () => {
    const newStatus = currentMailbox.status === 'WARMUP' ? 'ACTIVE' : 'WARMUP';
    try {
      const res = await updateMailboxStatus({ id: currentMailbox.id, status: newStatus });
      if (res.success && res.data) {
        setCurrentMailbox(res.data);
        if (onStatusChange) onStatusChange(currentMailbox.id, newStatus);
        setActionMessage({ type: 'success', text: `Hesap statüsü '${newStatus}' olarak güncellendi.` });
        loadReport();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const domain = currentMailbox.email?.split('@')[1] || 'starwebflow.com';
  const safeStatus = currentMailbox.status?.toUpperCase() || 'WARMUP';
  const deliv = reportData?.deliverability || { score: 100, grade: 'A+', recommendations: [] };
  const stats = reportData?.stats || {
    totalEstimatedSent: currentMailbox.sentToday || 0,
    threadsCount: 0,
    activeThreadsCount: 0,
    completedThreadsCount: 0,
    inboxRate: null,
    remainingDailyLimit: (currentMailbox.limit || 50) - (currentMailbox.sentToday || 0)
  };

  const filteredThreads = (reportData?.threads || []).filter((t: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.targetEmail?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
              {currentMailbox.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                  {currentMailbox.email}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  safeStatus === 'WARMUP' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                  safeStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  safeStatus === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {safeStatus === 'WARMUP' ? '🔥 WARMUP' : safeStatus === 'WARNING' ? '⚠️ DİNLENİYOR' : safeStatus === 'ACTIVE' ? '✅ AKTİF' : safeStatus}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-2">
                <span>Sağlayıcı: <strong className="text-white">{currentMailbox.provider || 'Özel SMTP'}</strong></span>
                <span>•</span>
                <span>Gönderici: <strong className="text-white">{currentMailbox.senderName || '-'}</strong></span>
                <span>•</span>
                <span>Domain: <strong className="text-cyan-400 font-mono">{domain}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              deliv.grade === 'A+' || deliv.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' :
              deliv.grade === 'B' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span>Sağlık Skoru: {deliv.grade} (%{deliv.score})</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTION MESSAGE BANNER */}
        {actionMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* MODAL TABS */}
        <div className="flex border-b border-white/5 px-6 pt-3 gap-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Genel İstatistikler', icon: BarChart3 },
            { id: 'sent', label: `Gönderilen Mailler & Diyaloglar (${stats.threadsCount || 0})`, icon: Send },
            { id: 'domain', label: 'Domain Sağlığı & DNS Raporu', icon: ShieldCheck },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id 
                  ? 'border-blue-500 text-white' 
                  : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="p-16 text-center text-[#94A3B8] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs">Posta kutusu raporu ve istatistikleri yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* High Impact Metric Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between text-[#94A3B8] text-xs">
                        <span>Bugün Gönderilen</span>
                        <Send className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {currentMailbox.sentToday || 0}
                        <span className="text-xs text-[#64748B] font-normal ml-1">/ {currentMailbox.limit || 50} mail</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-1">Kalan Kota: {stats.remainingDailyLimit} mail</div>
                    </div>

                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between text-[#94A3B8] text-xs">
                        <span>Gelen (Okunan)</span>
                        <Mail className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-400 mt-2">
                        {currentMailbox.receivedToday || 0}
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-1">IMAP Gelen Kutusu</div>
                    </div>

                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between text-[#94A3B8] text-xs">
                        <span>Ağ İtibarı</span>
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mt-2">
                        %{Math.min(100, currentMailbox.reputation || 100)}
                      </div>
                      <div className="text-[10px] text-cyan-400 mt-1">Sıfır-Spam Koruma Puanı</div>
                    </div>

                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between text-[#94A3B8] text-xs">
                        <span>Isınma Günü</span>
                        <Flame className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="text-2xl font-bold text-orange-400 mt-2">
                        {currentMailbox.warmupDay || 1}. Gün
                        <span className="text-xs text-[#64748B] font-normal ml-1">/ 30</span>
                      </div>
                      <div className="text-[10px] text-[#94A3B8] mt-1">İlerleme: %{Math.min(100, Math.floor(((currentMailbox.warmupDay || 1) / 30) * 100))}</div>
                    </div>
                  </div>

                  {/* Ramping Curve & Progress Bar */}
                  <div className="bg-[#05050A] border border-white/5 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="font-semibold text-white">30 Günlük Matematiksel Isınma Rampalama İlerlemesi</span>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold">
                        %{Math.min(100, Math.floor(((currentMailbox.warmupDay || 1) / 30) * 100))} Tamamlandı
                      </span>
                    </div>

                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.floor(((currentMailbox.warmupDay || 1) / 30) * 100))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>1. Gün (3-5 Mail/gün)</span>
                      <span>15. Gün (%50 - Güvenli Eşik)</span>
                      <span>30. Gün (Tam Isınmış - Yüksek Hacim)</span>
                    </div>
                  </div>

                  {/* Deliverability & Placement Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#05050A] border border-white/5 p-5 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Domain Güvenlik Doğrulama Durumu
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="text-[#94A3B8]">SPF (Sender Policy Framework)</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            currentMailbox.spfStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {currentMailbox.spfStatus ? '✓ GEÇERLİ' : '✗ EKSİK'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="text-[#94A3B8]">DKIM (DomainKeys Identified Mail)</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            currentMailbox.dkimStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {currentMailbox.dkimStatus ? '✓ GEÇERLİ' : '✗ EKSİK'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="text-[#94A3B8]">DMARC Politikası</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            currentMailbox.dmarcStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {currentMailbox.dmarcStatus ? '✓ AKTİF' : '⚠️ TANIMSIZ'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#05050A] border border-white/5 p-5 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Gelen Kutusu (Inbox) Yerleşim İstatistikleri
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="text-[#94A3B8]">Ölçülen Inbox Oranı</span>
                          <span className="font-bold text-emerald-400">
                            {stats.inboxRate !== null ? `%${stats.inboxRate}` : 'Ölçüm Yapılıyor...'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="text-[#94A3B8]">Toplam Diyalog Konuşması</span>
                          <span className="font-bold text-white">{stats.threadsCount} Adet</span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                          <span className="text-[#94A3B8]">Bounce (Geri Dönen) Sayısı</span>
                          <span className={`font-bold ${currentMailbox.bounceCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {currentMailbox.bounceCount || 0} Hata
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {deliv.recommendations && deliv.recommendations.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Sistem Tavsiyeleri & İtibar Koruması:
                      </div>
                      <ul className="space-y-1 text-xs text-[#94A3B8]">
                        {deliv.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SENT EMAILS & WARMUP THREADS */}
              {activeTab === 'sent' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-xs text-[#94A3B8]">
                      Bu mail kutusunun dahil olduğu veya başlattığı tüm otonom diyaloglar ve gönderilen mailler.
                    </p>
                    <input 
                      type="text"
                      placeholder="Hedef email veya konu ara..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs w-full sm:w-64 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {filteredThreads.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-[#05050A] border border-white/5 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400">
                        <Send className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-semibold text-white">Henüz Gönderilen Isınma Maili Kaydı Yok</h5>
                      <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                        Bu posta kutusundan henüz dış ağa veya havuza ısınma maili gitmedi. Sayfa üzerindeki <strong>"Zorla Isıt (Anında Test)"</strong> butonunu kullanarak hemen ilk maili gönderebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#05050A]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-[#94A3B8] text-[10px] uppercase tracking-wider bg-white/[0.02]">
                            <th className="p-3 font-semibold">Hedef (Alıcı Mail)</th>
                            <th className="p-3 font-semibold">Konu Başlığı</th>
                            <th className="p-3 font-semibold text-center">Diyalog Turu</th>
                            <th className="p-3 font-semibold text-center">Durum</th>
                            <th className="p-3 font-semibold text-right">Tarih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredThreads.map((t: any) => (
                            <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3 font-mono text-[11px] text-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[9px]">
                                    @
                                  </div>
                                  <span>{t.targetEmail}</span>
                                </div>
                              </td>
                              <td className="p-3 text-[#94A3B8] max-w-[240px] truncate font-medium">
                                "{t.subject}"
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white">
                                  {t.messageCount || 1} Mesaj
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                  t.status === 'COMPLETED'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {t.status === 'COMPLETED' ? 'Tamamlandı' : 'Diyalogda'}
                                </span>
                              </td>
                              <td className="p-3 text-right text-[#64748B] text-[11px] font-mono">
                                {new Date(t.updatedAt || t.createdAt).toLocaleString('tr-TR', {
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
                </div>
              )}

              {/* TAB 3: DOMAIN HEALTH & DNS INSPECTOR */}
              {activeTab === 'domain' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        Domain DNS Kayıtları ({domain})
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Domaininizin gelen kutusuna (Inbox) ulaşabilmesi için DNS sağlayıcınızda (Cloudflare, Ionos vb.) bu kayıtların bulunması zorunludur.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleVerifyDnsModal}
                        disabled={isVerifyingDns}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isVerifyingDns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        DNS Yeniden Doğrula
                      </button>

                      <button
                        onClick={handleTestConnectionModal}
                        disabled={isTestingConnection}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-semibold text-cyan-400 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isTestingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                        SMTP/IMAP Test Et
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* SPF Record Card */}
                    <div className="p-4 rounded-2xl bg-[#05050A] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${currentMailbox.spfStatus ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span className="text-xs font-bold text-white">SPF Kaydı (TXT)</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentMailbox.spfStatus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {currentMailbox.spfStatus ? 'DOĞRULANDI' : 'EKSİK VEYA HATALI'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">Ad: <code>@</code> (veya <code>{domain}</code>) | Tür: <code>TXT</code></p>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs text-cyan-300">
                        <span className="truncate">
                          {currentMailbox.provider === 'GOOGLE' ? 'v=spf1 include:_spf.google.com ~all' :
                           currentMailbox.provider === 'MICROSOFT' ? 'v=spf1 include:spf.protection.outlook.com ~all' :
                           'v=spf1 include:_spf-eu.ionos.com ~all'}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(
                            currentMailbox.provider === 'GOOGLE' ? 'v=spf1 include:_spf.google.com ~all' :
                            currentMailbox.provider === 'MICROSOFT' ? 'v=spf1 include:spf.protection.outlook.com ~all' :
                            'v=spf1 include:_spf-eu.ionos.com ~all',
                            'spf'
                          )}
                          className="text-[#94A3B8] hover:text-white ml-2 p-1 rounded"
                          title="Kopyala"
                        >
                          {copiedKey === 'spf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* DKIM Record Card */}
                    <div className="p-4 rounded-2xl bg-[#05050A] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${currentMailbox.dkimStatus ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span className="text-xs font-bold text-white">DKIM İmzalama Kaydı (CNAME / TXT)</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentMailbox.dkimStatus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {currentMailbox.dkimStatus ? 'DOĞRULANDI' : 'EKSİK VEYA HATALI'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">Google Workspace, Microsoft 365 veya Ionos panelinizden oluşturulan DKIM anahtarıdır.</p>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs text-cyan-300">
                        <span className="truncate">
                          {currentMailbox.provider === 'GOOGLE' ? 'google._domainkey (TXT)' :
                           currentMailbox.provider === 'MICROSOFT' ? 'selector1._domainkey (CNAME)' :
                           's1-ionos._domainkey | s1.dkim.ionos.com'}
                        </span>
                        <button 
                          onClick={() => copyToClipboard('s1-ionos._domainkey', 'dkim')}
                          className="text-[#94A3B8] hover:text-white ml-2 p-1 rounded"
                          title="Kopyala"
                        >
                          {copiedKey === 'dkim' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* DMARC Record Card */}
                    <div className="p-4 rounded-2xl bg-[#05050A] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${currentMailbox.dmarcStatus ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          <span className="text-xs font-bold text-white">DMARC Güvenlik Politikası (TXT)</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentMailbox.dmarcStatus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {currentMailbox.dmarcStatus ? 'DOĞRULANDI' : 'TAVSİYE EDİLİR'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">Ad: <code>_dmarc</code> | Tür: <code>TXT</code></p>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs text-cyan-300">
                        <span className="truncate">{`v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`}</span>
                        <button 
                          onClick={() => copyToClipboard(`v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`, 'dmarc')}
                          className="text-[#94A3B8] hover:text-white ml-2 p-1 rounded"
                          title="Kopyala"
                        >
                          {copiedKey === 'dmarc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 bg-black/20">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWarmupStatus}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                safeStatus === 'WARMUP'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
              }`}
            >
              {safeStatus === 'WARMUP' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {safeStatus === 'WARMUP' ? 'Isınmayı Duraklat' : 'Isınmayı Başlat'}
            </button>

            <button
              onClick={() => {
                onClose();
                onEditSettings(currentMailbox);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5 text-orange-400" />
              Ayarları & Şifreyi Düzenle
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
