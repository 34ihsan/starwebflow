"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, CheckCircle, RefreshCcw, ArrowRight, Zap, Target } from "lucide-react";
import { generateAIContent } from "@/app/actions/social";
import { NativePreview } from "./NativePreview";
import { BrandProfileModal } from "./BrandProfileModal";

export function AiContentTab({ initialPending }: { initialPending: any[] }) {
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [aiStudioParams, setAiStudioParams] = useState({
    topic: '',
    framework: 'AIDA',
    platforms: ['linkedin'],
    visualEngine: 'dalle3',
    useAlgorithmHacks: false
  });

  const [pendingQueue, setPendingQueue] = useState<any[]>(initialPending);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const handleApprove = async (id: string, updatedData?: any) => {
    try {
      const dataToUpdate = updatedData || { status: 'SCHEDULED' };
      if (!dataToUpdate.status) dataToUpdate.status = 'SCHEDULED';
      
      const { updateSocialPost } = await import("@/app/actions/social");
      const res = await updateSocialPost(id, dataToUpdate);
      if (res.success) {
        setPendingQueue(pendingQueue.filter(p => p.id !== id));
        setEditingPost(null);
      } else {
        alert("Güncelleme başarısız: " + res.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateAIContent({
        framework: aiStudioParams.framework,
        platforms: aiStudioParams.platforms,
        topic: aiStudioParams.topic,
        humanizerScore: 90,
        visualEngine: aiStudioParams.visualEngine,
      });

      if (res.success) {
        let omnichannel = res.omnichannel || {};
        // Otopilot algoritma hackleri simülasyonu
        if (aiStudioParams.useAlgorithmHacks) {
           if (omnichannel['linkedin']) omnichannel['linkedin'].content += "\n\n👇 İlk yorumda sürpriz var.";
        }
        setPreviewData({ omnichannel, image: res.mediaUrl, model: res.model });
      } else {
        alert("Üretim hatası: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            AI İçerik Stüdyosu
          </h2>
          <p className="text-neutral-400 mt-1">Gelişmiş Yapay Zeka modelleri ile çoklu varyant ve hook testleri üretin.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => setIsBrandModalOpen(true)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-medium transition-colors text-white"
          >
            Marka Belleği (Tone)
          </button>
          <button 
            onClick={() => setIsAiStudioOpen(!isAiStudioOpen)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Yeni Otopilot Serisi Başlat
          </button>
        </div>
      </div>

      {/* AI STUDIO PANEL */}
      {isAiStudioOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Target className="w-24 h-24 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">Üretim Parametreleri</h3>
            
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Konu / Kanca (Hook)</label>
                <textarea 
                  value={aiStudioParams.topic}
                  onChange={(e) => setAiStudioParams({...aiStudioParams, topic: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Framework</label>
                <select 
                  value={aiStudioParams.framework}
                  onChange={(e) => setAiStudioParams({...aiStudioParams, framework: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="AIDA">AIDA (Dikkat, İlgi, Arzu, Eylem)</option>
                  <option value="PAS">PAS (Problem, Agitate, Çözüm)</option>
                  <option value="BAB">BAB (Before, After, Bridge)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input 
                  type="checkbox" 
                  id="hacks"
                  checked={aiStudioParams.useAlgorithmHacks}
                  onChange={(e) => setAiStudioParams({...aiStudioParams, useAlgorithmHacks: e.target.checked})}
                  className="rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-indigo-500/50"
                />
                <label htmlFor="hacks" className="text-sm text-neutral-300">Algoritma Hacklerini Uygula (İlk Yorum vb.)</label>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 rounded-lg font-medium transition-all shadow-[0_0_10px_rgba(99,102,241,0.4)] flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Yapay Zeka Üretiyor...' : 'Varyantları Oluştur'}
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-0 overflow-hidden shadow-lg flex flex-col">
            <div className="border-b border-neutral-800 p-4 bg-neutral-950/50">
              <h3 className="text-lg font-semibold text-white">Canlı Native Önizleme (A/B Test)</h3>
            </div>
            <div className="p-5 flex-1 overflow-y-auto bg-neutral-950/30">
              {!previewData ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 min-h-[300px]">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p>Sol panelden parametreleri belirleyip üretime başlayın.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(previewData.omnichannel).map(([platform, data]: [string, any]) => (
                    <div key={platform} className="border border-neutral-800 rounded-xl p-4 bg-neutral-900">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold capitalize border border-indigo-500/30">
                          {platform}
                        </span>
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 transition">Varyant B İste</button>
                          <button className="text-xs px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded transition flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Onayla & Takvime Ekle
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-6 flex-col sm:flex-row">
                        {previewData.image && (
                          <div className="w-full sm:w-1/3 shrink-0">
                            <img src={previewData.image} alt="AI Generated" className="rounded-lg shadow-md border border-neutral-700 w-full object-cover aspect-square" />
                          </div>
                        )}
                        <div className="flex-1 whitespace-pre-wrap text-sm text-neutral-200">
                          {data.content}
                          {data.hashtags && (
                            <div className="mt-3 text-indigo-400 text-xs flex gap-2 flex-wrap">
                              {data.hashtags.map((h: string) => <span key={h}>{h.startsWith('#') ? h : `#${h}`}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAFTS & PENDING APPROVALS QUEUE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg mt-8">
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Onay Bekleyenler (Toplu Planlama Kuyruğu)
          </h3>
          <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-400 text-xs rounded-full font-medium border border-neutral-700">
            {pendingQueue.length} Gönderi Onay Bekliyor
          </span>
        </div>
        
        <div className="divide-y divide-neutral-800/50">
          {pendingQueue.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Onay bekleyen gönderi bulunmuyor.</p>
            </div>
          ) : (
            pendingQueue.map((post) => (
              <div key={post.id} className="p-5 hover:bg-neutral-800/20 transition flex flex-col md:flex-row gap-5">
                <div className="w-24 shrink-0 flex flex-col items-center justify-center bg-neutral-950 border border-neutral-800 rounded-lg py-3 text-center">
                  <span className="text-xs text-neutral-500 font-medium">
                    {post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'TARİHSİZ'}
                  </span>
                  <span className="text-lg font-bold text-neutral-200">
                    {post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded border border-indigo-500/20 font-bold tracking-wide uppercase">
                      {post.platform}
                    </span>
                    <span className="text-xs font-medium text-neutral-500">
                      Oluşturuldu: {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 line-clamp-2">
                    {post.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingPost(post)}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg transition border border-neutral-700"
                  >
                    Düzenle / Önizle
                  </button>
                  <button 
                    onClick={() => handleApprove(post.id)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Onayla
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <BrandProfileModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} />

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                İçerik Düzenleme ve Önizleme
              </h2>
              <button onClick={() => setEditingPost(null)} className="text-neutral-400 hover:text-white">
                Kapat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Düzenleme Formu */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Gönderi Metni</label>
                  <textarea 
                    value={editingPost.content || ''}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Görsel URL</label>
                  <input 
                    type="text" 
                    value={editingPost.mediaUrl || ''}
                    onChange={(e) => setEditingPost({...editingPost, mediaUrl: e.target.value})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Planlanan Tarih & Saat</label>
                  <input 
                    type="datetime-local" 
                    value={editingPost.scheduledFor ? new Date(new Date(editingPost.scheduledFor).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingPost({...editingPost, scheduledFor: new Date(e.target.value)})}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Native Önizleme */}
              <div className="bg-black/40 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">Native Cihaz Önizlemesi</p>
                <NativePreview 
                  platform={editingPost.platform?.toLowerCase() || 'linkedin'} 
                  content={editingPost.content || ''} 
                  image={editingPost.mediaUrl} 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-neutral-800 bg-neutral-950/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => handleApprove(editingPost.id, { 
                  content: editingPost.content, 
                  mediaUrl: editingPost.mediaUrl, 
                  scheduledFor: editingPost.scheduledFor,
                  status: 'IDEA' // just saving edits, not approving yet if clicked save
                })}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition"
              >
                Taslağı Kaydet
              </button>
              <button 
                onClick={() => handleApprove(editingPost.id, { 
                  content: editingPost.content, 
                  mediaUrl: editingPost.mediaUrl, 
                  scheduledFor: editingPost.scheduledFor,
                  status: 'SCHEDULED'
                })}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Değişiklikleri Kaydet ve Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
