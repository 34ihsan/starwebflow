"use client";

import { motion } from "framer-motion";
import { Server, ShieldCheck, Mail, Bot, Flame, Sparkles, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

interface AiCommandCenterProps {
  activeMailboxes: number;
  totalMailboxes: number;
  dnsStatus: "SAFE" | "WARNING" | "DANGER" | "UNKNOWN";
  pendingSocialPosts: number;
}

export const AiCommandCenter = ({ activeMailboxes, totalMailboxes, dnsStatus, pendingSocialPosts }: AiCommandCenterProps) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B0F19]/60 p-6 backdrop-blur-md h-full flex flex-col relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-2 mb-6 relative z-10">
        <Sparkles className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Yapay Zeka & Sistem</h3>
      </div>

      <div className="space-y-4 flex-1 relative z-10">
        {/* Email Engine Status */}
        <div className="group rounded-xl border border-white/[0.03] bg-[#131B2A]/50 p-4 transition-colors hover:bg-[#131B2A]/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Mail className="h-4 w-4 text-blue-400" /> Cold Email Motoru
            </div>
            <span className="relative flex h-2 w-2">
              {activeMailboxes > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${activeMailboxes > 0 ? "bg-blue-500" : "bg-slate-600"}`}></span>
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{activeMailboxes} <span className="text-sm font-normal text-slate-500">/ {totalMailboxes}</span></p>
            <p className="text-xs text-slate-400">hesap ısınıyor</p>
          </div>
          {activeMailboxes > 0 && (
            <div className="mt-3 w-full bg-[#0A0A0F] rounded-full h-1.5 overflow-hidden border border-white/5">
              <motion.div 
                className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                initial={{ width: "0%" }}
                animate={{ width: `${(activeMailboxes / Math.max(totalMailboxes, 1)) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="group rounded-xl border border-white/[0.03] bg-[#131B2A]/50 p-4 transition-colors hover:bg-[#131B2A]/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Server className="h-4 w-4 text-emerald-400" /> DNS & Deliverability
            </div>
            <ShieldCheck className={`h-4 w-4 ${dnsStatus === "SAFE" ? "text-emerald-500" : dnsStatus === "WARNING" ? "text-amber-500" : "text-rose-500"}`} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {dnsStatus === "SAFE" 
              ? "Tüm SPF/DKIM/DMARC kayıtları doğrulandı. Mailler inbox'a ulaşıyor." 
              : "Bazı DNS kayıtları eksik veya doğrulanmadı. Spam riski var!"}
          </p>
        </div>

        {/* Social Engine */}
        <div className="group rounded-xl border border-white/[0.03] bg-[#131B2A]/50 p-4 transition-colors hover:bg-[#131B2A]/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Bot className="h-4 w-4 text-purple-400" /> Social AI Motoru
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">{pendingSocialPosts}</p>
            <p className="text-xs text-slate-400">bekleyen içerik</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
        <h4 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Hızlı Aksiyonlar</h4>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/admin/social`} className="flex items-center justify-center gap-2 rounded-lg bg-[#131B2A] border border-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-[#1A2438] hover:text-white transition-colors">
            <MessageSquarePlus className="h-3 w-3" /> Post Üret
          </Link>
          <Link href={`/admin/email`} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 py-2 text-xs font-medium hover:bg-blue-600/20 transition-colors">
            <Flame className="h-3 w-3" /> Kampanya
          </Link>
        </div>
      </div>
    </div>
  );
};
