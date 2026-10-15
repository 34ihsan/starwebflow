"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, SlidersHorizontal, Check, Plus, Trash2, Clock, 
  Sparkles, ShieldAlert, Calendar, MessageSquare, 
  UserCheck, AlertCircle, Loader2, Zap, ArrowRight, Settings2
} from 'lucide-react';
import { AutoResponderRule, DEFAULT_CAMPAIGN_RULES, ActionType, RuleCategory } from '@/lib/campaign-rules';
import { getCampaignRules, saveCampaignRules } from '@/app/actions/email';

interface Props {
  campaign: any;
  templates?: any[];
  onClose: () => void;
}

const CATEGORY_META: Record<RuleCategory, { label: string; color: string; bg: string; icon: any }> = {
  meeting: { label: 'Toplantı & Randevu', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Calendar },
  unsubscribe: { label: 'Karantina & Anti-Spam', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: ShieldAlert },
  objection: { label: 'Fiyat & ROI İtirazı', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Sparkles },
  referral: { label: 'Yetkili Yönlendirme', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: UserCheck },
  ooo: { label: 'Ofis Dışı (OOO)', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Clock },
  vip: { label: 'VIP Canlı Radar', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Zap }
};

export default function AutoResponderModal({ campaign, templates = [], onClose }: Props) {
  const [rules, setRules] = useState<AutoResponderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | RuleCategory>('ALL');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Kuralları sunucudan çek
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res: any = await getCampaignRules(campaign.id);
      if (mounted) {
        setRules(res.success && Array.isArray(res.data) ? res.data : DEFAULT_CAMPAIGN_RULES);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [campaign.id]);

  // Kural aktif/pasif değiştir
  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  // Kural sil
  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // Hazır şablondan kural ekle
  const addDefaultRule = (defaultRule: AutoResponderRule) => {
    const exists = rules.some(r => r.id === defaultRule.id);
    if (exists) {
      // Zaten varsa aktif yap
      setRules(prev => prev.map(r => r.id === defaultRule.id ? { ...r, isActive: true } : r));
    } else {
      setRules(prev => [...prev, { ...defaultRule, id: `rule-${Date.now()}` }]);
    }
    setShowAddMenu(false);
  };

  // Anahtar kelime ekle
  const addKeywordToRule = (ruleId: string) => {
    if (!keywordInput.trim()) return;
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const kws = new Set(r.trigger.keywords);
      kws.add(keywordInput.trim().toLowerCase());
      return {
        ...r,
        trigger: { ...r.trigger, keywords: Array.from(kws) }
      };
    }));
    setKeywordInput('');
  };

  // Anahtar kelime çıkar
  const removeKeywordFromRule = (ruleId: string, kwToRemove: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      return {
        ...r,
        trigger: { ...r.trigger, keywords: r.trigger.keywords.filter(k => k !== kwToRemove) }
      };
    }));
  };

  // Gecikme süresi değiştir
  const setRuleDelay = (ruleId: string, minutes: number) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      return {
        ...r,
        action: { ...r.action, delayMinutes: minutes }
      };
    }));
  };

  // Değişiklikleri sunucuya kaydet
  const handleSave = async () => {
    setSaving(true);
    const res: any = await saveCampaignRules(campaign.id, rules);
    setSaving(false);
    if (res.success) {
      setSaveToast('Kurallar başarıyla kaydedildi!');
      setTimeout(() => {
        setSaveToast(null);
        onClose();
      }, 900);
    } else {
      alert(res.error || 'Kaydedilemedi');
    }
  };

  const filteredRules = rules.filter(r => activeFilter === 'ALL' || r.category === activeFilter);
  const activeCount = rules.filter(r => r.isActive).length;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-r from-orange-500/5 via-transparent to-transparent">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <SlidersHorizontal className="w-5 h-5 text-orange-400" />
              Otomatik Yanıt (Auto-Responder) Kuralları
            </h3>
            <p className="text-sm text-[#94A3B8] mt-1">
              <strong className="text-white">{campaign.name}</strong> kampanyasına gelen yanıtları AI ile otonom yönetin.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#64748B] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar & Category Filter */}
        <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B]">Durum:</span>
            <span className="text-emerald-400 font-semibold">{activeCount} Aktif</span>
            <span className="text-[#64748B]">/</span>
            <span className="text-[#94A3B8]">{rules.length} Toplam Kural</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === 'ALL' ? 'bg-white/10 text-white' : 'text-[#64748B] hover:text-white'
              }`}
            >
              Tümü
            </button>
            {(Object.keys(CATEGORY_META) as RuleCategory[]).map(cat => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    activeFilter === cat ? 'bg-white/10 text-white' : 'text-[#64748B] hover:text-white'
                  }`}
                >
                  <meta.icon className="w-3 h-3" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rules Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#64748B]">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-orange-400" />
              <p className="text-sm">Kampanya kuralları yükleniyor...</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="py-12 text-center text-[#64748B]">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Bu filtreye uygun kural bulunamadı.</p>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const meta = CATEGORY_META[rule.category] || CATEGORY_META.meeting;
              const isEditing = editingRuleId === rule.id;

              return (
                <div 
                  key={rule.id} 
                  className={`border rounded-2xl p-5 transition-all relative ${
                    rule.isActive 
                      ? 'bg-[#05050A] border-white/10 shadow-lg' 
                      : 'bg-white/[0.01] border-white/5 opacity-60'
                  }`}
                >
                  {/* Top Bar: Title, Category Badge, Toggle & Actions */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${meta.bg} ${meta.color}`}>
                          <meta.icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                        <h4 className="text-white font-bold text-sm">{rule.name}</h4>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{rule.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          rule.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-white/5 text-[#64748B] border border-white/10 hover:text-white'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-[#64748B]'}`} />
                        {rule.isActive ? 'AKTİF' : 'PASİF'}
                      </button>

                      <button
                        onClick={() => setEditingRuleId(isEditing ? null : rule.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isEditing ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-white/5 text-[#64748B] hover:text-white hover:bg-white/5'
                        }`}
                        title="Kuralı Düzenle"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-500/30 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Kuralı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Conditions & Actions Matrix */}
                  <div className="space-y-2 text-xs">
                    {/* EĞER */}
                    <div className="flex items-start gap-3 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <span className="bg-white/5 px-2.5 py-1 rounded text-[#94A3B8] font-bold text-[10px] tracking-wider shrink-0">EĞER</span>
                      <div className="flex-1">
                        <span className="text-[#94A3B8] block mb-1">Gelen yanıt şu anahtar kelimeleri içeriyorsa:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {rule.trigger.keywords.map((kw, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-black/60 border border-white/10 px-2 py-0.5 rounded-md text-white font-mono text-[11px]">
                              "{kw}"
                              {isEditing && (
                                <button 
                                  onClick={() => removeKeywordFromRule(rule.id, kw)}
                                  className="text-[#64748B] hover:text-red-400 ml-0.5"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* VE */}
                    <div className="flex items-center gap-3 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <span className="bg-white/5 px-2.5 py-1 rounded text-[#94A3B8] font-bold text-[10px] tracking-wider shrink-0">VE</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#94A3B8]">Duygu Analizi (AI):</span>
                        <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white font-semibold text-[11px]">
                          {rule.trigger.sentiment === 'POSITIVE' && '🟢 Pozitif / İlgili'}
                          {rule.trigger.sentiment === 'NEGATIVE' && '🔴 Negatif / Reddeden'}
                          {rule.trigger.sentiment === 'NEUTRAL' && '⚪ Nötr / Bilgi Arayan'}
                          {rule.trigger.sentiment === 'ANY' && '🟡 Herhangi Bir Duygu'}
                        </span>
                      </div>
                    </div>

                    {/* YAP */}
                    <div className="flex items-start gap-3 bg-emerald-500/[0.04] p-2.5 rounded-xl border border-emerald-500/20">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-bold text-[10px] tracking-wider shrink-0">YAP</span>
                      <div className="flex-1 text-white">
                        <span className="font-semibold text-emerald-300">
                          {rule.action.type === 'SEND_TEMPLATE' && `"${rule.action.templateName || 'Özel Şablon'}" yanıtını gönder.`}
                          {rule.action.type === 'UNSUBSCRIBE' && 'Lead durumunu "Unsubscribed" yap, kampanyayı durdur ve karantinaya al.'}
                          {rule.action.type === 'SEND_WHATSAPP' && 'Satış ekibinin telefonuna anında VIP WhatsApp uyarısı at.'}
                          {rule.action.type === 'NOTIFY_TEAM' && 'Yeni yetkili yönlendirmesini CRM ve dahili bildirim olarak kaydet.'}
                          {rule.action.type === 'RESCHEDULE' && 'Takip zincirini 5 gün sonraya ertele (Ofis Dışı Protokolü).'}
                        </span>
                        <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#94A3B8]" />
                            {rule.action.delayMinutes > 0 ? `${rule.action.delayMinutes} dakika gecikmeyle (doğal insan görünümü)` : 'Anında'}
                          </span>
                          {rule.action.leadScoreChange && (
                            <span className={rule.action.leadScoreChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {rule.action.leadScoreChange > 0 ? `+${rule.action.leadScoreChange}` : rule.action.leadScoreChange} CRM Puanı
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Panel */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3 bg-white/[0.02] p-4 rounded-xl">
                      <div className="flex items-center gap-2">
                        <input
                          value={keywordInput}
                          onChange={e => setKeywordInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addKeywordToRule(rule.id)}
                          placeholder="Yeni anahtar kelime yazıp Enter'a basın..."
                          className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#64748B] outline-none focus:border-orange-400"
                        />
                        <button
                          onClick={() => addKeywordToRule(rule.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                        >
                          Kelime Ekle
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#94A3B8]">Gecikme Süresi:</span>
                        {[0, 5, 15, 30, 60].map(mins => (
                          <button
                            key={mins}
                            onClick={() => setRuleDelay(rule.id, mins)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                              rule.action.delayMinutes === mins
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                                : 'bg-black/40 text-[#64748B] border-white/10 hover:text-white'
                            }`}
                          >
                            {mins === 0 ? 'Anında' : `${mins} dk`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Hazır Kural Kütüphanesinden Ekle */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full py-3.5 border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-2xl text-[#94A3B8] hover:text-orange-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-white/[0.01] hover:bg-orange-500/[0.03]"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              Hazır Kural Kütüphanesinden Kural Ekle ({DEFAULT_CAMPAIGN_RULES.length} Kural Mevcut)
            </button>

            {showAddMenu && (
              <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#0E0E17] border border-white/10 rounded-2xl shadow-2xl p-3 z-30 space-y-1.5 max-h-64 overflow-y-auto">
                <div className="text-[11px] font-bold text-[#64748B] uppercase px-2 py-1">
                  Kütüphanedeki Elite Kurallar (1-Tıkla Aktif Et)
                </div>
                {DEFAULT_CAMPAIGN_RULES.map(def => {
                  const meta = CATEGORY_META[def.category];
                  return (
                    <button
                      key={def.id}
                      onClick={() => addDefaultRule(def)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="text-white text-xs font-semibold truncate group-hover:text-orange-300">
                            {def.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">{def.description}</p>
                      </div>
                      <Plus className="w-4 h-4 text-[#64748B] group-hover:text-white shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0A0A0F] flex items-center justify-between gap-4">
          <div className="text-xs text-[#64748B]">
            {saveToast ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {saveToast}
              </span>
            ) : (
              <span>Kurallar gelen e-postalarda otomatik çalışır.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-white/5 text-white font-medium text-xs hover:bg-white/10 border border-white/10 transition-colors"
            >
              Vazgeç
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
