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
    <div className="space-y-8 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Komuta Merkezi
            </span>
          </h1>
          <p className="text-slate-400 mt-2">
            Ajansınızın genel durumunu, finansal akışını ve performansını anlık izleyin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isEditMode 
                ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            {isEditMode ? "Düzenlemeyi Bitir" : "Paneli Özelleştir"}
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ${isEditMode ? 'p-4 border-2 border-dashed border-blue-500/50 rounded-2xl bg-blue-500/5' : ''}`}>
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
              activeMailboxes={3} 
              totalMailboxes={5} 
              dnsStatus="SAFE" 
              pendingSocialPosts={12} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
