"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, CheckCircle, RefreshCcw, ArrowRight, Zap, Target, Layers, Share2, Flame, Copy, Check, X, MessageSquare, Bot, FileText, Send } from "lucide-react";
import { generateAIContent, bulkGenerateSocialContent, generateLeadMagnetAndFunnel, simulateIncomingDmTrigger } from "@/app/actions/social";
import { NativePreview } from "./NativePreview";
import { BrandProfileModal } from "./BrandProfileModal";

export function AiContentTab({ initialPending }: { initialPending: any[] }) {
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const [isFormatAdapterOpen, setIsFormatAdapterOpen] = useState(false);
  const [formatSourceText, setFormatSourceText] = useState('');
  const [formattedOutputs, setFormattedOutputs] = useState<any>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // DM Funnel State
  const [isDmFunnelModalOpen, setIsDmFunnelModalOpen] = useState(false);
  const [dmFunnelTopic, setDmFunnelTopic] = useState('2026 E-Ticaret Reklam Kancası ve Prompt Paketi');
  const [dmFunnelLeadType, setDmFunnelLeadType] = useState<'prompt_pack' | 'cheat_sheet' | 'script'>('prompt_pack');
  const [dmFunnelResult, setDmFunnelResult] = useState<any>(null);
  const [isGeneratingFunnel, setIsGeneratingFunnel] = useState(false);
  const [testUserHandle, setTestUserHandle] = useState('@ahmet_demir');
  const [isTestingDm, setIsTestingDm] = useState(false);

  const [aiStudioParams, setAiStudioParams] = useState({
    topic: '',
    framework: 'AIDA',
    platforms: ['linkedin'],
    visualEngine: 'dalle3',
    useAlgorithmHacks: false
  });

  const handleGenerateLeadMagnet = async () => {
    setIsGeneratingFunnel(true);
    try {
      const res = await generateLeadMagnetAndFunnel({
        topic: dmFunnelTopic,
        leadType: dmFunnelLeadType
      });
      if (res.success) {
        setDmFunnelResult(res.data);
      } else {
        alert("Funnel üretilemedi: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingFunnel(false);
    }
  };

  const handleTestDmTrigger = async () => {
    if (!dmFunnelResult) return;
    setIsTestingDm(true);
    try {
      const res = await simulateIncomingDmTrigger({
        keyword: dmFunnelResult.triggerKeyword,
        userHandle: testUserHandle,
        autoDmResponse: dmFunnelResult.autoDmResponse
      });
      if (res.success) {
        alert(`✅ OTOMATİK DM BAŞARILI!\n\n${res.message}\n\nGönderilen DM: "${dmFunnelResult.autoDmResponse}"`);
      } else {
        alert("DM testi başarısız: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingDm(false);
    }
  };

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

  const handle30DayAutopilot = async () => {
    setIsAutopilotRunning(true);
    try {
      const sampleTopics = [
        { topic: "Yapay zeka otomasyonları ile haftada 15 saat tasarruf etmenin 5 yolu", platforms: ["linkedin", "twitter"] },
        { topic: "2026 E-ticaret dönüşüm oranlarını artırma rehberi", platforms: ["linkedin", "instagram"] },
        { topic: "Müşteri adaylarını WhatsApp'tan anında arama ve dönüşüm oranları", platforms: ["linkedin", "twitter"] },
        { topic: "Starwebflow ile 7 günde sıfırdan dijital dönüşüm vaka analizi", platforms: ["linkedin", "instagram", "twitter"] },
      ];

      const res = await bulkGenerateSocialContent(sampleTopics);
      if (res.success) {
        if (res.createdPosts && res.createdPosts.length > 0) {
          setPendingQueue(prev => [...res.createdPosts, ...prev]);
        }
        alert(`🚀 30 Günlük Sosyal Medya Otopilot Serisi (${res.createdCount} gönderi) başarıyla oluşturuldu ve Onay Kuyruğuna eklendi!`);
      } else {
        alert("Otopilot üretimi başarısız: " + res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Otopilot başlatılırken hata oluştu.");
    } finally {
      setIsAutopilotRunning(false);
    }
  };

  const handleConvertFormats = async () => {
    if (!formatSourceText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await generateAIContent({
        framework: 'PAS (Problem-Agitate-Solve)',
        platforms: ['linkedin', 'twitter', 'instagram', 'tiktok'],
        topic: `Şu ham metni veya blog yazısını 4 farklı platform formatına çevir:\n\n"${formatSourceText}"`,
        humanizerScore: 95
      });

      if (res.success && res.omnichannel) {
        setFormattedOutputs({
          twitterThread: `🧵 [TWEET DİZİSİ]\n1/ ${res.omnichannel.twitter?.content || formatSourceText}\n\n2/ Yapay zeka ile otomatik süreç dönüşümü sağlayın.`,
          linkedin: res.omnichannel.linkedin?.content || formatSourceText,
          carouselPrompts: `📸 INSTAGRAM CAROUSEL SLAYTLARI:\nSlayt 1: ${formatSourceText.substring(0, 50)}...\nSlayt 2: Problemin Kökeni\nSlayt 3: Starwebflow Çözümü`,
          shortsScript: `🎥 TIKTOK/REELS VİDEO SENARYOSU:\n[0-3sn Hook]: Biliyor muydunuz?\n[3-15sn Gelişme]: ${formatSourceText.substring(0, 80)}...\n[15-30sn CTA]: Detaylar bio'daki linkte!`
        });
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
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <button 
            onClick={() => setIsDmFunnelModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
          >
            <MessageSquare className="w-4 h-4" />
            DM Funnel Stüdyosu
          </button>
          <button 
            onClick={() => setIsBrandModalOpen(true)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-medium transition-colors text-white"
          >
            Marka Belleği
          </button>
          <button 
            onClick={() => setIsFormatAdapterOpen(true)}
            className="px-4 py-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            Format Adaptörü
          </button>
          <button 
            onClick={handle30DayAutopilot}
            disabled={isAutopilotRunning}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isAutopilotRunning ? "Otopilot Çalışıyor..." : "30 Günlük Otopilot Başlat"}
          </button>
          <button 
            onClick={() => setIsAiStudioOpen(!isAiStudioOpen)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Yeni Akış Başlat
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
                  placeholder="Örn: E-ticaret dönüşüm oranlarını artırmanın 3 otomasyon sırrı..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Reklam Psikolojisi Framework</label>
                <select 
                  value={aiStudioParams.framework}
                  onChange={(e) => setAiStudioParams({...aiStudioParams, framework: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="AIDA">⚡ AIDA (Dikkat, İlgi, Arzu, Eylem)</option>
                  <option value="PAS">🔥 PAS (Problem, Agitate, Çözüm)</option>
                  <option value="BAB">🚀 BAB (Before, After, Bridge)</option>
                  <option value="VIRAL_AD_HOOK">⚡ PRO TITAN: Viral Reklam Kanca Motoru</option>
                  <option value="DM_FUNNEL">💬 DM Otomasyonu (Yorumda Kod İstetme)</option>
                </select>
              </div>

              <div className="space-y-2 mt-3 pt-3 border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="hacks"
                    checked={aiStudioParams.useAlgorithmHacks}
                    onChange={(e) => setAiStudioParams({...aiStudioParams, useAlgorithmHacks: e.target.checked})}
                    className="rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-indigo-500/50"
                  />
                  <label htmlFor="hacks" className="text-xs text-neutral-300 font-medium">Algoritma Hackleri (İlk Yorumda Link vb.)</label>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {isGenerating ? 'AI Titan Motoru Çalışıyor...' : 'PRO TITAN Varyantları Üret'}
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-0 overflow-hidden shadow-lg flex flex-col">
            <div className="border-b border-neutral-800 p-4 bg-neutral-950/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Titan Reklam Disiplinli Organik Önizleme
              </h3>
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
      {/* FORMAT ADAPTER MODAL */}
      {isFormatAdapterOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Smart Format Adaptörü (Omnichannel Transformer)
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Tek bir metni/blogu 4 farklı platform formatına (X Thread, LinkedIn, Instagram Carousel, TikTok Script) dönüştürün.</p>
              </div>
              <button onClick={() => setIsFormatAdapterOpen(false)} className="text-neutral-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Kaynak Metin veya Blog İçeriği</label>
                <textarea
                  value={formatSourceText}
                  onChange={e => setFormatSourceText(e.target.value)}
                  placeholder="Dönüştürmek istediğiniz ham metni, makaleyi veya blog yazısını buraya yapıştırın..."
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 resize-none font-sans"
                />
              </div>

              <button
                onClick={handleConvertFormats}
                disabled={isGenerating || !formatSourceText.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Formatlara Dönüştürülüyor...' : '4 Farklı Formata Dönüştür (Omnichannel)'}
              </button>

              {formattedOutputs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                  {Object.entries(formattedOutputs).map(([key, val]) => (
                    <div key={key} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{key}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(val));
                              setCopiedKey(key);
                              setTimeout(() => setCopiedKey(null), 2000);
                            }}
                            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                          >
                            {copiedKey === key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === key ? 'Kopyalandı' : 'Kopyala'}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs text-neutral-300 font-sans leading-relaxed max-h-48 overflow-y-auto">
                          {String(val)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DM FUNNEL & LEAD MAGNET STUDIO MODAL */}
      {isDmFunnelModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(236,72,153,0.3)]">
            
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/60">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-pink-400" />
                  PRO TITAN: Lead Magnet & DM Funnel Stüdyosu
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Organik yorum patlaması yaratın ve yorum atan profilleri anında CRM Lead'ine dönüştürün.</p>
              </div>
              <button onClick={() => setIsDmFunnelModalOpen(false)} className="text-neutral-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-neutral-950/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Lead Magnet Konusu / Serbest İstek VEYA Blog Eşle</label>
                  <input 
                    type="text" 
                    value={dmFunnelTopic} 
                    onChange={(e) => setDmFunnelTopic(e.target.value)}
                    placeholder="İstediğiniz konuyu yazın VEYA bir makale adı girin..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">İster serbest bir konu yazın, ister veritabanınızdaki bir blog makalesini başlığıyla eşleştirin.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Magnet Türü</label>
                  <select 
                    value={dmFunnelLeadType}
                    onChange={(e: any) => setDmFunnelLeadType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="prompt_pack">📦 Prompt & Şablon Paketi</option>
                    <option value="cheat_sheet">📋 Kontrol Listesi (Cheat Sheet)</option>
                    <option value="script">🎥 Satış & Reklam Senaryoları</option>
                    <option value="resource_guide">📚 Blog Özet Kılavuzu & Kaynak</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerateLeadMagnet}
                disabled={isGeneratingFunnel || !dmFunnelTopic.trim()}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 text-sm"
              >
                {isGeneratingFunnel ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {isGeneratingFunnel ? 'Titan Funnel Hazırlanıyor...' : 'Lead Magnet & Auto-DM Akışını Üret'}
              </button>

              {dmFunnelResult && (
                <div className="space-y-6 pt-4 border-t border-neutral-800 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-pink-950/30 border border-pink-500/30 p-4 rounded-xl">
                      <div className="text-xs text-pink-400 font-bold uppercase mb-1">Tetikleyici Kelime (Keyword)</div>
                      <div className="text-2xl font-black text-white flex items-center gap-2">
                        <span>"{dmFunnelResult.triggerKeyword}"</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-2">Kullanıcılar gönderiye bu kelimeyi yazdığı anda DM otomasyonu tetiklenir.</p>
                    </div>
                    <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                      <div className="text-xs text-neutral-400 font-bold uppercase mb-1">Üretilen Lead Magnet Bağlığı</div>
                      <div className="text-base font-bold text-white mb-2">{dmFunnelResult.magnetTitle}</div>
                      <div className="text-xs text-neutral-300 max-h-24 overflow-y-auto bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 whitespace-pre-wrap">
                        {dmFunnelResult.magnetContent}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">1. Sosyal Medya Gönderi Metni</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(dmFunnelResult.socialPostContent);
                            alert("Gönderi metni kopyalandı!");
                          }}
                          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Kopyala
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs text-neutral-300 font-sans leading-relaxed max-h-48 overflow-y-auto bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                        {dmFunnelResult.socialPostContent}
                      </pre>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">2. Otomatik Gönderilecek DM Yanıtı</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(dmFunnelResult.autoDmResponse);
                            alert("DM yanıtı kopyalandı!");
                          }}
                          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Kopyala
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs text-neutral-300 font-sans leading-relaxed max-h-48 overflow-y-auto bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                        {dmFunnelResult.autoDmResponse}
                      </pre>
                    </div>
                  </div>

                  {/* LIVE SIMULATION BOX */}
                  <div className="bg-gradient-to-r from-neutral-900 via-purple-950/20 to-neutral-900 border border-purple-500/30 p-5 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      Canlı DM Otomasyon Testi & Simülasyonu
                    </h4>
                    <p className="text-xs text-neutral-400">Yorum atan bir profili simüle edin, otomatik DM gönderimini ve CRM'e kaydını test edin.</p>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={testUserHandle}
                        onChange={(e) => setTestUserHandle(e.target.value)}
                        placeholder="@kullanici_adi"
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-48"
                      />
                      <button 
                        onClick={handleTestDmTrigger}
                        disabled={isTestingDm}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(147,51,234,0.4)] disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isTestingDm ? 'Gönderiliyor...' : 'Yorum Simülasyonu Çalıştır'}
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
