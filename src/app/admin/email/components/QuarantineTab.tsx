"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertOctagon, AlertTriangle, 
  RefreshCw, CheckCircle2, Search, Trash2, Shield
} from 'lucide-react';

interface QuarantinedLead {
  id: string;
  email: string;
  name: string;
  company: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  rawNotes: string;
}

export default function QuarantineTab() {
  const [leads, setLeads] = useState<QuarantinedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuarantine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads/quarantine');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching quarantine list', error);
      alert('Karantina listesi alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuarantine();
  }, [fetchQuarantine]);

  const whitelistLead = async (leadId: string) => {
    if (!window.confirm("Bu e-postayı güvenli listeye almak istediğinize emin misiniz?")) return;
    
    setActionLoading(leadId);
    try {
      const res = await fetch('/api/leads/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, action: 'whitelist' })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'E-posta güvenli listeye alındı.');
        setLeads(leads.filter(l => l.id !== leadId));
      } else {
        alert(data.error || 'İşlem başarısız.');
      }
    } catch (error) {
      alert('Bağlantı hatası.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityColors = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertOctagon className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
              Doğrulama & Karantina Merkezi
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Sistem tarafından tespit edilen geçersiz e-postalar, sahte domainler ve hard-bounce adresler burada karantinaya alınır.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input 
                type="text" 
                placeholder="E-posta veya isim ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#05050A] border border-white/10 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 min-w-[250px] transition-colors"
              />
            </div>
            <button
              onClick={fetchQuarantine}
              className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[#94A3B8] hover:text-white transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0A0A0F] border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent" />
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-rose-400 mb-1 uppercase tracking-wider">Kritik Riskli</p>
                <h4 className="text-2xl font-black text-white">{leads.filter(l => l.severity === 'critical').length}</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertOctagon className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </div>
          <div className="bg-[#0A0A0F] border border-orange-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-orange-400 mb-1 uppercase tracking-wider">Yüksek Riskli</p>
                <h4 className="text-2xl font-black text-white">{leads.filter(l => l.severity === 'high').length}</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Toplam Karantina</p>
                <h4 className="text-2xl font-black text-white">{leads.length}</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldAlert className="w-6 h-6 text-[#94A3B8]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-4" />
            <p className="text-[#64748B] text-sm">Karantina verileri yükleniyor...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Karantina Temiz</h3>
            <p className="text-[#64748B] max-w-sm">
              Şu anda sistem tarafından engellenmiş veya karantinaya alınmış bir e-posta adresi bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Kişi / Kurum</th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">E-Posta Adresi</th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Engellenme Nedeni</th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredLeads.map((lead, idx) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-white/[0.02] transition-colors group animate-in slide-in-from-bottom-2 fade-in"
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{lead.name || '-'}</div>
                      {lead.company && <div className="text-xs text-[#64748B] mt-0.5">{lead.company}</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[#E2E8F0] font-mono">{lead.email}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getSeverityColors(lead.severity)}`}>
                        {getSeverityIcon(lead.severity)}
                        {lead.reason}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => whitelistLead(lead.id)}
                        disabled={actionLoading === lead.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        title="Güvenli İşaretle (Whitelist)"
                      >
                        {actionLoading === lead.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        Kurtar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
