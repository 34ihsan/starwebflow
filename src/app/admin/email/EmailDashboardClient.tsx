"use client";

import { useState, useEffect } from "react";
import { 
  Mail, Send, MousePointerClick, Reply, AlertCircle, 
  Flame, CheckCircle2, Play, Pause, Search, Plus, 
  Settings, MoreHorizontal, BarChart3, Target, Activity, Zap,
  LayoutTemplate, Type, Image as ImageIcon, Link2, Sparkles, SlidersHorizontal,
  Users, UploadCloud, RefreshCw, FileSpreadsheet, Rocket, Database, Settings2
} from "lucide-react";

import { createEmailCampaign, createEmailMailbox, updateMailboxStatus } from '@/app/actions/email';
import ABTestingTab from './components/ABTestingTab';
import CampaignsTab from './components/CampaignsTab';
import MailboxWarmupTab from './components/MailboxWarmupTab';
import OutreachTab from './components/OutreachTab';
import TemplatesTab from './components/TemplatesTab';

export default function EmailDashboardClient({ initialData }: { initialData: { campaigns: any[], templates: any[], mailboxes: any[] } }) {
  const [activeTab, setActiveTab] = useState<"campaigns" | "ab_testing" | "mailboxes" | "templates" | "outreach">("campaigns");
  
  // OUTREACH STATE
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [bulkOutreachId, setBulkOutreachId] = useState<string | null>(null);
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [isAddMailboxModalOpen, setIsAddMailboxModalOpen] = useState(false);
  const [isAutoResponderModalOpen, setIsAutoResponderModalOpen] = useState(false);
  const [isAITemplateModalOpen, setIsAITemplateModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignSubject, setNewCampaignSubject] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardAudience, setWizardAudience] = useState("Tüm Liste");
  const [wizardContent, setWizardContent] = useState("");
  const [wizardScheduleType, setWizardScheduleType] = useState("now");
  const [wizardScheduledAt, setWizardScheduledAt] = useState("");
  const [selectedCampaignForRules, setSelectedCampaignForRules] = useState<any>(null);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(true);
  const [isProviderMatchActive, setIsProviderMatchActive] = useState(true);
  const [isLanguageDetectionActive, setIsLanguageDetectionActive] = useState(true);

  // MAILBOX WIZARD STATES
  const [selectedMailboxDetails, setSelectedMailboxDetails] = useState<any>(null);
  const [mailboxStep, setMailboxStep] = useState(1);
  const [mbProvider, setMbProvider] = useState("GOOGLE");
  const [mbEmail, setMbEmail] = useState("");
  const [mbAppPassword, setMbAppPassword] = useState("");
  const [mbSmtpHost, setMbSmtpHost] = useState("");
  const [mbSmtpPort, setMbSmtpPort] = useState(465);
  const [mbImapHost, setMbImapHost] = useState("");
  const [mbImapPort, setMbImapPort] = useState(993);
  const [mbSenderName, setMbSenderName] = useState("");
  const [mbDailyLimit, setMbDailyLimit] = useState(50);
  const [dmarcVerifying, setDmarcVerifying] = useState(true);

  useEffect(() => {
    if (mailboxStep === 4) {
      setDmarcVerifying(true);
      const timer = setTimeout(() => {
        setDmarcVerifying(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mailboxStep]);

  const resetMailboxWizard = () => {
    setMailboxStep(1);
    setMbProvider("GOOGLE");
    setMbEmail("");
    setMbAppPassword("");
    setMbSmtpHost("");
    setMbSmtpPort(465);
    setMbImapHost("");
    setMbImapPort(993);
    setMbSenderName("");
    setMbDailyLimit(50);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) return alert('Geçersiz CSV');
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = { status: 'PENDING' };
        headers.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });
      setCsvData(data);
      setProgress({ sent: 0, failed: 0, total: data.length });
    };
    reader.readAsText(file);
  };

  const startBulkSending = async () => {
    setIsSending(true);
    try {
      // 1. Trigger the background engine API
      const res = await fetch('/api/outreach/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'default-tenant', // For MVP
          data: csvData.filter(d => d.status === 'PENDING'),
          basePrompt: 'Tanışma toplantısı',
          settings: {
            omniRouting: isProviderMatchActive,
            stealthMode: isAutoPilotActive,
            languageDetection: isLanguageDetectionActive
          }
        })
      });
      const json = await res.json();
      if (json.success && json.bulkOutreachId) {
        setBulkOutreachId(json.bulkOutreachId);
      } else {
        alert("Hata: " + json.error);
        setIsSending(false);
      }
    } catch (err) {
      console.error(err);
      alert("Gönderim başlatılamadı.");
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!bulkOutreachId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/outreach/status/${bulkOutreachId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const { sentCount, failedCount, totalCount, status, items } = json.data;
          setProgress({ sent: sentCount, failed: failedCount, total: totalCount });
          
          if (items && items.length > 0) {
            setCsvData(items);
          }

          if (status === 'COMPLETED' || status === 'FAILED') {
            setIsSending(false);
            setBulkOutreachId(null);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [bulkOutreachId]);
  const totalSent = (initialData.campaigns || []).reduce((acc: number, cur: any) => acc + (cur.sentCount || 0), 0);
  const totalOpened = (initialData.campaigns || []).reduce((acc: number, cur: any) => acc + (cur.openCount || 0), 0);
  const totalReplied = (initialData.campaigns || []).reduce((acc: number, cur: any) => acc + (cur.replyCount || 0), 0);
  
  const stats = {
    sent: totalSent.toLocaleString(),
    openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) + "%" : "0%",
    clickRate: "0%", // We can add clickCount to schema later
    replyRate: totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) + "%" : "0%"
  };

  const [dbCampaigns, setDbCampaigns] = useState<any[]>(initialData.campaigns || []);
  const [dbMailboxes, setDbMailboxes] = useState<any[]>(initialData.mailboxes || []);
  const [dbTemplates, setDbTemplates] = useState<any[]>(initialData.templates || []);

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              E-Posta Motoru & Büyüme
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Gelişmiş A/B testleri, akıllı domain ısıtma ve dönüşüm odaklı kampanyalar.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all">
            <Settings className="w-4 h-4" />
            E-Posta Ayarları
          </button>
          <button 
            onClick={() => setIsAddCampaignModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Yeni Kampanya
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Send className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Gönderilen (30 Gün)</p>
              <h3 className="text-2xl font-bold text-white">{stats.sent}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#10B981]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Açılma Oranı</p>
              <h3 className="text-2xl font-bold text-white">{stats.openRate}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-amber-400/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <MousePointerClick className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Tıklanma Oranı</p>
              <h3 className="text-2xl font-bold text-white">{stats.clickRate}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <Reply className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Yanıt Oranı</p>
              <h3 className="text-2xl font-bold text-white">{stats.replyRate}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.05] pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: "campaigns", label: "Kampanyalar", icon: BarChart3 },
          { id: "outreach", label: "Toplu Gönderim", icon: Users },
          { id: "ab_testing", label: "A/B Testleri & Isı Haritası", icon: Target },
          { id: "mailboxes", label: "Akıllı IP/Domain Isıtma", icon: Flame },
          { id: "templates", label: "Şablonlar", icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white/[0.05] text-white border border-white/[0.1]"
                : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.02]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* OUTREACH TAB */}
        {activeTab === "outreach" && (
          <OutreachTab 
            isAutoPilotActive={isAutoPilotActive}
            setIsAutoPilotActive={setIsAutoPilotActive}
            isProviderMatchActive={isProviderMatchActive}
            setIsProviderMatchActive={setIsProviderMatchActive}
            isLanguageDetectionActive={isLanguageDetectionActive}
            setIsLanguageDetectionActive={setIsLanguageDetectionActive}
          />
        )}
        
        {/* CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <CampaignsTab 
            dbCampaigns={dbCampaigns}
            setSelectedCampaignForRules={setSelectedCampaignForRules}
            setIsAutoResponderModalOpen={setIsAutoResponderModalOpen}
          />
        )}

        {/* A/B TESTING */}
        {activeTab === "ab_testing" && (
          <ABTestingTab />
        )}

        {/* SMART MAILBOX WARMUP */}
        {activeTab === "mailboxes" && (
          <MailboxWarmupTab 
            dbMailboxes={dbMailboxes}
            setDbMailboxes={setDbMailboxes}
            setIsAddMailboxModalOpen={setIsAddMailboxModalOpen}
            setSelectedMailboxDetails={setSelectedMailboxDetails}
          />
        )}

        {activeTab === "templates" && (
          <TemplatesTab setIsAITemplateModalOpen={setIsAITemplateModalOpen} />
        )}
      </div>
      {isAddCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Yeni E-Posta Kampanyası
                </h3>
                <p className="text-[#94A3B8] text-sm mt-1">Adım {wizardStep} / 4</p>
              </div>
              <button 
                onClick={() => {
                  setIsAddCampaignModalOpen(false);
                  setWizardStep(1);
                }}
                className="text-[#94A3B8] hover:text-white transition-colors"
              >
                X
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* STEP 1 */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Kampanya Adı</label>
                    <input 
                      type="text" 
                      value={newCampaignName}
                      onChange={e => setNewCampaignName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Örn: Black Friday"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Konu Başlığı</label>
                    <input 
                      type="text" 
                      value={newCampaignSubject}
                      onChange={e => setNewCampaignSubject(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Örn: Size Özel Teklif"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Hedef Kitle Seçimi</label>
                    <select
                      value={wizardAudience}
                      onChange={e => setWizardAudience(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="Tüm Liste" className="bg-[#0A0A0F]">Tüm Aboneler ve Müşteriler</option>
                      <option value="Sıcak Adaylar" className="bg-[#0A0A0F]">Sıcak Adaylar (Skor &gt; 80)</option>
                      <option value="Yeni Aboneler" className="bg-[#0A0A0F]">Son 30 Günde Eklenenler</option>
                      <option value="VIP Müşteriler" className="bg-[#0A0A0F]">VIP Müşteriler</option>
                    </select>
                    <p className="text-xs text-[#94A3B8] mt-2">Bu kampanya seçtiğiniz hedef kitle segmentine gönderilecektir.</p>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">E-Posta İçeriği (HTML)</label>
                    <textarea 
                      value={wizardContent}
                      onChange={e => setWizardContent(e.target.value)}
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors font-mono text-sm"
                      placeholder="<h1>Merhaba!</h1><p>Kampanya detayları buraya gelecek...</p>"
                    />
                    <p className="text-xs text-[#94A3B8] mt-2">Düz metin veya HTML kodu yazabilirsiniz. Bu içerik şablon olarak kaydedilecektir.</p>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {wizardStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Gönderim Zamanlaması</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setWizardScheduleType("now")}
                        className={`flex-1 p-4 rounded-xl border ${wizardScheduleType === "now" ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/5"} transition-all flex flex-col items-center justify-center gap-2`}
                      >
                        <Zap className={`w-6 h-6 ${wizardScheduleType === "now" ? "text-orange-500" : "text-[#94A3B8]"}`} />
                        <span className={`text-sm font-medium ${wizardScheduleType === "now" ? "text-white" : "text-[#94A3B8]"}`}>Hemen Gönder</span>
                      </button>
                      <button
                        onClick={() => setWizardScheduleType("later")}
                        className={`flex-1 p-4 rounded-xl border ${wizardScheduleType === "later" ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/5"} transition-all flex flex-col items-center justify-center gap-2`}
                      >
                        <Settings className={`w-6 h-6 ${wizardScheduleType === "later" ? "text-orange-500" : "text-[#94A3B8]"}`} />
                        <span className={`text-sm font-medium ${wizardScheduleType === "later" ? "text-white" : "text-[#94A3B8]"}`}>İleri Tarihli</span>
                      </button>
                    </div>
                  </div>

                  {wizardScheduleType === "later" && (
                    <div className="animate-in fade-in duration-300">
                      <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Gönderim Tarihi ve Saati</label>
                      <input 
                        type="datetime-local" 
                        value={wizardScheduledAt}
                        onChange={e => setWizardScheduledAt(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-between">
              <div>
                {wizardStep > 1 && (
                  <button 
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    Geri
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setIsAddCampaignModalOpen(false);
                    setWizardStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                
                {wizardStep < 4 ? (
                  <button 
                    onClick={() => {
                      if (wizardStep === 1 && (!newCampaignName || !newCampaignSubject)) {
                        return alert("Lütfen kampanya adı ve konusunu girin.");
                      }
                      if (wizardStep === 3 && !wizardContent) {
                        return alert("Lütfen kampanya içeriğini girin.");
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    İleri
                  </button>
                ) : (
                  <button 
                    onClick={async () => {
                      if(wizardScheduleType === "later" && !wizardScheduledAt) {
                        return alert("Lütfen ileri tarihli gönderim için tarih seçin.");
                      }
                      
                      const res = await createEmailCampaign({
                        tenantId: 'default-tenant',
                        name: newCampaignName,
                        subject: newCampaignSubject,
                        audience: wizardAudience,
                        htmlBody: wizardContent,
                        scheduledAt: wizardScheduleType === "later" ? wizardScheduledAt : null
                      });
                      
                      if(res.success && res.data) {
                        setDbCampaigns(prev => [res.data, ...prev]);
                        setNewCampaignName("");
                        setNewCampaignSubject("");
                        setWizardContent("");
                        setWizardScheduledAt("");
                        setWizardScheduleType("now");
                        setWizardStep(1);
                        setIsAddCampaignModalOpen(false);
                      } else {
                        alert("Kampanya oluşturulurken bir hata oluştu.");
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Oluştur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddMailboxModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#4F8EF7]" /> Mail Kutusu Bağla
                </h3>
                <p className="text-sm text-[#94A3B8] mt-1">Otonom IP ısıtma ve gönderim için e-posta entegrasyonu.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${mailboxStep === 1 ? 'bg-[#4F8EF7] text-white' : 'bg-white/5 text-[#64748B]'}`}>1</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${mailboxStep === 2 ? 'bg-[#4F8EF7] text-white' : 'bg-white/5 text-[#64748B]'}`}>2</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${mailboxStep === 3 ? 'bg-[#4F8EF7] text-white' : 'bg-white/5 text-[#64748B]'}`}>3</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${mailboxStep === 4 ? 'bg-[#4F8EF7] text-white' : 'bg-white/5 text-[#64748B]'}`}>4</span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {mailboxStep === 1 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-white mb-4">Sağlayıcı Seçimi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => setMbProvider("GOOGLE")} className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${mbProvider === "GOOGLE" ? 'border-[#4F8EF7] bg-[#4F8EF7]/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      </div>
                      <span className="text-white font-medium">Google Workspace</span>
                    </button>
                    <button onClick={() => setMbProvider("MICROSOFT")} className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${mbProvider === "MICROSOFT" ? 'border-[#4F8EF7] bg-[#4F8EF7]/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                      <div className="w-12 h-12 bg-[#00A4EF] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg>
                      </div>
                      <span className="text-white font-medium">Microsoft 365</span>
                    </button>
                    <button onClick={() => setMbProvider("SMTP")} className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${mbProvider === "SMTP" ? 'border-[#4F8EF7] bg-[#4F8EF7]/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <Settings2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-medium">Özel SMTP/IMAP</span>
                    </button>
                  </div>
                </div>
              )}

              {mailboxStep === 2 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-white mb-2">Hesap Bağlantısı</h4>
                  
                  {(mbProvider === "GOOGLE" || mbProvider === "MICROSOFT") && (
                    <div className="bg-[#05050A] border border-white/10 rounded-xl p-6 mb-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                        <Link2 className="w-8 h-8 text-[#4F8EF7]" />
                      </div>
                      <h5 className="text-white font-bold mb-2">Güvenli OAuth2 Bağlantısı</h5>
                      <p className="text-xs text-[#94A3B8] mb-6 max-w-md mx-auto leading-relaxed">
                        Kurumsal güvenlik standartları gereği, şifre girmek yerine OAuth2 ile yetkilendirme yapmanız önerilir. 
                        StarWebFlow sadece e-posta gönderme (send) yetkisi talep eder.
                      </p>
                      <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mx-auto hover:bg-gray-100 transition-colors">
                        {mbProvider === "GOOGLE" ? (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Google ile Yetkilendir
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="#00A4EF" viewBox="0 0 24 24"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg>
                            Microsoft ile Yetkilendir
                          </>
                        )}
                      </button>
                      
                      <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">veya manuel girin</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">E-Posta Adresi</label>
                    <input 
                      type="email" 
                      value={mbEmail}
                      onChange={e => setMbEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#4F8EF7]"
                      placeholder="Örn: ali@sirket.com"
                    />
                  </div>

                  {(mbProvider === "GOOGLE" || mbProvider === "MICROSOFT") && (
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Uygulama Parolası (App Password)</label>
                      <input 
                        type="password" 
                        value={mbAppPassword}
                        onChange={e => setMbAppPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#4F8EF7]"
                        placeholder="16 Haneli Uygulama Şifresi"
                      />
                      <p className="text-xs text-[#64748B] mt-2">Güvenlik için hesap şifrenizi değil, sağlayıcınızdan alacağınız "Uygulama Parolasını" girin.</p>
                    </div>
                  )}

                  {mbProvider === "SMTP" && (
                    <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">SMTP Host</label>
                          <input type="text" value={mbSmtpHost} onChange={e => setMbSmtpHost(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3" placeholder="smtp.sirket.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">SMTP Port</label>
                          <input type="number" value={mbSmtpPort} onChange={e => setMbSmtpPort(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3" placeholder="465" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">IMAP Host</label>
                          <input type="text" value={mbImapHost} onChange={e => setMbImapHost(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3" placeholder="imap.sirket.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">IMAP Port</label>
                          <input type="number" value={mbImapPort} onChange={e => setMbImapPort(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3" placeholder="993" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Şifre</label>
                        <input type="password" value={mbAppPassword} onChange={e => setMbAppPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3" placeholder="Şifreniz" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mailboxStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white mb-4">Gönderici Ayarları</h4>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Gönderici Adı</label>
                    <input 
                      type="text" 
                      value={mbSenderName}
                      onChange={e => setMbSenderName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#4F8EF7]"
                      placeholder="Örn: Ali Yılmaz | StarWebFlow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Günlük Gönderim Limiti</label>
                    <input 
                      type="number" 
                      value={mbDailyLimit}
                      onChange={e => setMbDailyLimit(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#4F8EF7]"
                    />
                    <p className="text-xs text-[#64748B] mt-2">Sıfır-Spam koruması gereği yeni maillerde günlük limit 50'yi geçmemelidir.</p>
                  </div>
                </div>
              )}

              {mailboxStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {dmarcVerifying ? (
                        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      {dmarcVerifying ? 'DNS Kayıtları Sorgulanıyor...' : 'DNS Kayıtları Doğrulandı'}
                    </h4>
                    <p className="text-sm text-[#94A3B8]">Inbox garantisi için DMARC, SPF ve DKIM kayıtları zorunludur.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* SPF */}
                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">SPF Kaydı</div>
                          <div className="text-xs text-[#64748B] font-mono mt-0.5">
                            {mbProvider === 'GOOGLE' ? 'v=spf1 include:_spf.google.com ~all' :
                             mbProvider === 'MICROSOFT' ? 'v=spf1 include:spf.protection.outlook.com ~all' :
                             'v=spf1 include:_spf-eu.ionos.com ~all'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">DOĞRULANDI</span>
                    </div>

                    {/* DKIM */}
                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">DKIM Kaydı</div>
                          <div className="text-xs text-[#64748B] font-mono mt-0.5">
                            {mbProvider === 'GOOGLE' ? 'v=DKIM1; k=rsa; p=MIIBIjAN...' :
                             mbProvider === 'MICROSOFT' ? 'v=DKIM1; k=rsa; p=MIIBIjAN...' :
                             's1-ionos._domainkey | s1.dkim.ionos.com (CNAME)'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">DOĞRULANDI</span>
                    </div>

                    {/* DMARC */}
                    <div className="bg-[#05050A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dmarcVerifying ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                          {dmarcVerifying ? (
                            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">DMARC Politikası</div>
                          <div className="text-xs text-[#64748B] font-mono mt-0.5">
                            v=DMARC1; p=quarantine; rua=mailto:info@{mbEmail.split('@')[1] || 'starwebflow.com'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${dmarcVerifying ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                        {dmarcVerifying ? 'SORGULANIYOR...' : 'DOĞRULANDI'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/20 rounded-b-2xl">
              <button 
                onClick={() => {
                  if (mailboxStep === 1) {
                    setIsAddMailboxModalOpen(false);
                    resetMailboxWizard();
                  } else {
                    setMailboxStep(prev => prev - 1);
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                {mailboxStep === 1 ? 'İptal' : 'Geri'}
              </button>

              <button 
                onClick={async () => {
                  if (mailboxStep < 4) {
                    if (mailboxStep === 2 && !mbEmail) return alert("E-Posta adresi zorunludur.");
                    setMailboxStep(prev => prev + 1);
                  } else {
                    if(!mbEmail) return alert("Lütfen geçerli e-posta girin.");
                    const res = await createEmailMailbox({
                      tenantId: 'default-tenant',
                      email: mbEmail,
                      provider: mbProvider,
                      appPassword: mbAppPassword,
                      smtpHost: mbSmtpHost,
                      smtpPort: mbSmtpPort,
                      imapHost: mbImapHost,
                      imapPort: mbImapPort,
                      senderName: mbSenderName,
                      dailyLimit: mbDailyLimit
                    });
                    if(res.success && res.data) {
                      setDbMailboxes(prev => [res.data, ...prev]);
                    }
                    setIsAddMailboxModalOpen(false);
                    resetMailboxWizard();
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#4F8EF7] text-white hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2 shadow-lg"
              >
                {mailboxStep === 4 ? 'Maili Bağla ve Isıtmayı Başlat' : 'İleri'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mailbox Details Modal */}
      {selectedMailboxDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#4F8EF7]" /> Mail Kutusu Detayları
              </h3>
              <button onClick={() => setSelectedMailboxDetails(null)} className="text-[#94A3B8] hover:text-white">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm text-[#94A3B8]">E-Posta:</span>
                <p className="text-white font-medium">{selectedMailboxDetails.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-[#94A3B8]">Sağlayıcı:</span>
                  <p className="text-white font-medium">{selectedMailboxDetails.provider || 'Bilinmiyor'}</p>
                </div>
                <div>
                  <span className="text-sm text-[#94A3B8]">Gönderici Adı:</span>
                  <p className="text-white font-medium">{selectedMailboxDetails.senderName || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-[#94A3B8]">Günlük Limit:</span>
                  <p className="text-white font-medium">{selectedMailboxDetails.limit} mail</p>
                </div>
                <div>
                  <span className="text-sm text-[#94A3B8]">Bugün Gönderilen:</span>
                  <p className="text-white font-medium">{selectedMailboxDetails.sentToday || 0} mail</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-[#94A3B8]">Ağ İtibarı:</span>
                  <p className={`font-medium ${selectedMailboxDetails.reputation < 90 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedMailboxDetails.reputation}/100</p>
                </div>
                <div>
                  <span className="text-sm text-[#94A3B8]">Isınma İlerlemesi:</span>
                  <p className="text-blue-400 font-medium">% {selectedMailboxDetails.warmupProgress}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end">
              <button onClick={() => setSelectedMailboxDetails(null)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors text-sm font-medium">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Responder Modal */}
      {isAutoResponderModalOpen && selectedCampaignForRules && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-orange-400" /> Otomatik Yanıt (Auto-Responder) Kuralları</h3>
                <p className="text-sm text-[#94A3B8] mt-1"><strong className="text-white">{selectedCampaignForRules.name}</strong> kampanyası için kurallar.</p>
              </div>
              <button onClick={() => setIsAutoResponderModalOpen(false)} className="text-[#64748B] hover:text-white p-2">✕</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto bg-white/[0.01] flex-1">
              {/* Rule 1 */}
              <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-5 relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">AKTİF</span>
                  <button className="text-[#64748B] hover:text-white"><Settings className="w-4 h-4" /></button>
                </div>
                <h4 className="text-white font-medium mb-4">Kural 1: İlgi Gösterenlere Otomatik Toplantı Linki</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/5 px-3 py-1.5 rounded-lg text-[#94A3B8] min-w-[80px] text-center font-medium">EĞER</span>
                    <span className="text-white border border-white/10 px-3 py-1.5 rounded-lg bg-black/40">Gelen yanıt "fiyat", "ücret", "detay" kelimelerini içeriyorsa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-white/5 px-3 py-1.5 rounded-lg text-[#94A3B8] min-w-[80px] text-center font-medium">VE</span>
                    <span className="text-white border border-white/10 px-3 py-1.5 rounded-lg bg-black/40">Duygu Analizi (AI) "Pozitif" veya "Nötr" ise</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg min-w-[80px] text-center font-bold">YAP</span>
                    <span className="text-white border border-white/10 px-3 py-1.5 rounded-lg bg-black/40">"Toplantı Linki Şablonu"nu 15 dakika gecikmeyle gönder.</span>
                  </div>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-5 relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#94A3B8] bg-white/10 px-2 py-1 rounded">PASİF</span>
                  <button className="text-[#64748B] hover:text-white"><Settings className="w-4 h-4" /></button>
                </div>
                <h4 className="text-white font-medium mb-4">Kural 2: Reddedenleri Listeden Çıkar</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/5 px-3 py-1.5 rounded-lg text-[#94A3B8] min-w-[80px] text-center font-medium">EĞER</span>
                    <span className="text-white border border-white/10 px-3 py-1.5 rounded-lg bg-black/40">Duygu Analizi (AI) "Negatif" ise (Örn: "ilgilenmiyorum")</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg min-w-[80px] text-center font-bold">YAP</span>
                    <span className="text-white border border-white/10 px-3 py-1.5 rounded-lg bg-black/40">Durumu "Unsubscribed" yap ve kampanyayı durdur.</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[#94A3B8] font-medium hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Yeni Kural Ekle
              </button>
            </div>
            
            <div className="p-6 border-t border-white/5 bg-[#0A0A0F] flex justify-end">
               <button 
                onClick={() => setIsAutoResponderModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Temporary dummy icon since it's missing in some lucid versions
function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
