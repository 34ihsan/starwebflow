"use client";

import React, { useMemo, useState } from 'react';
import { X, Mail, CheckCircle2, AlertTriangle, ShieldAlert, Loader2, Search, Gauge, Zap, Flame } from 'lucide-react';
import { setCampaignMailboxes } from '@/app/actions/email';
import { getMailboxReadiness } from '@/lib/campaign-readiness';

interface Props {
  campaign: any;
  dbMailboxes: any[];
  onClose: () => void;
  /** Kayıttan sonra kampanya + kutu ilişkilerini yerel state'e yansıtır */
  onSaved: (campaignId: string, mailboxIds: string[]) => void;
}

const LEVEL_STYLE = {
  ready: { label: 'Hazır', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle2 },
  caution: { label: 'Dikkat', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', Icon: AlertTriangle },
  blocked: { label: 'Uygun Değil', cls: 'text-red-400 bg-red-500/10 border-red-500/20', Icon: ShieldAlert },
} as const;

export default function CampaignMailboxModal({ campaign, dbMailboxes, onClose, onSaved }: Props) {
  const initial = useMemo(() => new Set<string>((campaign.mailboxes || []).map((m: any) => m.id)), [campaign]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'selected'>('all');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      dbMailboxes.map(mb => ({ mb, r: getMailboxReadiness(mb) })).sort((a, b) => {
        const rank = { ready: 0, caution: 1, blocked: 2 } as const;
        return rank[a.r.level] - rank[b.r.level] || (b.mb.reputation || 0) - (a.mb.reputation || 0);
      }),
    [dbMailboxes]
  );

  const visible = rows.filter(({ mb, r }) => {
    if (query && !mb.email.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'ready') return r.sendable;
    if (filter === 'selected') return selected.has(mb.id);
    return true;
  });

  const selectedRows = rows.filter(({ mb }) => selected.has(mb.id));
  const capacity = selectedRows.reduce((s, { r }) => s + r.dailyCapacity, 0);
  const sendableCount = selectedRows.filter(({ r }) => r.sendable).length;
  const unsendableSelected = selectedRows.length - sendableCount;
  const dirty = selected.size !== initial.size || Array.from(selected).some(id => !initial.has(id));

  const toggle = (id: string, assignable: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (assignable) next.add(id);
      return next;
    });
  };

  const addAllReady = () =>
    setSelected(prev => {
      const next = new Set(prev);
      rows.filter(({ r }) => r.level === 'ready').forEach(({ mb }) => next.add(mb.id));
      return next;
    });

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const res: any = await setCampaignMailboxes(campaign.id, Array.from(selected));
    setSaving(false);
    if (res.success) {
      onSaved(campaign.id, res.data.mailboxIds);
      if (res.data.skipped?.length) {
        setMessage(`Atlanan (uygun değil): ${res.data.skipped.join(', ')}`);
      } else {
        onClose();
      }
    } else {
      setMessage(res.error || 'Kaydedilemedi');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#4F8EF7]" /> Mail Havuzu
            </h3>
            <p className="text-sm text-[#94A3B8] mt-1">
              <span className="text-white font-semibold">{campaign.name}</span> kampanyasının göndereceği kutuları seçin.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#64748B] hover:text-white rounded-lg hover:bg-white/5" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 px-6 pt-5">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Seçili Kutu</div>
            <div className="text-xl font-bold text-white">{selected.size}</div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#64748B] flex items-center gap-1"><Gauge className="w-3 h-3" /> Günlük Kapasite</div>
            <div className="text-xl font-bold text-emerald-400">{capacity.toLocaleString()}<span className="text-xs text-[#64748B] font-normal"> mail/gün</span></div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Gönderime Hazır</div>
            <div className="text-xl font-bold text-white">{sendableCount}<span className="text-xs text-[#64748B] font-normal"> / {selected.size}</span></div>
          </div>
        </div>

        {selected.size === 0 && (
          <div className="mx-6 mt-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            Havuz boş: bu kampanya gönderim yapamaz. En az 1 hazır kutu ekleyin.
          </div>
        )}
        {unsendableSelected > 0 && (
          <div className="mx-6 mt-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            {unsendableSelected} seçili kutu şu an gönderim motoru tarafından seçilmez (WARNING durumu vb.).
          </div>
        )}

        {/* Toolbar */}
        <div className="px-6 pt-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Mail ara…"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#4F8EF7]/50"
            />
          </div>
          {(['all', 'ready', 'selected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${filter === f ? 'bg-[#4F8EF7]/20 border-[#4F8EF7]/40 text-[#4F8EF7]' : 'bg-white/[0.03] border-white/10 text-[#94A3B8] hover:text-white'}`}
            >
              {f === 'all' ? 'Tümü' : f === 'ready' ? 'Gönderime Hazır' : 'Seçililer'}
            </button>
          ))}
          <button onClick={addAllReady} className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Hazırları Ekle
          </button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400">
            Tümünü Çıkar
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 min-h-[200px]">
          {visible.length === 0 && <div className="text-center text-sm text-[#64748B] py-8">Eşleşen mail kutusu yok.</div>}
          {visible.map(({ mb, r }) => {
            const isSel = selected.has(mb.id);
            const st = LEVEL_STYLE[r.level];
            const disabled = !isSel && !r.assignable;
            const otherCampaigns = (mb.campaigns || []).filter((c: any) => c.id !== campaign.id);
            return (
              <button
                key={mb.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(mb.id, r.assignable)}
                className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 transition-colors ${
                  isSel ? 'bg-[#4F8EF7]/10 border-[#4F8EF7]/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSel ? 'bg-[#4F8EF7] border-[#4F8EF7]' : 'border-white/20'}`}>
                  {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">{mb.email}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.cls}`}>
                      <st.Icon className="w-3 h-3" /> {st.label}
                    </span>
                    {mb.status === 'WARMUP' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-orange-400"><Flame className="w-3 h-3" />WARMUP</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {mb.warmupDay || 1}. gün · itibar {mb.reputation ?? 0}/100 · {r.dailyCapacity || 0}/gün
                    {otherCampaigns.length > 0 && <> · diğer kampanyalar: {otherCampaigns.map((c: any) => c.name).join(', ')}</>}
                  </div>
                  {(r.blockers.length > 0 || r.warnings.length > 0) && (
                    <div className="text-[11px] mt-1 flex flex-wrap gap-x-3">
                      {r.blockers.map((b, i) => <span key={'b' + i} className="text-red-400">⛔ {b}</span>)}
                      {r.warnings.map((w, i) => <span key={'w' + i} className="text-amber-400">⚠ {w}</span>)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {message && <div className="mx-6 mb-2 text-xs text-amber-400">{message}</div>}

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white disabled:opacity-50">
            Vazgeç
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex-1 py-2.5 rounded-xl bg-[#4F8EF7]/20 hover:bg-[#4F8EF7]/30 border border-[#4F8EF7]/40 text-sm font-bold text-[#4F8EF7] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor…</> : 'Havuzu Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
