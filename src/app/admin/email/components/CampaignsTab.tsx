"use client";

import React from 'react';
import { Play, Pause, CheckCircle2, BarChart3, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CampaignsTabProps {
  dbCampaigns: any[];
  setSelectedCampaignForRules: (camp: any) => void;
  setIsAutoResponderModalOpen: (open: boolean) => void;
}

const mockChartData = [
  { name: 'Pzt', sent: 400, opened: 240, replied: 24 },
  { name: 'Sal', sent: 300, opened: 139, replied: 22 },
  { name: 'Çar', sent: 200, opened: 980, replied: 229 },
  { name: 'Per', sent: 278, opened: 390, replied: 20 },
  { name: 'Cum', sent: 189, opened: 480, replied: 21 },
  { name: 'Cmt', sent: 239, opened: 380, replied: 25 },
  { name: 'Paz', sent: 349, opened: 430, replied: 21 },
];

export default function CampaignsTab({ dbCampaigns, setSelectedCampaignForRules, setIsAutoResponderModalOpen }: CampaignsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Haftalık Performans (Genel)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#05050A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="sent" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="replied" stroke="#8b5cf6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02] font-semibold text-xs text-[#64748B] uppercase tracking-wider">
              <th className="py-5 px-6">Kampanya Adı</th>
              <th className="py-5 px-6">Durum</th>
              <th className="py-5 px-6">Gönderilen</th>
              <th className="py-5 px-6">Açılma</th>
              <th className="py-5 px-6">Yanıt</th>
              <th className="py-5 px-6 text-right">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-sm">
            {dbCampaigns.map((camp) => {
              const safeStatus = camp.status?.toUpperCase() || 'ACTIVE';
              const sent = camp.sentCount || camp.sent || 0;
              const opened = camp.openCount || camp.opened || 0;
              const replied = camp.replyCount || camp.replied || 0;
              const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
              const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

              return (
              <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-5 px-6">
                  <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">{camp.name}</div>
                  <div className="text-xs text-[#64748B] mt-1">Adım {camp.step || 1} yayında</div>
                </td>
                <td className="py-5 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    safeStatus === 'ACTIVE' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                    safeStatus === 'PAUSED' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]' :
                    'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20'
                  }`}>
                    {safeStatus === 'ACTIVE' ? <Play className="w-3 h-3" /> : safeStatus === 'PAUSED' ? <Pause className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {safeStatus}
                  </span>
                </td>
                <td className="py-5 px-6 font-mono text-[#E2E8F0]">{sent.toLocaleString()}</td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{openRate}%</span>
                    <span className="text-xs text-[#64748B]">({opened.toLocaleString()})</span>
                  </div>
                  <div className="w-24 bg-[#05050A] rounded-full h-1.5 mt-1.5 border border-white/[0.05]">
                    <div className="bg-[#4F8EF7] h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${openRate}%` }}></div>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{replyRate}%</span>
                    <span className="text-xs text-[#64748B]">({replied.toLocaleString()})</span>
                  </div>
                  <div className="w-24 bg-[#05050A] rounded-full h-1.5 mt-1.5 border border-white/[0.05]">
                    <div className="bg-[#8B5CF6] h-1.5 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]" style={{ width: `${replyRate}%` }}></div>
                  </div>
                </td>
                <td className="py-5 px-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setSelectedCampaignForRules(camp); setIsAutoResponderModalOpen(true); }}
                      className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors border border-transparent hover:border-white/10" title="Otomatik Yanıt Kuralları"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors border border-transparent hover:border-white/10" title="İstatistik Detayları">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors border border-transparent hover:border-white/10">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
