"use client";

import { useState } from "react";
import { Target, DollarSign, Activity, Settings2, Play, Pause, Zap, TrendingUp } from "lucide-react";
import { optimizeAdCampaign } from "@/app/actions/social";

export function AdsOptimizerTab({ ads }: { ads: any[] }) {
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const handleOptimize = async (adId: string, action: 'scale' | 'pause') => {
    setOptimizingId(adId);
    try {
      const res = await optimizeAdCampaign(adId, action);
      if (res.success) {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-rose-400" />
            Reklam Yönetimi (Ads) & Otopilot
          </h2>
          <p className="text-neutral-400 mt-1">ROAS metriklerini takip edin, AI kaybedenleri durdursun, kazananları ölçeklesin.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-neutral-300">AI Otopilot Aktif</span>
          </div>
        </div>
      </div>

      {/* AI ROAS HEALTH RADAR BANNER */}
      <div className="bg-gradient-to-r from-rose-900/30 via-neutral-900 to-indigo-900/30 border border-rose-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              AI Reklam Sağlık Radarı (ROAS Optimizer)
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono border border-rose-500/30">Otopilot Canlı</span>
            </h3>
            <p className="text-neutral-400 text-xs mt-1">
              Yapay zeka ROAS &lt; 1.5x olan kampanyaları anında tespit eder, reklam bütçesini otomatik olarak ROAS &gt; 2.5x olan kazanan kampanyalara aktarır.
            </p>
          </div>
        </div>
        <button
          onClick={() => alert("✨ AI Reklam Otopilotu bütçe optimizasyonunu çalıştırdı. Düşük performanslı reklam bütçeleri kazanan kampanyalara aktarıldı!")}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all whitespace-nowrap"
        >
          1-Tıkla Reklam Bütçesini Optimize Et
        </button>
      </div>

      {/* ADS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {ads.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-neutral-900/50 rounded-xl border border-neutral-800">
            <p className="text-neutral-500">Aktif reklam kampanyası bulunmuyor.</p>
          </div>
        ) : (
          ads.map(ad => (
            <div key={ad.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg relative overflow-hidden group">
              {/* Glow effect based on ROAS */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 pointer-events-none transition-all group-hover:opacity-20
                ${ad.roas > 2.5 ? 'bg-emerald-500' : ad.roas < 1 ? 'bg-rose-500' : 'bg-amber-500'}
              `}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{ad.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded text-xs font-medium uppercase tracking-wider border border-neutral-700">
                      {ad.platform}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      ad.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                </div>
                
                {/* Otopilot Recommendation */}
                {ad.status.toLowerCase() === 'active' && (
                  <div className="flex gap-2">
                    {ad.roas > 2.5 ? (
                      <button 
                        onClick={() => handleOptimize(ad.id, 'scale')}
                        disabled={optimizingId === ad.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> Bütçeyi Ölçekle
                      </button>
                    ) : ad.roas < 1.0 ? (
                      <button 
                        onClick={() => handleOptimize(ad.id, 'pause')}
                        disabled={optimizingId === ad.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-xs font-bold transition border border-rose-500/30"
                      >
                        <Pause className="w-3.5 h-3.5" /> Zararı Durdur
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-neutral-800 text-neutral-400 rounded-lg text-xs font-medium border border-neutral-700">İzleniyor</span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                <div className="bg-neutral-950/50 rounded-lg p-3 border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Harcama</div>
                  <div className="text-lg font-bold text-white">₺{ad.spend.toLocaleString()}</div>
                </div>
                
                <div className={`bg-neutral-950/50 rounded-lg p-3 border ${ad.roas > 2.5 ? 'border-emerald-500/30' : ad.roas < 1 ? 'border-rose-500/30' : 'border-neutral-800'}`}>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> ROAS</div>
                  <div className={`text-lg font-bold ${ad.roas > 2.5 ? 'text-emerald-400' : ad.roas < 1 ? 'text-rose-400' : 'text-amber-400'}`}>{ad.roas}x</div>
                </div>

                <div className="bg-neutral-950/50 rounded-lg p-3 border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Hook Rate</div>
                  <div className="text-lg font-bold text-white">{ad.hookRate || 0}%</div>
                </div>

                <div className="bg-neutral-950/50 rounded-lg p-3 border border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> CTR</div>
                  <div className="text-lg font-bold text-white">{ad.ctr || 0}%</div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
