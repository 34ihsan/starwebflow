"use client";

import { useState } from "react";
import { 
  Calendar, PenTool, Share2, CheckCircle2, 
  Clock, XCircle, Users as UsersIcon, MessageCircle, Camera,
  MessageSquare, MoreHorizontal, Sparkles, Image as ImageIcon,
  TrendingUp, Users, Target, Activity, DollarSign,
  MonitorSmartphone, LayoutGrid, List, Plus, UploadCloud, Hash, ImagePlus, Check, Server, ArrowRight, Mail, MousePointer
} from "lucide-react";

import { createSocialPost, generateAIContent, createAdCampaign, updateSocialPost, bulkGenerateSocialContent, suggestSocialIdeas, deleteSocialPost, publishSocialPost, syncSocialLeads, generateTrackedLink } from "@/app/actions/social";
import Papa from 'papaparse';
import { NativePreview } from "./components/NativePreview";
import { BrandProfileModal } from "./components/BrandProfileModal";

export default function SocialDashboardClient({ initialData }: { initialData: { posts: any[], ads: any[], analytics?: any } }) {
  const [activeTab, setActiveTab] = useState<"pending" | "scheduled" | "published" | "ads" | "audience">("pending");
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<"list" | "grid">("grid");
  const [selectedPreviewPlatform, setSelectedPreviewPlatform] = useState<"linkedin" | "twitter" | "instagram">("linkedin");
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  const analytics = initialData.analytics || { clicks: 0, visitors: 0, leads: 0 };

  // AI Content Studio State
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [aiStudioParams, setAiStudioParams] = useState({
    framework: "PAS",
    tone: "professional",
    visualEngine: "google_ai_pro",
    humanizerScore: 85,
    platforms: ["linkedin"],
    useAlgorithmHacks: true,
    customImage: null as string | null,
    topic: "Web tasarım ve AI ajans hizmetleri",
  });
  const [studioPreview, setStudioPreview] = useState<{omnichannel: any, image: string | null, model?: string, mediaPrompt?: string | null, niche?: string} | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  // Missing state variables
  const [pendingPosts, setPendingPosts] = useState<any[]>(initialData.posts.filter((p: any) => p.status === 'PENDING' || p.status === 'pending'));
  const [scheduledLocalPosts, setScheduledLocalPosts] = useState<any[]>(initialData.posts.filter((p: any) => p.status === 'SCHEDULED' || p.status === 'scheduled' || p.status === 'IDEA'));
  const [ads, setAds] = useState<any[]>(initialData.ads || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [trackedLinkUrl, setTrackedLinkUrl] = useState<string | null>(null);

  // AI Ideation state
  const [topicContext, setTopicContext] = useState('');
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [editingIdeaIndex, setEditingIdeaIndex] = useState<number | null>(null);
  const [editingIdeaContent, setEditingIdeaContent] = useState<{ topic: string; imagePrompt: string }>({ topic: '', imagePrompt: '' });

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const res = await generateAIContent({
        framework: aiStudioParams.framework,
        platforms: aiStudioParams.platforms,
        topic: aiStudioParams.topic || "Web tasarımı, AI ajanları ve büyüme stratejileri",
        humanizerScore: aiStudioParams.humanizerScore,
        visualEngine: aiStudioParams.visualEngine,
      });

      let omnichannel: Record<string, any> = {};
      let niche = "";
      
      if (res.success && res.omnichannel) {
        omnichannel = res.omnichannel;
        niche = res.niche || "";
        
        // Algoritma hacklerini ekle
        if (aiStudioParams.useAlgorithmHacks) {
          if (omnichannel['linkedin']) {
            omnichannel['linkedin'].content += "\n\n👇 Ücretsiz analiz için link ilk yorumda.";
          }
          if (omnichannel['instagram']) {
            omnichannel['instagram'].content += "\n\n🔗 Link bioda! Ya da \"ANALİZ\" yazın → DM'den otomatik ulaşalım.";
          }
        }
      } else {
        omnichannel = { error: { content: "Hata oluştu: " + (res as any).error } };
      }

      const image = aiStudioParams.customImage || (res as any).mediaUrl || (aiStudioParams.visualEngine !== "none" ? "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop" : null);
      const model = (res as any).model ?? 'ai';
      const mediaPrompt = (res as any).mediaPrompt || null;

      setStudioPreview({ omnichannel, niche, image, model, mediaPrompt });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Missing handler functions ──────────────────────────────────────────────

  const openEditModal = (post: any) => {
    setEditingPost({ ...post });
    setTrackedLinkUrl(null);
    setIsEditModalOpen(true);
  };

  const handleDeletePost = async (postId: string, isScheduled: boolean = false) => {
    if (!confirm('Bu postu silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteSocialPost(postId);
      if (isScheduled) {
        setScheduledLocalPosts(prev => prev.filter((p: any) => p.id !== postId));
      } else {
        setPendingPosts(prev => prev.filter((p: any) => p.id !== postId));
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const addHashtags = async () => {
    if (!editingPost) return;
    const hashtags = await suggestSocialIdeas(editingPost.content || editingPost.topic || 'dijital pazarlama');
    if (hashtags) {
      setEditingPost((prev: any) => ({ ...prev, content: (prev.content || '') + '\n\n' + hashtags }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCsv(true);
    try {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = result.data as any[];
      for (const row of rows) {
        await createSocialPost({
          platform: row.platform || 'LinkedIn',
          platforms: [row.platform?.toLowerCase() || 'linkedin'],
          content: row.content || row.text || '',
          hashtags: row.hashtags ? row.hashtags.split(',').map((h: string) => h.trim()) : [],
          status: 'pending',
          groupId: 'csv_' + Date.now().toString(36),
        });
      }
      alert(`${rows.length} post başarıyla yüklendi.`);
    } catch (err) {
      console.error('CSV upload error:', err);
      alert('CSV yüklenirken hata oluştu.');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleSuggestIdeas = async () => {
    setIsSuggesting(true);
    try {
      const res = await suggestSocialIdeas(topicContext || 'dijital pazarlama ve web tasarım');
      if (res) {
        // Parse the returned string into idea objects if needed
        const resStr = String(res);
        const ideas = resStr.includes('\n')
          ? resStr.split('\n').filter(Boolean).map((line) => ({
              topic: line,
              imagePrompt: 'Profesyonel ve modern bir görsel',
              platforms: ['LinkedIn', 'Instagram'],
            }))
          : (Array.isArray(res) ? res as any[] : [{ topic: resStr, imagePrompt: 'Modern bir görsel', platforms: ['LinkedIn'] }]);
        setAiIdeas(ideas);
      }
    } catch (e) {
      console.error('Suggest ideas error:', e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleEditIdea = (idx: number, idea: any) => {
    setEditingIdeaIndex(idx);
    setEditingIdeaContent({ topic: idea.topic || '', imagePrompt: idea.imagePrompt || '' });
  };

  const handleDeleteIdea = (idx: number) => {
    setAiIdeas(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveIdeaEdit = () => {
    if (editingIdeaIndex === null) return;
    setAiIdeas(prev => prev.map((idea, i) =>
      i === editingIdeaIndex ? { ...idea, ...editingIdeaContent } : idea
    ));
    setEditingIdeaIndex(null);
  };

  const saveAiIdeas = async () => {
    setIsUploadingCsv(true);
    try {
      for (const idea of aiIdeas) {
        const platforms = Array.isArray(idea.platforms) ? idea.platforms : [idea.platform || 'LinkedIn'];
        await createSocialPost({
          platform: platforms[0],
          platforms: platforms.map((p: string) => p.toLowerCase()),
          content: idea.topic,
          hashtags: [],
          status: 'IDEA',
          groupId: 'idea_' + Date.now().toString(36),
          mediaPrompt: idea.imagePrompt,
        });
      }
      const newScheduled = aiIdeas.map((idea, i) => ({
        id: 'idea_local_' + i,
        platform: (Array.isArray(idea.platforms) ? idea.platforms[0] : idea.platform) || 'LinkedIn',
        content: idea.topic,
        status: 'IDEA',
        mediaPrompt: idea.imagePrompt,
        icon: null,
        bg: 'bg-violet-500/10',
        color: 'text-violet-400',
      }));
      setScheduledLocalPosts(prev => [...newScheduled, ...prev]);
      setAiIdeas([]);
      alert(`${newScheduled.length} fikir takvime eklendi.`);
    } catch (e) {
      console.error('Save ideas error:', e);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const savePostToDB = async () => {
    if (!studioPreview || !studioPreview.omnichannel) return;
    setIsSavingPost(true);
    try {
      const groupId = "grp_" + Date.now().toString(36);
      
      for (const platform of aiStudioParams.platforms) {
        const postData = studioPreview.omnichannel[platform];
        if (!postData) continue;
        
        const platformLabel = platform === 'linkedin' ? 'LinkedIn' : platform === 'twitter' ? 'Twitter' : platform === 'instagram' ? 'Instagram' : platform === 'facebook' ? 'Facebook' : 'Pinterest';

        const res = await createSocialPost({
          platform: platformLabel,
          platforms: aiStudioParams.platforms,
          content: postData.content,
          hashtags: postData.hashtags || [],
          groupId: groupId,
          status: 'pending',
          aiGenerationStyle: aiStudioParams.visualEngine,
          humanizedScore: aiStudioParams.humanizerScore,
          mediaUrl: studioPreview.image || undefined,
          mediaPrompt: studioPreview.mediaPrompt || undefined,
        });

        if (res.success && res.data) {
          const newPost = {
            ...res.data,
            icon: UsersIcon,
            color: "text-[#0A66C2]",
            bg: "bg-[#0A66C2]/10",
            image: studioPreview.image !== null,
            generatedAt: "Şimdi",
          };
          setPendingPosts(prev => [newPost, ...prev]);
        }
      }
      
      setStudioPreview(null);
      setActiveTab("pending");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingPost(false);
    }
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#E1306C] via-[#8B5CF6] to-[#4F8EF7] bg-clip-text text-transparent">
              Pazarlama & Sosyal Medya
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase">Elite</span>
          </h1>
          <p className="text-[#94A3B8] mt-2">İçerik planlama, reklam kampanyaları (Ads) ve kitle analitiği.</p>

          <div className="flex flex-wrap gap-2 mt-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-100">
               <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Otomatik Multi-Platform Yayın & Hata Takibi
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-100">
               <Target className="w-3.5 h-3.5 text-blue-400" /> A/B Testli Reklam Yönetimi
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-100">
               <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Brand Voice AI & Yorum Yönetimi
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => {
              const res = await syncSocialLeads();
              if (res.success) {
                alert(res.message);
              } else {
                alert('Hata: ' + res.error);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Uzman: Yorumları Müşteriye Çevir</span>
          </button>
          <button onClick={() => setIsBrandModalOpen(true)} className="flex items-center gap-2 bg-[#1A1A24] border border-white/10 hover:bg-[#2A2A35] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg">
            <Sparkles className="w-4 h-4 text-[#9A82FB]" />
            Marka Sesi
          </button>
          <button 
            onClick={() => setIsAiStudioOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            AI İçerik Stüdyosu
          </button>
        </div>
      </div>

      {/* AI Content Studio Modal */}
      {isAiStudioOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-3xl w-full max-w-6xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center bg-[#05050A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#4F8EF7] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI İçerik Stüdyosu <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-2">PRO</span></h3>
                  <p className="text-xs text-[#94A3B8]">Gelişmiş Algoritma Optimizasyonu & Önizleme</p>
                </div>
              </div>
              <button onClick={() => setIsAiStudioOpen(false)} className="p-2 text-[#64748B] hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Pane - Settings */}
              <div className="w-full md:w-[450px] border-r border-white/[0.05] p-6 overflow-y-auto space-y-6">

                {/* Konu / Topic Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-2 uppercase tracking-wider">Konu / Hook (Ana Mesaj)</label>
                  <input
                    type="text"
                    value={aiStudioParams.topic}
                    onChange={(e) => setAiStudioParams({...aiStudioParams, topic: e.target.value})}
                    placeholder="Örn: Düşük bütçeyle Meta reklam, AI web tasarım..."
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm focus:border-[#8B5CF6] outline-none placeholder:text-[#64748B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-2 uppercase tracking-wider">Hedef Platformlar</label>
                  <div className="grid grid-cols-5 gap-2 mb-8">
                    {[
                      { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
                      { id: 'instagram', label: 'Instagram', color: '#E1306C' },
                      { id: 'twitter', label: 'Twitter/X', color: '#1DA1F2' },
                      { id: 'facebook', label: 'Facebook', color: '#1877F2' },
                      { id: 'pinterest', label: 'Pinterest', color: '#E60023' }
                    ].map(platform => {
                      const isSelected = aiStudioParams.platforms.includes(platform.id);
                      return (
                        <button 
                          key={platform.id}
                          onClick={() => {
                            const newPlatforms = isSelected 
                              ? aiStudioParams.platforms.filter(p => p !== platform.id)
                              : [...aiStudioParams.platforms, platform.id];
                            if(newPlatforms.length > 0) setAiStudioParams({...aiStudioParams, platforms: newPlatforms});
                          }} 
                          className={"p-2 rounded-xl border text-center transition-all"}
                          style={isSelected ? { backgroundColor: platform.color+'1a', borderColor: platform.color+'4d', color: platform.color } : { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', color: '#64748B' }}
                        >
                          <div className="font-bold text-xs">{platform.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>


                <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#8B5CF6] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Algoritma Sırları (Hacks)
                    </label>
                    <button 
                      onClick={() => setAiStudioParams({...aiStudioParams, useAlgorithmHacks: !aiStudioParams.useAlgorithmHacks})}
                      className={`w-10 h-5 rounded-full relative transition-colors ${aiStudioParams.useAlgorithmHacks ? 'bg-[#8B5CF6]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${aiStudioParams.useAlgorithmHacks ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1">
                    {aiStudioParams.platforms[0] === 'linkedin' && (
                      <>
                        <p>✓ <strong>Link İlk Yorumda:</strong> Dışarıya link çıkışını gizler.</p>
                        <p>✓ <strong>Dwell Time (Boşluk):</strong> Kullanıcıyı yazıda daha çok tutar.</p>
                        <p>✓ <strong>Etkileşim Tuzağı:</strong> Soru ile bitirerek yorum artırır.</p>
                      </>
                    )}
                    {aiStudioParams.platforms[0] === 'instagram' && (
                      <>
                        <p>✓ <strong>Link İlk Yorumda:</strong> Tıklanabilir linki ilk yoruma sabitler.</p>
                        <p>✓ <strong>DM Otomasyonu:</strong> Yorumda belirli bir kelimeyi (örn: ANALİZ) isteyerek DM atar.</p>
                        <p>✓ <strong>Kaydetme Teşviki:</strong> Algoritma kaydetmeleri çok sever.</p>
                      </>
                    )}
                    {aiStudioParams.platforms[0] === 'twitter' && (
                      <>
                        <p>✓ <strong>Thread Kancası:</strong> İlk tweette sebebi gizler (İşte sebebi 👇).</p>
                        <p>✓ <strong>RT Teşviki:</strong> En sonda RT veya Bookmark istenir.</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-2 uppercase tracking-wider">Metin Formülü</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setAiStudioParams({...aiStudioParams, framework: 'AIDA'})} className={`p-3 rounded-xl border text-left transition-all ${aiStudioParams.framework === 'AIDA' ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-white' : 'bg-white/[0.02] border-white/[0.05] text-[#94A3B8] hover:border-white/[0.1]'}`}>
                      <div className="font-bold text-sm mb-1">AIDA Modeli</div>
                      <div className="text-[10px]">Dikkat, İlgi, Arzu, Eylem. Dönüşüm odaklı.</div>
                    </button>
                    <button onClick={() => setAiStudioParams({...aiStudioParams, framework: 'PAS'})} className={`p-3 rounded-xl border text-left transition-all ${aiStudioParams.framework === 'PAS' ? 'bg-[#4F8EF7]/10 border-[#4F8EF7]/30 text-white' : 'bg-white/[0.02] border-white/[0.05] text-[#94A3B8] hover:border-white/[0.1]'}`}>
                      <div className="font-bold text-sm mb-1">PAS Modeli</div>
                      <div className="text-[10px]">Problem, Kışkırtma, Çözüm. Ağrı noktası.</div>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Görsel (AI veya Manuel Yükle)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={() => setAiStudioParams({...aiStudioParams, visualEngine: 'google_ai_pro'})} className={`p-2 rounded-lg border text-center transition-all ${aiStudioParams.visualEngine === 'google_ai_pro' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.02] border-white/[0.05] text-[#64748B]'}`}>
                      <div className="font-bold text-xs">Google AI Pro (Imagen)</div>
                    </button>
                    <button onClick={() => setAiStudioParams({...aiStudioParams, visualEngine: 'none'})} className={`p-2 rounded-lg border text-center transition-all ${aiStudioParams.visualEngine === 'none' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.05] text-[#64748B]'}`}>
                      <div className="font-bold text-xs">Sadece Metin</div>
                    </button>
                  </div>
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-4 flex flex-col items-center justify-center bg-white/[0.01] hover:border-white/[0.2] transition-colors cursor-pointer relative overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setAiStudioParams({...aiStudioParams, customImage: e.target?.result as string});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <ImagePlus className="w-6 h-6 text-[#64748B] mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-white mb-1">Kendi Görselini Yükle</p>
                    <p className="text-[10px] text-[#94A3B8] text-center">AI Görseli yerine kullanılır. (Maks 5MB)</p>
                  </div>
                </div>

                <button 
                  onClick={generatePreview}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50"
                >
                  {isGenerating ? "İçerik Analiz Ediliyor & Üretiliyor..." : <><Sparkles className="w-5 h-5" /> İçerik Üret & Önizle</>}
                </button>
              </div>

              {/* Right Pane - Preview */}
              <div className="hidden md:flex flex-1 bg-[#05050A] p-8 flex-col items-center justify-center relative overflow-y-auto">
                {!studioPreview ? (
                  <div className="text-center text-[#64748B]">
                    <MonitorSmartphone className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-white mb-1">Önizleme Alanı</p>
                    <p className="text-sm">Ayarları yapılandırıp "İçerik Üret & Önizle" butonuna tıklayın.</p>
                  </div>
                ) : (
                  <div className="w-[360px] bg-white rounded-[32px] p-2 shadow-2xl border-4 border-white/10 relative">
                    <div className="bg-[#121212] w-full h-full rounded-[24px] overflow-hidden flex flex-col max-h-[600px] overflow-y-auto no-scrollbar">
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] p-[2px]">
                          <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center text-[10px] font-bold text-white">SWF</div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">StarWebFlow</p>
                          <p className="text-[10px] text-white/50">{aiStudioParams.platforms[0] === 'linkedin' ? 'Sponsorlu' : '@starwebflow'}</p>
                        </div>
                        <MoreHorizontal className="w-5 h-5 text-white/50 ml-auto" />
                      </div>
                      
                      {studioPreview.image && (
                        <div style={{ height: '360px', minHeight: '360px', width: '100%' }} className="bg-[#1A1A1A] relative flex items-center justify-center overflow-hidden">
                          <img src={studioPreview.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}


                      <div className="p-4">
                        <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{studioPreview.omnichannel?.[aiStudioParams.platforms[0]]?.content || ''}</p>
                        
                        {(aiStudioParams.platforms[0] === 'linkedin' || aiStudioParams.platforms[0] === 'instagram') && aiStudioParams.useAlgorithmHacks && (
                          <div className="mt-4 bg-white/5 p-3 rounded-md border border-emerald-500/30">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Algoritma Dostu İlk Yorum (Otomatik Eklenecek)</p>
                            </div>
                            <p className="text-xs text-white/70">Sistem yayın sonrası +15 dk içinde Ghost hesaptan bu yorumu otomatik atar.</p>
                          </div>
                        )}

                        {studioPreview?.model && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className="text-[9px] bg-[#8B5CF6]/10 text-[#8B5CF6] px-2 py-0.5 rounded-full border border-[#8B5CF6]/20 font-mono">
                              ⚡ {studioPreview.model}
                            </span>
                          </div>
                        )}
                        
                        {aiStudioParams.platforms[0] === 'instagram' && aiStudioParams.useAlgorithmHacks && (
                          <div className="mt-4 flex gap-2">
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-1 rounded font-bold border border-rose-500/30">🔥 Algoritma Puanı: 98/100 (DM Otomasyonu & Kaydetme Teşviki)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.05] bg-[#05050A] flex items-center justify-between gap-3">
              <div className="text-[10px] text-[#64748B]">
                {studioPreview?.model && studioPreview.model !== 'demo' && studioPreview.model !== 'demo-fallback' ? (
                  <span className="text-emerald-400">✅ DB&apos;ye kaydedilecek</span>
                ) : studioPreview?.model === 'demo' || studioPreview?.model === 'demo-fallback' ? (
                  <span className="text-amber-400">⚠️ Demo mod (API key girin)</span>
                ) : null}
              </div>
              <button 
                onClick={savePostToDB}
                disabled={!studioPreview || isSavingPost}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingPost ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kaydediliyor...</>
                ) : (
                  <><Check className="w-4 h-4" /> DB&apos;ye Kaydet & Planla</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit & Preview Modal */}
      {isEditModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center bg-[#05050A]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><PenTool className="w-5 h-5 text-[#8B5CF6]"/> Post Düzenle & Önizle</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-[#64748B] hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Pane - Editor */}
              <div className="flex-1 border-r border-white/[0.05] p-6 overflow-y-auto space-y-6">
                {editingPost.status === 'IDEA' && (
                  <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[#8B5CF6] text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4"/> Bu bir Fikir (IDEA)</h4>
                        <p className="text-xs text-[#94A3B8] mt-1">İçeriği ve görseli AI ile otomatik üretebilirsiniz.</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setIsGenerating(true);
                        try {
                          const res = await generateAIContent({
                            framework: 'PAS',
                            platforms: [editingPost.platform.toLowerCase()],
                            topic: editingPost.content,
                            humanizerScore: 85,
                            visualEngine: 'google_ai_pro',
                            imagePrompt: editingPost.mediaPrompt,
                          });
                          if (res.success && (res as any).content) {
                            setEditingPost((prev: any) => ({
                              ...prev,
                              content: (res as any).content,
                              mediaUrl: (res as any).mediaUrl || prev.mediaUrl,
                              mediaPrompt: (res as any).mediaPrompt || prev.mediaPrompt,
                              image: (res as any).mediaUrl !== null,
                              status: 'scheduled', // Change status so it's ready
                            }));
                          } else {
                            alert("Hata: " + (res as any).error);
                          }
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      disabled={isGenerating}
                      className="w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? "Üretiliyor..." : "AI İle İçerik ve Görsel Üret"}
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">Metin İçeriği</label>
                  <textarea 
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    className="w-full h-48 bg-white/[0.02] border border-white/[0.1] rounded-xl p-4 text-white text-sm focus:border-[#8B5CF6] outline-none resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-[#64748B]">{editingPost.content?.length || 0} karakter</span>
                    <button onClick={addHashtags} className="text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#8B5CF6]/20 transition-colors">
                      <Hash className="w-3 h-3" /> Hashtag Üret
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">Görsel (Watermark Otomatik Eklenecektir)</label>
                  <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 flex flex-col items-center justify-center bg-white/[0.01] hover:border-white/[0.2] transition-colors cursor-pointer relative overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setEditingPost({...editingPost, mediaUrl: e.target?.result as string, image: true});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <ImagePlus className="w-8 h-8 text-[#64748B] mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-white">Görsel Yükle veya Değiştir</p>
                    <p className="text-[10px] text-[#94A3B8] mt-1">Sistem otomatik olarak StarWebFlow logosunu sağ alt köşeye ekler.</p>
                  </div>
                  {editingPost.mediaPrompt && (
                    <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-[10px] text-[#94A3B8] font-semibold mb-1">AI Görsel Promptu:</p>
                      <p className="text-xs text-white italic">"{editingPost.mediaPrompt}"</p>
                    </div>
                  )}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-emerald-400 text-sm font-bold">Platform Optimizasyonu Aktif</h4>
                    <p className="text-xs text-[#94A3B8] mt-1">İçeriğiniz {editingPost.platform} algoritmasına uygun olarak optimize edildi (Link konumu, boyutlar).</p>
                  </div>
                </div>

                {/* Tracked Link Generator */}
                <div className="bg-[#1A1A2E] border border-white/10 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                    <MousePointer className="w-4 h-4 text-[#4F8EF7]" /> Müşteri Takip Linki Üret
                  </h4>
                  <p className="text-xs text-[#94A3B8] mb-4">
                    Bu posta özel bir izleme linki ekleyin. Tıklayanların çerezleri (cookies) kaydedilir ve etkileşimleri takip edilerek Leads (Müşteri Adayı) profiline entegre edilir.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const res = await generateTrackedLink({
                          originalUrl: 'https://starwebflow.com/contact',
                          postId: editingPost.id,
                          utmSource: editingPost.platform || 'social',
                          utmMedium: 'post',
                          utmCampaign: 'lead_magnet'
                        });
                        if (res.success && res.url) {
                          setTrackedLinkUrl(res.url);
                          // Optionally append to content automatically:
                          setEditingPost((prev: any) => ({
                            ...prev,
                            content: (prev.content || '') + '\n\n🔗 Daha fazlası için: ' + res.url
                          }));
                        } else {
                          alert('Link üretilemedi: ' + res.error);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> Tracked Link Üret & Ekle
                    </button>
                  </div>
                  {trackedLinkUrl && (
                    <div className="mt-3 p-2 bg-white/5 border border-white/10 rounded-md">
                      <p className="text-[10px] text-[#94A3B8] font-semibold mb-1">Üretilen Link (İçeriğe eklendi):</p>
                      <p className="text-xs text-[#4F8EF7] font-mono break-all">{trackedLinkUrl}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pane - Preview */}
              <div className="w-[400px] bg-[#05050A] p-8 flex flex-col items-center overflow-y-auto">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg mb-8">
                  {['linkedin', 'instagram', 'twitter'].map(platform => (
                    <button 
                      key={platform}
                      onClick={() => setSelectedPreviewPlatform(platform as any)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${selectedPreviewPlatform === platform ? 'bg-white text-black' : 'text-[#94A3B8] hover:text-white'}`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                {/* Simulated Phone Frame */}
                <div className="w-[320px] bg-white rounded-[32px] p-2 shadow-2xl border-4 border-white/10 relative">
                  <div className="bg-[#121212] w-full h-full rounded-[24px] overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] p-[2px]">
                        <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center text-[10px] font-bold text-white">SWF</div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">StarWebFlow</p>
                        <p className="text-[10px] text-white/50">{selectedPreviewPlatform === 'linkedin' ? 'Sponsorlu' : '@starwebflow'}</p>
                      </div>
                    </div>
                    
                    {editingPost.image && (
                      <div className="w-full aspect-square bg-[#1A1A1A] relative flex items-center justify-center overflow-hidden">
                        {editingPost.mediaUrl ? (
                          <img src={editingPost.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-white/20" />
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] font-bold text-white flex items-center gap-1">
                          <Sparkles className="w-2 h-2 text-[#8B5CF6]" /> STARWEBFLOW
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <p className="text-sm text-white whitespace-pre-wrap">{editingPost.content}</p>
                      {selectedPreviewPlatform === 'linkedin' && (
                        <div className="mt-4 bg-white/5 p-3 rounded-md border border-white/10">
                          <p className="text-[10px] text-white/60 mb-1">StarWebFlow</p>
                          <p className="text-xs text-white">Yorum 1: "Detaylar ve ücretsiz analiz için sitemizi ziyaret edin: starwebflow.com/analiz"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.05] bg-[#05050A] flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-white/[0.1] text-white text-sm font-bold hover:bg-white/5 transition-colors">Vazgeç</button>
              <button onClick={() => {
                setPendingPosts(prev => prev.map(p => p.id === editingPost.id ? editingPost : p));
                setIsEditModalOpen(false);
              }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white text-sm font-bold hover:opacity-90 flex items-center gap-2">
                <Check className="w-4 h-4" /> Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.05] pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: "pending", label: "AI Postları", count: pendingPosts.length },
          { id: "scheduled", label: "Takvim", count: scheduledLocalPosts.length },
          { id: "published", label: "Yayınlananlar", count: 2 },
          { id: "ads", label: "Reklam Yönetimi (Ads)", count: ads.length || 2 },
          { id: "audience", label: "Kitle Analitiği", count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white/[0.05] text-white border border-white/[0.1]"
                : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.02]"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-[#8B5CF6] text-white" : "bg-white/[0.05] text-[#64748B]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* PENDING / AI STUDIO */}
        {activeTab === "pending" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingPosts.map((post) => {
              const Icon = post.icon || MessageCircle;
              const bgClass = post.bg || "bg-white/10";
              const colorClass = post.color || "text-white";
              return (
              <div key={post.id} className="bg-[#0A0A0F]/80 border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.1] transition-colors relative group">
                <div className="absolute top-0 right-0 p-6 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgClass}`}>
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">AI Tarafından Oluşturuldu</span>
                    <span className="text-xs text-[#64748B] ml-2">• {post.generatedAt || "Şimdi"}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border mb-4 bg-white/[0.02] border-white/5 relative">
                  <p className="text-[#E2E8F0] whitespace-pre-wrap text-sm leading-relaxed mb-3 line-clamp-4">{post.content}</p>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none"></div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-5 border-t border-white/[0.05]">
                  <button onClick={() => handleDeletePost(post.id, false)} className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 text-rose-500 transition-colors flex-shrink-0" title="Sil">
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEditModal(post)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-white text-xs font-bold transition-colors">
                    <PenTool className="w-4 h-4" /> Düzenle
                  </button>
                  <button 
                    onClick={async () => {
                      // UUID formatındaysa gerçek DB kaydıdır, güncelle
                      const isDbRecord = /^[0-9a-f-]{36}$/.test(post.id);
                      if (isDbRecord) {
                        const res = await updateSocialPost(post.id, { status: 'scheduled' });
                        if (res.success && res.data) {
                          setPendingPosts(prev => prev.filter(p => p.id !== post.id));
                          setScheduledLocalPosts(prev => [res.data, ...prev]);
                        }
                      } else {
                        // UI-only post (henüz DB'ye yazılmadı)
                        setPendingPosts(prev => prev.filter(p => p.id !== post.id));
                        setScheduledLocalPosts(prev => [{...post, status: 'scheduled'}, ...prev]);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold hover:opacity-90 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Onayla (Planla)
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* SCHEDULED & BULK UPLOAD */}
        {activeTab === "scheduled" && (
          <div className="space-y-6 animate-in fade-in">
            {/* CSV UPLOAD ZONE */}
            <div className="mb-4 p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-[#64748B] hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 transition-all cursor-pointer bg-white/[0.01] relative group">
               <input 
                 type="file" 
                 accept=".csv" 
                 onChange={handleFileUpload}
                 disabled={isUploadingCsv}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
               />
               <UploadCloud className={`w-10 h-10 mb-3 text-[#8B5CF6] ${isUploadingCsv ? 'animate-bounce' : ''}`} />
               <p className="font-bold text-white text-lg">
                 {isUploadingCsv ? 'İçerikler Üretiliyor (Lütfen bekleyin)...' : 'Toplu İçerik Takvimi Yükle (.csv)'}
               </p>
               <p className="text-sm mt-1 text-center max-w-md">"Konu, Platform, Tarih" içeren CSV dosyanızı buraya sürükleyin. AI tüm içerikleri taslak olarak otomatik üretsin.</p>
               <button className="mt-4 px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg disabled:opacity-50">
                 {isUploadingCsv ? 'İşleniyor...' : 'Dosya Seç'}
               </button>
            </div>

            {/* AI IDEATION ZONE */}
            <div className="mb-4 p-8 border border-violet-500/20 rounded-2xl bg-violet-500/5 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" /> AI İle Fikir Üret
                  </h3>
                  <p className="text-sm text-[#94A3B8] mt-1">Excel uğraşmak istemiyor musunuz? AI sizin için projeye uygun 5 adet içerik fikri ve görsel promptu hazırlasın.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Opsiyonel: Odaklanılacak bir konu girin (Örn: Web Tasarım Trendleri)" 
                  value={topicContext}
                  onChange={e => setTopicContext(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-violet-500/50 outline-none"
                />
                <button 
                  onClick={handleSuggestIdeas}
                  disabled={isSuggesting}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {isSuggesting ? 'Üretiliyor...' : 'Fikir Üret'}
                </button>
              </div>

              {aiIdeas.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold text-white mb-2">Üretilen Fikirler</h4>
                  {aiIdeas.map((idea, idx) => {
                    const platforms = Array.isArray(idea.platforms) ? idea.platforms : [idea.platform || "LinkedIn"];
                    
                    if (editingIdeaIndex === idx) {
                      return (
                        <div key={idx} className="bg-black/40 p-4 rounded-xl border border-violet-500/50">
                          <input 
                            type="text" 
                            value={editingIdeaContent.topic} 
                            onChange={e => setEditingIdeaContent({...editingIdeaContent, topic: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 outline-none mb-2"
                          />
                          <textarea 
                            value={editingIdeaContent.imagePrompt} 
                            onChange={e => setEditingIdeaContent({...editingIdeaContent, imagePrompt: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 outline-none min-h-[60px]"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingIdeaIndex(null)} className="px-3 py-1 bg-white/10 text-white text-xs rounded-md">İptal</button>
                            <button onClick={handleSaveIdeaEdit} className="px-3 py-1 bg-violet-600 text-white text-xs rounded-md">Kaydet</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                    <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors group relative">
                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button onClick={() => handleEditIdea(idx, idea)} className="text-[#64748B] hover:text-white"><PenTool className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteIdea(idx)} className="text-[#64748B] hover:text-rose-500"><XCircle className="w-4 h-4" /></button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {platforms.map((plat: string, pIdx: number) => (
                          <span key={pIdx} className="text-xs font-bold px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
                            {plat}
                          </span>
                        ))}
                      </div>
                      <h5 className="text-sm font-bold text-white mb-2 leading-relaxed">{idea.topic}</h5>
                      <div className="bg-white/5 p-3 rounded-lg flex items-start gap-3">
                        <ImagePlus className="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-[#94A3B8] leading-relaxed italic">{idea.imagePrompt}</p>
                      </div>
                    </div>
                  )})}
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={saveAiIdeas}
                      disabled={isUploadingCsv}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Onayla ve Takvime IDEA Olarak Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setCalendarViewMode("grid")} className={`p-2 rounded-lg transition-colors ${calendarViewMode === 'grid' ? 'bg-white/10 text-white' : 'text-[#64748B] hover:bg-white/5'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setCalendarViewMode("list")} className={`p-2 rounded-lg transition-colors ${calendarViewMode === 'list' ? 'bg-white/10 text-white' : 'text-[#64748B] hover:bg-white/5'}`}><List className="w-4 h-4" /></button>
            </div>

            {calendarViewMode === "list" ? (
              <div className="grid grid-cols-1 gap-4">
                {scheduledLocalPosts.map((post) => {
                  const Icon = post.icon || Clock;
                  const bgClass = post.bg || "bg-white/10";
                  const colorClass = post.color || "text-white";
                  return (
                  <div key={post.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-5 flex items-center gap-6 group hover:border-white/[0.1] transition-colors">
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${bgClass}`}><Icon className={`w-6 h-6 ${colorClass}`} /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-white">{post.platform} Postu</span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20"><Clock className="w-3 h-3" />{post.scheduledFor ? new Date(post.scheduledFor).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : "Yakında"}</span>
                        {post.status === 'FAILED' && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20"><XCircle className="w-3 h-3" /> Yayın Hatası</span>
                        )}
                        {post.status === 'IDEA' ? (
                           <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20"><Sparkles className="w-3 h-3" /> Zamanı Gelince Üretilecek</span>
                        ) : post.status !== 'FAILED' && (
                           <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"><MessageCircle className="w-3 h-3" /> Ghost Yorum (+15dk)</span>
                        )}
                      </div>
                      <p className="text-sm text-[#94A3B8] line-clamp-1">{post.content}</p>
                      {post.publishError && (
                        <p className="text-xs text-rose-400 mt-2 p-2 bg-rose-500/10 rounded-md border border-rose-500/20">Sistem Uyarısı: {post.publishError}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {post.status !== 'IDEA' && (
                        <button 
                          onClick={async () => {
                            const res = await publishSocialPost(post.id);
                            if (res.success && res.data) {
                              window.location.reload();
                            } else {
                              alert("Yayınlama Hatası: " + res.error);
                              setScheduledLocalPosts(prev => prev.map(p => p.id === post.id ? {...p, status: 'FAILED', publishError: res.error} : p));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors" 
                          title="Hemen Yayınla (Simülasyon)"
                        >
                          Yayınla
                        </button>
                      )}
                      <button onClick={() => openEditModal(post)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors" title="Düzenle"><PenTool className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePost(post.id, true)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors" title="Sil"><XCircle className="w-4 h-4" /></button>
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-7 border-b border-white/[0.05] bg-white/[0.02]">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <div key={day} className="p-3 text-center text-xs font-semibold text-[#64748B]">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 grid-rows-5 auto-rows-[100px] divide-x divide-y divide-white/[0.05]">
                  {Array.from({length: 35}).map((_, i) => {
                    const dayNum = i - 2;
                    const isToday = dayNum === 14;
                    const hasPost = dayNum === 15;
                    if (dayNum < 1 || dayNum > 30) return <div key={i} className="bg-[#05050A]"></div>;
                    return (
                      <div key={i} className={`p-2 relative group hover:bg-white/[0.02] transition-colors ${isToday ? 'bg-white/[0.05]' : ''}`}>
                        <span className={`text-xs font-medium ${isToday ? 'text-white bg-[#4F8EF7] w-6 h-6 flex items-center justify-center rounded-full' : 'text-[#64748B]'}`}>{dayNum}</span>
                        {hasPost && <div className="mt-2 text-[10px] bg-[#E1306C]/10 border border-[#E1306C]/20 text-[#E1306C] p-1.5 rounded truncate font-medium flex items-center gap-1"><Camera className="w-3 h-3 flex-shrink-0" /> 14:00 Instagram</div>}
                        <button className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity"><Plus className="w-5 h-5 text-white" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PUBLISHED & FEEDBACK LOOP */}
        {activeTab === "published" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[#0A0A0F] p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-emerald-400" /> Dönüşüm ve Performans Analizi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 text-[#94A3B8] mb-2"><MousePointer className="w-4 h-4"/> Toplam Tıklama</div>
                  <div className="text-3xl font-black text-emerald-400">{analytics.clicks.toLocaleString()}</div>
                  <div className="text-xs text-[#64748B] mt-2">Kısa linkler (Tracked Links) üzerinden gelen tıklamalar.</div>
                </div>
                <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-[#94A3B8] mb-2"><UsersIcon className="w-4 h-4"/> Tekil Ziyaretçi</div>
                  <div className="text-3xl font-black text-blue-400">{analytics.visitors.toLocaleString()}</div>
                  <div className="text-xs text-[#64748B] mt-2">Benzersiz çerez (cookie) atanan ziyaretçi sayısı.</div>
                </div>
                <div className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-[#94A3B8] mb-2"><Activity className="w-4 h-4"/> Kazanılan Müşteri (Lead)</div>
                  <div className="text-2xl font-black text-fuchsia-400">+{analytics.leads}</div>
                  <div className="text-xs text-[#64748B] mt-2">Tıklamaların form doldurarak dönüştüğü kişi sayısı.</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-transparent p-6 rounded-xl border border-[#8B5CF6]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><Sparkles className="w-24 h-24 text-[#8B5CF6] opacity-10 blur-xl" /></div>
                <h4 className="text-[#8B5CF6] font-bold flex gap-2 mb-2"><Sparkles className="w-5 h-5"/> AI İçerik Önerisi (Feedback Loop)</h4>
                <p className="text-sm text-white/80 max-w-3xl leading-relaxed mb-4">Geçen hafta LinkedIn'de paylaştığınız B2B içerikler, normalden %40 daha fazla "Lead" form doldurulmasını sağladı. Özellikle "PAS Framework" kullandığınız postlar başarılı oldu. Bir sonraki hafta için "E-ticaret dönüşüm optimizasyonu" temalı 3 yeni post üretmek ister misiniz?</p>
                <button className="text-sm font-bold bg-[#8B5CF6] px-5 py-2.5 rounded-xl text-white hover:bg-[#8B5CF6]/80 transition-colors">Önerilen İçerikleri Üret & Planla</button>
              </div>
            </div>
          </div>
        )}

        {/* ADS MANAGEMENT */}
        {activeTab === "ads" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Advanced Ads Control Panel */}
            <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2"><Target className="w-5 h-5 text-blue-400" /> Senior Ads Controller</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">Gelişmiş eşleştirme, CAPI ve otonom bütçe yönetimi aktif.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold border border-blue-500/20 hover:bg-blue-500/20 transition-colors">+ Soğuk Kitle (Awareness)</button>
                  <button className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold border border-purple-500/20 hover:bg-purple-500/20 transition-colors">+ LAL (%1 Benzer Hedef)</button>
                  <button className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-colors">+ Retargeting (Sıcak Kitle)</button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl flex justify-between items-center">
                 <div>
                    <h4 className="text-emerald-400 font-bold flex gap-2"><Server className="w-4 h-4"/> Meta CAPI (Conversions API) Aktif & Advanced Matching Onaylı</h4>
                    <p className="text-xs text-[#94A3B8] mt-1">iOS 14+ kısıtlamalarını aşmak için 1st-party müşteri verileri (email, tel) yasalara uygun olarak (SHA-256) doğrudan Meta sunucularına aktarılmaktadır. Veri kaybı: %0</p>
                 </div>
                 <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.3)]"><div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full"></div></div>
              </div>
            </div>

            {/* Ads Stats & Thresholds (From previous code) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {(() => {
                const totalSpent = ads.reduce((sum, ad) => sum + (ad.spent || 0), 0);
                const totalRevenue = ads.reduce((sum, ad) => sum + (ad.revenue || 0), 0);
                const totalReach = ads.reduce((sum, ad) => sum + (ad.reach || 0), 0);
                const totalConversions = ads.reduce((sum, ad) => sum + (ad.conversions || 0), 0);
                const avgRoas = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(1) : "0.0";
                const cpa = totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : "0.00";
                const formatReach = (num: number) => num >= 1000 ? (num/1000).toFixed(1) + 'K' : num.toString();

                return (
                  <>
                    <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl"><div className="flex items-center gap-3 mb-2"><DollarSign className="w-5 h-5 text-emerald-400" /><h3 className="text-sm font-medium text-[#94A3B8]">Toplam Harcama</h3></div><p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p></div>
                    <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl"><div className="flex items-center gap-3 mb-2"><Target className="w-5 h-5 text-blue-400" /><h3 className="text-sm font-medium text-[#94A3B8]">Ortalama ROAS</h3></div><p className="text-2xl font-bold text-white">{avgRoas}x</p></div>
                    <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl"><div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-fuchsia-400" /><h3 className="text-sm font-medium text-[#94A3B8]">Erişim</h3></div><p className="text-2xl font-bold text-white">{formatReach(totalReach)}</p></div>
                    <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl"><div className="flex items-center gap-3 mb-2"><Activity className="w-5 h-5 text-rose-400" /><h3 className="text-sm font-medium text-[#94A3B8]">Dönüşüm Maliyeti (CPA)</h3></div><p className="text-2xl font-bold text-white">${cpa}</p></div>
                  </>
                );
              })()}
            </div>

            <div className="bg-gradient-to-r from-[#0A0A0F] to-[#0A0A0F]/80 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 p-4"><span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-md font-bold flex items-center gap-1 animate-pulse"><Activity className="w-3 h-3" /> OTOMASYON AKTİF</span></div>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-amber-500" /> AI Optimizasyon & Bütçe Eşikleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"><div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2"><XCircle className="w-4 h-4" /> KAYIP ÖNLEME (KILL-SWITCH)</div><p className="text-xs text-[#94A3B8] mb-3">ROAS &lt; 1.5x ve Harcama &gt; $50 ise kampanya otomatik durdurulur.</p><div className="text-[10px] font-mono text-white bg-black/40 px-2 py-1 rounded inline-block border border-rose-500/20">2 Kampanya Kapatıldı</div></div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4"><div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2"><TrendingUp className="w-4 h-4" /> ADVANTAGE+ ÖLÇEKLEME</div><p className="text-xs text-[#94A3B8] mb-3">Tek Geniş (Broad) kampanya. ROAS &gt; 3.0x ise bütçe otonom olarak %20 artırılır.</p><button className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">1 Teklif Onaylandı</button></div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2">
                    <MessageSquare className="w-4 h-4" /> CREATIVE FATIGUE
                  </div>
                  <p className="text-xs text-[#94A3B8] mb-3">
                    Hook Rate &lt; %15 düşerse Google AI Pro (Imagen) ile yepyeni bir görsel (A/B Testi) üretilir.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block border border-blue-500/20">
                      Sistem Sağlıklı
                    </div>
                    <button 
                      onClick={async () => {
                        // Find an active ad and fatigue it
                        const activeAd = ads.find((a: any) => a.status === 'active');
                        if (activeAd) {
                          alert(`${activeAd.name} kampanyasında yorgunluk (Ad Fatigue) tespit edildi. Durdurulup yeni AI creative siparişi verilecek.`);
                          setAds(prev => prev.map((a: any) => 
                            a.id === activeAd.id ? { ...a, status: 'paused', hookRate: 12.5, ctr: 1.1 } : a
                          ));
                          // Generate new ad concept
                          const res = await createAdCampaign({
                            name: `${activeAd.name} - (AI Auto-Refresh)`,
                            platform: activeAd.platform,
                            status: 'draft',
                            spend: 0,
                            roas: 0,
                            hookRate: 0,
                            ctr: 0
                          });
                          if (res.success && res.data) {
                            setAds(prev => [res.data, ...prev]);
                            alert(`Yeni AI Creative draft olarak eklendi: ${res.data.name}`);
                          }
                        } else {
                          alert("Aktif reklam kampanyası bulunamadı, önce bir strateji başlatın.");
                        }
                      }}
                      className="text-[10px] text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded border border-blue-500/20 transition-colors"
                    >
                      Simüle Et
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 mt-4">
                <div className="bg-gradient-to-r from-fuchsia-500/10 to-transparent border border-fuchsia-500/20 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 text-fuchsia-400 text-sm font-bold mb-1"><Target className="w-4 h-4" /> 1-Cent Video Retargeting (Lead Magnet)</div>
                    <p className="text-xs text-[#94A3B8]">Eğitici Reels videonuzu %50'den fazla izleyen kitleye otomatik olarak "Ücretsiz SEO Analizi" teklifi çıkılır. Hedeflenen Maliyet: $2/Gün</p>
                  </div>
                  <button 
                    onClick={async () => {
                      const res = await createAdCampaign({
                        // tenantId artık server action içinde otomatik çözümleniyor
                        name: '1-Cent Video Retargeting (Lead Magnet)',
                        platform: 'Meta',
                        status: 'active',
                        spend: 0,
                        roas: 0,
                        hookRate: 22.5,
                        ctr: 3.8
                      });
                      if (res.success && res.data) {
                        setAds(prev => [res.data, ...prev]);
                      }
                    }}
                    className="text-[10px] font-bold text-white bg-fuchsia-500 hover:bg-fuchsia-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    Stratejiyi Başlat
                  </button>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="bg-white/[0.02] text-[#64748B]">
                     <th className="p-4 font-medium">Kampanya Adı</th>
                     <th className="p-4 font-medium">Durum</th>
                     <th className="p-4 font-medium">Harcama</th>
                     <th className="p-4 font-medium">ROAS</th>
                     <th className="p-4 font-medium">Hook Rate</th>
                     <th className="p-4 font-medium text-right">Otomasyon</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.05]">
                    {ads.map((ad: any, i) => (
                      <tr key={ad.id || i} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-medium text-white">{ad.name}</td>
                        <td className="p-4"><span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold">{ad.status.toUpperCase()}</span></td>
                        <td className="p-4 text-white">${Number(ad.spend).toLocaleString()}</td>
                        <td className="p-4 text-emerald-400 font-medium">{Number(ad.roas).toFixed(1)}x</td>
                        <td className="p-4 text-emerald-400 font-medium">%{(ad.hookRate || 0).toFixed(1)}</td>
                        <td className="p-4 text-right"><button className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">Bütçe Artır (Scale)</button></td>
                      </tr>
                    ))}
                    {ads.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#94A3B8]">Henüz reklam kampanyası bulunmuyor.</td>
                      </tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* AUDIENCE INSIGHTS */}
        {activeTab === "audience" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Demografi Dağılımı
              </h3>
              <div className="space-y-4">
                <div><div className="flex justify-between text-xs text-[#94A3B8] mb-1"><span>25-34 Yaş (Profesyoneller)</span><span className="text-white">45%</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div></div></div>
                <div><div className="flex justify-between text-xs text-[#94A3B8] mb-1"><span>18-24 Yaş (Genç Yetenekler)</span><span className="text-white">30%</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{width: '30%'}}></div></div></div>
              </div>
            </div>

            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4"><span className="text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-1 rounded-md font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI INSIGHT</span></div>
              <h3 className="font-semibold text-white mb-6">Kitle Davranış Analizi</h3>
              <div className="space-y-4 text-sm text-[#94A3B8]">
                <p>🔹 <strong className="text-white">Etkileşim Saati:</strong> Kitleniz Salı ve Perşembe 14:00 - 16:00 arası aktif.</p>
                <p>🔹 <strong className="text-white">İçerik Tipi:</strong> Kısa video formatındaki içerikleriniz organik erişimi katlıyor.</p>
                <button className="mt-4 w-full py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl text-white hover:bg-white/[0.05] text-xs font-semibold">Detaylı Rapor Oluştur (PDF)</button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 mt-2 bg-[#0A0A0F] p-8 rounded-2xl border border-white/5">
               <h3 className="font-bold text-white mb-6 flex items-center gap-2"><ArrowRight className="w-5 h-5 text-[#8B5CF6]"/> Dönüşüm Yolculuğu (Omnichannel Path)</h3>
               <p className="text-xs text-[#94A3B8] mb-6">Müşterilerinizin sosyal medyadan siteye ve email kampanyalarına geçiş haritası.</p>
               
               <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-[#94A3B8] relative">
                  <div className="flex-1 p-6 bg-white/5 rounded-xl border border-white/10 text-center relative z-10 w-full">
                    <div className="w-10 h-10 mx-auto bg-[#E1306C]/20 text-[#E1306C] rounded-full flex items-center justify-center mb-3"><Camera className="w-5 h-5"/></div>
                    <span className="font-bold text-white text-sm block mb-1">1. Keşif (Social)</span>
                    Kullanıcı Instagram Reel videosunu izler.
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />
                  
                  <div className="flex-1 p-6 bg-white/5 rounded-xl border border-white/10 text-center relative z-10 w-full">
                    <div className="w-10 h-10 mx-auto bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-3"><MousePointer className="w-5 h-5"/></div>
                    <span className="font-bold text-white text-sm block mb-1">2. Aksiyon (Web)</span>
                    "Bio'daki Link" ile Fiyatlar sayfasına girer ama çıkış yapar.
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />
                  
                  <div className="flex-1 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center relative z-10 w-full shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="w-10 h-10 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3"><Mail className="w-5 h-5"/></div>
                    <span className="font-bold text-white text-sm block mb-1">3. Dönüşüm (Email & Retargeting)</span>
                    CAPI + Advanced Matching kullanılarak sepette/sayfada kalan kullanıcıya otomatik "Özel İndirim" e-postası ve Meta Retargeting reklamı gösterilir.
                  </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
