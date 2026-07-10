"use client";

import { Calendar as CalendarIcon, Clock, Plus, Zap, AlertCircle, FileSpreadsheet, UploadCloud, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function CalendarTab({ scheduledPosts }: { scheduledPosts: any[] }) {
  const [showWizard, setShowWizard] = useState(false);

  // In a real elite app, this would use FullCalendar or a custom drag-drop grid.
  // For the UI demonstration, we'll build a sleek timeline/calendar layout.

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/60 border border-neutral-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            Akıllı Takvim (Smart Grid)
          </h2>
          <p className="text-neutral-400 mt-1">İçerik planınızı görselleştirin ve AI ile otomatik boşlukları doldurun.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Hızlı Toplu Planlama Sihirbazı
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Boşlukları AI ile Doldur
          </button>
        </div>
      </div>

      {/* BULK WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Hızlı Toplu Planlama (Tablo Sihirbazı)</h3>
                  <p className="text-xs text-neutral-400">Tarih, saat, platform ve formatları tek seferde girin; AI sizin için üretsin.</p>
                </div>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-neutral-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-neutral-950/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                      <th className="px-4 py-3">Tarih & Saat</th>
                      <th className="px-4 py-3">Platform</th>
                      <th className="px-4 py-3">Format</th>
                      <th className="px-4 py-3 w-1/2">İçerik Konusu / Yönlendirme (Prompt)</th>
                      <th className="px-4 py-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {[1, 2, 3].map((row) => (
                      <tr key={row} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <input type="datetime-local" className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-indigo-500 outline-none" defaultValue={`2026-07-${15+row}T10:00`} />
                        </td>
                        <td className="px-4 py-3">
                          <select className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-indigo-500 outline-none">
                            <option>Instagram</option>
                            <option>LinkedIn</option>
                            <option>Twitter (X)</option>
                            <option>TikTok</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-indigo-500 outline-none">
                            <option>Reels / Shorts</option>
                            <option>Post (Görsel)</option>
                            <option>Story</option>
                            <option>Carousel (Kaydırmalı)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" placeholder="Örn: Yapay zeka ile satış arttırma yolları..." className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded-lg px-3 py-2 w-full focus:ring-1 focus:ring-indigo-500 outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-red-400 hover:text-red-300 transition text-sm font-medium">Sil</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="mt-4 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition font-medium px-4 py-2 rounded-lg hover:bg-indigo-500/10">
                <Plus className="w-4 h-4" /> Satır Ekle
              </button>
            </div>
            
            <div className="p-5 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Bu tablo "Closed-Loop" sistemini tetikler.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowWizard(false)} className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition">
                  İptal
                </button>
                <button onClick={() => setShowWizard(false)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Gönder ve AI'ı Tetikle (Üretimi Başlat)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR GRID (Simulated Week View) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
        <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-950/50">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-neutral-400 border-r border-neutral-800 last:border-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-neutral-950/30">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="min-h-[160px] p-2 border-r border-neutral-800 last:border-0 relative group transition hover:bg-neutral-800/30">
              <span className="absolute top-2 right-2 text-xs font-medium text-neutral-600">{i + 12} Nis</span>
              
              {/* Example Content Block (Approved) */}
              {i === 2 && (
                <div className="mt-6">
                  <div className="bg-neutral-800 border border-emerald-500/50 p-2 rounded-lg cursor-pointer hover:border-emerald-400 transition shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        <span className="text-xs text-neutral-300 font-medium">LinkedIn</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">Onaylandı</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2">Web tasarımında yapay zeka devrimi başlıyor...</p>
                    <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block">14:30 (Reels)</div>
                  </div>
                </div>
              )}

              {/* Example Content Block (Pending Approval) */}
              {i === 4 && (
                <div className="mt-6">
                  <div className="bg-neutral-800 border border-amber-500/50 p-2 rounded-lg cursor-pointer hover:border-amber-400 transition shadow-[0_0_10px_rgba(245,158,11,0.1)] animate-pulse">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        <span className="text-xs text-neutral-300 font-medium">Instagram</span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-500 uppercase">Onay Bekliyor</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2">Markanızı uçuracak 3 strateji (Reels Metni)...</p>
                    <div className="mt-2 flex gap-1">
                      <div className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded inline-block">18:00 (Reels)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state hover */}
              {i !== 2 && i !== 4 && (
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition flex justify-center">
                  <button className="p-1.5 bg-neutral-800 rounded-md text-neutral-400 hover:text-white hover:bg-indigo-600 transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ALERTS */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-amber-500">Cuma günü için içerik eksiği</h4>
          <p className="text-xs text-neutral-400 mt-1">Cuma akşam saatleri kitlenizin en aktif olduğu zaman dilimlerinden biri. Ancak o saate planlanmış bir gönderiniz yok. AI ile hızlıca bir fikir üretmek ister misiniz?</p>
        </div>
      </div>
    </div>
  );
}

