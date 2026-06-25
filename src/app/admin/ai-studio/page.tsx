'use client';

import { useState } from 'react';
import { Sparkles, Image, Video, FileText, Loader2, Download, Copy, Check, ChevronDown } from 'lucide-react';

type ContentType = 'blog' | 'email' | 'proposal' | 'social';
type Tab = 'image' | 'video' | 'content';

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('image');

  // ─── Görsel Durumu ───────────────────────────────────────────────────────
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspect, setImageAspect] = useState('16:9');
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ base64: string; mimeType: string }[]>([]);
  const [imageError, setImageError] = useState('');

  // ─── Video Durumu ────────────────────────────────────────────────────────
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState('16:9');
  const [videoFast, setVideoFast] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoOperation, setVideoOperation] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  // ─── İçerik Durumu ──────────────────────────────────────────────────────
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [contentTopic, setContentTopic] = useState('');
  const [contentPlatform, setContentPlatform] = useState('linkedin');
  const [contentLang, setContentLang] = useState('tr');
  const [contentLoading, setContentLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentCopied, setContentCopied] = useState(false);
  const [contentError, setContentError] = useState('');

  // ─── Görsel Üret ────────────────────────────────────────────────────────
  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageError('');
    setGeneratedImages([]);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio: imageAspect, numberOfImages: 2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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
    setVideoOperation(null);
    setVideoUrl('');
    setVideoStatus('Video üretimi başlatılıyor...');
    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt, aspectRatio: videoAspect, fast: videoFast }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVideoOperation(data.operationId);
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
          setTimeout(poll, 15000); // 15 saniyede bir kontrol
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
          topic: contentTopic,
          platform: contentPlatform,
          lang: contentLang,
          usePro: contentType === 'blog' || contentType === 'proposal',
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

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    setContentCopied(true);
    setTimeout(() => setContentCopied(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: any; color: string }[] = [
    { id: 'image', label: 'Görsel Üretici', icon: Image, color: 'text-violet-400' },
    { id: 'video', label: 'Video Üretici', icon: Video, color: 'text-blue-400' },
    { id: 'content', label: 'İçerik Üretici', icon: FileText, color: 'text-emerald-400' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-['Outfit']">Google AI Stüdyo</h1>
            <p className="text-sm text-[#64748B]">Gemini 2.5 · Imagen 4 · Veo 3.1</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg w-fit">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-violet-300">Google AI Pro aboneliği aktif</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-[#1A1A2E] text-white shadow-lg'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 ${activeTab === id ? color : ''}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ─── GÖRSEL TAB ─── */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Görsel Promptu</label>
            <textarea
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              placeholder="Profesyonel kurumsal web sitesi hero görseli, mor ve lacivert tonlar, minimalist tasarım, 4K..."
              rows={3}
              className="w-full bg-[#05050A] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-violet-500/50 resize-none"
            />
            <div className="flex items-center gap-4 mt-4">
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Oran</label>
                <select
                  value={imageAspect}
                  onChange={e => setImageAspect(e.target.value)}
                  className="bg-[#05050A] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                >
                  <option value="1:1">1:1 (Kare)</option>
                  <option value="16:9">16:9 (Geniş)</option>
                  <option value="9:16">9:16 (Dikey)</option>
                  <option value="4:3">4:3</option>
                </select>
              </div>
              <button
                onClick={generateImage}
                disabled={imageLoading || !imagePrompt.trim()}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {imageLoading ? 'Üretiliyor...' : 'Görsel Üret (Imagen 4)'}
              </button>
            </div>
            {imageError && <p className="mt-3 text-sm text-red-400">{imageError}</p>}
          </div>

          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((img, i) => (
                <div key={i} className="relative group bg-[#0A0A0F] border border-white/[0.05] rounded-xl overflow-hidden">
                  <img
                    src={`data:${img.mimeType};base64,${img.base64}`}
                    alt={`Generated ${i + 1}`}
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <a
                      href={`data:${img.mimeType};base64,${img.base64}`}
                      download={`imagen4-${Date.now()}-${i}.jpg`}
                      className="flex items-center justify-center gap-2 px-4 py-2 w-48 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg text-sm text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          const { createSocialPost } = await import('@/app/actions/social');
                          const res = await createSocialPost({
                            platform: 'Taslak',
                            content: `[Görsel Taslağı]\nPrompt: ${imagePrompt}`,
                            status: 'PENDING_APPROVAL',
                            aiGenerationStyle: 'imagen4'
                          });
                          if (res.success) {
                            alert('Görsel başarıyla Sosyal Medya Onay Kuyruğuna eklendi!');
                          }
                        } catch (err) {
                          alert('Bir hata oluştu.');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 w-48 bg-violet-600/80 hover:bg-violet-600 backdrop-blur rounded-lg text-sm text-white transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Sosyal'e Gönder
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
        <div className="space-y-6">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-6">
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Video Promptu</label>
            <textarea
              value={videoPrompt}
              onChange={e => setVideoPrompt(e.target.value)}
              placeholder="Bir web tasarım ajansının ofisinde çalışan yaratıcı bir ekip, hızlı tempo, profesyonel atmosfer..."
              rows={3}
              className="w-full bg-[#05050A] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <div className="flex items-center gap-4 mt-4">
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Oran</label>
                <select
                  value={videoAspect}
                  onChange={e => setVideoAspect(e.target.value)}
                  className="bg-[#05050A] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="16:9">16:9 (Geniş)</option>
                  <option value="9:16">9:16 (Reels/Story)</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={videoFast}
                  onChange={e => setVideoFast(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[#94A3B8]">Hızlı mod (düşük kalite)</span>
              </label>
              <button
                onClick={generateVideo}
                disabled={videoLoading || !videoPrompt.trim()}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                {videoLoading ? 'İşleniyor...' : 'Video Üret (Veo 3.1)'}
              </button>
            </div>
            {videoError && <p className="mt-3 text-sm text-red-400">{videoError}</p>}
            {videoStatus && !videoError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-300">
                {videoLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {videoStatus}
              </div>
            )}
          </div>

          {videoUrl && (
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl overflow-hidden">
              <video src={videoUrl} controls className="w-full" />
              <div className="p-4 flex justify-end">
                <a
                  href={videoUrl}
                  download={`veo3-${Date.now()}.mp4`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm text-blue-300"
                >
                  <Download className="w-4 h-4" />
                  MP4 İndir
                </a>
              </div>
            </div>
          )}

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <p className="text-xs text-blue-300">
              <strong>Veo 3.1</strong> — 8 saniyelik 1080p video üretir. İşlem 2-3 dakika sürebilir. 
              Tamamlandığında otomatik görüntülenir.
            </p>
          </div>
        </div>
      )}

      {/* ─── İÇERİK TAB ─── */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-[#64748B] mb-1">İçerik Tipi</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as ContentType)}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="blog">📝 Blog Yazısı</option>
                  <option value="email">📧 E-posta</option>
                  <option value="proposal">📋 Teklif Taslağı</option>
                  <option value="social">📱 Sosyal Medya</option>
                </select>
              </div>
              {contentType === 'social' && (
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">Platform</label>
                  <select
                    value={contentPlatform}
                    onChange={e => setContentPlatform(e.target.value)}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">X/Twitter</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs text-[#64748B] mb-1">Dil</label>
                <select
                  value={contentLang}
                  onChange={e => setContentLang(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="tr">🇹🇷 Türkçe</option>
                  <option value="de">🇩🇪 Almanca</option>
                  <option value="en">🇬🇧 İngilizce</option>
                </select>
              </div>
            </div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Konu / Bağlam</label>
            <textarea
              value={contentTopic}
              onChange={e => setContentTopic(e.target.value)}
              placeholder="Web tasarım hizmetleri, modern e-ticaret çözümleri, StarWebflow'un avantajları..."
              rows={3}
              className="w-full bg-[#05050A] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-emerald-500/50 resize-none"
            />
            <button
              onClick={generateContent}
              disabled={contentLoading || !contentTopic.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {contentLoading ? 'Üretiliyor...' : `İçerik Üret (Gemini ${contentType === 'blog' || contentType === 'proposal' ? '2.5 Pro' : '2.5 Flash'})`}
            </button>
            {contentError && <p className="mt-3 text-sm text-red-400">{contentError}</p>}
          </div>

          {generatedContent && (
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[#94A3B8]">Üretilen İçerik</span>
                <button
                  onClick={copyContent}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-[#94A3B8] transition-colors"
                >
                  {contentCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {contentCopied ? 'Kopyalandı!' : 'Kopyala'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-[#E2E8F0] font-sans leading-relaxed">
                {generatedContent}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
