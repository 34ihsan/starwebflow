"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Heart, MessageSquare, ArrowUpRight, BarChart3, Activity } from "lucide-react";
import { getAudienceAnalytics } from "@/app/actions/social";

export function AudienceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAudienceAnalytics().then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Kitle Analitiği (Growth AI)
          </h2>
          <p className="text-neutral-400 mt-1">Yorumların duygu durumunu ve gelecekteki büyüme potansiyelini öngörün.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sentiment Heatmap */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" /> Duygu Analizi (Yorumlar)
              </h3>
            </div>
            
            <div className="h-4 w-full flex rounded-full overflow-hidden mb-4 bg-neutral-800">
              <div style={{ width: `${data.sentiment.positive}%` }} className="bg-emerald-500 hover:brightness-110 transition-all cursor-help" title="Olumlu"></div>
              <div style={{ width: `${data.sentiment.neutral}%` }} className="bg-neutral-500 hover:brightness-110 transition-all cursor-help" title="Nötr"></div>
              <div style={{ width: `${data.sentiment.negative}%` }} className="bg-rose-500 hover:brightness-110 transition-all cursor-help" title="Olumsuz"></div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-neutral-300">Olumlu (%{data.sentiment.positive})</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-neutral-500"></span><span className="text-neutral-300">Nötr (%{data.sentiment.neutral})</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-neutral-300">Olumsuz (%{data.sentiment.negative})</span></div>
            </div>
            
            <div className="mt-8 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
              <p className="text-sm text-indigo-200">
                <strong className="text-indigo-400">AI Çıkarımı:</strong> Hedef kitleniz en son yayınlanan "AI Ajanları" konulu gönderinize son derece olumlu (%65) tepki verdi. B2B otomasyonları konulu gönderilere ağırlık vermeniz önerilir.
              </p>
            </div>
          </div>

          {/* Predictive Metrics */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-32 h-32 text-emerald-500" />
              </div>
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Tahmini Büyüme</h3>
              <div className="text-3xl font-black text-emerald-400 flex items-center gap-2">
                {data.followerPrediction} <ArrowUpRight className="w-6 h-6" />
              </div>
              <p className="text-xs text-neutral-500 mt-2">Mevcut etkileşim oranına göre AI tahmini.</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">En Aktif Günler</h3>
              <div className="flex gap-2">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => {
                  const isActive = data.topGrowthDays.some((tgd: string) => tgd.startsWith(d));
                  return (
                    <div key={d} className={`flex-1 text-center py-2 rounded-lg text-xs font-bold border ${isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-neutral-950 border-neutral-800 text-neutral-600'}`}>
                      {d}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-sm text-neutral-300">
                En iyi paylaşım saati: <span className="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded ml-1">{data.bestTimeToPost}</span>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
