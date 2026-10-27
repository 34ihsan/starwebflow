"use client";

import React, { useState } from "react";
import { 
  Radar, MapPin, Globe2, Briefcase, Database, 
  Sparkles, CheckCircle2, ChevronRight, Play, ServerCog, Info, Users, Mail, TrendingUp, HelpCircle, Target, ChevronDown, Check,
  Phone, ExternalLink, Trash2
} from "lucide-react";

const TARGET_ROLES = [
  { id: "founder", label: "Kurucu (Founder)" },
  { id: "owner", label: "Sahip (Owner)" },
  { id: "ceo", label: "CEO" },
  { id: "coo", label: "COO" },
  { id: "cto", label: "CTO" },
  { id: "cmo", label: "CMO" },
  { id: "managing_partner", label: "Yönetici Ortak" },
  { id: "managing_director", label: "Genel Müdür" },
  { id: "sales_director", label: "Satış Direktörü" },
  { id: "marketing_director", label: "Pazarlama Direktörü" },
  { id: "hr_director", label: "İnsan Kaynakları (HR)" }
];

export default function ProspectingClient() {
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState("google_maps");
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // Kampanya Aktarımı İçin Stateler
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("master-blueprint-1");
  const [isExporting, setIsExporting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [searchStatusText, setSearchStatusText] = useState<string | null>(null);
  
  // Apify tetikleme state
  const [isApifyTriggering, setIsApifyTriggering] = useState(false);
  
  // Hedef Roller state
  const [selectedTargetRoles, setSelectedTargetRoles] = useState<string[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Sayfa açıldığında mevcut lead'leri yükle
  React.useEffect(() => {
    fetchExistingLeads();
  }, []);

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

  const toggleLeadSelection = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === results.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(results.map(r => String(r.id)));
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSingle = async (id: string) => {
    // Anında ekrandan ve seçimlerden kaldır (Optimistic UI)
    setResults(prev => prev.filter(r => r.id !== id));
    setSelectedLeads(prev => prev.filter(lId => lId !== id));
    try {
      await fetch('/api/prospecting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [id] })
      });
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return alert("Lütfen silmek için en az bir müşteri seçin.");
    const toDelete = [...selectedLeads];
    // Anında ekrandan ve seçimlerden kaldır (Optimistic UI)
    setResults(prev => prev.filter(r => !toDelete.includes(r.id)));
    setSelectedLeads([]);
    setIsDeleting(true);
    try {
      await fetch('/api/prospecting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: toDelete })
      });
    } catch (err) {
      console.error("Silme hatası:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (results.length === 0) return;
    const allIds = results.map(r => r.id);
    // Anında tüm listeyi ve seçimleri sıfırla (Optimistic UI)
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

  const handleSearch = async () => {
    if (!sector || !country) return alert("Lütfen sektör ve ülke giriniz.");
    setIsSearching(true);
    setSearchStatusText("Hedef şirketler ve karar vericiler taranıyor...");
    // Yeni arama başladığında eski listeyi anında temizle!
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
          fresh: true,
          timestamp: searchTimestamp 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let message = `Sunucu hatası: HTTP ${response.status}`;
        try {
          const errJson = JSON.parse(errorText);
          if (errJson.error) message = errJson.error;
        } catch {
          if (response.status === 504) {
            message = "Arama ve AI analizi devam ediyor (Zaman aşımı). Lütfen birazdan sayfayı yenileyin veya CRM / Veri Havuzu sekmesini kontrol edin.";
          }
        }
        alert(message);
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
          // Arka planda çalışma durumunda 3 saniyede bir polling başlat
          setSearchStatusText(data.message || "Arama arka planda sürüyor, veriler işleniyor...");
          let attempts = 0;
          // SADECE BU YENİ ARAMADAN SONRA oluşturulan verileri getir!
          const pollUrl = `/api/prospecting?limit=50&sector=${encodeURIComponent(sector)}&location=${encodeURIComponent(location || '')}&after=${encodeURIComponent(searchTimestamp)}`;
          const interval = setInterval(async () => {
            attempts++;
            try {
              const checkRes = await fetch(pollUrl);
              const checkData = await checkRes.json();
              if (checkData.success && Array.isArray(checkData.results) && checkData.results.length > 0) {
                setResults(checkData.results);
                // Eğer 15+ potansiyel müşteri listelendiyse veya 6 deneme (18 sn) geçtiyse taramayı tamamla
                if (checkData.results.length >= 15 || attempts >= 8) {
                  setSearchStatusText(null);
                  setIsSearching(false);
                  clearInterval(interval);
                  return;
                }
              }
            } catch (err) {
              // Devam et
            }
            if (attempts >= 30) {
              clearInterval(interval);
              setSearchStatusText(null);
              setIsSearching(false);
            }
          }, 3000);
        }
      } else {
        alert("Arama sırasında hata oluştu: " + data.error);
        setSearchStatusText(null);
        setIsSearching(false);
      }
    } catch (err) {
      console.error(err);
      alert("Sistemle bağlantı kurulamadı.");
      setSearchStatusText(null);
      setIsSearching(false);
    }
  };

  const handleApifyTrigger = async () => {
    if (!sector || !country) return alert("Lütfen gerçek Apify taraması için sektör ve ülke giriniz.");
    setIsApifyTriggering(true);
    
    try {
      const response = await fetch('/api/webhooks/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword: sector,
          location: `${location || ''} ${country}`.trim(),
          platform: platform,
          targetRoles: selectedTargetRoles,
          personName,
          personRole
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert("Gerçek Apify Actor başarıyla tetiklendi! Datalar geldikçe listeye düşecektir.");
      } else {
        alert("Apify tetikleme başarısız: " + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      console.error(err);
      alert("Apify servisiyle bağlantı kurulamadı.");
    } finally {
      setIsApifyTriggering(false);
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
        alert(`${selectedLeads.length} müşteri başarıyla kampanyaya aktarıldı ve sıraya alındı!`);
        setIsModalOpen(false);
        // İsteğe bağlı: Seçilenleri tablodan kaldırabiliriz.
      } else {
        alert("Hata: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Kampanyaya aktarım sırasında hata oluştu.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-400 via-[#8B5CF6] to-[#4F8EF7] bg-clip-text text-transparent">
              Müşteri Avcısı (AI Prospecting)
            </span>
            <Sparkles className="w-6 h-6 text-[#8B5CF6] animate-pulse" />
          </h1>
          <p className="text-[#94A3B8] mt-2 text-lg">Yapay zeka ile dünyanın her yerinden hedefinize uygun müşterileri saniyeler içinde tespit edin.</p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Veri Zenginleştirme</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Bulunan işletmelerin web siteleri ve yorumları AI ile taranır; e-posta, karar verici isimleri ve acı noktaları (pain points) otomatik olarak çıkarılır.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#4F8EF7]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#4F8EF7]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">CRM Entegrasyonu</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Taranan tüm potansiyel müşteriler (leadler) otomatik olarak CRM sisteminize kaydedilir. <span className="text-white font-medium">CRM, Satış & Pipeline</span> sekmesinden dilediğiniz zaman ulaşabilirsiniz.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#10B981]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Otonom Kampanyalar</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">Seçtiğiniz leadleri doğrudan <span className="text-white font-medium">Hibrit B2B Tanışma Serisi</span> gibi e-posta sekanslarına aktararak otomatik ısıtma sürecini başlatabilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Radar / Search Area */}
      <div className="bg-[#0A0A0F]/80 backdrop-blur-md border border-white/[0.05] rounded-3xl p-8 relative shadow-2xl">
        {/* Radar Effect Background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#8B5CF6]/10 to-[#4F8EF7]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          <div>
            <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2"><Globe2 className="w-4 h-4" /> Hangi Ülke?</label>
            <div className="relative">
              <input 
                type="text" 
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Örn: Almanya, USA"
                className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Hangi Şehir?</label>
            <div className="relative">
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Örn: Berlin, London"
                className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Kimi Arıyoruz? (Sektör)</label>
            <div className="relative">
              <input 
                type="text" 
                value={sector}
                onChange={e => setSector(e.target.value)}
                placeholder="Örn: Diş Kliniği, Ajans"
                className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Hedef Rol (Opsiyonel)</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-left text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner flex items-center justify-between"
              >
                <span className="truncate text-sm text-[#94A3B8]">
                  {selectedTargetRoles.length === 0 
                    ? "Tüm Roller" 
                    : selectedTargetRoles.length === 1 
                      ? TARGET_ROLES.find(r => r.id === selectedTargetRoles[0])?.label 
                      : `${selectedTargetRoles.length} rol seçildi`}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#94A3B8] transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isRoleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#1E293B] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                    <div className="space-y-1">
                      {TARGET_ROLES.map(role => {
                        const isSelected = selectedTargetRoles.includes(role.id);
                        return (
                          <div 
                            key={role.id} 
                            onClick={() => toggleTargetRole(role.id)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-white/20'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm text-white">{role.label}</span>
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
            <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> İsim (Opsiyonel)</label>
            <div className="relative">
              <input 
                type="text" 
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                placeholder="Örn: John Doe"
                className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Rol/Konum (Opsiyonel)</label>
            <div className="relative">
              <input 
                type="text" 
                value={personRole}
                onChange={e => setPersonRole(e.target.value)}
                placeholder="Örn: Marketing Manager"
                className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div>
            <div className="relative group flex items-center w-fit">
              <label className="text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2 cursor-help">
                <Database className="w-4 h-4" /> 
                Kaynak
                <HelpCircle className="w-4 h-4 text-[#8B5CF6] opacity-80" />
              </label>

              {/* Popup Aciklama */}
              <div className="absolute bottom-full left-0 mb-2 w-80 bg-[#0A0A0F] border border-white/[0.05] rounded-xl p-4 shadow-[0_10px_40px_rgba(139,92,246,0.15)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#0A0A0F] border-b border-r border-white/[0.05] transform rotate-45"></div>
                <h4 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  Kaynaklar Niçin Kullanılır?
                </h4>
                <ul className="text-xs space-y-3">
                  <li className="flex gap-2 text-[#94A3B8]">
                    <span className="text-[#10B981] font-bold mt-0.5">•</span>
                    <span><strong className="text-white">Yerel İşletmeler (Maps):</strong> Klinik, restoran gibi fiziksel konumu olan işletmeleri lokasyon bazlı toplamak için.</span>
                  </li>
                  <li className="flex gap-2 text-[#94A3B8]">
                    <span className="text-[#4F8EF7] font-bold mt-0.5">•</span>
                    <span><strong className="text-white">Kurumsal (LinkedIn/Apollo):</strong> B2B şirketlerdeki direkt CEO/CTO/Müdür seviyesindeki karar vericileri avlamak için.</span>
                  </li>
                  <li className="flex gap-2 text-[#94A3B8]">
                    <span className="text-[#F59E0B] font-bold mt-0.5">•</span>
                    <span><strong className="text-white">Niyet Odaklı (🔥 İş İlanları vb):</strong> İş ilanı veren, yeni teknoloji kullanan veya fuara katılan "büyüme evresindeki" sıcak hedefleri yakalamak için.</span>
                  </li>
                </ul>
              </div>
            </div>
            <select 
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full bg-[#05050A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all appearance-none shadow-inner"
            >
              {/* Standart B2B & Yerel Kaynaklar */}
              <option value="google_maps" className="bg-[#0A0A0F]">Google Maps (Yerel İşletmeler)</option>
              <option value="linkedin" className="bg-[#0A0A0F]">LinkedIn (Kurumsal B2B)</option>
              <option value="apollo" className="bg-[#0A0A0F]">Apollo.io (Karar Vericiler)</option>
              
              {/* Bakir (Untapped) & Niyet Odaklı Kaynaklar */}
              <option value="jobs" className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 İş İlanları (Indeed, Glassdoor)</option>
              <option value="tech_radar" className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 Teknoloji Radarı (BuiltWith)</option>
              <option value="events" className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 Fuar & Etkinlik Katılımcıları</option>
              <option value="low_rating" className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 Düşük Puanlı İşletmeler (Yelp/Maps)</option>

              {/* Diğer Kaynaklar */}
              <option value="instagram" className="bg-[#0A0A0F]">Instagram (E-ticaret & Influencer)</option>
              <option value="crunchbase" className="bg-[#0A0A0F]">Crunchbase (Startuplar)</option>
              <option value="clutch" className="bg-[#0A0A0F]">Clutch.co (B2B Ajanslar)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-4 relative z-10 border-t border-white/[0.05] pt-6">
          {searchStatusText ? (
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3.5 py-2 rounded-xl mr-auto animate-pulse">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{searchStatusText}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mr-auto bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.05]">
              <Info className="w-4 h-4 text-[#4F8EF7]" />
              Tarama sonuçları anında <strong className="text-white">CRM</strong> panelinize işlenecektir.
            </div>
          )}
          
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${isSearching ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Sistemi Taramaya Başladı...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Hızlı Avı Başlat
              </>
            )}
          </button>
          
          <button 
            onClick={handleApifyTrigger}
            disabled={isApifyTriggering}
            className={`w-full md:w-auto px-8 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${isApifyTriggering ? 'bg-[#8B5CF6]/50 cursor-not-allowed' : 'bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7] hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}
            title="Gerçek veriler çekilir (Apify Actor çalışır)"
          >
            {isApifyTriggering ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 Tetikleniyor...
               </>
            ) : (
               <>
                 <ServerCog className="w-4 h-4" /> Gerçek Apify Taraması
               </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-white/[0.05] flex flex-col md:flex-row justify-between items-center bg-white/[0.02] gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-3 h-3 rounded-full bg-[#10B981] animate-ping opacity-75"></span>
                <span className="relative w-2 h-2 rounded-full bg-[#10B981]"></span>
              </div>
              Taranan Potansiyel Müşteriler ({results.length})
            </h2>
            <div className="flex items-center gap-2.5 flex-wrap">
              {selectedLeads.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl transition-all text-xs md:text-sm font-semibold flex items-center gap-1.5"
                  title="Seçilen potansiyel müşterileri sil"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Seçilenleri Sil ({selectedLeads.length})
                </button>
              )}
              <button 
                onClick={handleClearAll}
                disabled={isDeleting}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all text-xs md:text-sm font-medium flex items-center gap-1.5"
                title="Tüm listeyi temizle"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                Listeyi Temizle
              </button>
              <button 
                onClick={() => {
                  if(selectedLeads.length === 0) return alert("Önce listeden müşteri seçiniz.");
                  setIsModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <TrendingUp className="w-4 h-4" />
                Seçilenleri Kampanyaya Aktar ({selectedLeads.length})
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider w-14">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLeads(results.map(r => r.id));
                        else setSelectedLeads([]);
                      }}
                      checked={selectedLeads.length > 0 && selectedLeads.length === results.length}
                      className="w-5 h-5 rounded-md border-2 border-white/30 bg-slate-900 checked:bg-[#8B5CF6] accent-[#8B5CF6] cursor-pointer"
                      title="Tümünü Seç / Kaldır"
                    />
                  </th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">İşletme Adı</th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">İletişim & Karar Verici</th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">AI Tespitleri</th>
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {results.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td 
                      className="p-4 w-14 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = lead.id;
                        setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => {}}
                        className="w-5 h-5 rounded-md border-2 border-white/30 bg-slate-900 checked:bg-[#8B5CF6] accent-[#8B5CF6] cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm group-hover:text-[#8B5CF6] transition-colors flex items-center gap-1.5">
                        <span>{lead.company || lead.name}</span>
                        {lead.website && (
                          <a 
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#94A3B8] hover:text-[#4F8EF7] transition-colors inline-flex items-center"
                            title={`Siteye Git: ${lead.website}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8B5CF6]" /> {lead.location}
                      </div>
                      {lead.industry && (
                        <div className="text-xs text-purple-400 mt-1">{lead.industry}</div>
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
                          <span className="text-white/80">{lead.name || 'Genel İletişim'}</span>
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        {lead.email ? (
                          <div className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300">
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
                        {!lead.email && !lead.phone && (
                          <span className="text-xs text-amber-400/70 italic">İletişim bilgisi taranıyor...</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        {lead.ghostingAlert && (
                          <span className="flex items-center gap-1 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-2 py-1 rounded w-fit">
                            Ghosting Riski
                          </span>
                        )}
                        {(() => {
                          const p = lead.winProbability != null ? Number(lead.winProbability) : null;
                          const s = lead.score != null ? Number(lead.score) : null;
                          let pct = 70;
                          if (p != null) {
                            pct = p <= 1.0 ? Math.round(p * 100) : Math.round(p);
                          } else if (s != null) {
                            pct = s <= 1.0 ? Math.round(s * 100) : Math.round(s);
                          }
                          pct = Math.max(1, Math.min(100, pct));
                          const colorClass = pct >= 80 ? 'bg-[#10B981]' : pct >= 60 ? 'bg-[#4F8EF7]' : 'bg-[#F59E0B]';
                          return (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-white">%{pct}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {lead.painPoints && lead.painPoints.length > 0 ? (
                          <span className="text-xs bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-1 rounded cursor-help flex items-center gap-1 w-fit" title={lead.customPitch}>
                            <Sparkles className="w-3 h-3" />
                            {lead.painPoints[0]}
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleAnalyze(lead)}
                            disabled={analyzingId === lead.id}
                            className="text-xs text-[#4F8EF7] hover:text-white bg-[#4F8EF7]/10 hover:bg-[#4F8EF7] px-3 py-1.5 rounded transition-colors font-medium flex items-center gap-1 w-fit"
                          >
                            {analyzingId === lead.id ? "Analiz..." : "AI Yorum Analizi"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSingle(lead.id)}
                          disabled={isDeleting}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-auto"
                          title="Bu müşteriyi sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal - Kampanya Seçimi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#94A3B8] hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Kampanyaya Aktar</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Seçili <strong className="text-purple-400">{selectedLeads.length}</strong> müşteriye hangi e-posta senaryosu uygulanacak? Sistem AI ile içerikleri onlara özel uyarlayacak.
            </p>
            
            <div className="space-y-4 mb-8">
              <label className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors border-purple-500 bg-purple-500/5">
                <input type="radio" name="campaign" value="master-blueprint-1" checked={selectedCampaign === "master-blueprint-1"} onChange={() => setSelectedCampaign("master-blueprint-1")} className="mt-1 accent-purple-500 w-4 h-4" />
                <div>
                  <div className="font-bold text-white">Hibrit B2B Tanışma Serisi (5 Günlük)</div>
                  <div className="text-sm text-[#94A3B8] mt-1">Sektöre özel Case Study (Vaka) içeren, 5 aşamalı ısıtma e-postası.</div>
                </div>
              </label>
              <label className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors border-white/10 hover:bg-white/5 opacity-50 cursor-not-allowed">
                <input type="radio" name="campaign" disabled className="mt-1 w-4 h-4" />
                <div>
                  <div className="font-bold text-white">Direkt Satış & Demo Randevusu</div>
                  <div className="text-sm text-[#94A3B8] mt-1">Çok yakında...</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                İptal
              </button>
              <button onClick={handleExportToCampaign} disabled={isExporting} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 rounded-xl flex items-center gap-2 transition-all">
                {isExporting ? "Aktarılıyor..." : "Otomasyonu Başlat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
