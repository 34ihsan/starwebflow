'use client'
import { motion } from 'framer-motion'
import { FileText, ArrowRight, Clock, ChevronRight, Activity, FolderKanban, Zap, MessageSquare, LifeBuoy, Plus, TrendingUp, Sparkles, Bot, Search, Share2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'

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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black font-['Outfit'] text-slate-900 tracking-tight">
              <span className="text-blue-600">{t('dashboard.overview.welcome')},</span>{' '}
              <span className="text-slate-900">{client?.name || 'Client'}</span>
            </h1>
          </div>
          <p className="text-slate-600 font-medium">{t('dashboard.overview.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sparkline mini chart */}
          <div className="hidden lg:flex items-end gap-0.5 h-8 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
            {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
              <div
                key={i}
                className="sparkline-bar w-2 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, #2563EB, #06B6D4)`,
                  opacity: 0.4 + i * 0.08,
                }}
              />
            ))}
          </div>
          <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 activity-dot" />
            {language === 'tr' ? 'Sistem Aktif' : language === 'en' ? 'System Online' : 'System Aktiv'}
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {[
          { icon: Plus,         label: language === 'tr' ? 'Yeni Talep' : language === 'de' ? 'Neue Anfrage' : 'New Request', href: '/client/support', color: '#2563EB' },
          { icon: MessageSquare, label: language === 'tr' ? 'Mesajlar'  : language === 'de' ? 'Nachrichten'  : 'Messages',    href: '/client/messages', color: '#7C3AED' },
          { icon: FileText,     label: language === 'tr' ? 'Faturalar'  : language === 'de' ? 'Rechnungen'   : 'Invoices',    href: '/client/invoices', color: '#0284C7' },
          { icon: LifeBuoy,     label: language === 'tr' ? 'Destek'     : language === 'de' ? 'Support'      : 'Support',     href: '/client/support',  color: '#059669' },
        ].map(({ icon: Icon, label, href, color }, i) => (
          <Link
            key={i}
            href={href}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all group hover:no-underline"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors whitespace-nowrap truncate">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform duration-500 shadow-xs">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.overview.activeProjects')}</p>
              <h3 className="text-3xl font-black text-slate-900 font-['Outfit'] mt-1 tracking-tight">{projects?.length || 0}</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-200 group-hover:scale-110 transition-transform duration-500 shadow-xs">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.overview.pendingInvoices')}</p>
              <h3 className="text-3xl font-black text-orange-600 font-['Outfit'] mt-1 tracking-tight">
                {recentInvoices?.filter((i: any) => i.status === 'PENDING').length || 0}
              </h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200 group-hover:scale-110 transition-transform duration-500 shadow-xs">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.overview.openTickets')}</p>
              <h3 className="text-3xl font-black text-slate-900 font-['Outfit'] mt-1 tracking-tight">1</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Projects */}
        <div className="col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2 text-slate-900">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                <FolderKanban className="w-5 h-5 text-blue-600" />
              </div>
              {t('dashboard.overview.recentProjects')}
            </h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              {language === 'tr' ? 'Tümünü Gör' : language === 'en' ? 'View All' : 'Alle anzeigen'}
            </button>
          </div>
          
          <div className="space-y-4">
            {projects?.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                <p className="text-slate-500 font-medium">{t('dashboard.projects.empty')}</p>
              </div>
            ) : (
              projects?.map((project: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={project.id} 
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-md group cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{project.title}</h3>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                        {project.status === 'PLANNING' 
                          ? (language === 'tr' ? 'Planlama' : language === 'en' ? 'Planning' : 'Planung') 
                          : project.status === 'IN_PROGRESS' 
                            ? (language === 'tr' ? 'Geliştirme' : language === 'en' ? 'In Progress' : 'Entwicklung') 
                            : (language === 'tr' ? 'Tamamlandı' : language === 'en' ? 'Completed' : 'Abgeschlossen')}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">{t('dashboard.overview.progress')}</span>
                      <span className="text-slate-900 font-black">%{project.progress || 0}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
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
            <h2 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2 text-slate-900">
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              {t('dashboard.contracts.title')}
            </h2>

            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
              {contracts?.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-slate-500">
                  {language === 'tr' ? 'Bekleyen sözleşme yok.' : language === 'en' ? 'No pending contracts.' : 'Keine ausstehenden Verträge.'}
                </div>
              ) : (
                contracts?.map((contract: any, i: number) => (
                  <div key={contract.id} className={`p-5 flex items-center justify-between hover:bg-slate-50 transition-colors ${i !== contracts.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5 truncate max-w-[150px]">{contract.title}</h4>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${contract.status === 'İmza Bekliyor' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {contract.status === 'İmza Bekliyor' 
                          ? (language === 'tr' ? 'İmza Bekliyor' : language === 'en' ? 'Awaiting Signature' : 'Unterschrift ausstehend')
                          : (language === 'tr' ? 'İmzalandı' : language === 'en' ? 'Signed' : 'Unterzeichnet')}
                      </span>
                    </div>
                    <button className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 ${contract.action === 'İmzala' ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs hover:scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
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
            <h2 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2 text-slate-900">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              {language === 'tr' ? 'Son Aktiviteler' : language === 'en' ? 'Recent Activities' : 'Letzte Aktivitäten'}
            </h2>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-3 shadow-xs">
              <div className="relative">
                {/* Timeline connector line */}
                {RECENT_ACTIVITY.length > 1 && (
                  <div className="absolute left-[22px] top-7 bottom-7 border-l-2 border-slate-100" aria-hidden="true" />
                )}
                <div className="space-y-1">
                  {RECENT_ACTIVITY.length === 0 ? (
                    <div className="p-5 text-center text-sm font-medium text-slate-500">
                      {language === 'tr' ? 'Henüz aktivite yok.' : 'No recent activity.'}
                    </div>
                  ) : (
                    RECENT_ACTIVITY.map((activity, idx) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default relative z-10">
                        <div className="mt-1 flex-shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 transition-all ${idx === 0 ? 'activity-dot' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 font-bold truncate">{activity.title}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{activity.time}</p>
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

      {/* B2B Ek Hizmet & Büyüme Fırsatları (One-Click AI & Web Add-ons) */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'tr' ? 'Büyüme & Otomasyon Fırsatları' : language === 'de' ? 'Wachstum & Automation' : 'Growth & Automation Add-ons'}
              </div>
              <h2 className="text-2xl font-black font-['Outfit'] tracking-tight">
                {language === 'tr' ? 'İşletmenizi Bir Sonraki Seviyeye Taşıyın' : language === 'de' ? 'Bringen Sie Ihr Unternehmen auf das nächste Level' : 'Scale Your Business to the Next Level'}
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
                {language === 'tr'
                  ? 'Mevcut projenize dakikalar içinde entegre edilebilen otonom yapay zeka ajanları, GEO arama optimizasyonu ve iş akışı otomasyonları.'
                  : language === 'de'
                  ? 'Autonome KI-Agenten, GEO-Suchoptimierung und Workflow-Automatisierungen, die nahtlos integriert werden können.'
                  : 'Autonomous AI agents, GEO search optimization, and automated workflows ready to integrate into your existing project.'}
              </p>
            </div>
            <Link
              href="/client/support?subject=Yeni+Hizmet+Talebi"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md hover:scale-105 whitespace-nowrap self-start md:self-auto hover:no-underline"
            >
              <Zap className="w-4 h-4" />
              {language === 'tr' ? 'Özel Teklif İste' : language === 'de' ? 'Angebot anfordern' : 'Request Custom Quote'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              {
                icon: Bot,
                title: language === 'tr' ? '7/24 AI Satış Ajanı' : language === 'de' ? '24/7 KI-Vertriebsagent' : '24/7 AI Sales Agent',
                desc: language === 'tr' ? 'WhatsApp ve web sitenizde müşterileri karşılayan, randevu alan otonom ajan.' : language === 'de' ? 'Autonomer Agent für WhatsApp & Web, der Termine bucht.' : 'Autonomous agent handling leads and booking calls on WhatsApp & Web.',
                badge: 'Hot'
              },
              {
                icon: Search,
                title: language === 'tr' ? 'GEO & AI Görünürlük' : language === 'de' ? 'GEO & KI-Sichtbarkeit' : 'GEO & AI Engine Ranking',
                desc: language === 'tr' ? 'Perplexity, ChatGPT ve Claude yanıtlarında markanızın 1. sırada önerilmesi.' : language === 'de' ? 'Top-Platzierung in KI-Suchmaschinen wie Perplexity und ChatGPT.' : 'Top ranking in AI search answers across Perplexity and ChatGPT.',
                badge: 'Top ROI'
              },
              {
                icon: Share2,
                title: language === 'tr' ? 'n8n İş Akışı Entegrasyonu' : language === 'de' ? 'n8n Workflow-Integration' : 'n8n Workflow Automation',
                desc: language === 'tr' ? 'CRM, faturalandırma ve e-posta sistemlerini birbirine bağlayan sıfır hata otomasyon.' : language === 'de' ? 'Fehlerfreie Automatisierung für CRM, Rechnungen und E-Mail.' : 'Zero-error automation connecting CRM, invoicing, and email stacks.',
                badge: 'Save 20h/wk'
              }
            ].map((addon, idx) => {
              const Icon = addon.icon;
              return (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-slate-800/90 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {addon.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1.5">{addon.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{addon.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
