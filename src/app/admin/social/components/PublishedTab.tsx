"use client";

import { useState } from "react";
import { CheckCircle2, TrendingUp, Search, MessageCircle, Share2, BrainCircuit, X } from "lucide-react";
import { analyzePostPerformance } from "@/app/actions/social";

export function PublishedTab({ publishedPosts }: { publishedPosts: any[] }) {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async (postId: string) => {
    setAnalyzingId(postId);
    try {
      const res = await analyzePostPerformance(postId);
      if (res.success) {
        setAnalysisResult(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Yayınlananlar & Analiz
          </h2>
          <p className="text-neutral-400 mt-1">Geçmiş gönderilerinizin performansını AI ile ölçün ve optimize edin.</p>
        </div>
        <div className="mt-4 md:mt-0 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Gönderilerde ara..." 
            className="pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* POST LIST */}
      <div className="space-y-4">
        {publishedPosts.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-neutral-800">
            <p className="text-neutral-500">Henüz yayınlanmış bir gönderi bulunmuyor.</p>
          </div>
        ) : (
          publishedPosts.map((post) => (
            <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition shadow-lg flex flex-col lg:flex-row gap-6">
              
              {/* Content Area */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-xs font-medium uppercase tracking-wider">
                    {post.platform}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(post.scheduledFor || post.createdAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex gap-4">
                  {post.hasImage && (
                    <div className="w-20 h-20 rounded-lg bg-neutral-800 shrink-0 border border-neutral-700 flex items-center justify-center overflow-hidden">
                      {post.mediaUrl ? <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" /> : <div className="text-xs text-neutral-500">Görsel</div>}
                    </div>
                  )}
                  <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Metrics & Actions */}
              <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-800 pt-4 lg:pt-0 lg:pl-6">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-neutral-950/50 rounded-lg py-2 border border-neutral-800/50">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-white">{(Math.random() * 5000 + 500).toFixed(0)}</div>
                    <div className="text-[10px] text-neutral-500">Gösterim</div>
                  </div>
                  <div className="text-center bg-neutral-950/50 rounded-lg py-2 border border-neutral-800/50">
                    <MessageCircle className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-white">{(Math.random() * 50 + 5).toFixed(0)}</div>
                    <div className="text-[10px] text-neutral-500">Yorum</div>
                  </div>
                  <div className="text-center bg-neutral-950/50 rounded-lg py-2 border border-neutral-800/50">
                    <Share2 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-white">{(Math.random() * 20).toFixed(0)}</div>
                    <div className="text-[10px] text-neutral-500">Paylaşım</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleAnalyze(post.id)}
                  disabled={analyzingId === post.id}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 border border-neutral-700 hover:border-neutral-600 disabled:opacity-50"
                >
                  {analyzingId === post.id ? (
                    <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 animate-pulse" /> Analiz Ediliyor...</span>
                  ) : (
                    <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-indigo-400" /> AI Post-Mortem İste</span>
                  )}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* AI ANALYSIS MODAL */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.2)]">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-950/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                AI Post-Mortem Raporu
              </h3>
              <button onClick={() => setAnalysisResult(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Kanca (Hook) Skoru</div>
                  <div className="text-3xl font-black text-indigo-400">{analysisResult.hookScore}/100</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-400 mb-1">Genel Sonuç</div>
                  <div className="text-lg font-semibold text-emerald-400">{analysisResult.verdict}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <h4 className="text-emerald-400 font-semibold mb-2 text-sm uppercase tracking-wide">Güçlü Yönler</h4>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                  <h4 className="text-rose-400 font-semibold mb-2 text-sm uppercase tracking-wide">Zayıf Yönler</h4>
                  <ul className="space-y-2">
                    {analysisResult.weaknesses.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="text-rose-500 mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                <h4 className="text-indigo-400 font-semibold mb-1 text-sm uppercase tracking-wide">Aksiyon Önerisi</h4>
                <p className="text-sm text-neutral-200">{analysisResult.actionableAdvice}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
