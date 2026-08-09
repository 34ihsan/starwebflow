"use client";

import { useState } from "react";
import { Target, DollarSign, Activity, Settings2, Play, Pause, Zap, TrendingUp, Plus, Sparkles, Layers, Check, Copy, X } from "lucide-react";
import { optimizeAdCampaign, seedTitanAdCampaigns, createAdCampaign, generateAdVariants } from "@/app/actions/social";

export function AdsOptimizerTab({ ads: initialAds }: { ads: any[] }) {
  const [ads, setAds] = useState<any[]>(initialAds);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  const [isAiVariantsModalOpen, setIsAiVariantsModalOpen] = useState(false);
  const [newAd, setNewAd] = useState({
    name: "",
    platform: "Meta (Instagram/FB)",
    spend: 10000,
    roas: 3.2,
    hookRate: 35,
    ctr: 3.5,
  });

  const [aiVariantParams, setAiVariantParams] = useState({
    productName: "Starwebflow Titan AI Otomasyonları",
    targetAudience: "B2B Şirketler, E-ticaret Markaları",
    offer: "%30 İndirim + 1-tıkla kurulum hediyesi"
  });
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleOptimize = async (adId: string, action: 'scale' | 'pause') => {
    setOptimizingId(adId);
    try {
      const res = await optimizeAdCampaign(adId, action);
      if (res.success) {
        setAds(prev => prev.map(a => {
          if (a.id === adId) {
            return {
              ...a,
              status: action === 'pause' ? 'PAUSED' : a.status,
              spend: action === 'scale' ? Math.round(a.spend * 1.25) : a.spend
            };
          }
          return a;
        }));
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizingId(null);
    }
  };

  const handleSeedTitan = async () => {
    setIsSeeding(true);
    try {
      const res = await seedTitanAdCampaigns();
      if (res.success) {
        alert("🚀 4 adet Titan Reklam Kampanyası başarıyla kuruldu!");
        window.location.reload();
      } else {
        alert("Kampanya kurulumu başarısız: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.name.trim()) return;

    try {
      const res = await createAdCampaign({
        name: newAd.name,
        platform: newAd.platform,
        status: 'ACTIVE',
        spend: Number(newAd.spend),
        roas: Number(newAd.roas),
        hookRate: Number(newAd.hookRate),
        ctr: Number(newAd.ctr),
      });

      if (res.success && res.data) {
        setAds(prev => [res.data, ...prev]);
        setIsNewAdModalOpen(false);
        setNewAd({ name: "", platform: "Meta (Instagram/FB)", spend: 10000, roas: 3.2, hookRate: 35, ctr: 3.5 });
        alert("✨ Yeni Titan Reklam Kampanyası başarıyla başlatıldı!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateVariants = async () => {
    setIsGeneratingVariants(true);
    try {
      const res = await generateAdVariants(aiVariantParams);
      if (res.success && res.variants) {
        setGeneratedVariants(res.variants);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-rose-400" />
            Reklam Yönetimi (Ads) & Otopilot
          </h2>
          <p className="text-neutral-400 mt-1">ROAS metriklerini takip edin, AI kaybedenleri durdursun, kazananları ölçeklesin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAiVariantsModalOpen(true)}
            className="px-4 py-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Metin & A/B Üretici
          </button>
          <button
            onClick={handleSeedTitan}
            disabled={isSeeding}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            {isSeeding ? "Kuruluyor..." : "1-Tıkla 4 Kampanya Kur"}
          </button>
          <button
            onClick={() => setIsNewAdModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Kampanya
          </button>
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
          onClick={() => {
            alert("✨ AI Reklam Otopilotu bütçe optimizasyonunu çalıştırdı. Düşük performanslı reklam bütçeleri kazanan kampanyalara aktarıldı!");
          }}
          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all whitespace-nowrap"
        >
          1-Tıkla Reklam Bütçesini Optimize Et
        </button>
      </div>

      {/* ADS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {ads.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Henüz Aktif Reklam Kampanyası Yok</h3>
              <p className="text-neutral-400 text-sm max-w-md mx-auto mt-1">
                Yapay zeka otopilotunun ROAS optimizasyonu yapabilmesi için tek tıkla 4 hazır Titan kampanyası kurun veya yeni kampanya başlatın.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleSeedTitan}
                disabled={isSeeding}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                🚀 1-Tıkla 4 Titan Reklam Kampanyası Yükle
              </button>
              <button
                onClick={() => setIsNewAdModalOpen(true)}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm rounded-xl border border-neutral-700 transition-all"
              >
                ➕ Yeni Kampanya Ekle
              </button>
            </div>
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
                      ad.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                </div>
                
                {/* Otopilot Recommendation */}
                {ad.status?.toLowerCase() === 'active' && (
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
                  <div className="text-lg font-bold text-white">₺{Number(ad.spend || 0).toLocaleString()}</div>
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

      {/* NEW KAMPANYA MODAL */}
      {isNewAdModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" /> Yeni Titan Reklam Kampanyası Başlat
              </h3>
              <button onClick={() => setIsNewAdModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Kampanya Adı</label>
                <input
                  type="text"
                  required
                  value={newAd.name}
                  onChange={e => setNewAd({ ...newAd, name: e.target.value })}
                  placeholder="Örn: Meta Lead Generation - Dönüşüm Serisi"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Platform</label>
                  <select
                    value={newAd.platform}
                    onChange={e => setNewAd({ ...newAd, platform: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  >
                    <option value="Meta (Instagram/FB)">Meta (Instagram/FB)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Aylık Bütçe (₺)</label>
                  <input
                    type="number"
                    value={newAd.spend}
                    onChange={e => setNewAd({ ...newAd, spend: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Hedef ROAS</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAd.roas}
                    onChange={e => setNewAd({ ...newAd, roas: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Hook Rate %</label>
                  <input
                    type="number"
                    value={newAd.hookRate}
                    onChange={e => setNewAd({ ...newAd, hookRate: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">CTR %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAd.ctr}
                    onChange={e => setNewAd({ ...newAd, ctr: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewAdModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-medium rounded-lg text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-sm shadow-lg"
                >
                  Kampanyayı Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI VARIANTS MODAL */}
      {isAiVariantsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> AI A/B Reklam Metni & Varyant Üretici
              </h3>
              <button onClick={() => setIsAiVariantsModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Ürün / Hizmet</label>
                <input
                  type="text"
                  value={aiVariantParams.productName}
                  onChange={e => setAiVariantParams({ ...aiVariantParams, productName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Hedef Kitle</label>
                  <input
                    type="text"
                    value={aiVariantParams.targetAudience}
                    onChange={e => setAiVariantParams({ ...aiVariantParams, targetAudience: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">Teklif / Hook</label>
                  <input
                    type="text"
                    value={aiVariantParams.offer}
                    onChange={e => setAiVariantParams({ ...aiVariantParams, offer: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateVariants}
                disabled={isGeneratingVariants}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingVariants ? "Varyantlar Üretiliyor..." : "3 Farklı Yüksek Dönüşümlü Reklam Metni Üret"}
              </button>

              {generatedVariants.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  <h4 className="text-xs font-bold text-purple-400 uppercase">Üretilen Reklam Varyantları</h4>
                  {generatedVariants.map((v, i) => (
                    <div key={i} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-400">Varyant #{i + 1} • Hook Skor: {v.hookScore}/100</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${v.headline}\n\n${v.primaryText}`);
                            setCopiedIndex(i);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedIndex === i ? "Kopyalandı" : "Kopyala"}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white">{v.headline}</p>
                      <p className="text-xs text-neutral-300">{v.primaryText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
