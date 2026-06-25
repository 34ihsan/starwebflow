"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, 
  BrainCircuit, 
  Mail, 
  CheckCircle2, 
  Save,
  Plus,
  Home,
  Briefcase,
  Stethoscope,
  ShoppingCart,
  ChevronRight,
  FolderOpen,
  Paperclip,
  AlertCircle
} from "lucide-react";
import { 
  getCampaigns, 
  generateCustomCampaign,
  updateTemplate
} from "@/app/actions/campaignActions";

// Expanded B2B Sectors Pool
const SECTORS_POOL = [
  { id: "health", name: "Sağlık & Estetik", icon: Stethoscope, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10" },
  { id: "real_estate", name: "Emlak & Gayrimenkul", icon: Home, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10" },
  { id: "logistics", name: "Lojistik & Gümrükleme", icon: Briefcase, color: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10" },
  { id: "ecommerce", name: "E-Ticaret & Perakende", icon: ShoppingCart, color: "from-pink-500 to-rose-600", bg: "bg-pink-500/10" },
  { id: "saas", name: "Yazılım & SaaS", icon: BrainCircuit, color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10" },
  { id: "manufacturing", name: "Üretim & Sanayi", icon: Save, color: "from-slate-500 to-gray-600", bg: "bg-slate-500/10" },
  { id: "CUSTOM", name: "+ Arama / Farklı Sektör", icon: Wand2, color: "from-fuchsia-500 to-pink-600", bg: "bg-fuchsia-500/10" }
];

export default function TemplatesClient() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  
  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("health");
  const [customSector, setCustomSector] = useState("");
  const [customService, setCustomService] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit state
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentBody, setCurrentBody] = useState("");
  const [currentImportance, setCurrentImportance] = useState("NORMAL");
  const [currentHasAttachments, setCurrentHasAttachments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    setIsGenerating(true);
    try {
      if (selectedPoolId === "CUSTOM") {
        if (!customSector || !customService) {
          alert("Lütfen sektör ve hizmet alanlarını doldurun.");
          setIsGenerating(false);
          return;
        }
        await generateCustomCampaign(customSector, customService);
      } else {
        const sectorObj = SECTORS_POOL.find(s => s.id === selectedPoolId);
        await generateCustomCampaign(sectorObj?.name || "B2B", "Genel B2B Çözümleri");
      }
      setIsCreating(false);
      await loadCampaigns();
    } catch (err) {
      console.error(err);
      alert("Kampanya oluşturulurken hata oluştu. GEMINI_API_KEY (veya Google AI anahtarı) tanımlı olmayabilir veya sunucu tarafında bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    if (campaign.templates && campaign.templates.length > 0) {
      setActiveDayIndex(0);
      setCurrentSubject(campaign.templates[0].subject);
      setCurrentBody(campaign.templates[0].htmlBody);
      setCurrentImportance(campaign.templates[0].importance || "NORMAL");
      setCurrentHasAttachments(campaign.templates[0].hasAttachments || false);
    }
  };

  const handleDaySelect = (index: number) => {
    if (!selectedCampaign || !selectedCampaign.templates) return;
    setActiveDayIndex(index);
    setCurrentSubject(selectedCampaign.templates[index].subject);
    setCurrentBody(selectedCampaign.templates[index].htmlBody);
    setCurrentImportance(selectedCampaign.templates[index].importance || "NORMAL");
    setCurrentHasAttachments(selectedCampaign.templates[index].hasAttachments || false);
  };

  const handleSaveTemplate = async () => {
    if (!selectedCampaign || !selectedCampaign.templates) return;
    setIsSaving(true);
    try {
      const tpl = selectedCampaign.templates[activeDayIndex];
      await updateTemplate(tpl.id, currentSubject, currentBody, currentImportance, currentHasAttachments);
      
      // Update local state
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === selectedCampaign.id) {
          const updatedTemplates = [...c.templates];
          updatedTemplates[activeDayIndex] = { 
            ...tpl, 
            subject: currentSubject, 
            htmlBody: currentBody,
            importance: currentImportance,
            hasAttachments: currentHasAttachments
          };
          return { ...c, templates: updatedTemplates };
        }
        return c;
      });
      setCampaigns(updatedCampaigns);
      setSelectedCampaign(updatedCampaigns.find(c => c.id === selectedCampaign.id));
      
      alert("Şablon başarıyla kaydedildi!");
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-400" />
            Dinamik Kampanya ve Şablon Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">Yapay zeka veya hazır havuz ile dönüşüm odaklı Drip serileri oluşturun.</p>
        </div>
        
        {!isCreating && !selectedCampaign && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Yeni Kampanya Oluştur
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Sektör Seçimi veya AI Üretimi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {SECTORS_POOL.map((sector) => {
                const Icon = sector.icon;
                const isActive = selectedPoolId === sector.id;
                
                return (
                  <button
                    key={sector.id}
                    onClick={() => setSelectedPoolId(sector.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left
                      ${isActive 
                        ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                  >
                    <div className={`p-3 rounded-lg ${sector.bg}`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-br ${sector.color} bg-clip-text text-transparent`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{sector.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {sector.id === "CUSTOM" ? "Özel AI Parametreleri Gir" : "Dinamik AI Üretimi"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPoolId === "CUSTOM" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Sektör (Örn: Lojistik Firmaları)</label>
                  <input 
                    type="text" 
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hizmet Türü (Örn: IoT Takip Sistemleri)</label>
                  <input 
                    type="text" 
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <BrainCircuit className="w-4 h-4" />
                  <span>AI sadece anahtar kelimeleri üretecek, Elite kopya mimarisi %100 korunacak. (Düşük token maliyeti)</span>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Kampanya Üretiliyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Kampanyayı Oluştur
                  </>
                )}
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                İptal
              </button>
            </div>
          </motion.div>
        )}

        {!isCreating && !selectedCampaign && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-indigo-500/50 transition-colors cursor-pointer"
                onClick={() => handleSelectCampaign(camp)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-700 rounded-full text-gray-300">
                    {camp.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{camp.name}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Sektör: <span className="text-white">{camp.sector}</span><br/>
                  Hizmet: <span className="text-white">{camp.serviceType}</span>
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400 font-medium">{camp.templates?.length || 0} Şablon</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </motion.div>
            ))}
            {campaigns.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700 rounded-xl">
                <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Henüz hiç kampanya oluşturulmamış.</p>
              </div>
            )}
          </div>
        )}

        {selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-gray-300"
              >
                ← Geri Dön
              </button>
              <h2 className="text-xl font-bold text-white">{selectedCampaign.name}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar: Elite Drip Timeline */}
              <div className="lg:col-span-1 relative">
                <div className="absolute top-4 bottom-4 left-[1.3rem] w-0.5 bg-slate-700/50 z-0 hidden lg:block"></div>
                <div className="space-y-4 relative z-10">
                  {selectedCampaign.templates?.map((tpl: any, idx: number) => {
                    const isActive = activeDayIndex === idx;
                    
                    // Psychological Mapping
                    let stepName = "";
                    if(tpl.stepDay === 1) stepName = "Buz Kırıcı (Link Yasak)";
                    else if(tpl.stepDay === 3) stepName = "Otorite & Vaka";
                    else if(tpl.stepDay === 7) stepName = "FOMO & Aciliyet";
                    else if(tpl.stepDay === 12) stepName = "Değer/Kaynak Sunumu";
                    else if(tpl.stepDay === 18) stepName = "Kesin Ayrılış (Breakup)";
                    else if(tpl.stepDay === 20) stepName = "Otomatik Şablon";
                    else stepName = "Özel Gönderim";

                    return (
                      <button
                        key={tpl.id}
                        onClick={() => handleDaySelect(idx)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left bg-slate-900
                          ${isActive 
                            ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                            : 'border-slate-700/50 hover:border-slate-600'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {tpl.stepDay}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-indigo-400 mb-0.5 font-semibold truncate">
                            {stepName}
                          </div>
                          <div className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {tpl.subject || "Konu Yok"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editor */}
              <div className="lg:col-span-3 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Konu Satırı (Subject)</label>
                    <input
                      type="text"
                      value={currentSubject}
                      onChange={(e) => setCurrentSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">E-posta İçeriği (Body)</label>
                    <textarea
                      value={currentBody}
                      onChange={(e) => setCurrentBody(e.target.value)}
                      rows={15}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3" />
                      Gönderim anında metamorphicRewrite algoritması metni ufak oynamalarla kişiselleştirecektir.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 pt-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-400" />
                        Önem Derecesi (Priority)
                      </label>
                      <select
                        value={currentImportance}
                        onChange={(e) => setCurrentImportance(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        <option value="NORMAL">Normal (Standart)</option>
                        <option value="HIGH">Çok Önemli (High Priority)</option>
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">High Priority işaretli mailler, alıcı kutusunda (!) işaretiyle görünür.</p>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-indigo-400" />
                        Belge/Ek Yönetimi (Attachments)
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">
                        <input
                          type="checkbox"
                          checked={currentHasAttachments}
                          onChange={(e) => setCurrentHasAttachments(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">Bu Şablona Ek Eklenecek mi?</span>
                          <span className="text-[10px] text-gray-500">PDF Raporu, Teklif vb. ekleneceğini belirtir.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-700/50">
                    <button
                      onClick={handleSaveTemplate}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Şablonu Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

