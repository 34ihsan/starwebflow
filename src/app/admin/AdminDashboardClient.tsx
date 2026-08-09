'use client';

import { useState } from "react";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { ActivityStream } from "@/components/admin/dashboard/ActivityStream";
import { AiCommandCenter } from "@/components/admin/dashboard/AiCommandCenter";
import { OverviewCharts } from "@/components/admin/dashboard/OverviewCharts";
import { Settings, LayoutGrid } from "lucide-react";
import { type ActivityItem, type ActivityType } from "@/components/admin/dashboard/ActivityStream";

export default function AdminDashboardClient({ initialData, initialActivities }: { initialData: any, initialActivities: any[] }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const activities: ActivityItem[] = initialActivities.map((act) => ({
    id: act.id,
    type: (act.action.includes('INVOICE') ? 'INVOICE' : 
           act.action.includes('CONTRACT') ? 'CONTRACT' : 
           act.action.includes('LEAD') ? 'LEAD' : 
           act.action.includes('TASK') ? 'LEAD' : 'SYSTEM') as ActivityType,
    title: act.action,
    description: act.details || '',
    timestamp: new Date(act.createdAt),
    link: act.action.includes('INVOICE') ? '/admin/invoices' :
          act.action.includes('CONTRACT') ? '/admin/contracts' :
          act.action.includes('TASK') ? '/admin/projects' :
          act.action.includes('LEAD') ? '/admin/crm' : '#'
  }));

  return (
    <div className="relative space-y-8 p-8 animate-in fade-in duration-700">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 font-['Outfit']">
            <span className="gradient-text">
              Komuta Merkezi
            </span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Ajansınızın genel durumunu, finansal akışını ve performansını anlık izleyin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              isEditMode 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105" 
                : "glass hover:bg-white/10 text-white hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            {isEditMode ? "Düzenlemeyi Bitir" : "Paneli Özelleştir"}
          </button>
        </div>
      </div>

      <div className={`relative z-10 transition-all duration-500 ${isEditMode ? 'p-6 border-2 border-dashed border-blue-500/50 rounded-3xl bg-blue-500/5' : ''}`}>
        <StatCards stats={initialData.stats} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className={`xl:col-span-2 space-y-6 transition-all duration-300 ${isEditMode ? 'p-4 border-2 border-dashed border-purple-500/50 rounded-2xl bg-purple-500/5' : ''}`}>
          <OverviewCharts revenueData={initialData.charts.revenueData} leadsData={initialData.charts.leadsData} />
          <ActivityStream activities={activities} />
        </div>
        <div className={`xl:col-span-1 transition-all duration-300 ${isEditMode ? 'p-4 border-2 border-dashed border-emerald-500/50 rounded-2xl bg-emerald-500/5' : ''}`}>
          <div className="sticky top-6">
            <AiCommandCenter 
              activeMailboxes={initialData.aiStats?.activeMailboxes || 0} 
              totalMailboxes={initialData.aiStats?.totalMailboxes || 0} 
              dnsStatus={initialData.aiStats?.dnsStatus || "SAFE"} 
              pendingSocialPosts={initialData.aiStats?.pendingSocialPosts || 0} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
