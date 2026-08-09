"use client";

import { useState } from "react";
import {
  Target, DollarSign, Activity, Zap, TrendingUp, Plus, Sparkles, Layers,
  Check, Copy, X, Filter, Users, BarChart3, ArrowUpRight, Eye, Key, Wand2,
  RefreshCw, Brain, Shield, Search, AlertTriangle, CheckCircle, Clock,
  ChevronRight, ChevronDown, Rocket, Radio, Siren, LineChart, Cpu, Globe,
  Play, Pause, BarChart, BookOpen, Lightbulb, Settings, Tag, ArrowRight
} from "lucide-react";
import {
  optimizeAdCampaign,
  seedTitanAdCampaigns,
  createAdCampaign,
  generateAdVariants,
  generateAdAudienceTargeting,
  reverseEngineerCompetitorAds,
  applyReverseEngineeringHacks,
  runAiCampaignAudit,
  generatePlatformAdCopy,
  generateCrossPlatformBudgetPlan,
  detectCreativeFatigue,
  runFullAutopilotSweep,
  runCampaignWizardStep,
  generateCompetitorIntelligenceReport,
  generateNegativeKeywordList,
} from "@/app/actions/social";

const PLATFORMS = ["ALL", "Meta", "Google", "TikTok", "LinkedIn"];

const PLATFORM_COLORS: Record<string, string> = {
  "Meta (Instagram/FB)": "#1877F2",
  "Google Ads": "#34A853",
  "TikTok Ads": "#000000",
  "LinkedIn Ads": "#0A66C2",
};

const PLATFORM_ICONS: Record<string, string> = {
  "Meta (Instagram/FB)": "📘",
  "Google Ads": "🔍",
  "TikTok Ads": "🎵",
  "LinkedIn Ads": "💼",
};

const TABS = [
  { id: "overview", label: "Genel Bakış", icon: BarChart3 },
  { id: "wizard", label: "AI Kampanya Sihirbazı", icon: Wand2 },
  { id: "coach", label: "AI Koç & Denetim", icon: Brain },
  { id: "intelligence", label: "Rakip İstihbarat", icon: Search },
  { id: "autopilot", label: "Otopilot Motor", icon: Cpu },
  { id: "copy", label: "Reklam Metni Fabrikası", icon: BookOpen },
];

type Ad = any;

