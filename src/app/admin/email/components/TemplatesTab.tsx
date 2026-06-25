"use client";

import React from 'react';
import { Sparkles, ArrowRight, LayoutTemplate, Star, MessageSquare } from 'lucide-react';

interface TemplatesTabProps {
  setIsAITemplateModalOpen: (v: boolean) => void;
}

export default function TemplatesTab({ setIsAITemplateModalOpen }: TemplatesTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-indigo-500" />
              Yapay Zeka Metin & Şablon Stüdyosu
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              Sektörünüze özel, yüksek dönüşüm oranlı şablonları anında oluşturun veya önceden test edilmiş elit kütüphanemizden seçim yapın.
            </p>
          </div>
          <button 
            onClick={() => setIsAITemplateModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-white" /> Yapay Zeka ile Üret
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Template 1 */}
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.1] transition-all relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20 z-20">
            %84 Yanıt Oranı
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Star className="w-6 h-6 text-indigo-400" />
          </div>
          <h4 className="text-white font-bold mb-2 relative z-10 text-lg">B2B SaaS Tanışma (C-Level)</h4>
          <p className="text-sm text-[#94A3B8] mb-6 line-clamp-2 leading-relaxed relative z-10">
            "Merhaba {"{first_name}"}, {"{company_name}"} ekibinin son çeyrekteki büyümesini hayranlıkla takip ediyorum..."
          </p>
          <div className="flex justify-between items-center relative z-10 pt-4 border-t border-white/[0.05]">
             <span className="text-xs text-[#64748B] flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 2 Varyasyon</span>
            <button className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Şablonu Kullan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template 2 */}
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.1] transition-all relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-amber-500/20 z-20">
            %65 Yanıt Oranı
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <LayoutTemplate className="w-6 h-6 text-rose-400" />
          </div>
          <h4 className="text-white font-bold mb-2 relative z-10 text-lg">E-ticaret Kasa Terki</h4>
          <p className="text-sm text-[#94A3B8] mb-6 line-clamp-2 leading-relaxed relative z-10">
            "Sepetinizde harika ürünler unuttunuz {"{first_name}"}! Fiyatlar artmadan önce tamamlamak ister misiniz?"
          </p>
          <div className="flex justify-between items-center relative z-10 pt-4 border-t border-white/[0.05]">
             <span className="text-xs text-[#64748B] flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 4 Varyasyon</span>
            <button className="text-rose-400 text-sm font-semibold hover:text-rose-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Şablonu Kullan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create New Prompt Card */}
        <div 
          onClick={() => setIsAITemplateModalOpen(true)}
          className="border-2 border-dashed border-white/[0.1] rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/[0.02] hover:border-white/[0.2] transition-all group min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-indigo-500/20">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h4 className="text-white font-bold mb-2">Özel Şablon Üret</h4>
          <p className="text-sm text-[#94A3B8]">
            Hedef kitlenizi ve amacınızı yazın, yapay zeka saniyeler içinde sizin için optimize edilmiş şablonlar üretsin.
          </p>
        </div>

      </div>
    </div>
  );
}
