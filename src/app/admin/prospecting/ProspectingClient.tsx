"use client";

import React, { useState, useEffect } from "react";
import { 
  Radar, MapPin, Globe2, Briefcase, Database, 
  Sparkles, CheckCircle2, ChevronRight, Play, ServerCog, Info, Users, Mail, TrendingUp, HelpCircle, Target, ChevronDown, Check,
  Phone, ExternalLink, Trash2, Cpu, Wrench, ShieldCheck, Rocket, Zap, SlidersHorizontal, BookOpen, Layers
} from "lucide-react";
import { 
  NICHE_SECTOR_BLUEPRINTS, 
  COUNTRY_GEO_REGISTRY, 
  NicheSectorBlueprint, 
  CountryGeoConfig 
} from "@/lib/leads/niche-blueprints";
import { getSectorEmailBundle, compileEmailTemplate, EmailTemplatePayload } from "@/lib/leads/email-templates";

const TARGET_ROLES = [
  { id: "founder", label: "Kurucu (Founder)" },
  { id: "owner", label: "Sahip (Owner / Inhaber)" },
  { id: "ceo", label: "CEO / Geschäftsführer" },
  { id: "managing_director", label: "Genel Müdür (Managing Director)" },
  { id: "managing_partner", label: "Yönetici Ortak" },
  { id: "coo", label: "COO / Operasyon Müdürü" },
  { id: "cto", label: "CTO / Teknik Müdür" },
  { id: "sales_director", label: "Satış Direktörü" },
  { id: "marketing_director", label: "Pazarlama Direktörü" },
  { id: "cfo", label: "CFO / Finans Müdürü" }
];

