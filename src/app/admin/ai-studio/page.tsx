'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Image as ImageIcon, Video, FileText, Volume2, Bookmark, 
  Loader2, Download, Copy, Check, Wand2, Share2, Play, Music, ArrowRight
} from 'lucide-react';

type ContentType = 'blog' | 'email' | 'proposal' | 'social';
type Tab = 'image' | 'video' | 'content' | 'voice' | 'presets';

const brandPresets = [
  {
    id: 'hero-banner',
    title: '🚀 Kurumsal Hero Görseli',
    category: 'Tasarım',
    prompt: 'Ultra-modern 3D glassmorphism web agency landing page hero section background, dark mode neon purple and cyan lighting, 8k resolution cinematic render',
    aspect: '16:9'
  },
  {
    id: 'linkedin-carousel',
    title: '💼 LinkedIn Carousel Görseli',
    category: 'Sosyal Medya',
    prompt: 'Minimalist corporate infographic background with gradient glass cards, professional clean typography space, isometric tech illustration',
    aspect: '1:1'
  },
  {
    id: 'product-3d',
    title: '📦 3D Ürün ve Yazılım Mockup',
    category: 'Pazarlama',
    prompt: 'Sleek dark laptop displaying futuristic SaaS dashboard analytics with holographic floating charts, studio lighting, photorealistic',
    aspect: '4:5'
  },
  {
    id: 'ad-banner',
    title: '📢 Sosyal Medya Reklam Banner',
    category: 'Reklam',
    prompt: 'High-converting Instagram story ad template background, vibrant gradient glow, futuristic agency aesthetic, 9:16 aspect ratio',
    aspect: '9:16'
  }
];

