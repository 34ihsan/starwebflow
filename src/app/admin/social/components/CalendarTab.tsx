"use client";

import { Calendar as CalendarIcon, Clock, Plus, Zap, AlertCircle } from "lucide-react";

export function CalendarTab({ scheduledPosts }: { scheduledPosts: any[] }) {
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
          <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-medium transition-colors text-white flex items-center gap-2">
            <Clock className="w-4 h-4" />
            En İyi Saatleri Öner
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Boşlukları AI ile Doldur
          </button>
        </div>
      </div>

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
              
              {/* Example Content Block */}
              {i === 2 || i === 4 ? (
                <div className="mt-6">
                  <div className="bg-neutral-800 border border-neutral-700 p-2 rounded-lg cursor-pointer hover:border-indigo-500/50 transition">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      <span className="text-xs text-neutral-300 font-medium">{i === 2 ? 'LinkedIn' : 'Instagram'}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2">Web tasarımında yapay zeka devrimi başlıyor...</p>
                    <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block">14:30 (Önerilen)</div>
                  </div>
                </div>
              ) : null}

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
