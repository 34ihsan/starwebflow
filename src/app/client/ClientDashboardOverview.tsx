'use client'

import { FileText, ArrowRight, Clock, ChevronRight, Activity, FolderKanban } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ClientDashboardOverview({ initialData, initialActivities = [] }: { initialData: any, initialActivities?: any[] }) {
  const { client, projects, contracts, recentInvoices } = initialData;
  const { t, language } = useLanguage();

  const getRelativeTime = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat(language === 'tr' ? 'tr' : language === 'de' ? 'de' : 'en', { numeric: 'auto' });
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.round(diff / (1000 * 60 * 60));
      if (diffHours === 0) return language === 'tr' ? 'Şimdi' : 'Now';
      return rtf.format(diffHours, 'hour');
    }
    return rtf.format(diffDays, 'day');
  };

  const RECENT_ACTIVITY = initialActivities.length > 0 ? initialActivities.map(act => ({
    id: act.id,
    title: act.details || act.action,
    time: getRelativeTime(act.createdAt)
  })) : [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            {t('dashboard.overview.welcome')}, <span className="text-[#4F8EF7]">{client?.name || 'Client'}</span>
          </h1>
          <p className="text-slate-400 mt-1">{t('dashboard.overview.subtitle')}</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {language === 'tr' ? 'Sistem Aktif' : language === 'en' ? 'System Online' : 'System Aktiv'}
        </div>
      </header>

      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-[#4F8EF7]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.overview.activeProjects')}</p>
              <h3 className="text-2xl font-bold text-white font-['Outfit'] mt-1">{projects?.length || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.overview.pendingInvoices')}</p>
              <h3 className="text-2xl font-bold text-orange-400 font-['Outfit'] mt-1">
                {recentInvoices?.filter((i: any) => i.status === 'PENDING').length || 0}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.overview.openTickets')}</p>
              <h3 className="text-2xl font-bold text-white font-['Outfit'] mt-1">1</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Projects */}
        <div className="col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-['Outfit'] flex items-center gap-2 text-white">
              <FolderKanban className="w-5 h-5 text-[#4F8EF7]" />
              {t('dashboard.overview.recentProjects')}
            </h2>
            <button className="text-sm text-[#4F8EF7] hover:text-white transition-colors">
              {language === 'tr' ? 'Tümünü Gör' : language === 'en' ? 'View All' : 'Alle anzeigen'}
            </button>
          </div>
          
          <div className="space-y-4">
            {projects?.length === 0 ? (
              <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-8 text-center">
                <p className="text-slate-400">{t('dashboard.projects.empty')}</p>
              </div>
            ) : (
              projects?.map((project: any) => (
                <div key={project.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">{project.title}</h3>
                      <span className="text-xs text-[#4F8EF7] bg-[#4F8EF7]/10 px-2 py-1 rounded-md border border-[#4F8EF7]/20">
                        {project.status === 'PLANNING' 
                          ? (language === 'tr' ? 'Planlama' : language === 'en' ? 'Planning' : 'Planung') 
                          : project.status === 'IN_PROGRESS' 
                            ? (language === 'tr' ? 'Geliştirme' : language === 'en' ? 'In Progress' : 'Entwicklung') 
                            : (language === 'tr' ? 'Tamamlandı' : language === 'en' ? 'Completed' : 'Abgeschlossen')}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#4F8EF7] transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">{t('dashboard.overview.progress')}</span>
                      <span className="text-white font-bold">%{project.progress || 0}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#4F8EF7] to-[#06B6D4] rounded-full relative"
                        style={{ width: `${project.progress || 0}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Contracts & Activity */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold font-['Outfit'] flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
              {t('dashboard.contracts.title')}
            </h2>

            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-lg">
              {contracts?.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  {language === 'tr' ? 'Bekleyen sözleşme yok.' : language === 'en' ? 'No pending contracts.' : 'Keine ausstehenden Verträge.'}
                </div>
              ) : (
                contracts?.map((contract: any, i: number) => (
                  <div key={contract.id} className={`p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors ${i !== contracts.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1 truncate max-w-[150px]">{contract.title}</h4>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${contract.status === 'İmza Bekliyor' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {contract.status === 'İmza Bekliyor' 
                          ? (language === 'tr' ? 'İmza Bekliyor' : language === 'en' ? 'Awaiting Signature' : 'Unterschrift ausstehend')
                          : (language === 'tr' ? 'İmzalandı' : language === 'en' ? 'Signed' : 'Unterzeichnet')}
                      </span>
                    </div>
                    <button className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${contract.action === 'İmzala' ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}>
                      {contract.action === 'İmzala' 
                        ? (language === 'tr' ? 'İmzala' : language === 'en' ? 'Sign' : 'Unterschreiben')
                        : (language === 'tr' ? 'Görüntüle' : language === 'en' ? 'View' : 'Ansehen')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold font-['Outfit'] flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-emerald-400" />
              {language === 'tr' ? 'Son Aktiviteler' : language === 'en' ? 'Recent Activities' : 'Letzte Aktivitäten'}
            </h2>

            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-2 shadow-lg">
              <div className="space-y-1">
                {RECENT_ACTIVITY.length === 0 ? (
                  <div className="p-3 text-center text-sm text-slate-400">
                    {language === 'tr' ? 'Henüz aktivite yok.' : 'No recent activity.'}
                  </div>
                ) : (
                  RECENT_ACTIVITY.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-default">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#4F8EF7] ring-4 ring-[#4F8EF7]/10 group-hover:ring-[#4F8EF7]/20 transition-all" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 font-medium">{activity.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
