"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Server,
  ShieldCheck,
  Mail,
  Bot,
  Flame,
  Sparkles,
  MessageSquarePlus,
  Cpu,
  Zap,
  CheckCircle2,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import Link from "next/link";

interface AiCommandCenterProps {
  activeMailboxes: number;
  totalMailboxes: number;
  dnsStatus: "SAFE" | "WARNING" | "DANGER" | "UNKNOWN";
  pendingSocialPosts: number;
}

interface ClusterModel {
  key: string;
  name: string;
  role: string;
  installed: boolean;
  warmInRam: boolean;
}

export const AiCommandCenter = ({
  activeMailboxes,
  totalMailboxes,
  dnsStatus,
  pendingSocialPosts,
}: AiCommandCenterProps) => {
  const [ollamaOnline, setOllamaOnline] = useState<boolean>(true);
  const [sharedLayerWarm, setSharedLayerWarm] = useState<boolean>(false);
  const [cluster, setCluster] = useState<ClusterModel[]>([]);
  const [prewarming, setPrewarming] = useState<boolean>(false);
  const [prewarmMessage, setPrewarmMessage] = useState<string>("");
  const [briefingLoading, setBriefingLoading] = useState<boolean>(false);
  const [ceoActions, setCeoActions] = useState<string[]>([]);

  const fetchClusterStatus = async () => {
    try {
      const res = await fetch("/api/admin/ollama-cluster");
      const data = await res.json();
      if (data.success) {
        setOllamaOnline(Boolean(data.ollamaOnline));
        setSharedLayerWarm(Boolean(data.sharedLayerWarm));
        setCluster(data.cluster || []);
      }
    } catch {
      setOllamaOnline(false);
    }
  };

  useEffect(() => {
    fetchClusterStatus();
  }, []);

  const handlePrewarm = async () => {
    if (prewarming) return;
    setPrewarming(true);
    setPrewarmMessage("");
    try {
      const res = await fetch("/api/admin/ollama-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prewarm" }),
      });
      const data = await res.json();
      if (data.success) {
        setPrewarmMessage(data.message || "RAM önbelleği ısıtıldı.");
        await fetchClusterStatus();
      }
    } catch {
      setPrewarmMessage("Bağlantı zaman aşımına uğradı.");
    } finally {
      setPrewarming(false);
    }
  };

  const handleGenerateBriefing = async () => {
    if (briefingLoading) return;
    setBriefingLoading(true);
    try {
      const res = await fetch("/api/admin/ollama-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ceo-briefing" }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.actions)) {
        setCeoActions(data.actions);
      }
    } catch {
      // ignore
    } finally {
      setBriefingLoading(false);
    }
  };

  return (
    <div className="rounded-3xl glass p-6 card-hover h-full flex flex-col relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="flex items-center justify-between gap-2 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">AI Komuta & Ollama Kümesi</h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>E:\OllamaModels • 5 Uzman + 1 Vektör</span>
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            ollamaOnline
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ollamaOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
            }`}
          />
          {ollamaOnline ? (sharedLayerWarm ? "RAM WARM" : "ONLINE") : "OFFLINE"}
        </span>
      </div>

      <div className="space-y-4 flex-1 relative z-10">
        {/* Local Ollama 6-Model Cluster Telemetry */}
        <div className="rounded-2xl border border-indigo-500/20 bg-[#101726]/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Uzman LLM Orkestratörü</span>
            </div>
            <button
              type="button"
              onClick={handlePrewarm}
              disabled={prewarming}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3 h-3 text-amber-400 ${prewarming ? "animate-spin" : ""}`} />
              <span>{prewarming ? "RAM'e Yükleniyor..." : "RAM'de Isıt"}</span>
            </button>
          </div>

          {prewarmMessage && (
            <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
              ⚡ {prewarmMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            {(cluster.length > 0
              ? cluster
              : [
                  { key: "agent", name: "starwebflow-agent:latest", role: "AI Satış & VIP Destek", installed: true, warmInRam: true },
                  { key: "automation", name: "starwebflow-automation:latest", role: "Titan Otomasyon & Apify", installed: true, warmInRam: true },
                  { key: "webdev", name: "starwebflow-webdev:latest", role: "CTO Mimari & Lastenheft", installed: true, warmInRam: true },
                  { key: "growth", name: "starwebflow-growth:latest", role: "CRO, SEO & Cold Outreach", installed: true, warmInRam: true },
                  { key: "admin", name: "starwebflow-admin:latest", role: "Admin CRM, Spam & Warmup", installed: true, warmInRam: true },
                ]
            ).map((m) => (
              <div
                key={m.key}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs"
              >
                <div className="truncate pr-2">
                  <div className="font-mono font-bold text-white text-[11px] truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.role}</div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.warmInRam
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : m.installed
                      ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {m.warmInRam ? "⚡ HAZIR" : m.installed ? "KURULU" : "YOK"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Daily CEO Briefing Card */}
        <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-indigo-950/30 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Günlük CEO Brifingi</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateBriefing}
              disabled={briefingLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${briefingLoading ? "animate-spin" : ""}`} />
              <span>{briefingLoading ? "Analiz Ediliyor..." : ceoActions.length > 0 ? "Yenile" : "Brifing Üret"}</span>
            </button>
          </div>

          {ceoActions.length > 0 ? (
            <div className="space-y-2">
              {ceoActions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-200 bg-slate-950/60 border border-white/5 rounded-xl p-2.5 leading-relaxed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Canlı CRM Lead, Proje ve Kampanya verilerinizi <code className="text-emerald-300">starwebflow-admin</code> modeliyle analiz edip bugünün en kritik 3 satış aksiyonunu çıkarmak için &ldquo;Brifing Üret&rdquo; butonuna tıklayın.
            </p>
          )}
        </div>

        {/* Email Engine Status */}
        <div className="group rounded-xl border border-white/[0.03] bg-[#131B2A]/50 p-4 transition-colors hover:bg-[#131B2A]/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Mail className="h-4 w-4 text-blue-400" /> Cold Email Motoru
            </div>
            <span className="relative flex h-2 w-2">
              {activeMailboxes > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeMailboxes > 0 ? "bg-blue-500" : "bg-slate-600"
                }`}
              ></span>
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-white">
              {activeMailboxes} <span className="text-sm font-normal text-slate-500">/ {totalMailboxes}</span>
            </p>
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

        {/* System Health & Social Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.03] bg-[#131B2A]/50 p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-emerald-400" /> DNS
              </span>
              <ShieldCheck
                className={`h-3.5 w-3.5 ${
                  dnsStatus === "SAFE" ? "text-emerald-500" : "text-amber-500"
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {dnsStatus === "SAFE" ? "SPF/DKIM Doğrulandı" : "DNS Kontrol Edin"}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.03] bg-[#131B2A]/50 p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-purple-400" /> Social AI
              </span>
              <span className="text-sm font-bold text-white">{pendingSocialPosts}</span>
            </div>
            <p className="text-[11px] text-slate-400">bekleyen içerik</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-5 border-t border-white/5 relative z-10">
        <h4 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Hızlı Aksiyonlar</h4>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/admin/ai-studio`}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#131B2A] border border-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-[#1A2438] hover:text-white transition-colors"
          >
            <MessageSquarePlus className="h-3 w-3" /> AI Studio
          </Link>
          <Link
            href={`/admin/email`}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 py-2 text-xs font-medium hover:bg-blue-600/20 transition-colors"
          >
            <Flame className="h-3 w-3" /> Kampanya
          </Link>
        </div>
      </div>
    </div>
  );
};
