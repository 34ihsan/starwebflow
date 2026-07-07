"use client";

import React, { useState } from 'react';
import { Target, Play, Activity, AlertCircle } from 'lucide-react';
import { analyzeEmailContent } from '@/app/actions/email';

export default function ABTestingTab() {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Lütfen analiz edilecek bir metin girin.");
      return;
    }
    setError("");
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await analyzeEmailContent(text);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || "Analiz sırasında hata oluştu.");
      }
    } catch (e) {
      setError("Sistemsel bir hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Target className="w-7 h-7 text-rose-500" />
              AI Duygu & Ton Analizi
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Yapay zeka ile kampanya metninizi gönderimden önce analiz edin. Aciliyet, güven ve spam riskini önceden tespit ederek daha yüksek açılma oranları elde edin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <h4 className="font-bold text-white mb-4">Metninizi Girin</h4>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 bg-[#05050A] border border-white/[0.05] rounded-xl p-4 text-white focus:outline-none focus:border-rose-500/50 resize-none mb-4"
            placeholder="Analiz edilecek e-posta metnini veya başlığını buraya yapıştırın..."
          ></textarea>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white px-5 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">Analiz Ediliyor...</span>
            ) : (
              <><Play className="w-4 h-4 fill-white" /> Analizi Başlat</>
            )}
          </button>
        </div>

        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <h4 className="font-bold text-white flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-blue-400" /> Analiz Sonuçları
          </h4>
          
          {!result && !analyzing && (
            <div className="flex-1 flex items-center justify-center text-[#64748B] text-sm">
              Analiz başlatmak için soldaki formu kullanın.
            </div>
          )}
          
          {analyzing && (
            <div className="flex-1 flex items-center justify-center text-blue-400 text-sm animate-pulse">
              Yapay Zeka Metni İnceliyor...
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94A3B8] mb-2">
                  <span>Aciliyet (Urgency) Hissi</span>
                  <span className="text-white">{result.urgency}/100</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden">
                  <div className="bg-blue-500 h-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${result.urgency}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94A3B8] mb-2">
                  <span>Kurumsallık & Güven</span>
                  <span className="text-emerald-400">{result.trust}/100</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden">
                  <div className="bg-emerald-500 h-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${result.trust}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94A3B8] mb-2">
                  <span>Satış Baskısı (Spam Riski)</span>
                  <span className="text-red-400">{result.spamRisk}/100</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden">
                  <div className="bg-red-500 h-2 shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ width: `${result.spamRisk}%` }}></div>
                </div>
              </div>
              
              {result.feedback && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-100 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>{result.feedback}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