export default function AIStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('image');

  // ─── Görsel Durumu ───────────────────────────────────────────────────────
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspect, setImageAspect] = useState('16:9');
  const [imageStyle, setImageStyle] = useState('8k-cinematic');
  const [imageLoading, setImageLoading] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ base64: string; mimeType: string }[]>([]);
  const [imageError, setImageError] = useState('');

  // ─── Video Durumu ────────────────────────────────────────────────────────
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState('16:9');
  const [videoFast, setVideoFast] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  // ─── İçerik Durumu ──────────────────────────────────────────────────────
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [contentTopic, setContentTopic] = useState('');
  const [contentTone, setContentTone] = useState('ikna-edici');
  const [contentPlatform, setContentPlatform] = useState('linkedin');
  const [contentLang, setContentLang] = useState('tr');
  const [contentLoading, setContentLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentCopied, setContentCopied] = useState(false);
  const [contentError, setContentError] = useState('');

  // ─── Ses Durumu (Voice Studio) ──────────────────────────────────────────
  const [voiceText, setVoiceText] = useState('');
  const [voiceTone, setVoiceTone] = useState('kurucu');
  const [voiceSpeed, setVoiceSpeed] = useState('1.0');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [generatedAudioText, setGeneratedAudioText] = useState('');

  // ─── Sihirli Prompt İyileştirici ─────────────────────────────────────────
  const enhancePrompt = async () => {
    if (!imagePrompt.trim()) return;
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social',
          topic: `Şu ham görsel promptunu Midjourney/Imagen 4 için 8K sinematik, detaylı İngilizce yapılara dönüştür: "${imagePrompt}"`,
          platform: 'twitter',
          lang: 'en'
        }),
      });
      const data = await res.json();
      if (data.content) {
        setImagePrompt(data.content.trim().replace(/^["']|["']$/g, ''));
      }
    } catch {
      // Fallback enhancement
      setImagePrompt(`Hyper-realistic 8K photorealistic render, ${imagePrompt}, studio lighting, Octane render, volumetric atmosphere, highly detailed`);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // ─── Görsel Üret ────────────────────────────────────────────────────────
  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageError('');
    setGeneratedImages([]);
    try {
      const stylePrefixMap: Record<string, string> = {
        '8k-cinematic': 'Photorealistic 8K cinematic render, dramatic lighting',
        '3d-glass': '3D glassmorphism isometric digital art, glowing neon accents',
        'cyberpunk': 'Futuristic cyberpunk aesthetics, dark background, vivid neon glow',
        'luxury-minimal': 'Luxury minimalist design, elegant gold and dark slate tones'
      };

      const finalPrompt = `${stylePrefixMap[imageStyle] || ''}: ${imagePrompt}`;

      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, aspectRatio: imageAspect, numberOfImages: 2 }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          alert('Kullanım limitine ulaşıldı. Abonelik sayfasına yönlendiriliyorsunuz...');
          router.push('/admin/settings?tab=subscription');
          return;
        }
        throw new Error(data.error || 'Görsel üretilemedi');
      }
      setGeneratedImages(data.images || []);
    } catch (e: any) {
      setImageError(e.message);
    } finally {
      setImageLoading(false);
    }
  };

  // ─── Video Üret ─────────────────────────────────────────────────────────
  const generateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setVideoLoading(true);
    setVideoError('');
    setVideoUrl('');
    setVideoStatus('Video üretimi başlatılıyor (Veo 3.1)...');
    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt, aspectRatio: videoAspect, fast: videoFast }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVideoStatus('Video işleniyor... (~2-3 dakika sürebilir)');
      pollVideoStatus(data.operationId);
    } catch (e: any) {
      setVideoError(e.message);
      setVideoLoading(false);
    }
  };

  const pollVideoStatus = async (operationId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/ai/generate-video?operationId=${encodeURIComponent(operationId)}`);
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          setVideoUrl(data.videoUrl);
          setVideoStatus('Video hazır!');
          setVideoLoading(false);
        } else if (data.status === 'PROCESSING') {
          setTimeout(poll, 15000);
        } else {
          throw new Error(data.error || 'Bilinmeyen hata');
        }
      } catch (e: any) {
        setVideoError(e.message);
        setVideoLoading(false);
      }
    };
    setTimeout(poll, 15000);
  };

  // ─── İçerik Üret ────────────────────────────────────────────────────────
  const generateContent = async () => {
    if (!contentTopic.trim()) return;
    setContentLoading(true);
    setContentError('');
    setGeneratedContent('');
    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          topic: `[Ton: ${contentTone}] ${contentTopic}`,
          platform: contentPlatform,
          lang: contentLang,
          usePro: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedContent(data.content);
    } catch (e: any) {
      setContentError(e.message);
    } finally {
      setContentLoading(false);
    }
  };

  // ─── Seslendir (Text to Speech Synthesis) ────────────────────────────────
  const handleSynthesizeVoice = () => {
    if (!voiceText.trim()) return;
    setVoiceLoading(true);
    setGeneratedAudioText(voiceText);
    setTimeout(() => {
      setVoiceLoading(false);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = parseFloat(voiceSpeed);
        utterance.lang = 'tr-TR';
        utterance.onend = () => setVoicePlaying(false);
        setVoicePlaying(true);
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Tarayıcınız ses sentezini destekliyor. Simüle ses oluşturuldu.');
      }
    }, 1000);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    setContentCopied(true);
    setTimeout(() => setContentCopied(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: any; color: string }[] = [
    { id: 'image', label: 'Görsel Üretici', icon: ImageIcon, color: 'text-violet-400' },
    { id: 'video', label: 'Video Üretici', icon: Video, color: 'text-blue-400' },
    { id: 'content', label: 'İçerik Motoru', icon: FileText, color: 'text-emerald-400' },
    { id: 'voice', label: 'Ses Stüdyosu', icon: Volume2, color: 'text-cyan-400' },
    { id: 'presets', label: 'Marka Kiti', icon: Bookmark, color: 'text-amber-400' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Google AI Stüdyo <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">Titan Mode Pro</span>
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">Gemini 2.5 Pro · Imagen 4 · Veo 3.1 · AI Voice Sentez Motoru</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Tüm Yapay Zeka Servisleri Aktif</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-1.5 backdrop-blur-xl">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === id
                ? 'bg-[#1A1A2E] text-white shadow-xl border border-white/10'
                : 'text-[#64748B] hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Icon className={`w-4 h-4 ${activeTab === id ? color : 'text-[#64748B]'}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ─── GÖRSEL TAB ─── */}
      {activeTab === 'image' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-violet-400" />
                  Görsel İstem Metni (Prompt)
                </label>
                <button
                  onClick={enhancePrompt}
                  disabled={isEnhancingPrompt || !imagePrompt.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {isEnhancingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-violet-400" />}
                  Sihirli Prompt İyileştirici
                </button>
              </div>
              <textarea
                value={imagePrompt}
                onChange={e => setImagePrompt(e.target.value)}
                placeholder="Örn: Modern kurumsal teknoloji ajansı hero görseli, 3D cam efektleri, mor-lacivert neon tonlar, 8k sinematik detaylar..."
                rows={4}
                className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500/50 resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">En-Boy Oranı</label>
                <select
                  value={imageAspect}
                  onChange={e => setImageAspect(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                >
                  <option value="16:9">16:9 (Geniş Ekran / Banner)</option>
                  <option value="1:1">1:1 (Kare / Instagram Post)</option>
                  <option value="9:16">9:16 (Dikey / Story & Reel)</option>
                  <option value="4:5">4:5 (Sosyal Medya Dikey)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Görsel Stili</label>
                <select
                  value={imageStyle}
                  onChange={e => setImageStyle(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                >
                  <option value="8k-cinematic">📸 Gerçekçi 8K Fotoğraf</option>
                  <option value="3d-glass">🎨 3D Cam & Neomorfizm</option>
                  <option value="cyberpunk">🌃 Cyberpunk & Neon Glow</option>
                  <option value="luxury-minimal">✨ Lüks Minimalist Tasarım</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={generateImage}
                  disabled={imageLoading || !imagePrompt.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {imageLoading ? 'Görsel Üretiliyor...' : 'Görselleri Üret (Imagen 4)'}
                </button>
              </div>
            </div>

            {imageError && <p className="mt-2 text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{imageError}</p>}
          </div>

          {generatedImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((img, i) => (
                <div key={i} className="relative group bg-[#0A0A0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={`data:${img.mimeType};base64,${img.base64}`}
                    alt={`Generated ${i + 1}`}
                    className="w-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-sm">
                    <a
                      href={`data:${img.mimeType};base64,${img.base64}`}
                      download={`starwebflow-imagen4-${Date.now()}-${i}.jpg`}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 w-56 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Yüksek Çözünürlük İndir
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          const { createSocialPost } = await import('@/app/actions/social');
                          const res = await createSocialPost({
                            platform: 'Taslak',
                            content: `[Yapay Zeka Üretimi Görsel]\nPrompt: ${imagePrompt}`,
                            status: 'PENDING_APPROVAL',
                            aiGenerationStyle: 'imagen4'
                          });
                          if (res.success) {
                            alert('✨ Görsel Sosyal Medya Onay Kuyruğuna eklendi!');
                          }
                        } catch {
                          alert('Sosyal medyaya gönderilirken bir hata oluştu.');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 w-56 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold text-white transition-colors shadow-lg"
                    >
                      <Share2 className="w-4 h-4" />
                      Sosyal Medyaya Aktar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── VİDEO TAB ─── */}
      {activeTab === 'video' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <label className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                Video İstem Metni (Prompt)
              </label>
              <textarea
                value={videoPrompt}
                onChange={e => setVideoPrompt(e.target.value)}
                placeholder="Örn: Gelecek nesil yazılım ve yapay zeka ajansının dinamik ofisi, hızlı kamera hareketi, 1080p yüksek kaliteli tanıtım sahnesi..."
                rows={4}
                className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500/50 resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Format</label>
                  <select
                    value={videoAspect}
                    onChange={e => setVideoAspect(e.target.value)}
                    className="bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="16:9">16:9 (Geniş Ekran Video)</option>
                    <option value="9:16">9:16 (Reels / TikTok Format)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={videoFast}
                    onChange={e => setVideoFast(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span className="text-sm font-medium text-[#94A3B8]">Hızlı Önizleme Modu</span>
                </label>
              </div>

              <button
                onClick={generateVideo}
                disabled={videoLoading || !videoPrompt.trim()}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                {videoLoading ? 'Video İşleniyor...' : 'Video Üret (Veo 3.1)'}
              </button>
            </div>

            {videoError && <p className="mt-2 text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{videoError}</p>}
            {videoStatus && !videoError && (
              <div className="mt-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-sm font-medium text-blue-300">
                {videoLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
                {videoStatus}
              </div>
            )}
          </div>

          {videoUrl && (
            <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <video src={videoUrl} controls className="w-full max-h-[500px] object-cover" />
              <div className="p-4 flex justify-between items-center bg-white/[0.02]">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Veo 3.1 1080p Video Hazır</span>
                <a
                  href={videoUrl}
                  download={`starwebflow-veo3-${Date.now()}.mp4`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  MP4 İndir
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── İÇERİK TAB ─── */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">İçerik Tipi</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as ContentType)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="blog">📝 Uzun Blog Yazısı</option>
                  <option value="email">📧 Satış & Bülten E-Postası</option>
                  <option value="proposal">📋 Müşteri Teklif Metni</option>
                  <option value="social">📱 Sosyal Medya Metni</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">İçerik Tonu</label>
                <select
                  value={contentTone}
                  onChange={e => setContentTone(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="ikna-edici">🎯 İkna Edici & Yüksek Dönüşüm</option>
                  <option value="kurumsal">💼 Kurumsal & Profesyonel</option>
                  <option value="heyecanli">🚀 İlham Verici & Vizyoner</option>
                  <option value="samimi">💬 Eğlenceli & Samimi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Platform / Format</label>
                <select
                  value={contentPlatform}
                  onChange={e => setContentPlatform(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="instagram">Instagram Caption</option>
                  <option value="twitter">X / Twitter Thread</option>
                  <option value="email">Soğuk E-Posta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Hedef Dil</label>
                <select
                  value={contentLang}
                  onChange={e => setContentLang(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="tr">🇹🇷 Türkçe</option>
                  <option value="en">🇬🇧 İngilizce</option>
                  <option value="de">🇩🇪 Almanca</option>
                  <option value="es">🇪🇸 İspanyolca</option>
                  <option value="fr">🇫🇷 Fransızca</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Konu / Ürün Bağlamı
              </label>
              <textarea
                value={contentTopic}
                onChange={e => setContentTopic(e.target.value)}
                placeholder="Örn: StarWebflow'un yapay zeka otomasyon hizmetleri ile işletmelerin günde 3 saatlik iş yükünü otonom hale getirmesi..."
                rows={4}
                className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-emerald-500/50 resize-none font-sans leading-relaxed"
              />
            </div>

            <button
              onClick={generateContent}
              disabled={contentLoading || !contentTopic.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {contentLoading ? 'Metin Kaleme Alınıyor...' : 'İçeriği Üret (Gemini 2.5 Pro)'}
            </button>

            {contentError && <p className="mt-2 text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{contentError}</p>}
          </div>

          {generatedContent && (
            <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Gemini 2.5 Pro Çıktısı
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    {contentCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {contentCopied ? 'Kopyalandı!' : 'Metni Kopyala'}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-[#E2E8F0] font-sans leading-relaxed pt-2">
                {generatedContent}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ─── SES STÜDYOSU (AI VOICE STUDIO) TAB ─── */}
      {activeTab === 'voice' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Ses Karakteri / Tonu</label>
                <select
                  value={voiceTone}
                  onChange={e => setVoiceTone(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="kurucu">🎙️ VIP Kurucu (Tok & Güven Verici)</option>
                  <option value="dis-ses">📢 Belgesel / Dış Ses (Net & Profesyonel)</option>
                  <option value="sunucu">🚀 Heyecanlı Sunucu (Dinamik & Yüksek Enerji)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Konuşma Hızı</label>
                <select
                  value={voiceSpeed}
                  onChange={e => setVoiceSpeed(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="0.9">0.9x (Yavaş & Temkinli)</option>
                  <option value="1.0">1.0x (Normal Hız)</option>
                  <option value="1.1">1.1x (Dinamik Tempolu)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                Seslendirilecek Metin
              </label>
              <textarea
                value={voiceText}
                onChange={e => setVoiceText(e.target.value)}
                placeholder="Örn: Merhaba, Ben StarWebflow kurucusuyum. İşletmenizi yapay zeka otomasyonları ile nasıl %80 daha verimli hale getirebileceğimiz üzerine 30 saniyelik harika bir stratejimiz var..."
                rows={4}
                className="w-full bg-[#05050A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-cyan-500/50 resize-none font-sans leading-relaxed"
              />
            </div>

            <button
              onClick={handleSynthesizeVoice}
              disabled={voiceLoading || !voiceText.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {voiceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
              {voiceLoading ? 'Ses Sentezleniyor...' : 'Metni Seslendir (AI Voice Sentez)'}
            </button>
          </div>

          {generatedAudioText && (
            <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Yapay Zeka Ses Kaydı Hazır</h4>
                  <p className="text-xs text-[#94A3B8]">Konuşma Hızı: {voiceSpeed}x · Ton: {voiceTone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(generatedAudioText);
                      utterance.rate = parseFloat(voiceSpeed);
                      utterance.lang = 'tr-TR';
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Tekrar Dinle
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MARKA KİTİ (PRESETS) TAB ─── */}
      {activeTab === 'presets' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brandPresets.map((preset) => (
              <div key={preset.id} className="bg-[#0A0A0F] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">{preset.category}</span>
                    <span className="text-xs text-[#64748B] font-mono">{preset.aspect}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{preset.title}</h3>
                  <p className="text-xs text-[#94A3B8] font-mono bg-[#05050A] p-3 rounded-xl border border-white/5 leading-relaxed">{preset.prompt}</p>
                </div>

                <button
                  onClick={() => {
                    setImagePrompt(preset.prompt);
                    setImageAspect(preset.aspect);
                    setActiveTab('image');
                  }}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors group-hover:border-amber-400/30 group-hover:text-amber-300"
                >
                  Bu Şablonu Kullan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
