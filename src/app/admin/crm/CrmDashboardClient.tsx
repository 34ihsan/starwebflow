"use client";

import { useState } from "react";
import { 
  Users, CheckCircle2, Clock, 
  AlertCircle, Search, 
  MoreHorizontal, Calendar,
  Plus, Target, TrendingUp, Sparkles, DollarSign, Mail, BrainCircuit, Send
} from "lucide-react";
import { createLead, createLeadWithAIEmail, getLeadActivities } from "@/app/actions/lead";
import { createTask, updateTaskStatus } from "@/app/actions/task";
import { formatCurrency, CURRENCIES } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAt?: Date | null;
  lead?: any | null;
  assignees: { id: string; name?: string | null; email: string }[];
}

function checkGhosting(lead: any) {
  if (!lead) return false;
  if (lead.ghostingAlert) return true;
  if (lead.status === "contacted" && lead.lastContactedAt) {
    const daysSinceContact = (new Date().getTime() - new Date(lead.lastContactedAt).getTime()) / (1000 * 3600 * 24);
    return daysSinceContact > 3;
  }
  return false;
}

export default function CrmDashboardClient({ initialLeads, initialTasks }: { initialLeads: any[], initialTasks: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "HIGH_VALUE" | "URGENT">("ALL");
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newLeadData, setNewLeadData] = useState({ 
    title: "", description: "", priority: "MEDIUM" as const, 
    firstName: "", lastName: "", value: 0, currency: "TRY",
    email: "", phone: "", company: "", industry: "", serviceType: "Genel",
    language: "Türkçe", sendAIEmail: false
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch activities when a task with a lead is selected
  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    setActivities([]);
    if (task.lead?.id) {
      setLoadingActivities(true);
      try {
        const res = await getLeadActivities(task.lead.id);
        if (res.success && res.data) {
          setActivities(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingActivities(false);
      }
    }
  };

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerGenerating, setOfferGenerating] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState("");
  const [targetOfferLead, setTargetOfferLead] = useState<any>(null);

  const handleGenerateOffer = (lead: any) => {
    if (!lead) return;
    setTargetOfferLead(lead);
    setIsOfferModalOpen(true);
    setOfferGenerating(true);
    setGeneratedOffer("");
    
    // Simulate AI generation delay (In a real app, this would call an AI action)
    setTimeout(() => {
      setOfferGenerating(false);
      const companyOrName = lead.company || lead.name || (lead.firstName ? `${lead.firstName} ${lead.lastName}` : "Müşterimiz");
      setGeneratedOffer(
        `Merhaba ${companyOrName} Ekibi,\n\nVeri analizlerimiz ve platformumuz üzerindeki etkileşimleriniz doğrultusunda, dijital dönüşüm süreçlerinizde size özel bir değer katabileceğimize inanıyoruz.\n\nSizlere özel olarak hazırladığımız bu teklifte, tüm hizmetlerimizde geçerli anında %5 indirim veya ilk ay ücretsiz danışmanlık/destek paketi sunuyoruz. Hedefimiz, markanızın büyüme ivmesini hızlandırmak ve operasyonel verimliliğinizi maksimize etmektir.\n\nDetayları görüşmek ve bu özel teklifimizi aktif hale getirmek için uygun olduğunuz bir zaman diliminde 15 dakikalık kısa bir görüşme ayarlayabiliriz.\n\nSaygılarımızla,\nStarWebflow AI Büyüme Ekibi`
      );
    }, 1500);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.lead && typeof task.lead === 'object' && 'name' in task.lead ? (task.lead as any).name : "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterType === "HIGH_VALUE") {
      return task.lead && (task.lead.value >= 10000 || (task.lead.winProbability && task.lead.winProbability >= 0.8));
    }
    if (filterType === "URGENT") {
      return task.priority === "URGENT" || (task.lead && checkGhosting(task.lead));
    }
    return true;
  });

  const todoTasks = filteredTasks.filter(t => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter(t => t.status === "IN_PROGRESS");
  const doneTasks = filteredTasks.filter(t => t.status === "DONE");

  const hotLeads = leads
    .filter(l => l.winProbability && l.winProbability > 0.5)
    .sort((a, b) => b.winProbability - a.winProbability)
    .slice(0, 5);

  const topLead = [...leads].sort((a,b) => (b.winProbability || 0) - (a.winProbability || 0))[0];
  const topLeadName = topLead?.company || topLead?.name || (topLead?.firstName ? `${topLead.firstName} ${topLead.lastName}` : "");
  const topLeadScore = topLead ? Math.round((topLead.winProbability || 0) * 100) : 0;

  const totalPipelineValue = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const wonLeadsCount = leads.filter(l => l.status === "won").length;
  const conversionRate = leads.length > 0 ? Math.round((wonLeadsCount / leads.length) * 100) : 0;
  
  const todayTasksCount = todoTasks.filter(t => {
    if (!t.dueAt) return false;
    const today = new Date();
    const due = new Date(t.dueAt);
    return due.getDate() === today.getDate() && due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
  }).length;

  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-400 via-[#8B5CF6] to-[#4F8EF7] bg-clip-text text-transparent">
              CRM, Satış & Pipeline
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">AI destekli lead skorlama, gelir tahmini ve pipeline yönetimi.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Görev veya müşteri ara..." 
              className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#8B5CF6]/50 transition-colors w-64 placeholder:text-[#64748B]"
            />
          </div>
          <div className="flex bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-1">
            <button onClick={() => setFilterType("ALL")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'ALL' ? 'bg-white/10 text-white' : 'text-[#64748B] hover:text-white'}`}>Tümü</button>
            <button onClick={() => setFilterType("HIGH_VALUE")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'HIGH_VALUE' ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-[#64748B] hover:text-white'}`}>Yüksek Değer</button>
            <button onClick={() => setFilterType("URGENT")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterType === 'URGENT' ? 'bg-red-400/20 text-red-400' : 'text-[#64748B] hover:text-white'}`}>Acil</button>
          </div>
          <button 
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Plus className="w-4 h-4" />
            Yeni Lead Ekle
          </button>
        </div>
      </div>

      {/* İstatistik & Forecasting Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#10B981]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Tahmini Gelir (Pipeline)</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(totalPipelineValue, "TRY")}</h3>
            </div>
          </div>
          <div className="text-xs text-[#10B981] font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Gerçek zamanlı veri
          </div>
        </div>

        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#4F8EF7]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F8EF7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#4F8EF7]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Aktif Leadler</p>
              <h3 className="text-2xl font-bold text-white">{leads.length}</h3>
            </div>
          </div>
          <div className="text-xs text-[#94A3B8] font-medium flex items-center gap-1">
            Satışa dönüşme oranı: <span className="text-[#4F8EF7]">%{conversionRate}</span>
          </div>
        </div>

        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-amber-400/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Takip Bekleyen</p>
              <h3 className="text-2xl font-bold text-white">{todoTasks.length}</h3>
            </div>
          </div>
          <div className="text-xs text-[#94A3B8] font-medium flex items-center gap-1">
            Bugün yapılması gereken: {todayTasksCount} görev
          </div>
        </div>

        <div className="bg-[#0A0A0F] border border-[#8B5CF6]/30 p-6 rounded-2xl relative overflow-hidden group hover:border-[#8B5CF6]/80 transition-colors shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          <div className="absolute top-0 right-0 p-3">
             <span className="text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 px-2 py-1 rounded font-bold flex items-center gap-1">
               <Sparkles className="w-3 h-3" /> AI INSIGHT
             </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/5 to-[#4F8EF7]/5"></div>
          <div className="relative">
            <p className="text-sm font-medium text-[#94A3B8] mb-2">Akıllı Öneri</p>
            {topLead ? (
              <>
                <p className="text-sm text-white leading-relaxed">
                  &quot;{topLeadName}&quot; (Skor: {topLeadScore}) anlaşmayı kapatmaya çok yakın. Hemen bir teklif iletilmesini öneriyoruz.
                </p>
                <button 
                  onClick={() => handleGenerateOffer(topLead)}
                  className="mt-3 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-3 py-1.5 rounded-lg transition-colors font-medium w-full"
                >
                  Teklif Oluştur
                </button>
              </>
            ) : (
              <p className="text-sm text-white leading-relaxed">
                Şu an için yeterli veri yok. Yeni lead'ler ekledikçe yapay zeka size akıllı öneriler sunacaktır.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Arama sonucu bilgisi */}
      {searchQuery && (
        <div className="mb-4 text-sm text-[#94A3B8]">
          <span className="text-white font-medium">{filteredTasks.length}</span> görev bulundu: &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Top Hot Leads Widget */}
      {hotLeads.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Predictive Routing: Kapanmaya En Yakın Fırsatlar
          </h2>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {hotLeads.map(lead => (
              <div key={lead.id} className="min-w-[300px] snap-start bg-[#0A0A0F] border border-amber-400/20 p-5 rounded-2xl relative group hover:border-amber-400/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-white">{lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim()}</div>
                  <div className="bg-amber-400/10 text-amber-400 text-xs font-bold px-2 py-1 rounded-md border border-amber-400/20">
                    %{Math.round(lead.winProbability * 100)} İhtimal
                  </div>
                </div>
                <div className="text-sm text-[#94A3B8] mb-3">
                  {formatCurrency(lead.value || 0, lead.currency || "TRY")}
                </div>
                <button className="w-full text-xs bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-white py-2 rounded-xl transition-opacity font-bold">
                  Hemen İletişime Geç
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Sıcak Fırsatlar", tasks: todoTasks, dot: "bg-amber-400", shadow: "shadow-[0_0_10px_rgba(251,191,36,0.5)]", targetStatus: "TODO" as const },
          { title: "Görüşme / Müzakere", tasks: inProgressTasks, dot: "bg-[#8B5CF6]", shadow: "shadow-[0_0_10px_rgba(139,92,246,0.5)]", targetStatus: "IN_PROGRESS" as const },
          { title: "Kazanılan / Tamamlanan", tasks: doneTasks, dot: "bg-[#10B981]", shadow: "shadow-[0_0_10px_rgba(16,185,129,0.5)]", targetStatus: "DONE" as const },
        ].map(col => (
          <div key={col.title} className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot} ${col.shadow}`}></div>
                {col.title} <span className="text-[#64748B] text-sm font-normal">({col.tasks.length})</span>
              </h3>
              <button className="text-[#64748B] hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 flex-1">
              {col.tasks.map(task => (
                <div key={task.id} onClick={() => handleTaskClick(task)}>
                  <TaskCard task={task} moveTask={moveTask} />
                </div>
              ))}
              {col.tasks.length === 0 && (
                <div className="border-2 border-dashed border-white/[0.05] rounded-xl p-8 text-center text-[#64748B] text-sm flex flex-col items-center justify-center">
                  <div className={`w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center mb-2`}>
                    <AlertCircle className="w-5 h-5 opacity-50" />
                  </div>
                  {searchQuery ? "Arama sonucu yok" : "Görev bulunmuyor"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0F] border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Yeni Lead / Görev Ekle</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Lead Adı</label>
                  <input 
                    type="text" 
                    value={newLeadData.firstName}
                    onChange={e => setNewLeadData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Lead Soyadı</label>
                  <input 
                    type="text" 
                    value={newLeadData.lastName}
                    onChange={e => setNewLeadData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">E-posta</label>
                  <input 
                    type="email" 
                    value={newLeadData.email}
                    onChange={e => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Telefon</label>
                  <input 
                    type="tel" 
                    value={newLeadData.phone}
                    onChange={e => setNewLeadData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Şirket</label>
                  <input 
                    type="text" 
                    value={newLeadData.company}
                    onChange={e => setNewLeadData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Sektör</label>
                  <input 
                    type="text" 
                    value={newLeadData.industry}
                    onChange={e => setNewLeadData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Örn: E-ticaret, Sağlık..."
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] mb-1 block">İletişim Dili</label>
                  <select 
                    value={newLeadData.language}
                    onChange={e => setNewLeadData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 appearance-none"
                  >
                    <option value="Türkçe">Türkçe</option>
                    <option value="English">English</option>
                    <option value="Deutsch">Deutsch</option>
                    <option value="Français">Français</option>
                    <option value="Español">Español</option>
                    <option value="العربية">العربية (Arabic)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Potansiyel Değer</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input 
                      type="number" 
                      value={newLeadData.value}
                      onChange={e => setNewLeadData(prev => ({ ...prev, value: Number(e.target.value) }))}
                      className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                    />
                  </div>
                  <select 
                    value={newLeadData.currency}
                    onChange={e => setNewLeadData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-24 bg-[#05050A] border border-white/[0.05] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 appearance-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Görev Başlığı</label>
                <input 
                  type="text" 
                  value={newLeadData.title}
                  onChange={e => setNewLeadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Açıklama (Opsiyonel)</label>
                <textarea 
                  rows={3}
                  value={newLeadData.description}
                  onChange={e => setNewLeadData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Öncelik</label>
                <select 
                  value={newLeadData.priority}
                  onChange={e => setNewLeadData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 appearance-none"
                >
                  <option value="LOW">Düşük (LOW)</option>
                  <option value="MEDIUM">Normal (MEDIUM)</option>
                  <option value="HIGH">Yüksek (HIGH)</option>
                  <option value="URGENT">Acil (URGENT)</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-white/[0.05]">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={newLeadData.sendAIEmail}
                      onChange={e => setNewLeadData(prev => ({ ...prev, sendAIEmail: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${newLeadData.sendAIEmail ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'bg-[#05050A] border-white/[0.1] group-hover:border-white/[0.2]'}`}>
                      {newLeadData.sendAIEmail && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" /> 
                    AI Destekli Tanışma E-postası Gönder
                  </span>
                </label>
                {newLeadData.sendAIEmail && (
                  <p className="text-xs text-[#94A3B8] mt-2 ml-8">
                    * GPT-4o-mini, sektör ve görev bağlamına uygun profesyonel, teklif/süre taahhüdü içermeyen bir karşılama metni oluşturup müşterinin e-posta adresine iletir.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsAddLeadModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors text-sm font-medium"
              >
                İptal
              </button>
              <button 
                onClick={async () => {
                  if(!newLeadData.title) return alert("Görev Başlığı zorunludur!");
                  if(newLeadData.sendAIEmail && !newLeadData.email) return alert("AI e-postası göndermek için bir e-posta adresi girmelisiniz!");
                  
                  const fullName = `${newLeadData.firstName} ${newLeadData.lastName}`.trim();
                  
                  const res = await createLeadWithAIEmail({
                    tenantId: 'default-tenant',
                    name: fullName || newLeadData.title,
                    email: newLeadData.email,
                    phone: newLeadData.phone,
                    company: newLeadData.company,
                    industry: newLeadData.industry,
                    serviceType: newLeadData.serviceType,
                    taskTitle: newLeadData.title,
                    taskDescription: newLeadData.description,
                    priority: newLeadData.priority,
                    sendEmail: newLeadData.sendAIEmail,
                    language: newLeadData.language
                  });

                  if (res.success) {
                    if (res.lead) setLeads(prev => [res.lead, ...prev]);
                    if (res.task) setTasks(prev => [res.task as any, ...prev]);
                  } else {
                    alert("Bir hata oluştu: " + res.error);
                  }
                  
                  setNewLeadData({ 
                    title: "", description: "", priority: "MEDIUM", 
                    firstName: "", lastName: "", value: 0, currency: "TRY",
                    email: "", phone: "", company: "", industry: "", serviceType: "Genel",
                    language: "Türkçe", sendAIEmail: false 
                  });
                  setIsAddLeadModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Lead Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Offer Generation Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-[#8B5CF6]/30 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#4F8EF7]"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" /> 
              AI Destekli Teklif Oluşturucu
            </h2>

            {offerGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-[#8B5CF6]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#8B5CF6] rounded-full border-t-transparent animate-spin"></div>
                  <BrainCircuit className="absolute inset-0 m-auto w-6 h-6 text-[#8B5CF6] animate-pulse" />
                </div>
                <p className="text-[#94A3B8] font-medium animate-pulse">{targetOfferLead ? (targetOfferLead.company || targetOfferLead.name || targetOfferLead.firstName) : 'Müşteri'} için özel strateji ve teklif metni hazırlanıyor...</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-4">
                  <label className="text-xs font-medium text-[#94A3B8] mb-2 block uppercase tracking-wider">Oluşturulan Taslak Teklif</label>
                  <textarea 
                    rows={8}
                    className="w-full bg-transparent text-white text-sm focus:outline-none resize-none leading-relaxed"
                    value={generatedOffer}
                    onChange={(e) => setGeneratedOffer(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <span className="text-xs font-medium text-[#10B981] flex items-center gap-1 bg-[#10B981]/10 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Metin Başarıyla Üretildi
                  </span>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsOfferModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors text-sm font-medium"
                    >
                      İptal
                    </button>
                    <button 
                      onClick={() => {
                        alert("Teklif başarıyla gönderildi!");
                        setIsOfferModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Müşteriye Gönder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.1] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-start bg-gradient-to-r from-blue-900/20 to-purple-900/20">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedTask.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border text-[#4F8EF7] border-[#4F8EF7]/20 bg-[#4F8EF7]/10`}>
                    {selectedTask.priority}
                  </span>
                  <span className="text-sm text-[#94A3B8]">Durum: <strong className="text-white">{selectedTask.status}</strong></span>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-[#64748B] hover:text-white p-2">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Lead Info */}
              {selectedTask.lead && (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#8B5CF6]" /> Müşteri Profili</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">Müşteri Adı</p>
                      <p className="text-sm text-white font-medium">{(selectedTask.lead as any).name || `${selectedTask.lead.firstName} ${selectedTask.lead.lastName}`}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">Potansiyel Değer</p>
                      <p className="text-sm text-[#10B981] font-bold">{formatCurrency(selectedTask.lead.value || 0, selectedTask.lead.currency || "TRY")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-1">AI Lead Skoru</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-white/[0.05] rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] h-2 rounded-full" style={{ width: `${selectedTask.lead.aiScore || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-white">{selectedTask.lead.aiScore || 0}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Görev Açıklaması</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-wrap bg-white/[0.01] p-4 rounded-xl border border-white/[0.05]">
                  {selectedTask.description || "Açıklama bulunmuyor."}
                </p>
              </div>

              {/* Timeline (Gerçek) */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#4F8EF7]" /> Etkileşim Geçmişi (Timeline)</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.1] before:to-transparent">
                  {loadingActivities ? (
                    <div className="text-[#94A3B8] text-sm text-center">Geçmiş yükleniyor...</div>
                  ) : activities.length > 0 ? (
                    activities.map((activity, idx) => (
                      <div key={activity.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A0A0F] bg-[#4F8EF7] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          {activity.action.includes('Email') || activity.action.includes('Message') ? <Mail className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-white text-sm">{activity.action}</div>
                            <time className="text-xs font-medium text-[#64748B]">
                              {new Date(activity.createdAt).toLocaleDateString("tr-TR")}
                            </time>
                          </div>
                          {activity.details && (
                            <div className="text-xs text-[#94A3B8]">{activity.details}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#64748B] text-sm text-center">Herhangi bir etkileşim kaydı bulunmuyor.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function TaskCard({ task, moveTask }: { task: Task, moveTask: (id: string, status: Task["status"]) => void }) {
  const priorityStyles = {
    LOW: "text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20",
    MEDIUM: "text-[#4F8EF7] bg-[#4F8EF7]/10 border-[#4F8EF7]/20",
    HIGH: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    URGENT: "text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.2)]"
  }[task.priority] || "text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20";

  return (
    <div className="bg-[#05050A] border border-white/[0.05] p-5 rounded-xl hover:border-white/[0.1] hover:bg-white/[0.01] transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${priorityStyles}`}>
          {task.priority}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           {task.status !== "TODO" && (
             <button onClick={() => moveTask(task.id, "TODO")} className="text-xs text-[#64748B] hover:text-white px-2 py-1 rounded bg-white/[0.05]">TODO</button>
           )}
           {task.status !== "IN_PROGRESS" && (
             <button onClick={() => moveTask(task.id, "IN_PROGRESS")} className="text-xs text-[#64748B] hover:text-white px-2 py-1 rounded bg-white/[0.05]">PROG</button>
           )}
           {task.status !== "DONE" && (
             <button onClick={() => moveTask(task.id, "DONE")} className="text-xs text-[#64748B] hover:text-white px-2 py-1 rounded bg-white/[0.05]">DONE</button>
           )}
        </div>
      </div>

      {task.lead && checkGhosting(task.lead) && (
        <div className="mb-3 w-full bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] px-2 py-2 rounded flex flex-col gap-2 font-bold animate-pulse">
          <div className="flex items-center gap-1">
             <AlertCircle className="w-3 h-3" /> GHOSTING RİSKİ: İletişim kopmuş olabilir!
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); alert("Follow-up e-postası (taslak) oluşturuldu."); }}
            className="bg-red-400 text-black px-2 py-1.5 rounded text-xs hover:bg-red-500 transition-colors flex items-center justify-center gap-1 w-full"
          >
             <Mail className="w-3 h-3" /> Follow-up Gönder
          </button>
        </div>
      )}

      <h4 className="text-sm font-semibold text-white mb-2 leading-relaxed">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-[#94A3B8] line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
      )}
      
      <div className="mt-auto">
        {task.lead && (
          <div className="flex flex-col gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#4F8EF7]/5 border border-[#4F8EF7]/10 text-xs text-[#4F8EF7] w-fit">
              <Users className="w-3 h-3" />
              {(task.lead as any).name || `${task.lead.firstName} ${task.lead.lastName}`}
            </div>
            <div className="flex items-center justify-between text-xs border-t border-white/[0.05] pt-2 mt-1">
              <span className="text-[#94A3B8] font-mono">{formatCurrency(task.lead.value || 0, task.lead.currency || "TRY")}</span>
              {task.lead.winProbability && (
                 <span className={`font-bold flex items-center gap-1 ${task.lead.winProbability >= 0.8 ? 'text-[#10B981]' : task.lead.winProbability >= 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                   <Sparkles className="w-3 h-3" /> Kazanma: %{Math.round(task.lead.winProbability * 100)}
                 </span>
              )}
              {!task.lead.winProbability && task.lead.aiScore && (
                 <span className={`font-bold flex items-center gap-1 ${task.lead.aiScore >= 80 ? 'text-[#10B981]' : task.lead.aiScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                   <Sparkles className="w-3 h-3" /> AI Skor: {task.lead.aiScore}
                 </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
          {task.dueAt ? (
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(task.dueAt).toLocaleDateString("tr-TR")}
            </div>
          ) : <div />}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.map((assignee, i) => (
                <div key={assignee.id} className={`w-7 h-7 rounded-full bg-[#0A0A0F] border-2 border-[#0A0A0F] flex items-center justify-center text-[10px] text-white font-bold z-${10-i} bg-gradient-to-tr from-[#8B5CF6] to-[#4F8EF7]`} title={assignee.name || assignee.email}>
                  {(assignee.name || "U")[0].toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
