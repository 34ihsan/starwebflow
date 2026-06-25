'use client';

import { useState, useTransition } from 'react';
import {
  FileText, Clock, CheckCircle2, XCircle, Eye,
  MessageSquare, Check, X, Plus, Building2, Mail,
  Phone, Globe, AlertTriangle, Loader2, TrendingUp,
  BadgeCheck, Star
} from 'lucide-react';
import { updateProposalStatus, updateProposalNotes } from '@/app/actions/proposal';

type Proposal = {
  id: string;
  proposalNumber: string;
  companyName: string;
  authorizedPerson: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  serviceType?: string | null;
  message?: string | null;
  oneTimeTotal: number | string;
  monthlyTotal: number | string;
  grandTotal: number | string;
  currency: string;
  selectedSla: string;
  status: string;
  adminNotes?: string | null;
  reviewedAt?: string | Date | null;
  createdAt: string | Date;
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

const SLA_COLORS: Record<string, string> = {
  Starter: 'text-[#4F8EF7] bg-[#4F8EF7]/10 border-[#4F8EF7]/20',
  Pro: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20',
  Enterprise: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

function getStatusBadge(status: Proposal['status']) {
  switch (status) {
    case 'PENDING':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20"><Clock className="w-3.5 h-3.5" />Beklemede</span>;
    case 'REVIEWED':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20"><Eye className="w-3.5 h-3.5" />İncelendi</span>;
    case 'ACCEPTED':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" />Onaylandı</span>;
    case 'REJECTED':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" />Reddedildi</span>;
  }
}

export default function ProposalsDashboardClient({
  initialProposals,
  tenantId,
}: {
  initialProposals: Proposal[];
  tenantId: string;
}) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredProposals = statusFilter
    ? proposals.filter(p => p.status === statusFilter)
    : proposals;

  // --- Stats ---
  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'PENDING').length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    totalValue: proposals.reduce((acc, p) => acc + Number(p.grandTotal), 0),
  };

  const handleUpdateStatus = (id: string, status: Proposal['status']) => {
    startTransition(async () => {
      const res = await updateProposalStatus(id, status as any);
      if (res.success) {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        if (selectedProposal?.id === id) setSelectedProposal(prev => prev ? { ...prev, status } : null);
        showToast(status === 'ACCEPTED' ? '✅ Teklif onaylandı' : status === 'REJECTED' ? '❌ Teklif reddedildi' : 'Durum güncellendi', 'success');
      } else {
        showToast('İşlem başarısız', 'error');
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedProposal) return;
    startTransition(async () => {
      const res = await updateProposalNotes(selectedProposal.id, noteInput);
      if (res.success) {
        setProposals(prev => prev.map(p => p.id === selectedProposal.id ? { ...p, adminNotes: noteInput } : p));
        setSelectedProposal(prev => prev ? { ...prev, adminNotes: noteInput } : null);
        showToast('Notlar kaydedildi', 'success');
      } else {
        showToast('Notlar kaydedilemedi', 'error');
      }
    });
  };

  const formatCurrency = (val: number | string, currency = 'EUR') =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(Number(val));

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3 font-['Outfit']">
            <span className="bg-gradient-to-r from-white to-[#94A3B8] bg-clip-text text-transparent">
              Teklif Talepleri
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2 text-sm">
            Müşterilerden web üzerinden gelen SLA ve proforma teklif istekleri.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Teklif', value: stats.total, icon: <FileText className="w-4 h-4" />, color: 'text-white' },
          { label: 'Beklemede', value: stats.pending, icon: <Clock className="w-4 h-4" />, color: 'text-amber-400' },
          { label: 'Onaylanan', value: stats.accepted, icon: <BadgeCheck className="w-4 h-4" />, color: 'text-emerald-400' },
          { label: 'Potansiyel Gelir', value: formatCurrency(stats.totalValue), icon: <TrendingUp className="w-4 h-4" />, color: 'text-[#8B5CF6]' },
        ].map(s => (
          <div key={s.label} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-4">
            <div className={`flex items-center gap-2 mb-1 ${s.color} opacity-70`}>{s.icon}<span className="text-xs font-bold uppercase tracking-wider">{s.label}</span></div>
            <p className={`text-2xl font-bold font-['Outfit'] ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 border-b border-white/[0.05] pb-4 flex-wrap">
        {[
          { label: 'Tümü', value: '' },
          { label: 'Beklemede', value: 'PENDING' },
          { label: 'İncelendi', value: 'REVIEWED' },
          { label: 'Onaylandı', value: 'ACCEPTED' },
          { label: 'Reddedildi', value: 'REJECTED' },
        ].map(filter => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === filter.value
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'bg-white/[0.02] text-[#94A3B8] border border-white/[0.05] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            {filter.label}
            {filter.value === 'PENDING' && stats.pending > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-xl">
        {filteredProposals.length === 0 ? (
          <div className="py-24 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-[#64748B] font-medium">Bu kategoride teklif talebi bulunamadı.</p>
            <p className="text-[#4a5568] text-sm mt-1">Teklifler web formunuzdan otomatik olarak buraya düşecek.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02] text-xs text-[#64748B] uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Teklif No</th>
                  <th className="py-4 px-6">Şirket / Yetkili</th>
                  <th className="py-4 px-6">Toplam</th>
                  <th className="py-4 px-6">SLA Seviyesi</th>
                  <th className="py-4 px-6">Durum</th>
                  <th className="py-4 px-6">Tarih</th>
                  <th className="py-4 px-6 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {filteredProposals.map(proposal => (
                  <tr key={proposal.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-[#8B5CF6]">{proposal.proposalNumber}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{proposal.companyName}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{proposal.authorizedPerson} · {proposal.email}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#E2E8F0]">
                      {formatCurrency(proposal.grandTotal, proposal.currency)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${SLA_COLORS[proposal.selectedSla] || SLA_COLORS.Starter}`}>
                        {proposal.selectedSla}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(proposal.status)}</td>
                    <td className="py-4 px-6 text-xs text-[#64748B]">{formatDate(proposal.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedProposal(proposal); setNoteInput(proposal.adminNotes || ''); }}
                          className="p-2 hover:bg-[#4F8EF7]/10 rounded-lg text-[#64748B] hover:text-[#4F8EF7] transition-colors"
                          title="Detay & Notlar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(proposal.id, 'ACCEPTED')}
                          disabled={isPending || proposal.status === 'ACCEPTED'}
                          className="p-2 hover:bg-emerald-500/10 rounded-lg text-[#64748B] hover:text-emerald-400 transition-colors disabled:opacity-30"
                          title="Onayla"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(proposal.id, 'REJECTED')}
                          disabled={isPending || proposal.status === 'REJECTED'}
                          className="p-2 hover:bg-red-400/10 rounded-lg text-[#64748B] hover:text-red-400 transition-colors disabled:opacity-30"
                          title="Reddet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#05050A]/90 backdrop-blur-md" onClick={() => setSelectedProposal(null)} />
          <div className="relative z-10 w-full max-w-xl bg-[#0A0A0F] border border-white/[0.1] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start px-7 pt-7 pb-5 border-b border-white/[0.05]">
              <div>
                <h3 className="text-xl font-bold text-white">Teklif Detayları</h3>
                <p className="font-mono text-sm text-[#8B5CF6] mt-2 px-3 py-1 bg-[#8B5CF6]/10 rounded-lg inline-block border border-[#8B5CF6]/20">
                  {selectedProposal.proposalNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedProposal.status)}
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="text-[#64748B] hover:text-white p-2 rounded-lg hover:bg-white/[0.05] transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-7 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-5 rounded-xl border border-white/[0.05]">
                <div>
                  <span className="text-[#64748B] text-xs block mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" />Şirket</span>
                  <span className="text-white font-semibold text-sm">{selectedProposal.companyName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] text-xs block mb-1">Yetkili</span>
                  <span className="text-white font-semibold text-sm">{selectedProposal.authorizedPerson}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#64748B] text-xs block mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />E-posta</span>
                  <a href={`mailto:${selectedProposal.email}`} className="text-[#4F8EF7] text-sm hover:underline">{selectedProposal.email}</a>
                </div>
                {selectedProposal.phone && (
                  <div>
                    <span className="text-[#64748B] text-xs block mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />Telefon</span>
                    <span className="text-white text-sm">{selectedProposal.phone}</span>
                  </div>
                )}
                {selectedProposal.website && (
                  <div>
                    <span className="text-[#64748B] text-xs block mb-1 flex items-center gap-1"><Globe className="w-3 h-3" />Website</span>
                    <a href={selectedProposal.website} target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] text-sm hover:underline truncate block">{selectedProposal.website}</a>
                  </div>
                )}
                {selectedProposal.message && (
                  <div className="col-span-2 pt-2 border-t border-white/[0.05]">
                    <span className="text-[#64748B] text-xs block mb-1">Talep Mesajı</span>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">{selectedProposal.message}</p>
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#64748B] uppercase text-xs tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Mali Özet
                </h4>
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-hidden">
                  <div className="flex justify-between py-3 px-5 border-b border-white/[0.04] text-sm">
                    <span className="text-[#94A3B8]">Tek Seferlik Kurulum</span>
                    <span className="text-white font-semibold">{formatCurrency(selectedProposal.oneTimeTotal, selectedProposal.currency)}</span>
                  </div>
                  <div className="flex justify-between py-3 px-5 border-b border-white/[0.04] text-sm">
                    <span className="text-[#94A3B8]">Aylık SLA ({selectedProposal.selectedSla})</span>
                    <span className="text-white font-semibold">{formatCurrency(selectedProposal.monthlyTotal, selectedProposal.currency)}/ay</span>
                  </div>
                  <div className="flex justify-between py-4 px-5 font-bold text-[#8B5CF6]">
                    <span>Toplam (12 Ay)</span>
                    <span className="text-lg">{formatCurrency(selectedProposal.grandTotal, selectedProposal.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Status Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedProposal.id, 'ACCEPTED')}
                  disabled={isPending || selectedProposal.status === 'ACCEPTED'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Onayla
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProposal.id, 'REVIEWED')}
                  disabled={isPending || selectedProposal.status === 'REVIEWED'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20 transition-colors font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" /> İncelendi
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProposal.id, 'REJECTED')}
                  disabled={isPending || selectedProposal.status === 'REJECTED'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" /> Reddet
                </button>
              </div>

              {/* Admin Notes */}
              <div className="space-y-3 pt-3 border-t border-white/[0.05]">
                <label className="font-bold text-[#64748B] uppercase text-xs tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Dahili CRM Notları
                </label>
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Bu teklif talebiyle ilgili dahili takip notlarınızı buraya yazın..."
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-[#8B5CF6] rounded-xl p-4 h-28 focus:outline-none resize-none transition-all text-sm text-white placeholder:text-[#64748B]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Notları Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
