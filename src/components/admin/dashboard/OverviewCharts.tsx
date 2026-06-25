"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OverviewChartsProps {
  revenueData: { name: string; total: number }[];
  leadsData: { name: string; count: number }[];
}

export function OverviewCharts({ revenueData, leadsData }: OverviewChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-[350px] w-full rounded-2xl border border-white/5 bg-[#0B0F19]/60 p-6 backdrop-blur-md relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mb-6">
          <h3 className="text-lg font-bold text-white">Gelir Özeti</h3>
          <p className="text-xs text-slate-400">Son 6 aylık finansal performans</p>
        </div>
        
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#131B2A', color: '#fff' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#0B0F19' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                style={{ filter: "drop-shadow(0px 4px 8px rgba(16, 185, 129, 0.3))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="h-[350px] w-full rounded-2xl border border-white/5 bg-[#0B0F19]/60 p-6 backdrop-blur-md relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mb-6">
          <h3 className="text-lg font-bold text-white">Lead Üretimi</h3>
          <p className="text-xs text-slate-400">Son 6 aylık potansiyel müşteri akışı</p>
        </div>

        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leadsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#131B2A', color: '#fff' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                style={{ filter: "drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.5))" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