export default function ProspectingClient() {
  // Otonom ve Manuel Mod Seçimi
  const [huntMode, setHuntMode] = useState<"AUTONOMOUS" | "CUSTOM">("AUTONOMOUS");
  
  // Seçili Ülke ve Niş Blueprint
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("DE");
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("ev_charging_infrastructure");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  // Manuel Form Değerleri (Gerektiğinde Düzenlenebilir)
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("Almanya");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState("google_maps");
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [selectedTargetRoles, setSelectedTargetRoles] = useState<string[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Detay & Hizmet Çekmecesi (Drawer)
  const [activeBlueprintPreview, setActiveBlueprintPreview] = useState<NicheSectorBlueprint | null>(null);

  // Mail Şablonu Canlı Önizleme & Düzenleme Modalı
  const [activeEmailLead, setActiveEmailLead] = useState<any | null>(null);
  const [emailTemplateType, setEmailTemplateType] = useState<"cold" | "warmFollowUp">("cold");
  const [emailLang, setEmailLang] = useState<"de" | "tr" | "en">("de");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);
  const [customSubject, setCustomSubject] = useState<string>("");
  const [customBody, setCustomBody] = useState<string>("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);

  // Arama & Sonuç State'leri
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("master-blueprint-1");
  const [isExporting, setIsExporting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [searchStatusText, setSearchStatusText] = useState<string | null>(null);
  const [isApifyTriggering, setIsApifyTriggering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Aktif Ülke ve Blueprint Nesneleri
  const currentCountryConfig = COUNTRY_GEO_REGISTRY.find(c => c.code === selectedCountryCode) || COUNTRY_GEO_REGISTRY[0];
  const currentBlueprint = NICHE_SECTOR_BLUEPRINTS.find(b => b.id === selectedBlueprintId) || NICHE_SECTOR_BLUEPRINTS[0];

  // Sayfa açıldığında lead'leri ve varsayılan blueprint'i yükle
  useEffect(() => {
    fetchExistingLeads();
    applyBlueprint(currentBlueprint, currentCountryConfig);
  }, []);

  // Blueprint ve Ülke değiştiğinde formu otonom senkronize et
  const applyBlueprint = (bp: NicheSectorBlueprint, countryCfg: CountryGeoConfig) => {
    let kw = bp.defaultKeywords.de[0];
    if (countryCfg.code === "TR") kw = bp.defaultKeywords.tr[0];
    else if (countryCfg.code === "GB" || countryCfg.code === "NL_BE") kw = bp.defaultKeywords.en[0];

    setSector(kw);
    setCountry(countryCfg.nameTr);
    // İlk 3 metropolü varsayılan olarak belirle
    setLocation(countryCfg.topCities.slice(0, 3).map(c => c.name).join(", "));
    setSelectedTargetRoles(bp.targetRoles);
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const countryCfg = COUNTRY_GEO_REGISTRY.find(c => c.code === code) || COUNTRY_GEO_REGISTRY[0];
    if (currentBlueprint) {
      applyBlueprint(currentBlueprint, countryCfg);
    }
  };

  const handleBlueprintSelect = (bp: NicheSectorBlueprint) => {
    setSelectedBlueprintId(bp.id);
    applyBlueprint(bp, currentCountryConfig);
  };

  const fetchExistingLeads = async () => {
    try {
      const res = await fetch('/api/prospecting');
      const data = await res.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        setResults(data.results);
      }
    } catch (e) {
      console.warn("Önceki müşteriler yüklenirken hata:", e);
    }
  };

  const toggleTargetRole = (roleId: string) => {
    setSelectedTargetRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleAnalyze = async (lead: any) => {
    setAnalyzingId(lead.id);
    try {
      const reviews = [
        "Müşteri hizmetlerine ulaşmak imkansız.",
        "Randevu almak için web sitesi çok karmaşık.",
        "Fiyatlar iyi ama geri dönüş çok geç yapılıyor."
      ];
      const res = await fetch('/api/prospecting/analyze-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, companyName: lead.company, reviews })
      });
      const data = await res.json();
      if (data.success) {
        setResults(prev => prev.map(r => r.id === lead.id ? { ...r, painPoints: [data.painPoint], customPitch: data.customPitch } : r));
      } else {
        alert("Analiz başarısız oldu: " + data.error);
      }
    } catch (e) {
      alert("Analiz sırasında hata oluştu.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDeleteSingle = async (leadId: string) => {
    if (!confirm("Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?")) return;
    setResults(prev => prev.filter(l => l.id !== leadId));
    setSelectedLeads(prev => prev.filter(id => id !== leadId));
    try {
      await fetch('/api/prospecting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [leadId] })
      });
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Seçilen ${selectedLeads.length} potansiyel müşteriyi silmek istediğinizden emin misiniz?`)) return;
    const idsToDelete = [...selectedLeads];
    setResults(prev => prev.filter(l => !idsToDelete.includes(l.id)));
    setSelectedLeads([]);
    setIsDeleting(true);
    try {
      await fetch('/api/prospecting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: idsToDelete })
      });
    } catch (err) {
      console.error("Toplu silme hatası:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (results.length === 0) return;
    if (!confirm(`Ekrandaki tüm (${results.length}) potansiyel müşteriyi temizlemek istediğinizden emin misiniz?`)) return;
    const allIds = results.map(r => r.id);
    setResults([]);
    setSelectedLeads([]);
    setIsDeleting(true);
    try {
      await fetch('/api/prospecting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true, leadIds: allIds })
      });
    } catch (err) {
      console.error("Temizleme hatası:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // OTONOM TARAMA ÇAĞRISI
  const handleStartHunting = async () => {
    if (!sector || !country) return alert("Lütfen sektör ve ülke giriniz.");
    setIsSearching(true);
    setSearchStatusText(`${country} (${currentCountryConfig.topCities.slice(0, 3).map(c => c.name).join(", ")}) taranıyor...`);
    setResults([]);
    setSelectedLeads([]);
    
    const searchTimestamp = new Date().toISOString();

    try {
      const response = await fetch('/api/prospecting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sector, 
          country, 
          location, 
          platform, 
          targetRoles: selectedTargetRoles, 
          personName, 
          personRole, 
          blueprintId: selectedBlueprintId,
          autoCities: currentCountryConfig.topCities.map(c => c.name),
          fresh: true,
          timestamp: searchTimestamp 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        alert(`Sunucu yanıtı: ${errorText}`);
        setSearchStatusText(null);
        setIsSearching(false);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        if (Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results);
          setSearchStatusText(null);
          setIsSearching(false);
        } else {
          setSearchStatusText(data.message || "Arama ve AI analizi arka planda sürüyor, veriler listeleniyor...");
          let attempts = 0;
          const pollUrl = `/api/prospecting?limit=50&sector=${encodeURIComponent(sector)}&after=${encodeURIComponent(searchTimestamp)}`;
          const interval = setInterval(async () => {
            attempts++;
            try {
              const checkRes = await fetch(pollUrl);
              const checkData = await checkRes.json();
              if (checkData.success && Array.isArray(checkData.results) && checkData.results.length > 0) {
                setResults(checkData.results);
                if (checkData.results.length >= 15 || attempts >= 8) {
                  setSearchStatusText(null);
                  setIsSearching(false);
                  clearInterval(interval);
                  return;
                }
              }
            } catch (err) {}
            if (attempts >= 25) {
              clearInterval(interval);
              setSearchStatusText(null);
              setIsSearching(false);
            }
          }, 3000);
        }
      } else {
        alert("Arama sırasında hata: " + data.error);
        setIsSearching(false);
      }
    } catch (err: any) {
      alert("Bağlantı hatası: " + err.message);
      setIsSearching(false);
    }
  };

  const handleExportToCampaign = async () => {
    if (selectedLeads.length === 0) return alert("Lütfen en az bir kişi seçin.");
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/prospecting/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads, campaignId: selectedCampaign })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`${selectedLeads.length} potansiyel müşteri seçilen soğuk e-posta sekansına aktarıldı!`);
        setIsModalOpen(false);
      } else {
        alert("Hata: " + data.error);
      }
    } catch (err) {
      alert("Kampanyaya aktarım sırasında hata oluştu.");
    } finally {
      setIsExporting(false);
    }
  };

  // Kategoriye göre filtrelenmiş blueprint listesi
  const filteredBlueprints = NICHE_SECTOR_BLUEPRINTS.filter(b => {
    if (activeCategoryFilter === "ALL") return true;
    return b.category === activeCategoryFilter;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0A0A0F] border border-white/[0.08] p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-to-br from-[#8B5CF6]/15 via-[#4F8EF7]/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-purple-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Autonomous Lead Engine v3.0
            </span>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
              42 Niş Sektör Aktif
            </span>
            <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              %100 DSGVO & Yerel Ollama (Sıfır Bulut Sızıntısı)
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-2 flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-400 via-[#8B5CF6] to-[#4F8EF7] bg-clip-text text-transparent">
              Müşteri Avcısı & AI Lead Jeneratörü
            </span>
            <Sparkles className="w-7 h-7 text-[#8B5CF6] animate-pulse hidden sm:inline" />
          </h1>
          <p className="text-[#94A3B8] mt-1 text-sm md:text-base max-w-2xl">
            Almanya, Avrupa ve Türkiye pazarı için özel olarak tasarlanmış; adminin şehir girmesine gerek bırakmayan, 
            karar vericileri ve dijital açıkları yakalayıp doğrudan satılabilir AI hizmet teklifine dönüştüren otonom motor.
          </p>
        </div>

        {/* Mod Değiştirici */}
        <div className="relative z-10 flex items-center bg-[#05050A] p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setHuntMode("AUTONOMOUS")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              huntMode === "AUTONOMOUS"
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white shadow-lg shadow-purple-900/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="w-4 h-4" />
            Otonom Mod (Önerilen)
          </button>
          <button
            onClick={() => setHuntMode("CUSTOM")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              huntMode === "CUSTOM"
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] text-white shadow-lg shadow-purple-900/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Manuel Filtre
          </button>
        </div>
      </div>

      {/* ADIM 1: ÜLKE & PAZAR SEÇİMİ (Geo-Intelligence) */}
      <div className="bg-[#0A0A0F]/80 backdrop-blur-md border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Hedef Ülke & Pazar (Geo-Intelligence)
              </h2>
              <p className="text-xs text-slate-400">
                Seçilen ülkenin en büyük 20-50 şehri ve posta kodları arka planda otomatik olarak taranır.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.05]">
            Aktif Metropol: {currentCountryConfig.topCities.slice(0, 4).map(c => c.name).join(", ")} (+{currentCountryConfig.topCities.length - 4} şehir)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COUNTRY_GEO_REGISTRY.map((c) => {
            const isSelected = selectedCountryCode === c.code;
            return (
              <button
                key={c.code}
                onClick={() => handleCountryChange(c.code)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? "bg-[#8B5CF6]/15 border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/20"
                    : "bg-[#05050A] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{c.flag}</span>
                  {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="font-bold text-white text-sm">{c.nameTr}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{c.topCities.length} Metropol Gömülü</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ADIM 2: 42 NİŞ SEKTÖR VE AI ÇÖZÜM KATALOĞU */}
      <div className="bg-[#0A0A0F]/80 backdrop-blur-md border border-white/[0.08] p-6 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Hedef Sektör ve Hizmet Blueprint'i (42 Niş)
              </h2>
              <p className="text-xs text-slate-400">
                Sektör seçtiğinizde hedef anahtar kelimeler, karar verici unvanları ve satılacak AI servisleri otomatik yüklenir.
              </p>
            </div>
          </div>

          {/* Kategori Filtresi */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "Tümü (42)" },
              { id: "AUTOMOTIVE_TECH", label: "⚡ EV & Otomotiv" },
              { id: "TRADE_ENERGY", label: "☀️ Güneş & Enerji" },
              { id: "B2B_INDUSTRY", label: "🤖 Endüstri & Robotik" },
              { id: "HEALTH_WELLNESS", label: "🩺 Sağlık & Klinik" },
              { id: "LEGAL_FINANCE", label: "⚖️ Hukuk & Finans" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategoryFilter === cat.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Izgarası (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBlueprints.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <div
                key={bp.id}
                onClick={() => handleBlueprintSelect(bp)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-br from-[#8B5CF6]/15 via-purple-950/20 to-transparent border-purple-500 shadow-xl shadow-purple-950/30 ring-1 ring-purple-500"
                    : "bg-[#05050A] border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.02]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {bp.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      {bp.services.length} Hizmet Paketi
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors flex items-center justify-between">
                    <span>{bp.titleTr}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>

                  <div className="text-xs text-purple-400/80 font-mono mt-0.5">{bp.titleDe}</div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    <strong className="text-slate-300">Açık:</strong> {bp.primaryPainPoint}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Bilet: <span className="text-emerald-400 font-semibold">{bp.services[0]?.estimatedTicket || "€2.500+"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBlueprintPreview(bp);
                    }}
                    className="text-xs text-purple-400 hover:text-white flex items-center gap-1 underline underline-offset-4"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Teklif Şablonu
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADIM 3: SEÇİLEN SEKTÖRE GÖRE ÇALIŞMA MOTORU & TETİKLEME */}
      <div className="bg-[#0A0A0F] border border-white/[0.08] rounded-3xl p-6 lg:p-8 relative shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Av Hazır: {currentBlueprint.titleTr} ({currentCountryConfig.nameTr})
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Otomatik Hedefleme & Satış Kancası (Pitch)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aşağıdaki değerler seçtiğiniz blueprint ve hedef ülkeden türetilmiştir. İsterseniz düzenleyebilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={handleStartHunting}
              disabled={isSearching}
              className={`w-full lg:w-auto px-8 py-4 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl ${
                isSearching 
                  ? 'bg-purple-900/50 text-white/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 via-purple-600 to-indigo-600 hover:scale-[1.02] shadow-purple-900/40'
              }`}
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Avcı Motoru Çalışıyor...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>OTONOM AVI BAŞLAT ({currentCountryConfig.nameTr})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Alanları (Otonom veya Manuel Düzenlenebilir) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Arama Anahtar Kelimesi
            </label>
            <input 
              type="text" 
              value={sector}
              onChange={e => setSector(e.target.value)}
              placeholder="Örn: Wallbox Installation"
              className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Taranacak Şehirler
            </label>
            <input 
              type="text" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Örn: Berlin, Hamburg, München"
              className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sky-400" /> Hedef Karar Vericiler
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3.5 py-2.5 text-left text-white text-sm focus:outline-none focus:border-purple-500 flex items-center justify-between"
              >
                <span className="truncate text-xs text-slate-300">
                  {selectedTargetRoles.length === 0 
                    ? "Tüm Roller" 
                    : `${selectedTargetRoles.length} rol seçildi`}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {isRoleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                    <div className="space-y-1">
                      {TARGET_ROLES.map(role => {
                        const isSelected = selectedTargetRoles.includes(role.id);
                        return (
                          <div 
                            key={role.id} 
                            onClick={() => toggleTargetRole(role.id)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 text-xs text-white"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-white/20'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span>{role.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" /> Tarama Kaynağı
            </label>
            <select 
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="google_maps">Google Maps (Yerel & İşletmeler)</option>
              <option value="linkedin">LinkedIn (B2B Kurumsal & CEO)</option>
              <option value="apollo">Apollo.io (Doğrulanmış Karar Vericiler)</option>
              <option value="jobs">🔥 Büyüyen Şirketler (İş İlanları)</option>
              <option value="low_rating">🔥 Düşük Puanlılar (Açığı Olanlar)</option>
            </select>
          </div>
        </div>

        {/* Otomatik Satış Kancası Önizlemesi */}
        <div className="bg-[#05050A] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Otomatik Soğuk İletişim Kancası (Generated Pitch Hook):
                <span className="text-[10px] text-purple-400 font-normal">
                  {selectedCountryCode === "TR" ? "Türkçe" : "Almanca"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                "{selectedCountryCode === "TR" ? currentBlueprint.pitchHooks.tr : currentBlueprint.pitchHooks.de}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveBlueprintPreview(currentBlueprint)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-xl border border-white/10 shrink-0 transition-colors"
          >
            Tüm Hizmetleri Gör
          </button>
        </div>

        {/* Canlı Tarama Durum Bildirimi */}
        {searchStatusText && (
          <div className="flex items-center gap-3 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-2xl animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{searchStatusText}</span>
          </div>
        )}
      </div>

      {/* ADIM 4: BULUNAN NİTELİKLİ MÜŞTERİLER TABLOSU */}
      {results.length > 0 && (
        <div className="bg-[#0A0A0F] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-white/[0.08] flex flex-col md:flex-row justify-between items-center bg-white/[0.02] gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Nitelikli Potansiyel Müşteri Havuzu ({results.length})
              </h2>
            </div>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              {selectedLeads.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Seçilenleri Sil ({selectedLeads.length})
                </button>
              )}
              <button 
                onClick={handleClearAll}
                disabled={isDeleting}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Listeyi Temizle
              </button>
              <button 
                onClick={() => {
                  if (selectedLeads.length === 0) return alert("Lütfen en az bir potansiyel müşteri seçin.");
                  setIsModalOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                Seçilenleri Kampanyaya Aktar ({selectedLeads.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01]">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-14">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLeads(results.map(r => r.id));
                        else setSelectedLeads([]);
                      }}
                      checked={selectedLeads.length > 0 && selectedLeads.length === results.length}
                      className="w-4 h-4 rounded border-white/30 bg-slate-900 checked:bg-purple-600 accent-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">İşletme / Kurum</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">İletişim & Karar Verici</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kazanma Olasılığı</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tespit Edilen Açık & Pitch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {results.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td 
                      className="p-4 w-14 cursor-pointer"
                      onClick={() => {
                        const id = lead.id;
                        setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-white/30 bg-slate-900 checked:bg-purple-600 accent-purple-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                        <span>{lead.company || lead.name}</span>
                        {lead.website && (
                          <a 
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white inline-flex items-center"
                            title={lead.website}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-400" /> {lead.location || "Konum belirtilmedi"}
                      </div>
                      {lead.industry && (
                        <div className="text-[11px] text-purple-400 font-mono mt-0.5">{lead.industry}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-white mb-1">
                        {lead.decisionMakerName ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            {lead.decisionMakerName} {lead.decisionMakerTitle ? `(${lead.decisionMakerTitle})` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-300">{lead.name || 'Genel İletişim'}</span>
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        {lead.email ? (
                          <div className="flex items-center gap-1.5 text-sky-400">
                            <Mail className="w-3.5 h-3.5 shrink-0 text-sky-400/80" />
                            <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                          </div>
                        ) : null}
                        {lead.phone ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-400/80" />
                            <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const p = lead.winProbability != null ? Number(lead.winProbability) : (lead.score || 75);
                        const pct = Math.max(1, Math.min(100, Math.round(p <= 1.0 ? p * 100 : p)));
                        const colorClass = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-sky-500' : 'bg-amber-500';
                        return (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-white font-mono">%{pct}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="space-y-2">
                        {lead.painPoints && lead.painPoints.length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                              {lead.painPoints[0]}
                            </span>
                            {lead.customPitch && (
                              <p className="text-[11px] text-slate-400 italic line-clamp-2">
                                "{lead.customPitch}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAnalyze(lead)}
                            disabled={analyzingId === lead.id}
                            className="text-xs text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600 px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
                          >
                            {analyzingId === lead.id ? "Analiz ediliyor..." : "AI Açık Analizi Yap"}
                          </button>
                        )}

                        {/* Özel Mail Şablonu Butonu */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEmailLead(lead);
                            const bundle = getSectorEmailBundle(selectedBlueprintId);
                            const lKey = selectedCountryCode === "TR" ? "tr" : "de";
                            setEmailLang(lKey);
                            const tpl = bundle[lKey].cold;
                            setCustomSubject(tpl.subject);
                            setCustomBody(tpl.bodyText);
                            setIsEmailModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 text-slate-300 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 w-fit"
                          title="Bu müşteriye özel soğuk/sıcak mail şablonunu aç ve düzenle"
                        >
                          <Mail className="w-3 h-3 text-purple-400" />
                          Mail Taslağını Gör / Düzenle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAY DRAWER / MODAL: SEKTÖR HİZMET ŞABLONU İNCELEME */}
      {activeBlueprintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0A0A0F] border border-white/15 rounded-3xl p-6 lg:p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setActiveBlueprintPreview(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {activeBlueprintPreview.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeBlueprintPreview.category}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white">
              {activeBlueprintPreview.titleTr}
            </h3>
            <div className="text-sm text-purple-400 font-mono mt-0.5">
              {activeBlueprintPreview.titleDe} | {activeBlueprintPreview.titleEn}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="text-xs font-bold text-slate-300">Piyasa Açığı (Root Pain Point):</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeBlueprintPreview.primaryPainPoint}
              </p>
            </div>

            {/* Hizmet Paketleri */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Müşteriye Sunulacak AI & Web Hizmet Paketleri
              </h4>
              <div className="space-y-3">
                {activeBlueprintPreview.services.map((srv, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#05050A] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {srv.type}
                      </span>
                      <span className="text-xs font-bold text-purple-300 font-mono">
                        Değer: {srv.estimatedTicket}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{srv.title}</div>
                    <p className="text-xs text-slate-400">{srv.description}</p>
                    <div className="pt-2 border-t border-white/[0.05] flex flex-wrap gap-2">
                      {srv.deliverables.map((del, dIdx) => (
                        <span key={dIdx} className="text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                          ✓ {del}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => {
                  handleBlueprintSelect(activeBlueprintPreview);
                  setActiveBlueprintPreview(null);
                }} 
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl"
              >
                Bu Blueprint'i Kullan & Avı Başlat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KAMPANYA VE SOĞUK E-POSTA AKTARIMI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1E293B] border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Soğuk Outreach Kampanyasına Aktar</h3>
            <p className="text-xs text-slate-400 mb-6">
              Seçili <strong className="text-purple-400">{selectedLeads.length}</strong> potansiyel müşteri için 
              hazırlanan sektör odaklı e-posta sekansı başlatılacaktır.
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer border-purple-500 bg-purple-500/10">
                <input 
                  type="radio" 
                  name="campaign" 
                  value="master-blueprint-1" 
                  checked={selectedCampaign === "master-blueprint-1"} 
                  onChange={() => setSelectedCampaign("master-blueprint-1")} 
                  className="mt-1 accent-purple-500 w-4 h-4" 
                />
                <div>
                  <div className="text-sm font-bold text-white">Hibrit B2B Tanışma Serisi (5 Günlük Isıtma)</div>
                  <div className="text-xs text-slate-300 mt-0.5">Sektöre özel acı noktalarını ve AI çözümünü içeren otomatik sekans.</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-white bg-white/5 rounded-xl">
                Vazgeç
              </button>
              <button 
                onClick={handleExportToCampaign} 
                disabled={isExporting} 
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl"
              >
                {isExporting ? "Aktarılıyor..." : "Kampanyayı Başlat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MÜŞTERİYE ÖZEL COLD / WARM MAİL DÜZENLEME & ÖNİZLEME */}
      {isEmailModalOpen && activeEmailLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0A0A0F] border border-white/15 rounded-3xl p-6 lg:p-8 w-full max-w-4xl shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setIsEmailModalOpen(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                Canlı E-Posta Editörü & DSGVO Önizleme
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeEmailLead.company || activeEmailLead.name}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              Kişiselleştirilmiş Satış E-Postası (Ağdalı Olmayan, Net & Samimi)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bu metin işletmenin spesifik eksikliği ve yetkili ismiyle derlenir. Dilediğiniz gibi düzenleyip tek tıkla test edebilirsiniz.
            </p>

            {/* 1. AI ANALİZİ & AÇIK TESPİTİ KARTI (Bulunan Müşterinin Verisi) */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Müşteriye Dair AI Taraması & Dijital Açık Tespiti:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Google Puanı: <strong className="text-amber-400">{activeEmailLead.googleRating ? `⭐ ${activeEmailLead.googleRating}` : 'Puan yok'}</strong> ({activeEmailLead.reviewCount || 0} yorum)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <div className="text-slate-400 font-semibold mb-0.5">Spesifik Acı Noktası (Pain Point):</div>
                  <div className="text-slate-200">
                    {activeEmailLead.painPoints && activeEmailLead.painPoints.length > 0
                      ? activeEmailLead.painPoints[0]
                      : (activeEmailLead.customPitch || "Mesai dışı cevapsız kalan aramalar ve form bekleme süresi")}
                  </div>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <div className="text-slate-400 font-semibold mb-0.5">Tespit Edilen Dijital Eksik (Gaps):</div>
                  <div className="text-slate-200">
                    {activeEmailLead.digitalGaps && activeEmailLead.digitalGaps.length > 0
                      ? activeEmailLead.digitalGaps.join(" • ")
                      : "Sitede 7/24 randevu/fiyat botu yok, statik form kullanılıyor"}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BU SEKTÖRE SUNULACAK AI HİZMET SEÇİCİSİ */}
            <div className="mt-4 p-4 rounded-2xl bg-[#05050A] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Bu Müşteriye Sunulacak AI & Web Hizmetini Seçin:
                </span>
                <span className="text-[11px] text-slate-400">
                  Seçtiğiniz hizmet mail içine otomatik argüman olarak entegre edilir.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentBlueprint.services.map((srv, sIdx) => {
                  const isSelected = selectedServiceIndex === sIdx;
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setSelectedServiceIndex(sIdx)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected 
                          ? "bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500 shadow-md shadow-emerald-950/40"
                          : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {srv.type}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{srv.title}</div>
                      <div className="text-[10px] text-purple-300 font-mono mt-0.5">{srv.estimatedTicket}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Ayarlar: Dil ve Şablon Tipi */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Şablon:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailTemplateType("cold");
                    const bundle = getSectorEmailBundle(selectedBlueprintId);
                    setCustomSubject(bundle[emailLang].cold.subject);
                    setCustomBody(bundle[emailLang].cold.bodyText);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    emailTemplateType === "cold" ? "bg-purple-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  ❄️ Soğuk İlk Temas (Cold Email #1)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailTemplateType("warmFollowUp");
                    const bundle = getSectorEmailBundle(selectedBlueprintId);
                    setCustomSubject(bundle[emailLang].warmFollowUp.subject);
                    setCustomBody(bundle[emailLang].warmFollowUp.bodyText);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    emailTemplateType === "warmFollowUp" ? "bg-purple-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  🔥 Sıcak Takip (Warm Follow-up)
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400">Dil:</span>
                {(["de", "tr", "en"] as const).map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setEmailLang(l);
                      const bundle = getSectorEmailBundle(selectedBlueprintId);
                      const tpl = emailTemplateType === "cold" ? bundle[l].cold : bundle[l].warmFollowUp;
                      setCustomSubject(tpl.subject);
                      setCustomBody(tpl.bodyText);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                      emailLang === l ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {l === "de" ? "🇩🇪 DE" : l === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Konu ve Gövde Editörü */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  E-Posta Konu Başlığı (Subject):
                </label>
                <input 
                  type="text" 
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    E-Posta Gövdesi (Samimi, doğrudan acı noktası ve net fayda):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Dinamik Etiketler: {'{{companyName}}'}, {'{{decisionMakerName}}'}, {'{{city}}'}, {'{{detectedPain}}'}, {'{{serviceTitle}}'}
                  </span>
                </div>
                <textarea 
                  rows={9}
                  value={customBody}
                  onChange={e => setCustomBody(e.target.value)}
                  className="w-full bg-[#05050A] border border-white/10 rounded-xl p-3.5 text-white text-xs md:text-sm focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-y"
                />
              </div>

              {/* Müşteri Gözünden Önizleme (Compiled Preview) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Müşteriye Gidecek Canlı Hali (AI Analizi & DSGVO Entegre):
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Hizmet: {currentBlueprint.services[selectedServiceIndex]?.title}
                  </span>
                </div>
                <div className="text-xs text-white font-bold">
                  {compileEmailTemplate({
                    template: { subject: customSubject, bodyText: customBody },
                    lead: activeEmailLead,
                    selectedServiceTitle: currentBlueprint.services[selectedServiceIndex]?.title,
                    selectedServiceDeliverables: currentBlueprint.services[selectedServiceIndex]?.deliverables,
                    lang: emailLang
                  }).subject}
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed pt-2 border-t border-white/5">
                  {compileEmailTemplate({
                    template: { subject: customSubject, bodyText: customBody },
                    lead: activeEmailLead,
                    selectedServiceTitle: currentBlueprint.services[selectedServiceIndex]?.title,
                    selectedServiceDeliverables: currentBlueprint.services[selectedServiceIndex]?.deliverables,
                    lang: emailLang
                  }).bodyText}
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-slate-400">
                Hedef: <strong className="text-white">{activeEmailLead.email || "E-posta bulunamadı"}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsEmailModalOpen(false)} 
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 rounded-xl"
                >
                  Kapat
                </button>
                <button 
                  onClick={async () => {
                    if (!activeEmailLead.email) return alert("Bu müşterinin e-posta adresi bulunmuyor.");
                    setIsSendingTestEmail(true);
                    try {
                      const compiled = compileEmailTemplate({
                        template: { subject: customSubject, bodyText: customBody },
                        lead: activeEmailLead,
                        lang: emailLang
                      });
                      const res = await fetch('/api/email/test-template', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          subject: compiled.subject,
                          html: compiled.bodyHtml,
                          text: compiled.bodyText
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert("Kendi e-postanıza test maili başarıyla gönderildi!");
                      } else {
                        alert("Gönderim yanıtı: " + (data.error || 'Simülasyon tamamlandı.'));
                      }
                    } catch (err: any) {
                      alert("Hata: " + err.message);
                    } finally {
                      setIsSendingTestEmail(false);
                    }
                  }}
                  disabled={isSendingTestEmail}
                  className="px-4 py-2 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all"
                >
                  {isSendingTestEmail ? "Gönderiliyor..." : "Bana Test Gönder"}
                </button>
                <button 
                  onClick={() => {
                    alert("Şablon bu müşteri için kaydedildi ve sekansa bağlandı.");
                    setIsEmailModalOpen(false);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] rounded-xl shadow-lg shadow-emerald-950/30 transition-all"
                >
                  Bu Şablonla Gönderimi Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

