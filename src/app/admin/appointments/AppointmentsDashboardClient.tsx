"use client";

import { useState } from "react";
import { 
  CalendarDays, Video, Clock, Users,
  Link as LinkIcon, Plus, ChevronRight,
  Settings, Copy, Calendar, RefreshCw, Bell, Smartphone, MessageSquare
} from "lucide-react";

import { createAppointment } from "@/app/actions/appointment";

export default function AppointmentsDashboardClient({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "types">("upcoming");
  const [appointments, setAppointments] = useState<any[]>(initialData);
  const [isCreating, setIsCreating] = useState(false);

  const now = new Date();
  const dbUpcoming = appointments.filter(a => new Date(a.endTime) >= now);
  const dbPast = appointments.filter(a => new Date(a.endTime) < now);

  const displayUpcoming = dbUpcoming;

  const appointmentTypes = [
    {
      id: "T-1",
      name: "Keşif Görüşmesi",
      duration: "30 dk",
      link: "cal.com/starwebflow/discovery",
      active: true
    },
    {
      id: "T-2",
      name: "Teknik Danışmanlık",
      duration: "60 dk",
      link: "cal.com/starwebflow/tech-consult",
      active: true
    }
  ];

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Randevular
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Müşteri görüşmeleri, Google Meet / Zoom entegrasyonu ve uygunluk takvimi.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              // TODO: Implement real modal for new appointment
              alert("Bu özellik yakında eklenecektir.");
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Randevu Planla
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.05] pb-4">
        {[
          { id: "upcoming", label: "Gelecek Görüşmeler", icon: CalendarDays },
          { id: "past", label: "Geçmiş", icon: Clock },
          { id: "types", label: "Randevu Tipleri", icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white/[0.05] text-white border border-white/[0.1]"
                : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.02]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "upcoming" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-4">
              {displayUpcoming.length > 0 ? displayUpcoming.map((apt) => {
                const guestName = apt.clientName || apt.guest;
                const typeName = apt.title || apt.type;
                const platformName = apt.platform || "Google Meet";
                
                let dateStr = apt.date;
                let timeStr = apt.time;
                if (apt.startTime) {
                  const d = new Date(apt.startTime);
                  dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
                  timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + " - " + 
                            new Date(apt.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                }

                return (
                <div key={apt.id} className="bg-[#0A0A0F]/80 border border-white/[0.05] p-6 rounded-2xl hover:border-white/[0.1] transition-colors relative group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 min-w-[80px]">
                        <span className="text-xs text-blue-400 font-semibold">{dateStr}</span>
                        <span className="text-lg font-bold text-white mt-1">{timeStr?.split(" - ")[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{guestName}</h3>
                        <p className="text-sm text-[#94A3B8] mt-1">{typeName}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                            <Video className="w-4 h-4" />
                            {platformName}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                            <Clock className="w-4 h-4" />
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a 
                        href={apt.meetLink?.startsWith('http') ? apt.meetLink : `https://${apt.meetLink}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/25"
                      >
                        <Video className="w-4 h-4" />
                        Görüşmeye Katıl
                      </a>
                    </div>
                  </div>
                </div>
              )}) : (
                <div className="text-center py-20 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
                  <CalendarDays className="w-12 h-12 text-[#64748B] mx-auto mb-4 opacity-50" />
                  <h3 className="text-white font-semibold mb-2">Yaklaşan Görüşme Yok</h3>
                  <p className="text-[#64748B] text-sm max-w-sm mx-auto">Şu anda planlanmış gelecek bir randevunuz bulunmuyor.</p>
                </div>
              )}
            </div>

            <div className="xl:col-span-1">
              <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-between">
                  Takvim Senkronizasyonu
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </h3>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 relative overflow-hidden mb-4 group cursor-pointer hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Google Calendar</p>
                      <p className="text-xs text-[#94A3B8]">sinan@starwebflow.com</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Son sek. 2 dk önce</span>
                    <button className="text-blue-400 hover:text-blue-300">Ayarlar</button>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] text-[#94A3B8] hover:text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Yeni Takvim Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "types" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointmentTypes.map(type => (
              <div key={type.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.1] transition-colors relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{type.name}</h3>
                  <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">{type.duration}</span>
                </div>
                
                <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-3 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] truncate mr-2">
                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{type.link}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold whitespace-nowrap hover:bg-blue-500/20 transition-colors">
                      Önizle
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white transition-colors" title="Kopyala">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span>2 Hatırlatıcı Aktif</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#64748B]" />
                    <MessageSquare className="w-3.5 h-3.5 text-[#64748B]" />
                  </div>
                </div>

                <button className="w-full flex items-center justify-between py-2 text-sm text-[#94A3B8] hover:text-white transition-colors group/btn">
                  Düzenle & Otomasyonlar
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-4">
            {dbPast.length > 0 ? dbPast.map((apt) => {
              const d = new Date(apt.startTime);
              const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
              const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={apt.id} className="bg-[#0A0A0F]/80 border border-white/[0.05] p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold">{apt.clientName}</h4>
                    <p className="text-sm text-[#94A3B8]">{apt.title} • {dateStr} {timeStr}</p>
                  </div>
                  <span className="px-3 py-1 bg-white/10 text-white rounded-md text-xs">Tamamlandı</span>
                </div>
              )
            }) : (
              <div className="text-center py-20 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
                <Clock className="w-12 h-12 text-[#64748B] mx-auto mb-4 opacity-50" />
                <h3 className="text-white font-semibold mb-2">Geçmiş Görüşmeler</h3>
                <p className="text-[#64748B] text-sm max-w-sm mx-auto">Tamamlanan tüm toplantılarınızı ve AI toplantı notlarını buradan inceleyebilirsiniz.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
