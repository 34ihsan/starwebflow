'use client'

import { useState } from 'react'
import { FolderKanban, Search, ChevronRight, Clock, FileText, CheckCircle2, CheckSquare, X, Check, RefreshCw, AlertTriangle, Calendar, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const localDict = {
  tr: {
    title: 'Projelerim',
    subtitle: 'Geliştirme süreçlerini takip edin, dosyalarınıza ve detaylara erişin.',
    all: 'Tümü',
    active: 'Aktif',
    completed: 'Tamamlananlar',
    searchPlaceholder: 'Proje ara...',
    notFound: 'Proje Bulunamadı',
    notFoundDesc: 'Seçili filtrelere uygun proje bulunmuyor. Yeni bir proje başlatmak için bizimle iletişime geçin.',
    lastUpdate: 'Son Güncelleme:',
    generalProgress: 'Genel İlerleme',
    target: 'Hedef: 100%',
    inspectTasks: 'Görevleri İncele',
    filesPresentations: 'Dosyalar & Sunumlar',
    taskTracking: 'Görev Takibi',
    taskTrackingSubtitle: 'İşlerin ilerlemesini görüntüleyin ve teslimatları onaylayın.',
    loadingTasks: 'Görevler yükleniyor...',
    loadingTasksError: 'Görevler yüklenemedi.',
    noTasksTitle: 'Henüz Görev Eklenmemiş',
    noTasksDesc: 'Bu proje için ajans tarafından henüz bir görev oluşturulmadı.',
    devStage: 'Geliştirme Aşamasında',
    statusDoing: 'Yapılıyor',
    statusTodo: 'Yapılacak',
    noTasksColumn: 'Görev yok',
    awaitingApproval: 'Onayınızı Bekleyenler',
    underReview: 'İncelemede',
    revision: 'Revizyon',
    approve: 'Onayla',
    noPendingTasks: 'Onay bekleyen görev yok',
    completedColumn: 'Tamamlananlar',
    noCompletedTasks: 'Tamamlanan görev yok',
    actionError: 'İşlem gerçekleştirilemedi.',
    statusMapping: {
      'PLANNING': 'Planlama',
      'IN_PROGRESS': 'Geliştirme',
      'COMPLETED': 'Tamamlandı'
    }
  },
  en: {
    title: 'My Projects',
    subtitle: 'Track development processes, access your files and details.',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    searchPlaceholder: 'Search projects...',
    notFound: 'No Projects Found',
    notFoundDesc: 'No projects found matching the selected filters. Contact us to start a new project.',
    lastUpdate: 'Last Update:',
    generalProgress: 'Overall Progress',
    target: 'Target: 100%',
    inspectTasks: 'Review Tasks',
    filesPresentations: 'Files & Presentations',
    taskTracking: 'Task Tracking',
    taskTrackingSubtitle: 'View work progress and approve deliverables.',
    loadingTasks: 'Loading tasks...',
    loadingTasksError: 'Failed to load tasks.',
    noTasksTitle: 'No Tasks Added Yet',
    noTasksDesc: 'No tasks have been created for this project by the agency yet.',
    devStage: 'In Development',
    statusDoing: 'In Progress',
    statusTodo: 'To Do',
    noTasksColumn: 'No tasks',
    awaitingApproval: 'Awaiting Your Approval',
    underReview: 'Under Review',
    revision: 'Revision',
    approve: 'Approve',
    noPendingTasks: 'No tasks awaiting approval',
    completedColumn: 'Completed',
    noCompletedTasks: 'No completed tasks',
    actionError: 'Operation could not be completed.',
    statusMapping: {
      'PLANNING': 'Planning',
      'IN_PROGRESS': 'Development',
      'COMPLETED': 'Completed'
    }
  },
  de: {
    title: 'Meine Projekte',
    subtitle: 'Verfolgen Sie die Entwicklungsprozesse, greifen Sie auf Ihre Dateien und Details zu.',
    all: 'Alle',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    searchPlaceholder: 'Projekt suchen...',
    notFound: 'Keine Projekte gefunden',
    notFoundDesc: 'Keine Projekte gefunden, die den ausgewählten Filtern entsprechen. Kontaktieren Sie uns, um ein neues Projekt zu starten.',
    lastUpdate: 'Letztes Update:',
    generalProgress: 'Gesamtfortschritt',
    target: 'Ziel: 100%',
    inspectTasks: 'Aufgaben überprüfen',
    filesPresentations: 'Dateien & Präsentationen',
    taskTracking: 'Aufgabenverfolgung',
    taskTrackingSubtitle: 'Arbeitsfortschritt anzeigen und Lieferungen freigeben.',
    loadingTasks: 'Aufgaben werden geladen...',
    loadingTasksError: 'Aufgaben konnten nicht geladen werden.',
    noTasksTitle: 'Noch keine Aufgaben hinzugefügt',
    noTasksDesc: 'Für dieses Projekt wurden von der Agentur noch keine Aufgaben erstellt.',
    devStage: 'In Entwicklung',
    statusDoing: 'In Arbeit',
    statusTodo: 'To Do',
    noTasksColumn: 'Keine Aufgaben',
    awaitingApproval: 'Wartet auf Ihre Freigabe',
    underReview: 'In Überprüfung',
    revision: 'Revision',
    approve: 'Freigeben',
    noPendingTasks: 'Keine Aufgaben warten auf Freigabe',
    completedColumn: 'Abgeschlossen',
    noCompletedTasks: 'Keine abgeschlossenen Aufgaben',
    actionError: 'Aktion konnte nicht durchgeführt werden.',
    statusMapping: {
      'PLANNING': 'Planung',
      'IN_PROGRESS': 'Entwicklung',
      'COMPLETED': 'Abgeschlossen'
    }
  }
}

export default function ClientProjectsClient({ initialProjects }: { initialProjects: any[] }) {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  // Task states for Client
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [isClientActionLoading, setIsClientActionLoading] = useState<string | null>(null);

  const fetchProjectTasks = async (projectId: string) => {
    setIsTasksLoading(true);
    setTasksError(null);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks`);
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || dict.loadingTasksError);
      }
      setProjectTasks(resData.data || []);
    } catch (err: any) {
      setTasksError(err.message);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleOpenTasks = (project: any) => {
    setSelectedProject(project);
    fetchProjectTasks(project.id);
  };

  const handleCloseTasks = () => {
    setSelectedProject(null);
    setProjectTasks([]);
  };

  const handleClientAction = async (taskId: string, newStatus: 'done' | 'todo') => {
    setIsClientActionLoading(taskId);
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || dict.actionError);
      }
      setProjectTasks(projectTasks.map(t => t.id === taskId ? resData.data : t));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsClientActionLoading(null);
    }
  };

  const filteredProjects = initialProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === "ALL" ? true :
      activeTab === "ACTIVE" ? (p.status === "PLANNING" || p.status === "IN_PROGRESS") :
      p.status === "COMPLETED";
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const localizedLabel = dict.statusMapping[status as keyof typeof dict.statusMapping] || status
    switch (status) {
      case "PLANNING":
        return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
      case "IN_PROGRESS":
        return <span className="bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
      case "COMPLETED":
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
    }
  };

  const currencyLocale = language === 'tr' ? 'tr-TR' : 'de-DE'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-[#4F8EF7]" />
            {dict.title}
          </h1>
          <p className="text-slate-400 mt-2">{dict.subtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0A0A0F] border border-white/[0.05] p-4 rounded-2xl">
        <div className="flex bg-[#131B2A] rounded-lg p-1 border border-white/[0.05] w-full sm:w-auto">
          {["ALL", "ACTIVE", "COMPLETED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-[#4F8EF7] text-white shadow-[0_0_15px_rgba(79,142,247,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "ALL" ? dict.all : tab === "ACTIVE" ? dict.active : dict.completed}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4F8EF7] transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#0A0A0F] border border-white/[0.05] rounded-2xl border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">{dict.notFound}</h3>
            <p className="text-slate-400 text-center max-w-md">
              {dict.notFoundDesc}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => handleOpenTasks(project)}
              className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg hover:border-[#4F8EF7]/30 transition-all group cursor-pointer relative overflow-hidden"
            >
              {/* Card Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F8EF7]/5 rounded-full blur-3xl group-hover:bg-[#4F8EF7]/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 font-['Outfit'] group-hover:text-[#4F8EF7] transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(project.status)}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dict.lastUpdate} {new Date(project.updatedAt).toLocaleDateString(currencyLocale)}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#131B2A] border border-white/[0.05] flex items-center justify-center group-hover:bg-[#4F8EF7] transition-colors shadow-lg">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </div>
                </div>
                
                <div className="space-y-3 bg-[#131B2A]/50 p-4 rounded-xl border border-white/[0.02]">
                  <div className="flex justify-between text-sm items-end">
                    <div>
                      <span className="text-slate-400 block text-xs mb-1">{dict.generalProgress}</span>
                      <span className="text-white font-bold text-lg font-['Outfit']">%{project.progress || 0}</span>
                    </div>
                    <span className="text-xs text-slate-500">{dict.target}</span>
                  </div>
                  <div className="w-full h-3 bg-[#05050A] rounded-full overflow-hidden border border-white/[0.05]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#4F8EF7] to-[#06B6D4] rounded-full relative"
                      style={{ width: `${project.progress || 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4 border-t border-white/[0.05] pt-4">
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleOpenTasks(project); }}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    {dict.inspectTasks}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <FileText className="w-4 h-4 text-purple-400" />
                    {dict.filesPresentations}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Slide-Over Panel for Clients */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={handleCloseTasks}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-4xl bg-[#07070C] border-l border-white/[0.08] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-[#0A0A10]">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-[#4F8EF7]" />
                    {selectedProject.title} — {dict.taskTracking}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{dict.taskTrackingSubtitle}</p>
                </div>
                <button 
                  onClick={handleCloseTasks}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isTasksLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#4F8EF7] animate-spin" />
                    <span className="text-sm text-slate-400 font-medium">{dict.loadingTasks}</span>
                  </div>
                ) : tasksError ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{tasksError}</span>
                  </div>
                ) : projectTasks.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-2xl bg-white/[0.01]">
                    <CheckCircle2 className="w-12 h-12 text-slate-600 mb-3" />
                    <h4 className="text-white font-bold mb-1">{dict.noTasksTitle}</h4>
                    <p className="text-slate-400 text-sm max-w-xs text-center">{dict.noTasksDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Column 1: Yapılacak & Devam Edenler */}
                    <div className="border border-white/[0.05] bg-white/[0.01] rounded-2xl overflow-hidden">
                      <div className="border-t-4 border-t-[#4F8EF7] p-4 bg-[#0A0A10] border-b border-white/[0.05] flex justify-between items-center">
                        <span className="font-semibold text-white text-sm">{dict.devStage}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                          {projectTasks.filter(t => ['todo', 'doing'].includes(t.status)).length}
                        </span>
                      </div>
                      <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {projectTasks.filter(t => ['todo', 'doing'].includes(t.status)).map(task => (
                          <div key={task.id} className="bg-[#0A0A10] border border-white/[0.04] rounded-xl p-4 space-y-3 relative overflow-hidden">
                            <h4 className="font-semibold text-white text-sm leading-snug">{task.title}</h4>
                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-white/[0.02]">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                task.status === 'doing'
                                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                  : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                              }`}>
                                {task.status === 'doing' ? dict.statusDoing : dict.statusTodo}
                              </span>
                              {task.dueDate && (
                                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {new Date(task.dueDate).toLocaleDateString(currencyLocale, { day: '2-digit', month: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {projectTasks.filter(t => ['todo', 'doing'].includes(t.status)).length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500 italic">{dict.noTasksColumn}</div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Onay Bekleyenler (Review) */}
                    <div className="border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                      <div className="border-t-4 border-t-[#8B5CF6] p-4 bg-[#0A0A10] border-b border-white/[0.05] flex justify-between items-center">
                        <span className="font-semibold text-purple-300 text-sm">{dict.awaitingApproval}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300">
                          {projectTasks.filter(t => t.status === 'review').length}
                        </span>
                      </div>
                      <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {projectTasks.filter(t => t.status === 'review').map(task => (
                          <div key={task.id} className="bg-[#0A0A10] border border-[#8B5CF6]/30 rounded-xl p-4 space-y-3 shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/5 to-transparent" />
                            <div className="relative z-10 space-y-3">
                              <h4 className="font-semibold text-white text-sm leading-snug">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{task.description}</p>
                              )}
                              
                              <div className="flex justify-between items-center pt-2 border-t border-white/[0.02] text-[10px] text-slate-500">
                                <span className="text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded">
                                  {dict.underReview}
                                </span>
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(task.dueDate).toLocaleDateString(currencyLocale, { day: '2-digit', month: 'short' })}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={() => handleClientAction(task.id, 'todo')}
                                  disabled={isClientActionLoading === task.id}
                                  className="flex items-center justify-center gap-1 bg-transparent hover:bg-rose-500/10 border border-rose-500/20 text-rose-400 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                  {isClientActionLoading === task.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      {dict.revision}
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleClientAction(task.id, 'done')}
                                  disabled={isClientActionLoading === task.id}
                                  className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50"
                                >
                                  {isClientActionLoading === task.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      {dict.approve}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {projectTasks.filter(t => t.status === 'review').length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500 italic">{dict.noPendingTasks}</div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Tamamlananlar */}
                    <div className="border border-white/[0.05] bg-white/[0.01] rounded-2xl overflow-hidden">
                      <div className="border-t-4 border-t-emerald-500 p-4 bg-[#0A0A10] border-b border-white/[0.05] flex justify-between items-center">
                        <span className="font-semibold text-white text-sm">{dict.completedColumn}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                          {projectTasks.filter(t => t.status === 'done').length}
                        </span>
                      </div>
                      <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {projectTasks.filter(t => t.status === 'done').map(task => (
                          <div key={task.id} className="bg-[#0A0A10]/60 border border-white/[0.03] rounded-xl p-4 space-y-2 relative opacity-75 hover:opacity-100 transition-opacity">
                            <h4 className="font-semibold text-slate-300 text-sm leading-snug line-through">{task.title}</h4>
                            <div className="flex justify-between items-center pt-2 border-t border-white/[0.02]">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                {dict.approve}
                              </span>
                            </div>
                          </div>
                        ))}
                        {projectTasks.filter(t => t.status === 'done').length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500 italic">{dict.noCompletedTasks}</div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
