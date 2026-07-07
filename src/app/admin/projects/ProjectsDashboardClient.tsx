"use client";

import { useState } from "react";
import { 
  FolderKanban, Plus, Search, 
  Users, CheckCircle2, Clock, 
  Briefcase, FileText, XCircle,
  AlertTriangle, ShieldAlert, Zap, TrendingDown
} from "lucide-react";
import Link from "next/link";
import { createProject } from "@/app/actions/project";

interface Project {
  id: string;
  name: string;
  type: "BESPOKE" | "INTERNAL_PRODUCT";
  status: "PLANNING" | "DEVELOPMENT" | "TESTING" | "DELIVERED";
  progress: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReason?: string;
  client?: { companyName: string };
  teamMembers: { id: string; name: string; email: string }[];
  contracts: { type: string }[];
  tasks: { status: string }[];
}

export default function ProjectsDashboardClient({ initialProjects }: { initialProjects: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [viewMode, setViewMode] = useState<"CARDS" | "GANTT">("CARDS");


  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: "", type: "BESPOKE" as const, companyName: "" });

  const filteredProjects = projects.filter(p => 
    (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.client?.name || p.client?.companyName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bespokeProjects = filteredProjects.filter(p => p.type === "BESPOKE");
  const internalProjects = filteredProjects.filter(p => p.type === "INTERNAL_PRODUCT");

  const totalActive = projects.filter(p => p.status !== "DELIVERED").length;
  const highRiskProjects = projects.filter(p => p.riskLevel === "HIGH" && p.status !== "DELIVERED").length;

  const uniqueTeamMembers = new Set(
    projects.flatMap(p => (p.teamMembers || p.tasks?.map((t: any) => t.assigneeId) || []).filter(Boolean))
  ).size;

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Projeler & Risk Merkezi
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">AI destekli risk analizi, milestone yönetimi ve geliştirici atamaları.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-1">
            <button 
              onClick={() => setViewMode("CARDS")} 
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${viewMode === 'CARDS' ? 'bg-white/10 text-white' : 'text-[#64748B] hover:text-white'}`}>
              Kartlar
            </button>
            <button 
              onClick={() => setViewMode("GANTT")} 
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'GANTT' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#64748B] hover:text-white'}`}>
              Gantt Chart
            </button>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Proje veya müşteri ara..." 
              className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#8B5CF6]/50 transition-colors w-64 placeholder:text-[#64748B]"
            />
          </div>
          <button 
            onClick={() => setIsAddProjectModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Plus className="w-4 h-4" />
            Yeni Proje
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F8EF7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-[#4F8EF7]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Toplam Proje</p>
              <h3 className="text-2xl font-bold text-white">{projects.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Aktif Geliştirilen</p>
              <h3 className="text-2xl font-bold text-white">{totalActive}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Atanan Uzmanlar</p>
              <h3 className="text-2xl font-bold text-white">{uniqueTeamMembers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0F] border border-rose-500/20 p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-colors shadow-[0_0_20px_rgba(244,63,94,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-100"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Riskli Projeler</p>
              <h3 className="text-2xl font-bold text-white">{highRiskProjects}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* AI Risk Monitor Banner */}
      <div className="bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-[#0A0A0F] border border-rose-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden flex items-start gap-4">
        <div className="absolute top-0 right-0 p-3">
            <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> AI RISK MONITOR
            </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-rose-500/30">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">Dikkat Edilmesi Gereken Projeler</h3>
          <p className="text-sm text-[#94A3B8] mb-4">AI tarafından tespit edilen operasyonel riskler ve gecikme ihtimali olan görevler.</p>
          
          <div className="space-y-3">
            {projects.filter(p => p.riskLevel !== 'LOW' && p.status !== 'DELIVERED').map(p => (
              <div key={p.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{p.title || p.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      p.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {p.riskLevel} RISK
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {p.riskReason}
                  </p>
                </div>
                <button className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                  Müdahale Et
                </button>
              </div>
            ))}
            {projects.filter(p => p.riskLevel !== 'LOW' && p.status !== 'DELIVERED').length === 0 && (
               <div className="text-emerald-400 text-sm flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Tüm projeler planda ilerliyor, risk tespit edilmedi.
               </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === "GANTT" ? (
        <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#8B5CF6]" /> Zaman Çizelgesi (Gantt Chart)</h2>
          <div className="min-w-[800px]">
            <div className="flex border-b border-white/[0.05] pb-2 mb-4 text-xs font-medium text-[#64748B]">
              <div className="w-48 shrink-0">Proje</div>
              <div className="flex-1 flex justify-between px-4">
                <span>1. Hafta</span>
                <span>2. Hafta</span>
                <span>3. Hafta</span>
                <span>4. Hafta</span>
                <span>5. Hafta</span>
              </div>
            </div>
            <div className="space-y-4">
              {filteredProjects.map((project, i) => {
                const startMargin = (i % 3) * 10;
                const width = 20 + ((i % 5) * 8);
                return (
                  <div key={project.id} className="flex items-center group">
                    <div className="w-48 shrink-0 pr-4 truncate text-sm font-medium text-white group-hover:text-[#4F8EF7] transition-colors cursor-pointer">
                      {project.title || project.name}
                    </div>
                    <div className="flex-1 relative h-6 bg-white/[0.02] rounded-full overflow-hidden border border-white/[0.05]">
                      <div 
                        className={`absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/80 to-[#4F8EF7]/80 group-hover:from-[#8B5CF6] group-hover:to-[#4F8EF7] transition-all`}
                        style={{ left: `${startMargin}%`, width: `${width}%` }}
                      >
                        <div className="px-2 py-1 text-[10px] font-bold text-white truncate w-full h-full flex items-center">
                          {project.progress}% Tamamlandı
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-[#64748B] text-sm">Proje bulunamadı.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Client Projects (Bespoke) */}
          <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#4F8EF7]/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#4F8EF7]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Müşteri Projeleri (Bespoke)</h2>
                <p className="text-[#64748B] text-sm mt-1">Dışarıya yapılan geliştirme ve tasarım hizmetleri.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              {bespokeProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {bespokeProjects.length === 0 && (
                <div className="py-12 text-center text-[#64748B] text-sm border-2 border-dashed border-white/[0.05] rounded-xl">
                  Bespoke proje bulunmamaktadır.
                </div>
              )}
            </div>
          </div>

          {/* Internal Products */}
          <div className="bg-[#0A0A0F]/50 border border-white/[0.05] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">İç Geliştirme (Internal Products)</h2>
                <p className="text-[#64748B] text-sm mt-1">Kendi girişimlerimiz ve SaaS ürünlerimiz.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              {internalProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {internalProjects.length === 0 && (
                <div className="py-12 text-center text-[#64748B] text-sm border-2 border-dashed border-white/[0.05] rounded-xl">
                  İç proje bulunmamaktadır.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0F] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Yeni Proje Oluştur</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Proje Adı</label>
                <input 
                  type="text" 
                  value={newProjectData.name}
                  onChange={e => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  placeholder="Örn: E-Ticaret Dönüşümü"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Müşteri Şirket Adı</label>
                <input 
                  type="text" 
                  value={newProjectData.companyName}
                  onChange={e => setNewProjectData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50"
                  placeholder="Örn: Yılmazlar A.Ş."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8] mb-1 block">Proje Tipi</label>
                <select 
                  value={newProjectData.type}
                  onChange={e => setNewProjectData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]/50 appearance-none"
                >
                  <option value="BESPOKE">Müşteri Projesi (Bespoke)</option>
                  <option value="INTERNAL_PRODUCT">İç Proje (Internal)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsAddProjectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors text-sm font-medium"
              >
                İptal
              </button>
              <button 
                onClick={async () => {
                  if(!newProjectData.name) return alert("Proje Adı zorunludur!");
                  
                  const res = await createProject({
                    tenantId: 'default-tenant',
                    title: newProjectData.name,
                    type: newProjectData.type
                  });
                  
                  if (res.success && res.data) {
                    setProjects(prev => [res.data, ...prev]);
                  }

                  setNewProjectData({ name: "", type: "BESPOKE", companyName: "" });
                  setIsAddProjectModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const contracts = project.contracts || [];
  const hasLastenheft = contracts.some((c: any) => c.type === "LASTENHEFT");
  const hasPflichtenheft = contracts.some((c: any) => c.type === "PFLICHTENHEFT");

  return (
    <div className={`bg-[#05050A] border ${project.riskLevel === 'HIGH' && project.status !== 'DELIVERED' ? 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/[0.05]'} p-6 rounded-xl hover:border-white/[0.1] hover:bg-white/[0.01] transition-all group relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link href={`/admin/projects/${project.id}`}>
            <h3 className="text-lg font-semibold text-white hover:text-[#4F8EF7] transition-colors cursor-pointer">{project.title || project.name}</h3>
          </Link>
          {(project.client?.name || project.client?.companyName) && (
            <p className="text-sm text-[#64748B] mt-1">{project.client.name || project.client.companyName}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${
            project.status === 'DELIVERED' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
            project.status === 'DEVELOPMENT' ? 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' :
            project.status === 'PLANNING' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
            'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20'
          }`}>
            {project.status}
          </span>
          {project.riskLevel === 'HIGH' && project.status !== 'DELIVERED' && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> YÜKSEK RİSK
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#94A3B8] mb-2 font-medium">
          <span>İlerleme</span>
          <span className="text-white">%{project.progress}</span>
        </div>
        <div className="w-full bg-[#0A0A0F] rounded-full h-2 border border-white/[0.05]">
          <div className={`h-2 rounded-full relative ${project.status === 'DELIVERED' ? 'bg-[#10B981]' : 'bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7]'}`} style={{ width: `${project.progress}%` }}>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/20 rounded-full blur-[2px]"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 border-t border-white/[0.05] pt-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer" title="Dosyalar">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{contracts.length} Dosya</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]" title="Görevler">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{project.tasks?.length || 0} Görev</span>
          </div>
        </div>

        {/* Team Members */}
        {project.teamMembers && project.teamMembers.length > 0 ? (
          <div className="flex -space-x-2 mr-4">
            {project.teamMembers.slice(0, 3).map((member: any, i: number) => (
              <div key={member.id} className={`w-8 h-8 rounded-full bg-[#0A0A0F] border-2 border-[#05050A] flex items-center justify-center text-[10px] text-white font-bold z-${10-i} bg-gradient-to-tr from-[#8B5CF6] to-[#4F8EF7]`} title={member.name || member.email}>
                {(member.name || "U")[0].toUpperCase()}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-[#64748B]">Ekip atanmadı</span>
        )}
      </div>
    </div>
  );
}
