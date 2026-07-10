"use client";

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, Eye, MousePointerClick, DollarSign, Activity } from 'lucide-react';

const mockPerformanceData: any[] = [];
const mockPlatformData: any[] = [];
const mockTopPosts: any[] = [];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#05050A]/95 border border-white/[0.1] p-4 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-white font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#94A3B8]">{entry.name}:</span>
            <span className="text-white font-semibold">
              {entry.name === 'ROAS' ? `${entry.value}x` : 
               entry.name === 'Harcama' ? `$${entry.value}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AudienceTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Kitle Analitiği (Elite Pro)
          </h2>
          <p className="text-neutral-400 mt-1">Harcama, ROAS, erişim ve etkileşim trendlerinizi gelişmiş analizlerle görün.</p>
        </div>
        <button className="mt-4 md:mt-0 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Rapor İndir (PDF)
        </button>
      </div>

      {/* Kpi Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Toplam Erişim", value: "0", change: "0%", icon: Eye, color: "from-blue-500 to-cyan-400" },
          { title: "Etkileşim Oranı", value: "0%", change: "0%", icon: Activity, color: "from-indigo-500 to-purple-400" },
          { title: "Ortalama ROAS", value: "0x", change: "0", icon: TrendingUp, color: "from-emerald-400 to-teal-400" },
          { title: "Reklam Harcaması", value: "$0", change: "0%", icon: DollarSign, color: "from-rose-400 to-pink-500" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#0A0A0F] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group hover:border-white/[0.1] transition-colors">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${kpi.color} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[#94A3B8] text-sm font-medium">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{kpi.value}</h3>
              </div>
              <div className="p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white">
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${kpi.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {kpi.change}
              </span>
              <span className="text-[#64748B]">Geçen haftaya göre</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart (Spend vs ROAS) */}
        <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Performans ve ROAS Eğilimi</h3>
              <p className="text-sm text-[#94A3B8]">Reklam harcamalarının getiriye oranı (Son 7 Gün)</p>
            </div>
            <select className="bg-[#05050A] border border-white/[0.1] text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
              <option>Son 7 Gün</option>
              <option>Son 30 Gün</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRoas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area yAxisId="left" type="monotone" dataKey="spend" name="Harcama" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                <Area yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRoas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Platform Dağılımı</h3>
            <p className="text-sm text-[#94A3B8]">Erişim vs Etkileşim</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPlatformData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff02'}} />
                <Bar dataKey="reach" name="Erişim" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="interactions" name="Etkileşim" fill="#A855F7" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Posts Table */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4">En Yüksek Performans Gösteren İçerikler</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="pb-3 text-sm font-semibold text-[#64748B]">İçerik</th>
                <th className="pb-3 text-sm font-semibold text-[#64748B]">Platform</th>
                <th className="pb-3 text-sm font-semibold text-[#64748B] text-right">Tıklama</th>
                <th className="pb-3 text-sm font-semibold text-[#64748B] text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {mockTopPosts.map((post) => (
                <tr key={post.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="py-4 text-sm text-white font-medium group-hover:text-blue-400 transition-colors">
                    {post.content}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/[0.05] border border-white/[0.05] text-[#94A3B8]">
                      {post.platform}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-white font-bold text-right flex items-center justify-end gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#64748B]" />
                    {post.clicks.toLocaleString()}
                  </td>
                  <td className="py-4 text-sm text-emerald-400 font-bold text-right">
                    {post.roas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
