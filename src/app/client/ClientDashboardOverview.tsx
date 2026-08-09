'use client'
import { motion } from 'framer-motion'
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
    <div className="relative p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Mesh Background */}
      <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none mix-blend-screen -z-10" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black font-['Outfit'] text-white flex items-center gap-3 tracking-tight">
            <span className="gradient-text">{t('dashboard.overview.welcome')}, {client?.name || 'Client'}</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">{t('dashboard.overview.subtitle')}</p>
        </div>
        <div className="px-5 py-2.5 glass border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-400 text-sm font-bold rounded-xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          {language === 'tr' ? 'Sistem Aktif' : language === 'en' ? 'System Online' : 'System Aktiv'}
        </div>
      </header>

      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass card-hover rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(79,142,247,0.2)]">
              <FolderKanban className="w-6 h-6 text-[#4F8EF7]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.overview.activeProjects')}</p>
              <h3 className="text-3xl font-black text-white font-['Outfit'] mt-1 tracking-tight">{projects?.length || 0}</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass card-hover rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.overview.pendingInvoices')}</p>
              <h3 className="text-3xl font-black text-orange-400 font-['Outfit'] mt-1 tracking-tight">
                {recentInvoices?.filter((i: any) => i.status === 'PENDING').length || 0}
              </h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass card-hover rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Activity className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.overview.openTickets')}</p>
              <h3 className="text-3xl font-black text-white font-['Outfit'] mt-1 tracking-tight">1</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Projects */}
        <div className="col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2 text-white">
              <div className="p-2 rounded-xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/20">
                <FolderKanban className="w-5 h-5 text-[#4F8EF7]" />
              </div>
              {t('dashboard.overview.recentProjects')}
            </h2>
            <button className="text-sm font-bold text-[#4F8EF7] hover:text-white transition-colors">
              {language === 'tr' ? 'Tümünü Gör' : language === 'en' ? 'View All' : 'Alle anzeigen'}
            </button>
          </div>
          
          <div className="space-y-4">
            {projects?.length === 0 ? (
              <div className="glass rounded-3xl p-8 text-center border-dashed border-2 border-white/10">
                <p className="text-slate-400 font-medium">{t('dashboard.projects.empty')}</p>
              </div>
            ) : (
              projects?.map((project: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={project.id} 
                  className="glass rounded-3xl p-6 card-hover group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <span className="text-xs font-bold text-[#4F8EF7] bg-[#4F8EF7]/10 px-3 py-1.5 rounded-lg border border-[#4F8EF7]/20">
                        {project.status === 'PLANNING' 
                          ? (language === 'tr' ? 'Planlama' : language === 'en' ? 'Planning' : 'Planung') 
                          : project.status === 'IN_PROGRESS' 
                            ? (language === 'tr' ? 'Geliştirme' : language === 'en' ? 'In Progress' : 'Entwicklung') 
                            : (language === 'tr' ? 'Tamamlandı' : language === 'en' ? 'Completed' : 'Abgeschlossen')}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#4F8EF7] group-hover:shadow-[0_0_15px_rgba(79,142,247,0.5)] transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">{t('dashboard.overview.progress')}</span>
                      <span className="text-white font-black">%{project.progress || 0}</span>
                    </div>
                    <div className="w-full h-3 bg-[#0A0A0F] rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#4F8EF7] to-[#06B6D4] rounded-full relative shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right: Contracts & Activity */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2 text-white">
              <div className="p-2 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                <FileText className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              {t('dashboard.contracts.title')}
            </h2>

            <div className="glass rounded-3xl overflow-hidden card-hover">
              {contracts?.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-slate-400">
                  {language === 'tr' ? 'Bekleyen sözleşme yok.' : language === 'en' ? 'No pending contracts.' : 'Keine ausstehenden Verträge.'}
                </div>
              ) : (
                contracts?.map((contract: any, i: number) => (
                  <div key={contract.id} className={`p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors ${i !== contracts.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1.5 truncate max-w-[150px]">{contract.title}</h4>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${contract.status === 'İmza Bekliyor' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {contract.status === 'İmza Bekliyor' 
                          ? (language === 'tr' ? 'İmza Bekliyor' : language === 'en' ? 'Awaiting Signature' : 'Unterschrift ausstehend')
                          : (language === 'tr' ? 'İmzalandı' : language === 'en' ? 'Signed' : 'Unterzeichnet')}
                      </span>
                    </div>
                    <button className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 ${contract.action === 'İmzala' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:scale-105' : 'glass hover:text-white hover:border-white/20'}`}>
                      {contract.action === 'İmzala' 
                        ? (language === 'tr' ? 'İmzala' : language === 'en' ? 'Sign' : 'Unterschreiben')
                        : (language === 'tr' ? 'Görüntüle' : language === 'en' ? 'View' : 'Ansehen')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2 text-white">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              {language === 'tr' ? 'Son Aktiviteler' : language === 'en' ? 'Recent Activities' : 'Letzte Aktivitäten'}
            </h2>

            <div className="glass rounded-3xl p-3 card-hover">
              <div className="space-y-1">
                {RECENT_ACTIVITY.length === 0 ? (
                  <div className="p-5 text-center text-sm font-medium text-slate-400">
                    {language === 'tr' ? 'Henüz aktivite yok.' : 'No recent activity.'}
                  </div>
                ) : (
                  RECENT_ACTIVITY.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors group cursor-default">
                      <div className="mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4F8EF7] shadow-[0_0_10px_rgba(79,142,247,0.5)] ring-4 ring-[#4F8EF7]/10 group-hover:ring-[#4F8EF7]/30 transition-all" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 font-bold">{activity.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">{activity.time}</p>
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
