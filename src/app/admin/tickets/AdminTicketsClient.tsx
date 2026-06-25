'use client';

import { useState, useTransition, useEffect } from 'react';
import { getTickets, updateTicketStatus, addTicketMessage } from '@/app/actions/ticket';
import { useRouter } from 'next/navigation';
import {
  LifeBuoy, Search, MessageSquare, Clock, CheckCircle2, XCircle,
  AlertTriangle, User, Send, Lock, ChevronRight, X, Shield,
  Circle, Loader2, ArrowUpRight, StickyNote, BarChart3
} from 'lucide-react';

type TicketMessage = {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string | Date;
  sender: { id: string; name: string; role: string } | null;
};

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  resolvedAt?: string | Date | null;
  client: { id: string; name: string; email: string } | null;
  messages: TicketMessage[];
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  URGENT: { label: 'ACİL', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  HIGH:   { label: 'YÜKSEK', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  MEDIUM: { label: 'ORTA', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10', border: 'border-[#4F8EF7]/20' },
  LOW:    { label: 'DÜŞÜK', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  OPEN:              { label: 'AÇIK', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20', icon: <Circle className="w-3 h-3" /> },
  IN_PROGRESS:       { label: 'İŞLEMDE', color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10', border: 'border-[#4F8EF7]/20', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  WAITING_ON_CLIENT: { label: 'MÜŞTERİ BEKLENİYOR', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  RESOLVED:          { label: 'ÇÖZÜLDÜ', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  CLOSED:            { label: 'KAPALI', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <XCircle className="w-3 h-3" /> },
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success'
        ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-300'
        : 'bg-red-900/90 border-red-500/30 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Admin user ID — in a real app this comes from session
const ADMIN_SENDER_ID = 'admin';

export default function AdminTicketsClient({ initialTickets, tenantId }: { initialTickets: Ticket[]; tenantId: string }) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getTickets(tenantId);
      if (res.success && res.data) {
        setTickets(res.data);
        setSelectedTicket(prev => {
          if (!prev) return null;
          const updated = res.data.find(t => t.id === prev.id);
          return updated || prev;
        });
      }
    }, 5000); // Check for new messages every 5 seconds

    return () => clearInterval(interval);
  }, [tenantId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Stats ---
  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    waitingOnClient: tickets.filter(t => t.status === 'WAITING_ON_CLIENT').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    urgent: tickets.filter(t => t.priority === 'URGENT').length,
  };

  // --- Filtering ---
  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Status Change ---
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingStatus(ticketId);
    const res = await updateTicketStatus(ticketId, newStatus);
    setUpdatingStatus(null);
    if (res.success) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      showToast('Durum güncellendi', 'success');
    } else {
      showToast('Durum güncellenemedi', 'error');
    }
  };

  // --- Send Reply ---
  const handleSendReply = () => {
    if (!replyContent.trim() || !selectedTicket) return;

    // We need a real sender ID — using a fallback for now
    startTransition(async () => {
      // Find any user to use as sender (admin) - ideally from session
      const res = await addTicketMessage({
        ticketId: selectedTicket.id,
        senderId: selectedTicket.client?.id || tenantId, // fallback
        content: replyContent.trim(),
        isInternal,
      });

      if (res.success && res.data) {
        const newMsg: TicketMessage = {
          id: res.data.id,
          content: replyContent.trim(),
          isInternal,
          createdAt: new Date().toISOString(),
          sender: { id: 'admin', name: 'Admin', role: 'AGENCY_OWNER' },
        };
        setTickets(prev => prev.map(t =>
          t.id === selectedTicket.id
            ? { ...t, messages: [...t.messages, newMsg], updatedAt: new Date().toISOString() }
            : t
        ));
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null);
        setReplyContent('');
        setIsInternal(false);
        showToast(isInternal ? 'Dahili not eklendi' : 'Yanıt gönderildi', 'success');
      } else {
        showToast('Yanıt gönderilemedi', 'error');
      }
    });
  };

  const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d: string | Date) => new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-[#8B5CF6]" />
            Destek Talepleri
          </h1>
          <p className="text-slate-400 mt-1.5">Müşterilerden gelen tüm destek taleplerini buradan yönetin.</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Açık', value: stats.open, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20' },
          { label: 'İşlemde', value: stats.inProgress, color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10', border: 'border-[#4F8EF7]/20' },
          { label: 'Müşteri Bekl.', value: stats.waitingOnClient, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Çözüldü', value: stats.resolved, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Acil', value: stats.urgent, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold font-['Outfit'] ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content: List + Detail Panel */}
      <div className="flex gap-4 min-h-[600px]">
        {/* LEFT: Ticket List */}
        <div className={`flex flex-col gap-3 transition-all duration-300 ${selectedTicket ? 'w-full lg:w-[42%]' : 'w-full'}`}>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 bg-[#0A0A0F] border border-white/[0.05] p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Konu veya müşteri ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#131B2A] border border-white/[0.05] rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#8B5CF6] transition-colors"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="OPEN">Açık</option>
              <option value="IN_PROGRESS">İşlemde</option>
              <option value="WAITING_ON_CLIENT">Müşteri Bekliyor</option>
              <option value="RESOLVED">Çözüldü</option>
              <option value="CLOSED">Kapalı</option>
            </select>
          </div>

          {/* Ticket Cards */}
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden flex-1">
            {filteredTickets.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Kayıt Bulunamadı</h3>
                <p className="text-slate-400 text-center text-sm">Arama kriterlerinize uygun destek talebi yok.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filteredTickets.map(ticket => {
                  const pCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
                  const sCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                  const isSelected = selectedTicket?.id === ticket.id;
                  const unreadCount = ticket.messages.length;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 cursor-pointer transition-all hover:bg-white/[0.03] ${isSelected ? 'bg-[#8B5CF6]/5 border-l-2 border-l-[#8B5CF6]' : 'border-l-2 border-l-transparent'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sCfg.bg} border ${sCfg.border}`}>
                            <MessageSquare className={`w-4 h-4 ${sCfg.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isSelected ? 'text-[#8B5CF6]' : 'text-white'}`}>{ticket.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="text-xs text-slate-400 truncate">{ticket.client?.name || 'Bilinmiyor'}</span>
                              <span className="text-slate-700 text-xs">•</span>
                              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="text-xs text-slate-500">{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>
                            {sCfg.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pCfg.bg} ${pCfg.color} ${pCfg.border}`}>
                            {pCfg.label}
                          </span>
                        </div>
                      </div>
                      {ticket.messages.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2 ml-12 line-clamp-1">
                          💬 {ticket.messages[ticket.messages.length - 1].content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Detail Panel */}
        {selectedTicket && (
          <div className="hidden lg:flex flex-col flex-1 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
            {/* Panel Header */}
            <div className="flex items-start justify-between p-5 border-b border-white/[0.05] bg-[#0D0D14]">
              <div className="min-w-0">
                <h2 className="font-bold text-white text-base leading-snug">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${STATUS_CONFIG[selectedTicket.status]?.bg} ${STATUS_CONFIG[selectedTicket.status]?.color} ${STATUS_CONFIG[selectedTicket.status]?.border}`}>
                    {STATUS_CONFIG[selectedTicket.status]?.icon}
                    {STATUS_CONFIG[selectedTicket.status]?.label}
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-md border ${PRIORITY_CONFIG[selectedTicket.priority]?.bg} ${PRIORITY_CONFIG[selectedTicket.priority]?.color} ${PRIORITY_CONFIG[selectedTicket.priority]?.border}`}>
                    {PRIORITY_CONFIG[selectedTicket.priority]?.label}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> {selectedTicket.client?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Changer */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] bg-[#0D0D14]">
              <span className="text-xs text-slate-500 font-medium shrink-0">Durum Değiştir:</span>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    disabled={updatingStatus === selectedTicket.id}
                    onClick={() => handleStatusChange(selectedTicket.id, key)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                      selectedTicket.status === key
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-[0_0_8px_rgba(139,92,246,0.2)]`
                        : 'bg-white/[0.02] text-slate-500 border-white/[0.05] hover:bg-white/[0.05] hover:text-slate-300'
                    }`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Açıklama</p>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedTicket.description}</p>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(selectedTicket.createdAt)} {formatTime(selectedTicket.createdAt)}
              </p>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Konuşma ({selectedTicket.messages.length} mesaj)
              </p>

              {selectedTicket.messages.length === 0 && (
                <div className="py-8 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Henüz mesaj yok. İlk yanıtı siz gönderin.</p>
                </div>
              )}

              {selectedTicket.messages.map(msg => {
                const isAdmin = msg.sender?.role !== 'CLIENT_MEMBER' && msg.sender?.role !== 'CLIENT_OWNER';
                const isInternalMsg = msg.isInternal;
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isInternalMsg
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200'
                        : isAdmin
                        ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 text-white'
                        : 'bg-white/[0.05] border border-white/[0.08] text-slate-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold ${isInternalMsg ? 'text-amber-400' : isAdmin ? 'text-[#8B5CF6]' : 'text-slate-400'}`}>
                          {isInternalMsg && '🔒 '}
                          {msg.sender?.name || (isAdmin ? 'Admin' : 'Müşteri')}
                        </span>
                        {isInternalMsg && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">DAHİLİ NOT</span>}
                        <span className="text-[10px] text-slate-600 ml-auto">{formatTime(msg.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-white/[0.05] bg-[#0D0D14] space-y-3">
              {/* Internal Note Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsInternal(!isInternal)}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    isInternal
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300'
                  }`}
                >
                  {isInternal ? <Lock className="w-3.5 h-3.5" /> : <StickyNote className="w-3.5 h-3.5" />}
                  {isInternal ? 'Dahili Not' : 'Müşteri Yanıtı'}
                </button>
                <span className="text-xs text-slate-600">
                  {isInternal ? 'Sadece adminler görür' : 'Müşteriye gönderilecek'}
                </span>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSendReply(); }}
                  placeholder={isInternal ? 'Dahili not ekle... (Müşteri göremez)' : 'Müşteriye yanıt yaz... (Ctrl+Enter)'}
                  rows={3}
                  className={`flex-1 bg-[#131B2A] border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none resize-none transition-colors ${
                    isInternal
                      ? 'border-amber-500/30 focus:border-amber-500'
                      : 'border-white/[0.08] focus:border-[#8B5CF6]'
                  }`}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isPending}
                  className={`w-12 h-auto rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                    isInternal
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400'
                      : 'bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:opacity-90'
                  }`}
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
