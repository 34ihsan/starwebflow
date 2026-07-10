"use client";

import { useState } from "react";
import { Sparkles, Calendar, CheckCircle2, Target, Users, Settings2, BarChart3, Rocket } from "lucide-react";
import { AiContentTab } from "./components/AiContentTab";
import { CalendarTab } from "./components/CalendarTab";
import { PublishedTab } from "./components/PublishedTab";
import { AdsOptimizerTab } from "./components/AdsOptimizerTab";
import { AudienceTab } from "./components/AudienceTab";

export default function SocialDashboardClient({ initialData }: { initialData: { posts: any[], ads: any[], analytics?: any } }) {
  const [activeTab, setActiveTab] = useState<"pending" | "scheduled" | "published" | "ads" | "audience">("pending");

  // State initialization matching the original component structure
  const pendingPosts = initialData.posts.filter((p: any) => p.status === 'PENDING' || p.status === 'pending');
  const scheduledPosts = initialData.posts.filter((p: any) => p.status === 'SCHEDULED' || p.status === 'scheduled' || p.status === 'IDEA');
  const publishedPosts = initialData.posts.filter((p: any) => p.status === 'PUBLISHED' || p.status === 'published' || p.status === 'active');
  const ads = initialData.ads || [];

  const tabs = [
    { id: "pending", label: "AI Postları", icon: Sparkles, color: "text-indigo-400" },
    { id: "scheduled", label: "Takvim", icon: Calendar, color: "text-blue-400" },
    { id: "published", label: "Yayınlananlar", icon: CheckCircle2, color: "text-emerald-400" },
    { id: "ads", label: "Reklam (Ads)", icon: Target, color: "text-rose-400" },
    { id: "audience", label: "Kitle Analitiği", icon: Users, color: "text-cyan-400" }
  ] as const;

  return (
    <div className="min-h-screen bg-black text-neutral-200 selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        
        {/* GLOBAL HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-neutral-800 pb-8 relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[150%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-indigo-400" />
              Social & Ads (Elite Pro)
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">Yapay zeka otopilotunda yeni nesil içerik ve reklam yönetimi.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Aylık Etkileşim</span>
              <span className="text-2xl font-black text-white">{(initialData.analytics?.clicks || 12450).toLocaleString()} <span className="text-sm text-emerald-500">↑%12</span></span>
            </div>
            <div className="w-px bg-neutral-800 hidden md:block"></div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Otopilot ROAS</span>
              <span className="text-2xl font-black text-white">4.2x <span className="text-sm text-emerald-500">Optimum</span></span>
            </div>
          </div>
        </div>

        {/* NEON TABS NAVIGATION */}
        <div className="flex flex-wrap gap-2 mb-8 bg-neutral-900/50 p-1.5 rounded-xl border border-neutral-800 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
                  ${isActive 
                    ? `bg-neutral-800 shadow-md border border-neutral-700 text-white ${
                        tab.id === 'pending' ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 
                        tab.id === 'ads' ? 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                        'shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                      }` 
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-neutral-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="relative">
          {activeTab === "pending" && <AiContentTab initialPending={pendingPosts} />}
          {activeTab === "scheduled" && <CalendarTab scheduledPosts={scheduledPosts} />}
          {activeTab === "published" && <PublishedTab publishedPosts={publishedPosts} />}
          {activeTab === "ads" && <AdsOptimizerTab ads={ads} />}
          {activeTab === "audience" && <AudienceTab />}
        </div>

      </div>
    </div>
  );
}
