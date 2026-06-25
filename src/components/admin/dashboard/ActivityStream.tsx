"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FileText, UserPlus, Zap, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export type ActivityType = "LEAD" | "INVOICE" | "AI_EMAIL" | "SYSTEM";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
}

export const ActivityStream = ({ activities }: { activities: ActivityItem[] }) => {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "LEAD": return <UserPlus className="h-4 w-4 text-blue-400" />;
      case "INVOICE": return <FileText className="h-4 w-4 text-emerald-400" />;
      case "AI_EMAIL": return <Mail className="h-4 w-4 text-indigo-400" />;
      default: return <Zap className="h-4 w-4 text-amber-400" />;
    }
  };

  const getBgColor = (type: ActivityType) => {
    switch (type) {
      case "LEAD": return "bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
      case "INVOICE": return "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      case "AI_EMAIL": return "bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]";
      default: return "bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B0F19]/60 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Canlı Aktivite Akışı</h3>
          <p className="text-xs text-slate-400">Tüm modüllerden gelen son hareketler</p>
        </div>
      </div>

      <div className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Henüz aktivite bulunmuyor.</p>
        ) : (
          activities.map((activity, index) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative pl-6 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-px before:bg-white/10 last:before:hidden"
            >
              <div className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border ${getBgColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 group">
                <div className="bg-[#131B2A]/30 p-3 rounded-xl border border-white/[0.02] flex-1 hover:bg-[#131B2A]/60 transition-colors">
                  <p className="text-sm font-medium text-slate-200">
                    {activity.link ? (
                      <Link href={activity.link} className="hover:text-blue-400 transition-colors">
                        {activity.title}
                      </Link>
                    ) : activity.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                </div>
                
                <div className="flex items-center gap-3 pt-2 sm:pt-3">
                  <span suppressHydrationWarning className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: tr })}
                  </span>
                  {activity.link && (
                    <Link href={activity.link} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-slate-500 hover:text-white" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
