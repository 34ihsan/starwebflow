"use client";

import React from 'react';
import { Target, Play, Users, Activity, AlertCircle, Zap } from 'lucide-react';

export default function ABTestingTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Area */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Target className="w-7 h-7 text-rose-500" />
              Öngörücü Persona Simülasyonu & Isı Haritası
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Yapay zeka ile 500 farklı alıcı profilini (C-Level, İK, Pazarlama) simüle edin. E-postayı 
              göndermeden önce insanların gözünün nereye odaklanacağını ve tıklama ihtimalini tahmin edin.
            </p>
          </div>
          <button className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-105 transition-transform shrink-0">
            <Play className="w-4 h-4 fill-white" /> Analizi Başlat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shadow Testing Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B5CF6]" /> Persona Yanıt Tahminleri
              </h4>
              <span className="text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-1 rounded font-bold tracking-wider">500 SANAL ALICI</span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Persona 1 */}
              <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-4 relative overflow-hidden group hover:border-white/[0.1] transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs border border-emerald-500/20">CE</div>
                    <span className="text-sm font-semibold text-white">Teknoloji CEO'ları</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded shadow-inner">%82 Açma</span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">Kısa ve net ROI verilerine odaklanan giriş cümlesi çok başarılı bulundu. Buton tıklama oranı %24 tahmin ediliyor.</p>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-[82%] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                </div>
              </div>

              {/* Persona 2 */}
              <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-4 relative overflow-hidden group hover:border-white/[0.1] transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/20">PZ</div>
                    <span className="text-sm font-semibold text-white">Pazarlama Müdürleri</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded shadow-inner">%45 Açma</span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">Tasarım vizyonu yetersiz. Daha fazla görsel referans ve vaka analizi (case study) talep ediyorlar.</p>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full w-[45%] shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                </div>
              </div>

              {/* Persona 3 */}
              <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-4 relative overflow-hidden group hover:border-white/[0.1] transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-xs border border-red-500/20">İK</div>
                    <span className="text-sm font-semibold text-white">İnsan Kaynakları</span>
                  </div>
                  <span className="text-red-400 font-bold text-sm bg-red-500/10 px-2 py-0.5 rounded shadow-inner">%12 Açma</span>
                </div>
                <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">Fazla agresif dil kullanımı. Ürün teknik detayları İK personası için karmaşık ve gereksiz.</p>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-red-500 h-1.5 rounded-full w-[12%] shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h4 className="font-bold text-white flex items-center gap-2 mb-6 relative z-10">
              <Activity className="w-4 h-4 text-blue-400" /> Metin Duygu & Ton Analizi
            </h4>
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94A3B8] mb-2">
                  <span>Aciliyet (Urgency) Hissi</span>
                  <span className="text-white bg-white/10 px-2 py-0.5 rounded">Optimum</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] flex overflow-hidden">
                  <div className="bg-blue-500/20 h-2 w-1/3"></div>
                  <div className="bg-blue-500 h-2 w-1/3 shadow-[0_0_10px_rgba(59,130,246,0.8)] relative">
                    <div className="absolute inset-0 bg-white/20 blur-[1px]"></div>
                  </div>
                  <div className="bg-blue-500/20 h-2 w-1/3"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94A3B8] mb-2">
                  <span>Kurumsallık & Güven</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Çok Yüksek</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden">
                  <div className="bg-emerald-500 h-2 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] relative">
                    <div className="absolute inset-0 bg-white/20 blur-[1px]"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-[#94A3B8] mb-2">
                  <span>Satış Baskısı (Spam Riski)</span>
                  <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Tehlikeli</span>
                </div>
                <div className="w-full bg-[#05050A] rounded-full h-2 border border-white/[0.05] overflow-hidden">
                  <div className="bg-red-500 h-2 w-[70%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] relative">
                    <div className="absolute inset-0 bg-white/20 blur-[1px]"></div>
                  </div>
                </div>
                <p className="text-[10px] text-red-400/80 mt-2 bg-red-500/5 p-2 rounded border border-red-500/10 shadow-inner">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  "Ücretsiz Dene" kelimesi yerine "Platformu İnceleyin" kullanmanız spam riskini %40 azaltacaktır.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Heatmap */}
        <div className="lg:col-span-7 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Bilişsel Göz İzleme (Cognitive Eye-Tracking)
            </h4>
            <div className="flex items-center gap-4 text-xs font-medium text-[#94A3B8] bg-[#05050A] px-3 py-1.5 rounded-lg border border-white/[0.05] shadow-inner">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div> Sıcak (Yüksek Odak)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-50"></div> Soğuk (Düşük Odak)</div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl relative overflow-hidden shadow-2xl mx-auto w-full max-w-lg border-4 border-[#1E293B] hover:scale-[1.02] transition-transform duration-500">
            {/* MacOS Window Mockup Header */}
            <div className="h-8 bg-[#1E293B] flex items-center px-3 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
            </div>

            <div className="relative p-8 h-[500px] overflow-hidden group">
              {/* Glassmorphism heatmap simulation */}
              <div className="absolute inset-0 bg-transparent z-20 backdrop-blur-[0px] transition-all duration-1000 group-hover:backdrop-blur-[2px]">
                {/* Heatmap Overlay Gradients (Mix Blend Mode Multiply simulates heat over text) */}
                <div className="absolute top-12 left-8 w-40 h-24 bg-rose-500 opacity-[0.35] blur-2xl rounded-[100%] mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.6]"></div>
                <div className="absolute top-48 left-16 w-48 h-16 bg-amber-400 opacity-20 blur-2xl rounded-[100%] mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.4]"></div>
                
                {/* Extremely hot CTA button heatmap */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-600 opacity-[0.45] blur-3xl rounded-[100%] mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.8] animate-pulse"></div>
                
                <div className="absolute top-1/2 right-4 w-24 h-48 bg-blue-500 opacity-[0.15] blur-3xl rounded-[100%] mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.3]"></div>
              </div>

              <div className="relative z-10 text-[#0F172A] font-sans h-full flex flex-col">
                <h1 className="text-[22px] font-bold text-[#0F172A] mb-6 leading-tight tracking-tight">
                  Q3 Büyüme Hedefleriniz İçin <span className="text-rose-600">Özel Strateji</span>
                </h1>
                
                <p className="text-[13px] text-[#475569] mb-5">Merhaba Sinan Bey,</p>
                
                <p className="text-[13px] text-[#475569] mb-6 leading-relaxed relative">
                  E-ticaret sektöründeki son gelişmelerinizi yakından takip ediyoruz. 
                  Rakiplerinizin maliyetlerini %30 oranında nasıl düşürdüğünü ve dönüşüm 
                  oranlarını nasıl maksimize ettiğini biliyor musunuz?
                </p>
                
                <div className="bg-[#F8FAFC] border-l-4 border-rose-500 p-4 rounded-r-lg mb-8 relative">
                  <p className="text-[12px] text-[#334155] italic font-medium">
                    "Sistemlerinizi yapay zeka ile entegre ederek, manuel süreçleri 
                    tamamen ortadan kaldırıyoruz ve satışlarınızı 7/24 optimize ediyoruz."
                  </p>
                </div>

                <div className="text-center mt-auto mb-6 relative">
                  <button className="bg-[#0F172A] text-white px-8 py-3.5 rounded-lg text-sm font-bold shadow-xl relative w-full sm:w-auto overflow-hidden group/btn">
                    15 Dakikalık Tanışma Toplantısı Ayarla
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                  </button>
                </div>
                
                <p className="text-[11px] text-[#94A3B8] text-center relative z-30">
                  Sevgilerle, <strong className="text-[#64748B]">StarWebflow Ekibi</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