export function AdsOptimizerTab({ ads: initialAds }: { ads: Ad[] }) {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlatform, setSelectedPlatform] = useState("ALL");
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null);

  // AI Koç state
  const [auditData, setAuditData] = useState<Record<string, any>>({});
  const [auditingId, setAuditingId] = useState<string | null>(null);

  // Fatigue state
  const [fatigueData, setFatigueData] = useState<any>(null);
  const [isDetectingFatigue, setIsDetectingFatigue] = useState(false);

  // Autopilot state
  const [autopilotResult, setAutopilotResult] = useState<any>(null);
  const [isRunningAutopilot, setIsRunningAutopilot] = useState(false);

  // Budget Plan state
  const [budgetPlan, setBudgetPlan] = useState<any>(null);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardContext, setWizardContext] = useState<Record<string, string>>({
    goal: "",
    product: "Starwebflow AI Titan Otomasyonları",
    platform: "Meta (Instagram/FB)",
    audience: "",
    offer: "%30 İndirim + 1-tıkla kurulum",
  });
  const [wizardResults, setWizardResults] = useState<Record<number, any>>({});
  const [isWizardLoading, setIsWizardLoading] = useState(false);
  const [wizardComplete, setWizardComplete] = useState(false);

  // Competitor Intelligence state
  const [competitorNiche, setCompetitorNiche] = useState("Web Tasarım ve Dijital Ajans");
  const [competitorReport, setCompetitorReport] = useState<any>(null);
  const [isGatheringIntel, setIsGatheringIntel] = useState(false);

  // Ad Copy Factory state
  const [copyPlatform, setCopyPlatform] = useState("Meta (Instagram/FB)");
  const [copyParams, setCopyParams] = useState({
    product: "Starwebflow AI Titan Otomasyonları",
    audience: "KOBİ sahipleri ve dijital ajanslar",
    offer: "%30 İndirim + ücretsiz kurulum",
    tone: "Güvenilir & Dinamik",
    goal: "Lead Generation",
  });
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // Negative Keywords state
  const [negKwPlatform, setNegKwPlatform] = useState("Google Ads");
  const [negKwResult, setNegKwResult] = useState<any>(null);
  const [isGenNegKw, setIsGenNegKw] = useState(false);

  // New Ad form
  const [newAd, setNewAd] = useState({
    name: "",
    platform: "Meta (Instagram/FB)",
    objective: "Lead Generation",
    spend: 10000,
    roas: 3.2,
    hookRate: 35,
    ctr: 3.5,
  });

  const filteredAds = ads.filter((ad) => {
    if (selectedPlatform === "ALL") return true;
    return ad.platform?.toLowerCase().includes(selectedPlatform.toLowerCase());
  });

  const totalSpend = filteredAds.reduce((sum, a) => sum + Number(a.spend || 0), 0);
  const avgRoas =
    filteredAds.length > 0
      ? (filteredAds.reduce((sum, a) => sum + Number(a.roas || 0), 0) / filteredAds.length).toFixed(2)
      : "0.00";
  const avgCtr =
    filteredAds.length > 0
      ? (filteredAds.reduce((sum, a) => sum + Number(a.ctr || 0), 0) / filteredAds.length).toFixed(1)
      : "0.0";
  const avgHook =
    filteredAds.length > 0
      ? (filteredAds.reduce((sum, a) => sum + Number(a.hookRate || 0), 0) / filteredAds.length).toFixed(0)
      : "0";

  const handleOptimize = async (adId: string, action: "scale" | "pause") => {
    setOptimizingId(adId);
    try {
      const res = await optimizeAdCampaign(adId, action);
      if (res.success) {
        setAds((prev) =>
          prev.map((a) =>
            a.id === adId ? { ...a, status: action === "pause" ? "PAUSED" : "ACTIVE", spend: res.newSpend ?? a.spend } : a
          )
        );
      }
    } finally {
      setOptimizingId(null);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedTitanAdCampaigns();
      if (res.success && res.campaigns) setAds(res.campaigns as Ad[]);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateAd = async () => {
    try {
      const res = await createAdCampaign(newAd);
      if (res.success && res.campaign) {
        setAds((prev) => [res.campaign as Ad, ...prev]);
        setIsNewAdModalOpen(false);
      }
    } catch {}
  };

  const handleRunAudit = async (adId: string) => {
    setAuditingId(adId);
    try {
      const res = await runAiCampaignAudit(adId);
      if (res.success) setAuditData((prev) => ({ ...prev, [adId]: res.audit }));
    } finally {
      setAuditingId(null);
    }
  };

  const handleDetectFatigue = async () => {
    setIsDetectingFatigue(true);
    try {
      const res = await detectCreativeFatigue();
      if (res.success) setFatigueData(res);
    } finally {
      setIsDetectingFatigue(false);
    }
  };

  const handleRunAutopilot = async () => {
    setIsRunningAutopilot(true);
    try {
      const res = await runFullAutopilotSweep();
      if (res.success) {
        setAutopilotResult(res);
        const updated = await seedTitanAdCampaigns();
        if (updated.success && updated.campaigns) setAds(updated.campaigns as Ad[]);
      }
    } finally {
      setIsRunningAutopilot(false);
    }
  };

  const handleGenerateBudgetPlan = async () => {
    setIsGeneratingBudget(true);
    try {
      const res = await generateCrossPlatformBudgetPlan();
      if (res.success) setBudgetPlan(res);
    } finally {
      setIsGeneratingBudget(false);
    }
  };

  const handleWizardStep = async () => {
    if (!wizardContext.goal && wizardStep === 1) return;
    setIsWizardLoading(true);
    try {
      const res = await runCampaignWizardStep(wizardStep, wizardContext);
      if (res.success) {
        setWizardResults((prev) => ({ ...prev, [wizardStep]: res.result }));
        if (wizardStep < 4) {
          setWizardStep((s) => s + 1);
        } else {
          setWizardComplete(true);
        }
      }
    } finally {
      setIsWizardLoading(false);
    }
  };

  const handleGatherIntel = async () => {
    setIsGatheringIntel(true);
    try {
      const res = await generateCompetitorIntelligenceReport(competitorNiche);
      if (res.success) setCompetitorReport(res.report);
    } finally {
      setIsGatheringIntel(false);
    }
  };

  const handleGenerateCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await generatePlatformAdCopy(copyPlatform, copyParams);
      if (res.success) setGeneratedCopy(res.copy);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleGenNegKw = async () => {
    setIsGenNegKw(true);
    try {
      const res = await generateNegativeKeywordList({
        product: copyParams.product,
        platform: negKwPlatform,
        audience: copyParams.audience,
      });
      if (res.success) setNegKwResult(res.list);
    } finally {
      setIsGenNegKw(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getRoasColor = (roas: number) => {
    if (roas >= 3) return "#22c55e";
    if (roas >= 1.5) return "#f59e0b";
    return "#ef4444";
  };

  const getFatigueColor = (level: string) => {
    if (level === "CRITICAL") return { bg: "#7f1d1d33", border: "#ef4444", text: "#fca5a5" };
    if (level === "WARNING") return { bg: "#78350f33", border: "#f59e0b", text: "#fcd34d" };
    return { bg: "#14532d33", border: "#22c55e", text: "#86efac" };
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Titan Mode Badge ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0a1628 100%)",
        border: "1px solid #7c3aed44",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", boxShadow: "0 0 24px #a855f755"
          }}>⚡</div>
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", letterSpacing: "0.5px" }}>
              PRO TITAN MODE — AI Reklam Yönetim Merkezi
            </div>
            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
              Meta • Google • TikTok • LinkedIn — Derin AI Analiz + Tam Otomasyon Aktif
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            style={{
              padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              background: isSeeding ? "#1e1b4b" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Rocket size={13} />
            {isSeeding ? "Oluşturuluyor..." : "Demo Kampanyalar Oluştur"}
          </button>
          <button
            onClick={() => setIsNewAdModalOpen(true)}
            style={{
              padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              background: "#0f172a", color: "#a5b4fc", border: "1px solid #3730a3",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Plus size={13} /> Yeni Kampanya
          </button>
        </div>
      </div>

      {/* ── KPI Bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        {[
          { label: "Toplam Harcama", value: `₺${totalSpend.toLocaleString()}`, icon: <DollarSign size={16} />, color: "#60a5fa" },
          { label: "Ort. ROAS", value: `${avgRoas}x`, icon: <TrendingUp size={16} />, color: parseFloat(avgRoas) >= 2.5 ? "#22c55e" : "#f59e0b" },
          { label: "Ort. CTR", value: `%${avgCtr}`, icon: <Activity size={16} />, color: "#a78bfa" },
          { label: "Ort. Hook Rate", value: `%${avgHook}`, icon: <Zap size={16} />, color: "#34d399" },
          { label: "Aktif Kampanya", value: `${filteredAds.filter(a => a.status === "ACTIVE").length}`, icon: <Radio size={16} />, color: "#fb7185" },
          { label: "Kampanya Sayısı", value: `${filteredAds.length}`, icon: <Layers size={16} />, color: "#94a3b8" },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px",
            padding: "16px", display: "flex", flexDirection: "column", gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: kpi.color }}>{kpi.icon}<span style={{ fontSize: "11px", color: "#64748b" }}>{kpi.label}</span></div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{
        display: "flex", gap: "4px", background: "#0f172a", borderRadius: "12px",
        padding: "4px", border: "1px solid #1e293b", overflowX: "auto"
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                background: activeTab === tab.id ? "linear-gradient(135deg, #7c3aed22, #4f46e522)" : "transparent",
                color: activeTab === tab.id ? "#a78bfa" : "#64748b",
                border: activeTab === tab.id ? "1px solid #7c3aed44" : "1px solid transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s", whiteSpace: "nowrap"
              }}
            >
              <Icon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: GENEL BAKIŞ
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Platform Filter */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                style={{
                  padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                  background: selectedPlatform === p ? "#7c3aed" : "#1e293b",
                  color: selectedPlatform === p ? "#fff" : "#64748b",
                  border: "none", cursor: "pointer"
                }}
              >{p}</button>
            ))}
          </div>

          {filteredAds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <div style={{ fontSize: "16px", marginBottom: "8px" }}>Kampanya bulunamadı</div>
              <div style={{ fontSize: "13px" }}>Demo kampanyalar oluşturun veya yeni kampanya ekleyin</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredAds.map((ad) => {
                const platformColor = Object.entries(PLATFORM_COLORS).find(([k]) => ad.platform?.includes(k.split(" ")[0]))?.[1] || "#7c3aed";
                const platformIcon = Object.entries(PLATFORM_ICONS).find(([k]) => ad.platform?.includes(k.split(" ")[0]))?.[1] || "📣";
                const roas = Number(ad.roas || 0);
                const isExpanded = expandedAdId === ad.id;
                const audit = auditData[ad.id];

                return (
                  <div key={ad.id} style={{
                    background: "#0f172a", border: `1px solid ${ad.status === "PAUSED" ? "#374151" : "#1e293b"}`,
                    borderRadius: "14px", overflow: "hidden",
                    opacity: ad.status === "PAUSED" ? 0.7 : 1
                  }}>
                    {/* Card Header */}
                    <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        background: platformColor + "22", border: `1px solid ${platformColor}44`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
                      }}>{platformIcon}</div>

                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "14px" }}>{ad.name}</div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                          {ad.platform} • {ad.objective}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        {[
                          { label: "ROAS", value: `${roas}x`, color: getRoasColor(roas) },
                          { label: "CTR", value: `%${Number(ad.ctr || 0).toFixed(1)}` , color: "#a78bfa" },
                          { label: "Hook", value: `%${ad.hookRate || 0}`, color: "#34d399" },
                          { label: "Harcama", value: `₺${Number(ad.spend || 0).toLocaleString()}`, color: "#60a5fa" },
                        ].map((m) => (
                          <div key={m.label} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "10px", color: "#475569" }}>{m.label}</div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: m.color }}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Status Badge */}
                      <div style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
                        background: ad.status === "ACTIVE" ? "#14532d33" : "#374151",
                        color: ad.status === "ACTIVE" ? "#22c55e" : "#9ca3af",
                        border: `1px solid ${ad.status === "ACTIVE" ? "#22c55e44" : "#4b5563"}`
                      }}>
                        {ad.status === "ACTIVE" ? "● CANLI" : "⏸ DURDURULDU"}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleRunAudit(ad.id)}
                          disabled={auditingId === ad.id}
                          title="AI Derin Analiz"
                          style={{
                            padding: "7px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600,
                            background: audit ? "#1e1b4b" : "#0f172a",
                            color: audit ? "#a78bfa" : "#64748b",
                            border: "1px solid #334155", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                          }}
                        >
                          <Brain size={12} />{auditingId === ad.id ? "..." : "AI Denet"}
                        </button>
                        {ad.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleOptimize(ad.id, "pause")}
                            disabled={optimizingId === ad.id}
                            style={{
                              padding: "7px 10px", borderRadius: "8px", fontSize: "11px",
                              background: "#1c0a0a", color: "#fca5a5", border: "1px solid #7f1d1d",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                            }}
                          ><Pause size={11} /> Durdur</button>
                        ) : (
                          <button
                            onClick={() => handleOptimize(ad.id, "scale")}
                            disabled={optimizingId === ad.id}
                            style={{
                              padding: "7px 10px", borderRadius: "8px", fontSize: "11px",
                              background: "#052e16", color: "#86efac", border: "1px solid #166534",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                            }}
                          ><Play size={11} /> Başlat</button>
                        )}
                        <button
                          onClick={() => setExpandedAdId(isExpanded ? null : ad.id)}
                          style={{
                            padding: "7px 10px", borderRadius: "8px", fontSize: "11px",
                            background: "#0f172a", color: "#64748b", border: "1px solid #334155",
                            cursor: "pointer"
                          }}
                        >{isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</button>
                      </div>
                    </div>

                    {/* Expanded AI Audit Panel */}
                    {isExpanded && audit && (
                      <div style={{
                        borderTop: "1px solid #1e293b", padding: "20px",
                        background: "linear-gradient(135deg, #0a0a1a, #0f0f20)"
                      }}>
                        {/* Health Score */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                          <div style={{
                            width: "64px", height: "64px", borderRadius: "50%",
                            border: `3px solid ${getScoreColor(audit.healthScore)}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", boxShadow: `0 0 20px ${getScoreColor(audit.healthScore)}44`
                          }}>
                            <span style={{ fontSize: "18px", fontWeight: 800, color: getScoreColor(audit.healthScore) }}>{audit.healthScore}</span>
                            <span style={{ fontSize: "8px", color: "#64748b" }}>SKOR</span>
                          </div>
                          <div>
                            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px" }}>AI Kampanya Denetimi</div>
                            <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>{audit.verdict}</div>
                            <div style={{ color: "#22c55e", fontSize: "12px", marginTop: "4px" }}>
                              📈 30 Gün ROAS Tahmini: <strong>{audit.roasProjection}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {/* Kritik Sorunlar */}
                          <div style={{ background: "#1c0a0a44", borderRadius: "10px", padding: "14px", border: "1px solid #7f1d1d33" }}>
                            <div style={{ color: "#fca5a5", fontWeight: 700, fontSize: "12px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <AlertTriangle size={13} /> KRİTİK SORUNLAR
                            </div>
                            {(audit.critical || []).map((c: string, i: number) => (
                              <div key={i} style={{ color: "#fcd34d", fontSize: "12px", marginBottom: "6px", display: "flex", gap: "8px" }}>
                                <span style={{ color: "#ef4444", flexShrink: 0 }}>⚠</span> {c}
                              </div>
                            ))}
                          </div>

                          {/* Platform Hackleri */}
                          <div style={{ background: "#0a1628", borderRadius: "10px", padding: "14px", border: "1px solid #1e40af33" }}>
                            <div style={{ color: "#93c5fd", fontWeight: 700, fontSize: "12px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Key size={13} /> GİZLİ PLATFORM HACKLERI
                            </div>
                            {(audit.platformHacks || []).map((h: string, i: number) => (
                              <div key={i} style={{ color: "#bfdbfe", fontSize: "12px", marginBottom: "6px", display: "flex", gap: "8px" }}>
                                <span style={{ color: "#3b82f6", flexShrink: 0 }}>⚡</span> {h}
                              </div>
                            ))}
                          </div>

                          {/* Bid Strategy */}
                          <div style={{ background: "#0a1a0a", borderRadius: "10px", padding: "14px", border: "1px solid #14532d33" }}>
                            <div style={{ color: "#86efac", fontWeight: 700, fontSize: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Target size={13} /> TEKLİF STRATEJİSİ
                            </div>
                            <div style={{ color: "#d1fae5", fontSize: "12px" }}>{audit.bidStrategy}</div>
                          </div>

                          {/* Next Action */}
                          <div style={{ background: "#1a0a2e", borderRadius: "10px", padding: "14px", border: "1px solid #7c3aed33" }}>
                            <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Rocket size={13} /> HEMEN YAPILACAK
                            </div>
                            <div style={{ color: "#e9d5ff", fontSize: "12px" }}>{audit.nextAction}</div>
                          </div>
                        </div>

                        {/* Audience + Creative */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                          <div style={{ background: "#0f172a", borderRadius: "10px", padding: "12px", border: "1px solid #334155" }}>
                            <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "11px", marginBottom: "6px" }}>👥 Kitle Sinyali</div>
                            <div style={{ color: "#d1d5db", fontSize: "12px" }}>{audit.audienceSignal}</div>
                          </div>
                          <div style={{ background: "#0f172a", borderRadius: "10px", padding: "12px", border: "1px solid #334155" }}>
                            <div style={{ color: "#34d399", fontWeight: 600, fontSize: "11px", marginBottom: "6px" }}>🎨 Creative Yönergesi</div>
                            <div style={{ color: "#d1d5db", fontSize: "12px" }}>{audit.creativeDirective}</div>
                          </div>
                        </div>

                        {/* Negative Keywords */}
                        {audit.negativeKeywords?.length > 0 && (
                          <div style={{ marginTop: "12px", background: "#0f172a", borderRadius: "10px", padding: "12px", border: "1px solid #334155" }}>
                            <div style={{ color: "#f87171", fontWeight: 600, fontSize: "11px", marginBottom: "8px" }}>🚫 Negatif Anahtar Kelimeler</div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {audit.negativeKeywords.map((kw: string, i: number) => (
                                <span key={i} style={{
                                  padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
                                  background: "#7f1d1d22", color: "#fca5a5", border: "1px solid #7f1d1d"
                                }}>{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: AI KAMPANYA SİHİRBAZI
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "wizard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "#0f172a", borderRadius: "16px", padding: "24px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Wand2 size={20} style={{ color: "#a78bfa" }} /> AI Kampanya Oluşturma Sihirbazı
            </div>
            <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
              Hedefinizi söyleyin — AI stratejiden metne, hedeflemeden bütçeye her şeyi oluşturur.
            </div>

            {/* Step Progress */}
            <div style={{ display: "flex", gap: "0", marginBottom: "32px" }}>
              {["Hedef", "Kitle", "Strateji", "Lansman"].map((s, i) => {
                const stepNum = i + 1;
                const done = wizardResults[stepNum] || wizardStep > stepNum;
                const active = wizardStep === stepNum;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: done ? "#7c3aed" : active ? "#1e1b4b" : "#0f172a",
                        border: `2px solid ${done || active ? "#7c3aed" : "#334155"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: done || active ? "#fff" : "#64748b", fontSize: "13px", fontWeight: 700
                      }}>
                        {done && !active ? <Check size={14} /> : stepNum}
                      </div>
                      <span style={{ fontSize: "10px", color: active ? "#a78bfa" : done ? "#7c3aed" : "#475569" }}>{s}</span>
                    </div>
                    {i < 3 && <div style={{ flex: 1, height: "2px", background: done ? "#7c3aed" : "#1e293b", margin: "0 4px", marginBottom: "18px" }} />}
                  </div>
                );
              })}
            </div>

            {/* Wizard Complete */}
            {wizardComplete && wizardResults[4] ? (
              <div style={{ background: "#052e16", borderRadius: "12px", padding: "20px", border: "1px solid #166534" }}>
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "16px", marginBottom: "16px" }}>
                  🚀 Kampanya Hazır!
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {Object.entries(wizardResults[4].campaignConfig || {}).map(([k, v]) => (
                    <div key={k} style={{ background: "#0a1a0a", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>{k.toUpperCase()}</div>
                      <div style={{ color: "#86efac", fontWeight: 600 }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "16px", background: "#0a1a0a", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ color: "#86efac", fontWeight: 600, fontSize: "12px", marginBottom: "8px" }}>📋 Lansman Öncesi Kontrol Listesi</div>
                  {(wizardResults[4].launchChecklist || []).map((item: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "8px", color: "#d1fae5", fontSize: "12px", marginBottom: "4px" }}>
                      <Check size={12} style={{ color: "#22c55e", flexShrink: 0, marginTop: "1px" }} /> {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "12px", background: "#0a1a0a", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ color: "#86efac", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>✍️ İlk Reklam Metni</div>
                  <div style={{ color: "#d1fae5", fontSize: "13px", fontStyle: "italic" }}>"{wizardResults[4].firstAdCopy}"</div>
                </div>
                <button
                  onClick={() => { setWizardStep(1); setWizardResults({}); setWizardComplete(false); setWizardContext({ goal: "", product: "Starwebflow AI Titan Otomasyonları", platform: "Meta (Instagram/FB)", audience: "", offer: "%30 İndirim + 1-tıkla kurulum" }); }}
                  style={{ marginTop: "16px", padding: "10px 20px", borderRadius: "8px", background: "#166534", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Yeni Kampanya Oluştur
                </button>
              </div>
            ) : (
              <div>
                {/* Step 1: Goal */}
                {wizardStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "14px" }}>Kampanyanızdan ne bekliyorsunuz?</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {["Satış artışı ve e-ticaret dönüşümü", "Lead (müşteri adayı) toplama", "Marka bilinirliği ve erişim", "Uygulama indirme ve kullanıcı kazanımı"].map((g) => (
                        <button key={g} onClick={() => setWizardContext(p => ({ ...p, goal: g }))} style={{
                          padding: "14px 18px", borderRadius: "10px", textAlign: "left", fontSize: "14px",
                          background: wizardContext.goal === g ? "#1e1b4b" : "#0a0f1e",
                          color: wizardContext.goal === g ? "#a78bfa" : "#94a3b8",
                          border: `1px solid ${wizardContext.goal === g ? "#7c3aed" : "#1e293b"}`,
                          cursor: "pointer", transition: "all 0.15s"
                        }}>{g}</button>
                      ))}
                      <input
                        placeholder="Veya hedefi kendiniz yazın..."
                        value={wizardContext.goal}
                        onChange={e => setWizardContext(p => ({ ...p, goal: e.target.value }))}
                        style={{ padding: "12px 16px", borderRadius: "10px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "14px" }}
                      />
                    </div>
                    {wizardResults[1] && (
                      <div style={{ background: "#0a1628", borderRadius: "12px", padding: "16px", border: "1px solid #1e40af33" }}>
                        <div style={{ color: "#93c5fd", fontWeight: 600, fontSize: "13px", marginBottom: "12px" }}>🤖 AI Platformları Değerlendirdi:</div>
                        {(wizardResults[1].platforms || []).map((p: any) => (
                          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: "#bfdbfe", fontWeight: 600, fontSize: "13px" }}>{p.name}</div>
                              <div style={{ color: "#64748b", fontSize: "11px" }}>{p.reason}</div>
                            </div>
                            <div style={{
                              padding: "4px 10px", borderRadius: "12px", fontWeight: 700, fontSize: "12px",
                              background: p.fit >= 80 ? "#14532d33" : "#78350f33",
                              color: p.fit >= 80 ? "#22c55e" : "#fbbf24"
                            }}>%{p.fit}</div>
                          </div>
                        ))}
                        <button
                          onClick={() => { setWizardContext(p => ({ ...p, platform: wizardResults[1]?.platforms?.[0]?.name || p.platform })); setWizardStep(2); }}
                          style={{ marginTop: "12px", padding: "10px 20px", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                        >İleri <ArrowRight size={14} /></button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Audience */}
                {wizardStep === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "14px" }}>Ürününüzü/hizmetinizi tanımlayın:</div>
                    <input value={wizardContext.product} onChange={e => setWizardContext(p => ({ ...p, product: e.target.value }))}
                      style={{ padding: "12px 16px", borderRadius: "10px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "14px" }} />
                    {wizardResults[2] && (
                      <div style={{ background: "#0f0f1a", borderRadius: "12px", padding: "16px", border: "1px solid #7c3aed33" }}>
                        <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: "13px", marginBottom: "12px" }}>👥 Hedef Kitle Profili (ICP):</div>
                        <div style={{ color: "#e2e8f0", fontSize: "13px", marginBottom: "12px" }}>{wizardResults[2].icp}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                          {Object.entries(wizardResults[2].demographics || {}).map(([k, v]) => (
                            <div key={k} style={{ background: "#1a1a2e", borderRadius: "8px", padding: "10px" }}>
                              <div style={{ color: "#64748b", fontSize: "10px" }}>{k.toUpperCase()}</div>
                              <div style={{ color: "#c4b5fd", fontSize: "12px", fontWeight: 600 }}>{String(v)}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ color: "#f87171", fontSize: "11px", marginBottom: "6px" }}>⚡ Tetikleyici Kelimeler:</div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {(wizardResults[2].triggerWords || []).map((w: string) => (
                              <span key={w} style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "11px", background: "#7f1d1d22", color: "#fca5a5", border: "1px solid #7f1d1d44" }}>{w}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => { setWizardContext(p => ({ ...p, audience: wizardResults[2]?.icp || "" })); setWizardStep(3); }}
                          style={{ marginTop: "12px", padding: "10px 20px", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          İleri <ArrowRight size={14} /></button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Strategy */}
                {wizardStep === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "14px" }}>Teklifiniz nedir?</div>
                    <input value={wizardContext.offer} onChange={e => setWizardContext(p => ({ ...p, offer: e.target.value }))}
                      style={{ padding: "12px 16px", borderRadius: "10px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "14px" }} />
                    {wizardResults[3] && (
                      <div style={{ background: "#0f0f1a", borderRadius: "12px", padding: "16px", border: "1px solid #14532d33" }}>
                        <div style={{ color: "#86efac", fontWeight: 600, fontSize: "13px", marginBottom: "12px" }}>📣 Reklam Stratejisi:</div>
                        {Object.entries(wizardResults[3]).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: "8px" }}>
                            <span style={{ color: "#64748b", fontSize: "11px" }}>{k.toUpperCase()}: </span>
                            <span style={{ color: "#d1fae5", fontSize: "12px" }}>{String(v)}</span>
                          </div>
                        ))}
                        <button onClick={() => setWizardStep(4)}
                          style={{ marginTop: "12px", padding: "10px 20px", borderRadius: "8px", background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                          İleri <ArrowRight size={14} /></button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Launch */}
                {wizardStep === 4 && !wizardComplete && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "14px" }}>🎯 Tüm bilgiler toplandı. AI nihai kampanya planını oluşturuyor...</div>
                  </div>
                )}

                <button
                  onClick={handleWizardStep}
                  disabled={isWizardLoading || (wizardStep === 1 && !wizardContext.goal)}
                  style={{
                    marginTop: "16px", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                    background: isWizardLoading ? "#1e1b4b" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                    opacity: (wizardStep === 1 && !wizardContext.goal) ? 0.5 : 1
                  }}
                >
                  <Sparkles size={16} />
                  {isWizardLoading ? "AI Çalışıyor..." : wizardStep < 4 ? `Adım ${wizardStep}: AI Analiz Et` : "🚀 Nihai Planı Oluştur"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: AI KOÇ & DENETİM
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "coach" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Creative Fatigue */}
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Siren size={16} style={{ color: "#f59e0b" }} /> Creative Fatigue Dedektörü
                </div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>Reklam yorgunluğunu ve kitle tükenmesini otomatik tespit eder</div>
              </div>
              <button
                onClick={handleDetectFatigue}
                disabled={isDetectingFatigue}
                style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg, #78350f, #92400e)", color: "#fcd34d", border: "1px solid #92400e", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Activity size={14} />{isDetectingFatigue ? "Taranıyor..." : "Yorgunluk Tara"}
              </button>
            </div>
            {fatigueData && (
              <div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                  {[
                    { label: "Kritik", value: fatigueData.summary.critical, color: "#ef4444" },
                    { label: "Uyarı", value: fatigueData.summary.warnings, color: "#f59e0b" },
                    { label: "Sağlıklı", value: fatigueData.summary.ok, color: "#22c55e" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "8px 16px", borderRadius: "10px", background: s.color + "11", border: `1px solid ${s.color}33`, display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "20px", fontWeight: 800, color: s.color }}>{s.value}</span>
                      <span style={{ fontSize: "12px", color: s.color }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                {fatigueData.alerts?.map((alert: any) => {
                  const colors = getFatigueColor(alert.fatigueLevel);
                  if (alert.signals.length === 0) return null;
                  return (
                    <div key={alert.id} style={{ background: colors.bg, border: `1px solid ${colors.border}33`, borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "13px" }}>{alert.name}</div>
                        <span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: 700, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                          {alert.fatigueLevel}
                        </span>
                      </div>
                      {alert.signals.map((s: string, i: number) => (
                        <div key={i} style={{ color: colors.text, fontSize: "12px", marginBottom: "4px" }}>⚠ {s}</div>
                      ))}
                      {alert.remedies.map((r: string, i: number) => (
                        <div key={i} style={{ color: "#86efac", fontSize: "12px", marginBottom: "4px" }}>✅ {r}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Campaign-by-Campaign Audit */}
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Brain size={16} style={{ color: "#a78bfa" }} /> Kampanya Bazlı AI Denetimi
            </div>
            <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "16px" }}>
              Genel Bakış sekmesinde her kampanya kartındaki "AI Denet" butonuna basın → derin analiz açılır panel olarak görünür.
            </div>
            <button onClick={() => setActiveTab("overview")} style={{ padding: "10px 20px", borderRadius: "10px", background: "#1e1b4b", color: "#a78bfa", border: "1px solid #7c3aed33", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
              <BarChart3 size={14} /> Kampanya Listesine Git
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: RAKİP İSTİHBARAT
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "intelligence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Search size={16} style={{ color: "#60a5fa" }} /> Rakip Reklam İstihbaratı
            </div>
            <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "20px" }}>
              Meta Ads Library, Google Transparency Center ve TikTok Creative Center'dan AI sentezi
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <input
                value={competitorNiche}
                onChange={e => setCompetitorNiche(e.target.value)}
                placeholder="Sektör / Niş (ör: Web Tasarım, E-ticaret, SaaS)"
                style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "14px" }}
              />
              <button onClick={handleGatherIntel} disabled={isGatheringIntel} style={{
                padding: "12px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #1e3a5f, #1e40af)", color: "#93c5fd", border: "1px solid #1e40af", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px"
              }}>
                <Globe size={14} />{isGatheringIntel ? "Toplıyor..." : "İstihbarat Topla"}
              </button>
            </div>

            {competitorReport && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#0a1628", borderRadius: "12px", padding: "16px", border: "1px solid #1e40af33" }}>
                  <div style={{ color: "#93c5fd", fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>📊 Sektör Genel Bakış</div>
                  <div style={{ color: "#bfdbfe", fontSize: "13px" }}>{competitorReport.sectorOverview}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                  {(competitorReport.competitors || []).map((c: any, i: number) => (
                    <div key={i} style={{ background: "#0f0f20", borderRadius: "12px", padding: "14px", border: "1px solid #334155" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "13px" }}>{c.archetype}</div>
                        <span style={{ color: "#f87171", fontSize: "11px" }}>CPM: {c.estimatedCpm}</span>
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>🎣 Hook: <span style={{ color: "#fbbf24" }}>{c.hookFormula}</span></div>
                      <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>💡 Zayıf Nokta: <span style={{ color: "#86efac" }}>{c.weakness}</span></div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#0a1a0a", borderRadius: "12px", padding: "16px", border: "1px solid #166534" }}>
                  <div style={{ color: "#86efac", fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>🌊 Blue Ocean Fırsatları (Rakipler Görmüyor)</div>
                  {(competitorReport.blueOceans || []).map((b: string, i: number) => (
                    <div key={i} style={{ color: "#d1fae5", fontSize: "12px", marginBottom: "6px", display: "flex", gap: "8px" }}>
                      <span style={{ color: "#22c55e" }}>→</span> {b}
                    </div>
                  ))}
                </div>

                <div style={{ background: "#1a0a2e", borderRadius: "12px", padding: "16px", border: "1px solid #7c3aed33" }}>
                  <div style={{ color: "#c084fc", fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>⚡ Ters Mühendislik Karşı Strateji</div>
                  <div style={{ color: "#e9d5ff", fontSize: "13px" }}>{competitorReport.counterStrategy}</div>
                </div>

                <div style={{ background: "#1a1000", borderRadius: "12px", padding: "16px", border: "1px solid #92400e33" }}>
                  <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>🔐 Gizli Rekabet Avantajı</div>
                  <div style={{ color: "#fef3c7", fontSize: "13px" }}>{competitorReport.secretEdge}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  {Object.entries(competitorReport.adLibraryInsights || {}).map(([platform, insight]) => (
                    <div key={platform} style={{ background: "#0f172a", borderRadius: "10px", padding: "12px", border: "1px solid #334155" }}>
                      <div style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", marginBottom: "6px" }}>{platform}</div>
                      <div style={{ color: "#cbd5e1", fontSize: "12px" }}>{String(insight)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: OTOPİLOT MOTOR
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "autopilot" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Rule Engine */}
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Cpu size={16} style={{ color: "#a78bfa" }} /> Otopilot Kural Motoru
                </div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>Tüm kampanyaları 4 kural ile otomatik optimize eder</div>
              </div>
              <button
                onClick={handleRunAutopilot}
                disabled={isRunningAutopilot}
                style={{ padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, background: isRunningAutopilot ? "#1e1b4b" : "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Zap size={14} />{isRunningAutopilot ? "Çalışıyor..." : "Otopilot Süpürmesi Başlat"}
              </button>
            </div>

            {/* Rules Display */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              {[
                { rule: "ROAS < 1.0x", action: "Kampanya OTOMATİK DURDURULUR", icon: "⏸", color: "#ef4444" },
                { rule: "ROAS > 3.0x", action: "Bütçe %20 ARTTIRILIR", icon: "📈", color: "#22c55e" },
                { rule: "Hook Rate < 20%", action: "Creative UYARISI oluşturulur", icon: "🎨", color: "#f59e0b" },
                { rule: "CTR < 0.5% + ROAS < 2x", action: "Bütçe %30 AZALTILIR", icon: "✂️", color: "#f87171" },
              ].map(r => (
                <div key={r.rule} style={{ background: "#0a0f1e", borderRadius: "10px", padding: "12px", border: `1px solid ${r.color}22` }}>
                  <div style={{ fontSize: "18px", marginBottom: "6px" }}>{r.icon}</div>
                  <div style={{ color: r.color, fontWeight: 700, fontSize: "13px" }}>Eğer {r.rule}</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "4px" }}>→ {r.action}</div>
                </div>
              ))}
            </div>

            {autopilotResult && (
              <div style={{ background: "#052e16", borderRadius: "12px", padding: "16px", border: "1px solid #166534" }}>
                <div style={{ color: "#22c55e", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={16} /> Süpürme Tamamlandı — {autopilotResult.actionsCount} Aksiyon
                </div>
                <div style={{ color: "#86efac", fontSize: "13px", marginBottom: "12px" }}>{autopilotResult.summary}</div>
                {autopilotResult.actions?.map((a: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0a1a0a", borderRadius: "8px", marginBottom: "6px" }}>
                    <div>
                      <span style={{ color: "#d1fae5", fontSize: "12px", fontWeight: 600 }}>{a.name}</span>
                      <span style={{ color: "#64748b", fontSize: "11px" }}> → {a.rule}</span>
                    </div>
                    <span style={{
                      padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                      background: a.action === "PAUSED" ? "#7f1d1d33" : a.action === "BUDGET_SCALED" ? "#14532d33" : "#78350f33",
                      color: a.action === "PAUSED" ? "#fca5a5" : a.action === "BUDGET_SCALED" ? "#86efac" : "#fcd34d"
                    }}>{a.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Plan */}
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LineChart size={16} style={{ color: "#34d399" }} /> Cross-Platform Bütçe Dağıtım Motoru
                </div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>AI, kazananlara bütçe aktarır, kaybedenlerden keser</div>
              </div>
              <button onClick={handleGenerateBudgetPlan} disabled={isGeneratingBudget} style={{
                padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                background: isGeneratingBudget ? "#0a1a0a" : "linear-gradient(135deg, #064e3b, #065f46)",
                color: "#34d399", border: "1px solid #065f46", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
              }}>
                <DollarSign size={14} />{isGeneratingBudget ? "Hesaplanıyor..." : "Bütçe Planı Oluştur"}
              </button>
            </div>
            {budgetPlan && (
              <div>
                <div style={{ background: "#0a1a0a", borderRadius: "12px", padding: "14px", marginBottom: "14px", border: "1px solid #166534" }}>
                  <pre style={{ color: "#86efac", fontSize: "12px", whiteSpace: "pre-wrap", margin: 0 }}>{budgetPlan.summary?.insight}</pre>
                </div>
                {budgetPlan.plan?.map((p: any) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "#0a0f1e", borderRadius: "10px", marginBottom: "8px", border: "1px solid #1e293b" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{p.name}</div>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>{p.platform}</div>
                      <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "4px" }}>{p.reason}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#64748b", fontSize: "11px" }}>₺{p.currentSpend?.toLocaleString()} →</div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: p.budgetDelta > 0 ? "#22c55e" : p.budgetDelta < 0 ? "#ef4444" : "#94a3b8" }}>
                        ₺{p.newSpend?.toLocaleString()}
                      </div>
                      <span style={{
                        padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700,
                        background: p.action === "SCALE_UP" ? "#14532d33" : p.action === "PAUSE" ? "#7f1d1d33" : p.action === "REDUCE" ? "#78350f33" : "#1e293b",
                        color: p.action === "SCALE_UP" ? "#22c55e" : p.action === "PAUSE" ? "#fca5a5" : p.action === "REDUCE" ? "#fcd34d" : "#94a3b8"
                      }}>{p.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: REKLAM METNİ FABRİKASI
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "copy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #1e293b" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={16} style={{ color: "#f472b6" }} /> Platform Spesifik Reklam Metni Fabrikası
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px", display: "block" }}>Platform</label>
                <select value={copyPlatform} onChange={e => setCopyPlatform(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px" }}>
                  {["Meta (Instagram/FB)", "Google Ads", "TikTok Ads", "LinkedIn Ads"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px", display: "block" }}>Ton</label>
                <select value={copyParams.tone} onChange={e => setCopyParams(p => ({ ...p, tone: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px" }}>
                  {["Güvenilir & Dinamik", "Acil & Kıtlık", "Otorite & Uzman", "Samimi & UGC", "Soru Soran & Meraklı"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px", display: "block" }}>Ürün/Hizmet</label>
                <input value={copyParams.product} onChange={e => setCopyParams(p => ({ ...p, product: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px", display: "block" }}>Hedef Kitle</label>
                <input value={copyParams.audience} onChange={e => setCopyParams(p => ({ ...p, audience: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px", display: "block" }}>Teklif</label>
                <input value={copyParams.offer} onChange={e => setCopyParams(p => ({ ...p, offer: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px", display: "block" }}>Hedef</label>
                <select value={copyParams.goal} onChange={e => setCopyParams(p => ({ ...p, goal: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px" }}>
                  {["Lead Generation", "Satış/Dönüşüm", "Marka Bilinirliği", "Uygulama Kurulum", "Video Görüntülenme"].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleGenerateCopy} disabled={isGeneratingCopy} style={{
                padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                background: isGeneratingCopy ? "#1e1b4b" : "linear-gradient(135deg, #be185d, #9d174d)",
                color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
              }}>
                <Sparkles size={16} />{isGeneratingCopy ? "Üretiliyor..." : `${copyPlatform} için Metin Üret`}
              </button>
              <button onClick={handleGenNegKw} disabled={isGenNegKw} style={{
                padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                background: "#0a0f1e", color: "#f87171", border: "1px solid #7f1d1d", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}>
                <Tag size={14} />{isGenNegKw ? "..." : "Negatif Kelime Listesi"}
              </button>
            </div>
          </div>

          {/* Generated Copy Output */}
          {generatedCopy && (
            <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #be185d33" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "15px" }}>✍️ Oluşturulan Reklam Metinleri — {copyPlatform}</div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {generatedCopy.hookScore && <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 700, background: "#14532d33", color: "#22c55e" }}>Hook Skoru: {generatedCopy.hookScore}/100</span>}
                  {generatedCopy.predictedCtr && <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 700, background: "#1e1b4b", color: "#a78bfa" }}>Tahmini CTR: {generatedCopy.predictedCtr}</span>}
                </div>
              </div>

              {/* Primary */}
              {generatedCopy.primary && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ color: "#f472b6", fontWeight: 600, fontSize: "12px", marginBottom: "8px" }}>📌 ANA FORMAT</div>
                  {Object.entries(generatedCopy.primary).map(([k, v]) => (
                    <div key={k} style={{ background: "#0a0f1e", borderRadius: "8px", padding: "10px 14px", marginBottom: "6px" }}>
                      <div style={{ color: "#64748b", fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" }}>{k}</div>
                      <div style={{ color: "#e2e8f0", fontSize: "13px", whiteSpace: "pre-wrap" }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hooks */}
              {generatedCopy.hooks?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "12px", marginBottom: "8px" }}>⚡ HOOK VARYANTları</div>
                  {generatedCopy.hooks.map((h: string, i: number) => (
                    <div key={i} style={{ background: "#1a1000", borderRadius: "8px", padding: "10px 14px", marginBottom: "6px", border: "1px solid #92400e22" }}>
                      <div style={{ color: "#fef3c7", fontSize: "13px" }}>{i + 1}. {h}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Variants */}
              {generatedCopy.variants?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ color: "#60a5fa", fontWeight: 600, fontSize: "12px", marginBottom: "8px" }}>🔀 A/B TEST VARYANTları</div>
                  {generatedCopy.variants.map((v: any, i: number) => (
                    <div key={i} style={{ background: "#0a1628", borderRadius: "8px", padding: "12px", marginBottom: "8px", border: "1px solid #1e40af22" }}>
                      <div style={{ color: "#93c5fd", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>{v.label}</div>
                      <div style={{ color: "#bfdbfe", fontSize: "13px", whiteSpace: "pre-wrap" }}>{v.text || (v.headlines ? v.headlines.join(" | ") : v.script)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {generatedCopy.tips?.length > 0 && (
                <div style={{ background: "#0a1a0a", borderRadius: "10px", padding: "14px", border: "1px solid #14532d33" }}>
                  <div style={{ color: "#86efac", fontWeight: 600, fontSize: "12px", marginBottom: "8px" }}>💡 Platform Optimizasyon İpuçları</div>
                  {generatedCopy.tips.map((t: string, i: number) => (
                    <div key={i} style={{ color: "#d1fae5", fontSize: "12px", marginBottom: "6px", display: "flex", gap: "8px" }}>
                      <span style={{ color: "#22c55e" }}>✓</span> {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Negative Keywords Output */}
          {negKwResult && (
            <div style={{ background: "#0f172a", borderRadius: "14px", padding: "20px", border: "1px solid #7f1d1d33" }}>
              <div style={{ color: "#fca5a5", fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>🚫 Negatif Anahtar Kelime Listesi — {negKwPlatform}</div>
              <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "12px" }}>{negKwResult.reasoning}</div>
              <div style={{ color: "#22c55e", fontSize: "12px", marginBottom: "16px" }}>💰 {negKwResult.estimatedSavings}</div>
              {[
                { label: "Tam Eşleme", key: "exact", color: "#ef4444" },
                { label: "Cümle Eşleme", key: "phrase", color: "#f59e0b" },
                { label: "Geniş Eşleme", key: "broad", color: "#a78bfa" },
              ].map(({ label, key, color }) => (
                <div key={key} style={{ marginBottom: "12px" }}>
                  <div style={{ color, fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>[{label.toUpperCase()}]</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(negKwResult[key] || []).map((kw: string, i: number) => (
                      <span key={i} style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "11px", background: color + "11", color, border: `1px solid ${color}33` }}>{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: Yeni Kampanya
      ══════════════════════════════════════════════════════════════ */}
      {isNewAdModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "16px" }}>Yeni Kampanya Ekle</div>
              <button onClick={() => setIsNewAdModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Kampanya Adı", key: "name", type: "text" },
                { label: "Aylık Harcama (₺)", key: "spend", type: "number" },
                { label: "ROAS Hedefi", key: "roas", type: "number" },
                { label: "Hook Rate (%)", key: "hookRate", type: "number" },
                { label: "CTR (%)", key: "ctr", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px", display: "block" }}>{label}</label>
                  <input
                    type={type}
                    value={(newAd as any)[key]}
                    onChange={e => setNewAd(p => ({ ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px", display: "block" }}>Platform</label>
                <select value={newAd.platform} onChange={e => setNewAd(p => ({ ...p, platform: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0a0f1e", color: "#e2e8f0", border: "1px solid #334155", fontSize: "13px" }}>
                  {["Meta (Instagram/FB)", "Google Ads", "TikTok Ads", "LinkedIn Ads"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setIsNewAdModalOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#1e293b", color: "#94a3b8", border: "none", cursor: "pointer", fontWeight: 600 }}>İptal</button>
              <button onClick={handleCreateAd} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>Kampanya Oluştur</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
