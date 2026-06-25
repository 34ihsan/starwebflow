"use client";

import { useState } from "react";
import { 
  FolderKanban, Clock, Users, FileText, 
  ChevronLeft, AlertTriangle, Briefcase, 
  CheckCircle2, Plus, ArrowRight, Trash2, Edit3, Calendar, User, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProjectDetailClient({ project, users = [] }: { project: any; users?: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "TASKS" | "ASSETS" | "INVOICES">("OVERVIEW");

  const [tasks, setTasks] = useState<any[]>(project.tasks || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setDueDate("");
    setErrorMsg(null);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/v1/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          assigneeId: assigneeId || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || "Görev eklenirken bir hata oluştu.");
      }

      setTasks([...tasks, resData.data]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || "Görev durumu güncellenirken hata oluştu.");
      }

      setTasks(tasks.map(t => t.id === taskId ? resData.data : t));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !title.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/v1/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          assigneeId: assigneeId || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          status: editingTask.status,
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || "Görev güncellenirken bir hata oluştu.");
      }

      setTasks(tasks.map(t => t.id === editingTask.id ? resData.data : t));
      setIsEditModalOpen(false);
      setEditingTask(null);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error?.message || "Görev silinirken hata oluştu.");
      }

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setAssigneeId(task.assigneeId || "");
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    setIsEditModalOpen(true);
  };

  const columns = [
    { id: 'todo', title: 'Yapılacaklar', borderClass: 'border-t-[#4F8EF7]', bgClass: 'bg-[#4F8EF7]/5', textClass: 'text-[#4F8EF7]' },
    { id: 'doing', title: 'Yapılıyor', borderClass: 'border-t-amber-500', bgClass: 'bg-amber-500/5', textClass: 'text-amber-400' },
    { id: 'review', title: 'İncelemede', borderClass: 'border-t-purple-500', bgClass: 'bg-purple-500/5', textClass: 'text-purple-400' },
    { id: 'done', title: 'Tamamlandı', borderClass: 'border-t-emerald-500', bgClass: 'bg-emerald-500/5', textClass: 'text-emerald-400' }
  ];

  const tabs = [
    { id: "OVERVIEW", label: "Genel Bakış", icon: Briefcase },
    { id: "TASKS", label: "Görevler", icon: CheckCircle2 },
    { id: "ASSETS", label: "Dosyalar", icon: FileText },
    { id: "INVOICES", label: "Finans", icon: FolderKanban },
  ] as const;

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Projelere Dön
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {project.title}
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${
              project.status === 'DELIVERED' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
              project.status === 'DEVELOPMENT' ? 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' :
              project.status === 'PLANNING' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
              'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20'
            }`}>
              {project.status}
            </span>
            {project.riskLevel === 'HIGH' && project.status !== 'DELIVERED' && (
              <span className="text-xs px-2.5 py-1 rounded-md font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> YÜKSEK RİSK
              </span>
            )}
          </div>
          
          <p className="text-[#94A3B8] mt-2 max-w-2xl">
            {project.client?.companyName || project.client?.name || 'Müşteri atanmamış'} için {project.type === 'BESPOKE' ? 'Müşteri Projesi' : 'İç Geliştirme'} süreci.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#0A0A0F] border border-white/[0.05] p-4 rounded-xl">
          <div className="text-center pr-6 border-r border-white/[0.05]">
            <p className="text-xs text-[#94A3B8] font-medium mb-1">İlerleme</p>
            <p className="text-xl font-bold text-white">%{project.progress}</p>
          </div>
          <div className="text-center pl-2">
            <p className="text-xs text-[#94A3B8] font-medium mb-1">Harcanan Zaman</p>
            <div className="flex items-center gap-1 text-white">
              <Clock className="w-4 h-4 text-[#4F8EF7]" />
              <p className="text-xl font-bold">{(project.id.length % 20) * 8}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.05]">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-2 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#8B5CF6]' : ''}`} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "OVERVIEW" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Proje Özeti</h3>
                {project.briefData ? (
                  <pre className="text-sm text-[#94A3B8] whitespace-pre-wrap font-sans">
                    {JSON.stringify(project.briefData, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-[#64748B] italic">Bu proje için detaylı bir özet (brief) girilmemiştir.</p>
                )}
              </div>

              {project.riskLevel !== 'LOW' && project.status !== 'DELIVERED' && (
                <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-[#0A0A0F] border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-rose-500/30">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Risk Analizi</h3>
                      <p className="text-sm text-rose-200/80 leading-relaxed">
                        {project.riskReason || "Belirlenmiş bir risk nedeni yok."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-[#94A3B8]">Müşteri Bilgileri</h3>
                {project.client ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#4F8EF7] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      {(project.client.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{project.client.name}</p>
                      <p className="text-sm text-[#64748B]">{project.client.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B] italic">Müşteri atanmamış.</p>
                )}
              </div>

              <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-[#94A3B8]">Proje Yöneticisi</h3>
                {project.manager ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10B981] to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {(project.manager.name || "M")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{project.manager.name}</p>
                      <p className="text-sm text-[#64748B]">{project.manager.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B] italic">Yönetici atanmamış.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "TASKS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0F]/50 border border-white/[0.05] p-6 rounded-2xl">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">Kanban Panosu</h3>
                <p className="text-sm text-slate-400 mt-1">Görevlerin durumunu kolonlar üzerinden yönetin ve atayın.</p>
              </div>
              <button 
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                className="flex items-center justify-center gap-2 bg-[#4F8EF7] hover:bg-[#3B7DE8] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,142,247,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Yeni Görev Ekle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className={`border border-white/[0.05] rounded-2xl overflow-hidden ${col.bgClass}`}>
                    <div className={`border-t-4 ${col.borderClass} p-4 bg-[#0A0A0F]/60 border-b border-white/[0.05] flex justify-between items-center`}>
                      <span className="font-semibold text-white text-sm">{col.title}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400`}>
                        {colTasks.length}
                      </span>
                    </div>
                    
                    <div className="p-3 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto custom-scrollbar">
                      {colTasks.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center border border-dashed border-white/[0.03] rounded-xl text-xs text-slate-500 italic">
                          Görev yok
                        </div>
                      ) : (
                        colTasks.map(task => {
                          const assignee = users.find(u => u.id === task.assigneeId);
                          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                          
                          return (
                            <div 
                              key={task.id}
                              className="bg-[#0A0A0F] border border-white/[0.05] hover:border-white/10 rounded-xl p-4 space-y-3 transition-all group relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-16 h-16 bg-[#4F8EF7]/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              <div className="relative z-10 space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-semibold text-white text-sm leading-snug break-words pr-8">
                                    {task.title}
                                  </h4>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0">
                                    <button 
                                      onClick={() => openEditModal(task)}
                                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
                                      title="Düzenle"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-400 transition-colors"
                                      title="Sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                {task.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex justify-between items-center pt-2 border-t border-white/[0.03]">
                                  {/* Assignee */}
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#4F8EF7] flex items-center justify-center text-[9px] font-bold text-white uppercase flex-shrink-0">
                                      {assignee ? assignee.name[0] : <User className="w-2.5 h-2.5 text-slate-400" />}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium truncate">
                                      {assignee ? assignee.name : 'Atanmamış'}
                                    </span>
                                  </div>
                                  
                                  {/* Due date */}
                                  {task.dueDate && (
                                    <div className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${
                                      isOverdue 
                                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' 
                                        : 'text-slate-400 bg-white/5'
                                    }`}>
                                      <Calendar className="w-2.5 h-2.5" />
                                      <span>
                                        {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Quick status moves */}
                                <div className="flex items-center justify-end pt-1">
                                  <select 
                                    value={task.status} 
                                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                    className="bg-[#131B2A] border border-white/[0.05] rounded text-[10px] px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-[#4F8EF7] cursor-pointer"
                                  >
                                    <option value="todo">Yapılacak</option>
                                    <option value="doing">Yapılıyor</option>
                                    <option value="review">İncelemede</option>
                                    <option value="done">Tamamlandı</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "ASSETS" && (
          <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-6 text-center py-24">
            <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Dosya Yönetimi</h3>
            <p className="text-[#94A3B8] max-w-sm mx-auto mb-6">
              Projenin dokümanlarını, tasarımlarını ve sözleşmelerini buradan yönetebilirsiniz.
            </p>
            <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Dosya Yükle
            </button>
          </div>
        )}

        {activeTab === "INVOICES" && (
          <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-6 text-center py-24">
            <FolderKanban className="w-12 h-12 text-[#64748B] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Finans ve Faturalar</h3>
            <p className="text-[#94A3B8] max-w-sm mx-auto mb-6">
              Projeye ait ödemeler, faturalar ve bakiyeler bu alandan takip edilecek.
            </p>
            <Link href="/admin/invoices" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Faturalar Paneline Git
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0F] border border-white/[0.08] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Yeni Görev Ekle</h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Görev Başlığı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="örn: Landing Page Tasarımı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Açıklama</label>
                <textarea 
                  placeholder="Görev detayları..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Sorumlu</label>
                  <select 
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors"
                  >
                    <option value="">Atanmamış</option>
                    {users.filter(u => ['AGENCY_OWNER', 'AGENCY_MEMBER'].includes(u.role)).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Teslim Tarihi</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
                <button 
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="px-5 py-2.5 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-[#4F8EF7] hover:bg-[#3B7DE8] text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,142,247,0.3)] disabled:opacity-50"
                >
                  {isLoading ? 'Ekleniyor...' : 'Görev Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0F] border border-white/[0.08] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Görevi Düzenle</h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingTask(null); resetForm(); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditTaskSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Görev Başlığı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="örn: Landing Page Tasarımı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Açıklama</label>
                <textarea 
                  placeholder="Görev detayları..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Sorumlu</label>
                  <select 
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors"
                  >
                    <option value="">Atanmamış</option>
                    {users.filter(u => ['AGENCY_OWNER', 'AGENCY_MEMBER'].includes(u.role)).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Teslim Tarihi</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Durum</label>
                <select 
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F8EF7] transition-colors cursor-pointer"
                >
                  <option value="todo">Yapılacak</option>
                  <option value="doing">Yapılıyor</option>
                  <option value="review">İncelemede</option>
                  <option value="done">Tamamlandı</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
                <button 
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingTask(null); resetForm(); }}
                  className="px-5 py-2.5 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-[#4F8EF7] hover:bg-[#3B7DE8] text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(79,142,247,0.3)] disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
