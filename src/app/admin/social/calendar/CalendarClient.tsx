'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, LayoutGrid, CheckCircle2, Search, X } from 'lucide-react';
import Link from 'next/link';

export default function CalendarClient({ initialPosts }: { initialPosts: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Pazartesi
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const dayFormat = "d";
  const weekDayFormat = "EEEE";

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#9A82FB]" />
            İçerik Takvimi
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Planlanan ve paylaşılan tüm içeriklerinizi buradan yönetin</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#111118] border border-white/5 rounded-xl p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-white font-medium min-w-[140px] text-center capitalize">
            {format(currentDate, dateFormat, { locale: tr })}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/social" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Stüdyo'ya Dön
          </Link>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    let startDateOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm text-zinc-400 uppercase py-4">
          {format(addDays(startDateOfWeek, i), 'EEE', { locale: tr })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-white/5">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dayFormat);
        const cloneDay = day;
        
        // Bu güne ait postları bul
        const dayPosts = initialPosts.filter(post => {
          if (!post.scheduledFor) return false;
          return isSameDay(parseISO(post.scheduledFor.toString()), cloneDay);
        });

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border-r border-b border-white/5 transition-colors relative group
              ${!isSameMonth(day, monthStart) ? "bg-[#0A0A0F]/50 text-zinc-600" : "bg-[#111118] text-zinc-300 hover:bg-[#151520]"}
              ${isSameDay(day, new Date()) ? "ring-1 ring-inset ring-[#9A82FB]/50" : ""}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                ${isSameDay(day, new Date()) ? 'bg-[#9A82FB] text-white' : ''}
              `}>
                {formattedDate}
              </span>
              
              {/* Günün özet istatistiği */}
              {dayPosts.length > 0 && (
                <span className="text-xs bg-[#9A82FB]/20 text-[#9A82FB] px-1.5 py-0.5 rounded-md font-medium">
                  {dayPosts.length} Post
                </span>
              )}
            </div>

            {/* Postların listelenmesi */}
            <div className="flex flex-col gap-1.5">
              {dayPosts.map((post, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedPost(post)}
                  className={`text-xs p-1.5 rounded-md border cursor-pointer truncate transition-all hover:scale-[1.02]
                    ${post.status === 'PUBLISHED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}
                  `}
                >
                  <span className="font-bold mr-1 capitalize">{post.platform}</span>
                  {post.content.substring(0, 20)}...
                </div>
              ))}
            </div>
            
            {/* Boş güne tıklandığında (opsiyonel) '+' butonu */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-white/20 transition-colors">
                <span className="text-white text-lg">+</span>
              </div>
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pt-12">
      {renderHeader()}
      
      <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {renderDays()}
        {renderCells()}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white capitalize">{selectedPost.platform} Gönderisi</h3>
              <button onClick={() => setSelectedPost(null)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {selectedPost.mediaUrl && (
              <div className="mb-4 rounded-xl overflow-hidden aspect-video border border-white/10">
                <img src={selectedPost.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl mb-4 text-sm text-zinc-300 whitespace-pre-wrap">
              {selectedPost.content}
            </div>
            
            <div className="flex justify-between text-sm text-zinc-400 mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedPost.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                {selectedPost.status}
              </div>
              <div>
                {selectedPost.scheduledFor ? format(parseISO(selectedPost.scheduledFor.toString()), 'dd MMM yyyy HH:mm', { locale: tr }) : 'Tarih Yok'}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                Düzenle
              </button>
              <button className="flex-1 py-2 rounded-xl bg-[#9A82FB] hover:bg-[#8A71EB] text-white font-medium transition-colors shadow-[0_0_20px_rgba(154,130,251,0.3)]">
                Şimdi Paylaş
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
