"use client";

import React, { useState } from "react";
import { 
  Radar, MapPin, Globe2, Briefcase, Database, 
  Sparkles, CheckCircle2, ChevronRight, Play, ServerCog, Info, Users, Mail, TrendingUp, HelpCircle
} from "lucide-react";

export default function ProspectingClient() {
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState("Google Maps");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // Kampanya Aktarımı İçin Yeni Stateler
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("master-blueprint-1");
  const [isExporting, setIsExporting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  // Apify tetikleme state
  const [isApifyTriggering, setIsApifyTriggering] = useState(false);

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

  const toggleLeadSelection = (id: number) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const toggleAllLeads = () => {
    if (selectedLeads.length === results.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(results.map(r => r.id));
    }
  };

  const handleSearch = async () => {
    if (!sector || !country) return alert("Lütfen sektör ve ülke giriniz.");
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/prospecting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, country, location, platform })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        alert("Arama sırasında hata oluştu: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Sistemle bağlantı kurulamadı.");
    } finally {
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
          platform: platform
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
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
              <option className="bg-[#0A0A0F]">Google Maps (Yerel İşletmeler)</option>
              <option className="bg-[#0A0A0F]">LinkedIn (Kurumsal B2B)</option>
              <option className="bg-[#0A0A0F]">Apollo.io (Karar Vericiler)</option>
              
              {/* Bakir (Untapped) & Niyet Odaklı Kaynaklar */}
              <option className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 İş İlanları (Indeed, Glassdoor)</option>
              <option className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 Teknoloji Radarı (BuiltWith)</option>
              <option className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 Fuar & Etkinlik Katılımcıları</option>
              <option className="bg-[#0A0A0F] font-bold text-[#8B5CF6]">🔥 Düşük Puanlı İşletmeler (Yelp/Maps)</option>

              {/* Diğer Kaynaklar */}
              <option className="bg-[#0A0A0F]">Instagram (E-ticaret & Influencer)</option>
              <option className="bg-[#0A0A0F]">Crunchbase (Startuplar)</option>
              <option className="bg-[#0A0A0F]">Clutch.co (B2B Ajanslar)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-4 relative z-10 border-t border-white/[0.05] pt-6">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mr-auto bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.05]">
            <Info className="w-4 h-4 text-[#4F8EF7]" />
            Tarama sonuçları anında <strong className="text-white">CRM</strong> panelinize işlenecektir.
          </div>
          
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
            <button 
              onClick={() => {
                if(selectedLeads.length === 0) return alert("Önce listeden müşteri seçiniz.");
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all text-sm font-bold flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Seçilenleri Kampanyaya Aktar ({selectedLeads.length})
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if(e.target.checked) setSelectedLeads(results.map(r => r.id));
                        else setSelectedLeads([]);
                      }}
                      checked={selectedLeads.length === results.length && results.length > 0}
                      className="rounded border-white/[0.05] bg-[#05050A] text-[#8B5CF6] focus:ring-[#8B5CF6]/50"
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
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if(e.target.checked) setSelectedLeads([...selectedLeads, lead.id]);
                          else setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                        }}
                        className="rounded border-white/[0.05] bg-[#05050A] text-[#8B5CF6] focus:ring-[#8B5CF6]/50"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm group-hover:text-[#8B5CF6] transition-colors">{lead.company}</div>
                      <div className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {lead.location}
                      </div>
                      {lead.industry && (
                        <div className="text-xs text-purple-400 mt-1">{lead.industry}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-white mb-1">
                        {lead.decisionMakerName ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {lead.decisionMakerName} ({lead.decisionMakerTitle || 'CEO'})
                          </span>
                        ) : lead.name}
                      </div>
                      <div className="text-xs text-[#94A3B8]">{lead.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        {lead.ghostingAlert && (
                          <span className="flex items-center gap-1 text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-2 py-1 rounded w-fit">
                            Ghosting Riski
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${(lead.winProbability || lead.score) >= 90 ? 'bg-[#10B981]' : (lead.winProbability || lead.score) >= 80 ? 'bg-[#4F8EF7]' : 'bg-[#F59E0B]'}`} style={{ width: `${lead.winProbability || lead.score}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-white">%{lead.winProbability || lead.score}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
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
