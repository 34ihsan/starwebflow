"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Settings, User, Key, Globe, 
  Bell, Database, Shield, Zap, 
  Save, EyeOff, Eye, Image as ImageIcon,
  Trash2, RefreshCw, AlertTriangle, CheckCircle, Info, History,
  BarChart, Share2, LineChart, 
  MessageCircle, Pin, Download, Lock, FileText, Sparkles
} from "lucide-react";

import { updateTenantSettings } from "@/app/actions/settings";
import { getRetentionStats, runRetentionCleanup, seedRetentionMockData } from "@/app/actions/retention";

export default function SettingsDashboardClient({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState<"general" | "invoice" | "branding" | "marketing" | "api" | "retention" | "notifications" | "integrations" | "security" | "database">("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showIban, setShowIban] = useState(false);
  const [showTaxNo, setShowTaxNo] = useState(false);
  const [settings, setSettings] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  // Retention states
  const [retentionStats, setRetentionStats] = useState<any | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Integrations state
  const [activeIntegrationModal, setActiveIntegrationModal] = useState<any | null>(null);
  const [integrationFormData, setIntegrationFormData] = useState<string>("");

  const preferences = settings?.preferences || {};
  const apiKeys = settings?.apiKeys || {};

  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          preferences: {
            ...preferences,
            branding: {
              ...(preferences.branding || {}),
              logoUrl: reader.result
            }
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          preferences: {
            ...preferences,
            branding: {
              ...(preferences.branding || {}),
              faviconUrl: reader.result
            }
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWebhook = () => {
    const url = prompt("Webhook URL'sini girin:");
    if (url) {
      const name = prompt("Webhook adını girin:", "Yeni Webhook");
      const currentWebhooks = preferences.webhooks || [];
      setSettings({
        ...settings,
        preferences: {
          ...preferences,
          webhooks: [
            ...currentWebhooks,
            { id: Date.now().toString(), name: name || "Webhook", url, active: true }
          ]
        }
      });
    }
  };

  const toggleWebhook = (id: string) => {
    const currentWebhooks = preferences.webhooks || [];
    setSettings({
      ...settings,
      preferences: {
        ...preferences,
        webhooks: currentWebhooks.map((wh: any) => 
          wh.id === id ? { ...wh, active: !wh.active } : wh
        )
      }
    });
  };

  const deleteWebhook = (id: string) => {
    const currentWebhooks = preferences.webhooks || [];
    setSettings({
      ...settings,
      preferences: {
        ...preferences,
        webhooks: currentWebhooks.filter((wh: any) => wh.id !== id)
      }
    });
  };

  const generateNewApiKey = () => {
    if (confirm("Mevcut API anahtarı geçersiz kılınacak ve yeni bir tane oluşturulacak. Emin misiniz?")) {
      const newKey = "sk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSettings({
        ...settings,
        apiKeys: {
          ...apiKeys,
          developer: newKey
        }
      });
    }
  };

  const fetchRetentionStats = async () => {
    setIsLoadingStats(true);
    const res = await getRetentionStats('default-tenant');
    if (res.success && res.data) {
      setRetentionStats(res.data);
    }
    setIsLoadingStats(false);
  };

  useEffect(() => {
    if (activeTab === "retention") {
      fetchRetentionStats();
    }
  }, [activeTab]);

  const handleCleanup = async () => {
    if (!window.confirm("DİKKAT: Yasal saklama süresi dolmuş tüm müşteri verileri, dosyaları ve logları kalıcı olarak silinecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?")) {
      return;
    }
    
    setIsCleaning(true);
    setCleanupMessage(null);
    try {
      const res = await runRetentionCleanup('default-tenant', 'Yönetici Paneli');
      if (res.success && res.log) {
        setCleanupMessage({
          type: 'success',
          text: `Yasal temizlik başarıyla tamamlandı! Toplamda ${
            res.log.deletedCounts.logs + 
            res.log.deletedCounts.leads + 
            res.log.deletedCounts.appointments + 
            res.log.deletedCounts.contracts + 
            res.log.deletedCounts.projects + 
            res.log.deletedCounts.users
          } adet yasal süresi geçmiş kayıt başarıyla imha edildi.`
        });
        // İstatistikleri ve geçmişi güncelle
        fetchRetentionStats();
        
        const updatedHistory = [res.log, ...(settings?.preferences?.cleanupHistory || [])];
        setSettings({
          ...settings,
          preferences: {
            ...settings.preferences,
            cleanupHistory: updatedHistory
          }
        });
      } else {
        setCleanupMessage({
          type: 'error',
          text: res.error || 'Temizlik işlemi başarısız oldu.'
        });
      }
    } catch (err: any) {
      setCleanupMessage({
        type: 'error',
        text: err.message || 'Bir hata oluştu.'
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleSeedMock = async () => {
    setIsSeeding(true);
    setCleanupMessage(null);
    try {
      const res = await seedRetentionMockData('default-tenant');
      if (res.success) {
        setCleanupMessage({
          type: 'success',
          text: 'Test amaçlı geçmiş tarihli (yasal imha süresi geçmiş) mock veriler başarıyla veritabanına eklendi. Şimdi temizliği çalıştırıp test edebilirsiniz!'
        });
        fetchRetentionStats();
      } else {
        setCleanupMessage({
          type: 'error',
          text: res.error || 'Mock veri eklenemedi.'
        });
      }
    } catch (err: any) {
      setCleanupMessage({
        type: 'error',
        text: err.message || 'Mock veri üretilirken hata oluştu.'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">
              Sistem Ayarları
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Uygulama tercihleri, API anahtarları, marka kimliği ve global ayarlar.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => {
              setIsSaving(true);
              await updateTenantSettings('default-tenant', {
                companyName: settings.companyName,
                preferences,
                apiKeys
              });
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-1">
          {[
            { id: "general", label: "Genel Ayarlar", icon: Settings },
            { id: "invoice", label: "Firma & Fatura", icon: FileText },
            { id: "branding", label: "Marka & Görünüm", icon: ImageIcon },
            { id: "marketing", label: "Pazarlama & Sosyal", icon: BarChart },
            { id: "api", label: "API & Webhooks", icon: Key },
            { id: "notifications", label: "Bildirimler", icon: Bell },
            { id: "security", label: "Güvenlik", icon: Shield },
            { id: "retention", label: "Veri Saklama & İmha", icon: Trash2 },
            { id: "integrations", label: "Entegrasyonlar", icon: Zap },
            { id: "database", label: "Veritabanı", icon: Database },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white/[0.05] text-white border border-white/[0.05]"
                  : "text-[#64748B] hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-8 shadow-xl">
            
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-500" />
                      Genel Ayarlar
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Platform temel bilgileri, operasyonel formatlar ve sistem durumu.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sistem Durumu */}
                  <div className="lg:col-span-2 p-5 bg-[#05050A] border border-white/[0.05] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-white/[0.1] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Bakım Modu (Maintenance Mode)</h3>
                        {preferences.general?.maintenanceMode && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20 animate-pulse">AKTİF</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 max-w-lg">
                        Bu özellik açıldığında sistem son kullanıcılara (müşterilerinize) kapatılır ve belirlediğiniz bakım mesajı gösterilir. Sadece yönetici girişi olanlar sistemi görmeye devam eder.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preferences.general?.maintenanceMode ?? false}
                        onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, maintenanceMode: e.target.checked}}})}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                  </div>

                  {preferences.general?.maintenanceMode && (
                    <div className="lg:col-span-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-medium text-[#94A3B8]">Bakım Mesajı</label>
                      <textarea 
                        rows={2}
                        placeholder="Örn: Sistemimizde kısa süreli bir iyileştirme çalışması yapıyoruz. Lütfen daha sonra tekrar deneyiniz."
                        value={preferences.general?.maintenanceMessage || ""} 
                        onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, maintenanceMessage: e.target.value}}})}
                        className="w-full bg-[#05050A] border border-rose-500/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors placeholder:text-white/[0.2]"
                      />
                    </div>
                  )}

                  {/* Site Kimliği ve Resmi Bilgiler */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Info className="w-4 h-4 text-[#94A3B8]" />
                      Site Kimliği ve Resmi Bilgiler
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Platform Adı</label>
                        <input 
                          type="text" 
                          value={settings?.companyName || ""} 
                          onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Şirket Yasal Ünvanı</label>
                        <input 
                          type="text" 
                          placeholder="Örn: StarWebFlow Yazılım A.Ş."
                          value={preferences.general?.legalName || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, legalName: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <p className="text-[10px] text-[#64748B]">Sözleşme ve faturalarda otomatik kullanılır.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Destek & İletişim E-Postası</label>
                        <input 
                          type="email" 
                          value={preferences.general?.supportEmail || "support@starwebflow.com"} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, supportEmail: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Müşteri Hizmetleri Numarası</label>
                        <input 
                          type="tel" 
                          placeholder="+90 (850) 123 45 67"
                          value={preferences.general?.supportPhone || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, supportPhone: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bölgesel Ayarlar */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Globe className="w-4 h-4 text-[#94A3B8]" />
                      Bölgesel Ayarlar ve Formatlar
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Varsayılan Dil</label>
                          <select 
                            value={preferences.language || "tr"}
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, language: e.target.value}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                          >
                            <option value="tr">Türkçe (TR)</option>
                            <option value="en">English (US)</option>
                            <option value="de">Deutsch (DE)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Para Birimi</label>
                          <select 
                            value={preferences.general?.currency || "TRY"}
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, currency: e.target.value}}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                          >
                            <option value="TRY">Türk Lirası (₺)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Saat Dilimi</label>
                        <select 
                          value={preferences.timezone || "Europe/Istanbul"}
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, timezone: e.target.value}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                          <option value="Europe/Istanbul">(GMT+03:00) Istanbul</option>
                          <option value="Europe/Berlin">(GMT+01:00) Berlin</option>
                          <option value="Europe/London">(GMT+00:00) London</option>
                          <option value="America/New_York">(GMT-05:00) New York</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Tarih ve Saat Formatı</label>
                        <select 
                          value={preferences.general?.dateFormat || "DD/MM/YYYY 24H"}
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, dateFormat: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                          <option value="DD/MM/YYYY 24H">GG/AA/YYYY (24 Saat)</option>
                          <option value="MM/DD/YYYY 12H">AA/GG/YYYY (12 Saat / AM-PM)</option>
                          <option value="YYYY-MM-DD">YYYY-AA-GG (ISO 8601)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Çerez Bildirimi (GDPR/KVKK)</h4>
                          <p className="text-[10px] text-[#64748B] mt-0.5">Ziyaretçilere alt kısımda onay barı gösterir.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={preferences.general?.cookieConsent ?? true}
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, general: {...preferences.general, cookieConsent: e.target.checked}}})}
                          />
                          <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "invoice" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Firma ve Fatura Bilgileri
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Resmi fatura detayları, banka hesap bilgileri ve belge şablon ayarları.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fatura ve Vergi Bilgileri */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <FileText className="w-4 h-4 text-[#94A3B8]" />
                      Resmi Vergi & Fatura Bilgileri
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Fatura Yasal Ünvanı</label>
                        <input 
                          type="text" 
                          placeholder="Örn: StarWebFlow Yazılım Teknolojileri A.Ş."
                          value={preferences.billing?.legalName || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, legalName: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Vergi Dairesi</label>
                          <input 
                            type="text" 
                            placeholder="Mecidiyeköy VD"
                            value={preferences.billing?.taxOffice || ""} 
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, taxOffice: e.target.value}}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Vergi Kimlik No / TCKN</label>
                          <div className="relative">
                            <input 
                              type={showTaxNo ? "text" : "password"} 
                              maxLength={30}
                              placeholder="Örn: 41 / 056 / 80705"
                              value={preferences.billing?.taxNumber || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, taxNumber: val}}})
                              }}
                              className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2] pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowTaxNo(!showTaxNo)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                            >
                              {showTaxNo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Tam Fatura Adresi</label>
                        <textarea 
                          rows={3}
                          maxLength={250}
                          placeholder="Faturada görünecek tam yasal adresiniz..."
                          value={preferences.billing?.address || ""} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/[<>]/g, '');
                            setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, address: val}}})
                          }}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banka Hesap Bilgileri */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                      Banka & Ödeme Bilgileri
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Banka Adı</label>
                        <input 
                          type="text" 
                          placeholder="Örn: Garanti BBVA"
                          value={preferences.billing?.bankName || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, bankName: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">IBAN Numarası</label>
                        <div className="relative">
                          <input 
                            type={showIban ? "text" : "password"} 
                            maxLength={34}
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                            value={preferences.billing?.iban || ""} 
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase();
                              setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, iban: val}}})
                            }}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder:font-sans placeholder:text-white/[0.2] pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowIban(!showIban)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                          >
                            {showIban ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Swift / BIC Kodu</label>
                          <input 
                            type="text" 
                            placeholder="TGBATRIS"
                            value={preferences.billing?.swift || ""} 
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, swift: e.target.value}}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Para Birimi</label>
                          <select 
                            value={preferences.billing?.bankCurrency || "TRY"}
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, bankCurrency: e.target.value}}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                          >
                            <option value="TRY">TRY (₺)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fatura Şablonu ve Notlar */}
                  <div className="lg:col-span-2 p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Sparkles className="w-4 h-4 text-[#94A3B8]" />
                      Fatura Şablonu & Alt Bilgi (Footer) Notu
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#94A3B8]">Fatura Numarası Ön Eki (Prefix)</label>
                          <input 
                            type="text" 
                            placeholder="Örn: INV-"
                            value={preferences.billing?.invoicePrefix || "INV-"} 
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, invoicePrefix: e.target.value}}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                          />
                          <p className="text-[10px] text-[#64748B]">Oluşturulacak faturalar INV-0001, INV-0002 şeklinde numaralandırılır.</p>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-medium text-[#94A3B8]">Standart KDV / USt Oranı (%)</label>
                          <select 
                            value={preferences.billing?.vatRate ?? "0"}
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, vatRate: e.target.value}}})}
                            className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                          >
                            <option value="0">%0 (KDV Muaf / Kleinunternehmen)</option>
                            <option value="7">%7</option>
                            <option value="19">%19 (Almanya Standart)</option>
                            <option value="20">%20 (Türkiye Standart)</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-sm font-medium text-white">E-Fatura Mükellefiyim</p>
                            <p className="text-[10px] text-[#64748B] mt-0.5">Otomatik e-fatura numaralandırması için.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={preferences.billing?.isEInvoice ?? false}
                              onChange={(e) => setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, isEInvoice: e.target.checked}}})}
                            />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Standart Fatura Notu (Alt Bilgi)</label>
                        <textarea 
                          rows={4}
                          maxLength={500}
                          placeholder="Lütfen ödemeyi yaparken açıklama kısmına fatura numarasını yazınız. Bizi tercih ettiğiniz için teşekkür ederiz."
                          value={preferences.billing?.invoiceNote || ""} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/[<>]/g, '');
                            setSettings({...settings, preferences: {...preferences, billing: {...preferences.billing, invoiceNote: val}}})
                          }}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2] resize-none"
                        />
                        <p className="text-[10px] text-[#64748B] text-right">Oluşturulan tüm faturaların altında standart olarak gösterilir.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "branding" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-500" />
                      Marka & Görünüm (UI/UX)
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Uygulamanın görsel kimliği, logolar, renk paleti ve tipografi ayarları.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Görseller */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <ImageIcon className="w-4 h-4 text-[#94A3B8]" />
                      Logo ve İkonlar
                    </h3>
                    
                    <div>
                      <label className="text-xs font-medium text-[#94A3B8] block mb-3">Ana Logo</label>
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-xl bg-[#0A0A0F] border border-white/[0.1] flex items-center justify-center overflow-hidden shadow-inner">
                          {preferences.branding?.logoUrl ? (
                            <img src={preferences.branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">SWF</span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleLogoUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                          >
                            Yeni Logo Seç
                          </button>
                          <p className="text-[10px] text-[#64748B]">Maks 2MB (SVG, PNG önerilir).</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.05]">
                      <label className="text-xs font-medium text-[#94A3B8] block mb-3">Tarayıcı İkonu (Favicon)</label>
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-white/[0.1] flex items-center justify-center overflow-hidden">
                           {preferences.branding?.faviconUrl ? (
                             <img src={preferences.branding.faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                           ) : (
                             <img src="/icon.png" alt="Favicon" className="w-full h-full object-contain p-1" />
                           )}
                        </div>
                        <div>
                          <input 
                            type="file" 
                            ref={faviconInputRef} 
                            onChange={handleFaviconUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button 
                            onClick={() => faviconInputRef.current?.click()}
                            className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Favicon Yükle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Renk ve Tipografi */}
                  <div className="space-y-6">
                    <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-6">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></span>
                        Renk Paleti & Tema
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Varsayılan Tema</p>
                          <p className="text-xs text-[#64748B] mt-0.5">Sistem geneli varsayılan mod.</p>
                        </div>
                        <select 
                          value={preferences.branding?.defaultTheme || "dark"}
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, branding: {...preferences.branding, defaultTheme: e.target.value}}})}
                          className="bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="dark">Karanlık Mod (Dark)</option>
                          <option value="light">Aydınlık Mod (Light)</option>
                          <option value="system">Sistem Ayarı</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-medium text-[#94A3B8] block">Kurumsal Renkler</label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <div className="relative group">
                              <input 
                                type="color" 
                                value={preferences.branding?.primaryColor || "#8B5CF6"} 
                                onChange={(e) => setSettings({...settings, preferences: {...preferences, branding: {...preferences.branding, primaryColor: e.target.value}}})}
                                className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] p-1"
                              />
                            </div>
                            <p className="text-[10px] text-center font-mono text-[#94A3B8]">Primary</p>
                          </div>
                          <div className="space-y-1.5">
                            <input 
                              type="color" 
                              value={preferences.branding?.secondaryColor || "#4F8EF7"} 
                              onChange={(e) => setSettings({...settings, preferences: {...preferences, branding: {...preferences.branding, secondaryColor: e.target.value}}})}
                              className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] p-1"
                            />
                            <p className="text-[10px] text-center font-mono text-[#94A3B8]">Secondary</p>
                          </div>
                          <div className="space-y-1.5">
                            <input 
                              type="color" 
                              value={preferences.branding?.successColor || "#10B981"} 
                              onChange={(e) => setSettings({...settings, preferences: {...preferences, branding: {...preferences.branding, successColor: e.target.value}}})}
                              className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] p-1"
                            />
                            <p className="text-[10px] text-center font-mono text-[#94A3B8]">Success</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                        <span className="font-serif italic text-[#94A3B8]">Aa</span>
                        Tipografi (Yazı Tipi)
                      </h3>
                      <div className="space-y-1.5">
                        <select 
                          value={preferences.branding?.fontFamily || "Inter"}
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, branding: {...preferences.branding, fontFamily: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="Inter">Inter (Sistem Varsayılanı)</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Playfair Display">Playfair Display (Serif)</option>
                        </select>
                        <p className="text-[10px] text-[#64748B]">Seçilen font Google Fonts üzerinden otomatik yüklenir.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "marketing" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-blue-500" />
                      Pazarlama & Sosyal Medya
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Analitik kodları, SEO ayarları ve sosyal platform entegrasyonları.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* İzleme ve Analitik */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <LineChart className="w-4 h-4 text-[#94A3B8]" />
                      İzleme ve Analitik (Tracking)
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Google Analytics (G-XXXXX)</label>
                        <input 
                          type="text" 
                          placeholder="G-..."
                          value={preferences.marketing?.googleAnalyticsId || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, marketing: { ...preferences.marketing, googleAnalyticsId: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Meta (Facebook) Pixel ID</label>
                        <input 
                          type="text" 
                          placeholder="1234567890"
                          value={preferences.marketing?.metaPixelId || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, marketing: { ...preferences.marketing, metaPixelId: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Google Tag Manager (GTM-XXXXX)</label>
                        <input 
                          type="text" 
                          placeholder="GTM-..."
                          value={preferences.marketing?.gtmId || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, marketing: { ...preferences.marketing, gtmId: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Ayarları */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Globe className="w-4 h-4 text-[#94A3B8]" />
                      Genel SEO Ayarları
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Varsayılan Meta Başlık (Title)</label>
                        <input 
                          type="text" 
                          placeholder="Site Başlığı | Slogan"
                          value={preferences.marketing?.defaultMetaTitle || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, marketing: { ...preferences.marketing, defaultMetaTitle: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8]">Varsayılan Meta Açıklama (Description)</label>
                        <textarea 
                          rows={3}
                          placeholder="Sitenizi arama motorlarında öne çıkaracak kısa açıklama..."
                          value={preferences.marketing?.defaultMetaDesc || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, marketing: { ...preferences.marketing, defaultMetaDesc: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/[0.2]"
                        />
                        <p className="text-[10px] text-right text-[#64748B]">Maks. 160 karakter önerilir.</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                        <div>
                          <p className="text-sm font-bold text-white">Arama Motoru İndeksleme</p>
                          <p className="text-xs text-[#64748B] mt-0.5">Google gibi botların siteyi taramasına izin ver.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={preferences.marketing?.allowIndexing ?? true}
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, marketing: { ...preferences.marketing, allowIndexing: e.target.checked }}})}
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Sosyal Medya */}
                  <div className="lg:col-span-2 p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Share2 className="w-4 h-4 text-[#94A3B8]" />
                      Sosyal Medya Hesapları
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-2">
                          <Share2 className="w-3 h-3" /> Instagram
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://instagram.com/..."
                          value={preferences.socialMedia?.instagram || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, socialMedia: { ...preferences.socialMedia, instagram: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-2">
                          <Share2 className="w-3 h-3" /> Facebook
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://facebook.com/..."
                          value={preferences.socialMedia?.facebook || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, socialMedia: { ...preferences.socialMedia, facebook: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-2">
                          <Share2 className="w-3 h-3" /> X (Twitter)
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://x.com/..."
                          value={preferences.socialMedia?.twitter || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, socialMedia: { ...preferences.socialMedia, twitter: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-2">
                          <Share2 className="w-3 h-3" /> LinkedIn
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://linkedin.com/in/..."
                          value={preferences.socialMedia?.linkedin || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, socialMedia: { ...preferences.socialMedia, linkedin: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-700 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#94A3B8] flex items-center gap-2">
                          <Share2 className="w-3 h-3" /> YouTube
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://youtube.com/..."
                          value={preferences.socialMedia?.youtube || ""} 
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, socialMedia: { ...preferences.socialMedia, youtube: e.target.value }}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-white/[0.2]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/[0.05] pb-4">API & Webhooks</h2>
                
                <div className="space-y-6">
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h3 className="text-sm font-bold text-blue-400 mb-1">Geliştirici API Anahtarı</h3>
                    <p className="text-xs text-[#94A3B8] mb-4">Bu anahtar tam yetkiye sahiptir. Asla istemci (client) tarafında ifşa etmeyin.</p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type={showApiKey ? "text" : "password"} 
                          value={apiKeys.developer || "sk_live_51Mxyz...93jK"}
                          readOnly
                          className="w-full bg-[#05050A] border border-blue-500/30 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none"
                        />
                        <button 
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button onClick={generateNewApiKey} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors">
                        Yenile
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">Aktif Webhook'lar</h3>
                      <button onClick={handleAddWebhook} className="text-xs font-bold text-blue-400 hover:text-blue-300">+ Yeni Webhook</button>
                    </div>
                    
                    <div className="space-y-2">
                      {(preferences.webhooks || [
                        { id: "1", name: "Stripe Ödeme Başarılı", url: "https://api.starwebflow.com/webhook/stripe", active: true },
                        { id: "2", name: "Yeni Lead Oluştu", url: "https://n8n.starwebflow.com/webhook/lead", active: true }
                      ]).map((wh: any) => (
                        <div key={wh.id} className={`flex items-center justify-between p-4 bg-[#05050A] border border-white/[0.05] rounded-xl group hover:border-white/[0.1] transition-colors ${!wh.active ? 'opacity-60' : ''}`}>
                          <div>
                            <p className="text-sm font-medium text-white mb-0.5">{wh.name}</p>
                            <p className="text-xs text-[#64748B] font-mono">{wh.url}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={() => toggleWebhook(wh.id)} className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${wh.active ? 'bg-[#10B981]' : 'bg-gray-500'}`}></span>
                              <span className={`text-xs font-medium ${wh.active ? 'text-[#10B981]' : 'text-gray-400'}`}>{wh.active ? 'Aktif' : 'Pasif'}</span>
                            </button>
                            <button onClick={() => deleteWebhook(wh.id)} className="text-rose-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "retention" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Veri Saklama & Yasal İmha Yönetimi (DSGVO / KVKK)
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Kişisel verilerin korunması ve ticari saklama yükümlülükleri kontrol paneli.
                    </p>
                  </div>
                  <button 
                    onClick={fetchRetentionStats}
                    disabled={isLoadingStats}
                    className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors border border-white/[0.05]"
                  >
                    <RefreshCw className={`w-4 h-4 text-white ${isLoadingStats ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {cleanupMessage && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                    cleanupMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {cleanupMessage.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold">{cleanupMessage.type === 'success' ? 'Başarılı' : 'Hata'}</p>
                      <p className="mt-1 opacity-90">{cleanupMessage.text}</p>
                    </div>
                  </div>
                )}

                {/* Legal Banner */}
                <div className="bg-[#0D0D15] border border-blue-500/20 rounded-xl p-5 flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Yasal Saklama Prensipleri (Art. 5(1)(e) GDPR & KVKK)</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Müşteri verileri, işleme amaçları bittiğinde silinmeli veya anonimleştirilmelidir. Ancak vergi kanunları (AO § 147, VUK § 253) ve ticaret kanunları (HGB § 257, TTK M. 82) gereğince, faturalar ve imzalı sözleşmeler **10 yıl** boyunca yasal denetim için saklanmak zorundadır. Sistemimiz, bu süreleri otomatik takip ederek süresi dolan kayıtları güvenle imha edecek altyapıya sahiptir.
                    </p>
                  </div>
                </div>

                {/* Stats Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    Veritabanı Saklama ve İmha Durumu
                  </h3>
                  
                  <div className="border border-white/[0.05] rounded-xl overflow-hidden bg-[#05050A]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[#94A3B8] font-bold">
                            <th className="p-4">Veri Sınıfı</th>
                            <th className="p-4">Yasal Saklama Süresi</th>
                            <th className="p-4">Yasal Dayanak</th>
                            <th className="p-4 text-center">Toplam Kayıt</th>
                            <th className="p-4 text-center">İmha Edilecek</th>
                            <th className="p-4 text-right">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-[#E2E8F0]">
                          {isLoadingStats && !retentionStats ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-[#64748B] font-medium">
                                İstatistikler yükleniyor...
                              </td>
                            </tr>
                          ) : !retentionStats ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-[#64748B] font-medium">
                                Veri yüklenemedi. Lütfen yenile butonuna basın.
                              </td>
                            </tr>
                          ) : (
                            [
                              { name: "Sistem ve İşlem Günlükleri", total: retentionStats.automationLogs.total, expired: retentionStats.automationLogs.expired, rule: "180 Gün (6 Ay)", basis: retentionStats.automationLogs.legalBasis },
                              { name: "Aday Müşteri (Lead) Kayıtları", total: retentionStats.leads.total, expired: retentionStats.leads.expired, rule: "1 Yıl", basis: retentionStats.leads.legalBasis },
                              { name: "Randevu ve Görüşme Kayıtları", total: retentionStats.appointments.total, expired: retentionStats.appointments.expired, rule: "1 Yıl", basis: retentionStats.appointments.legalBasis },
                              { name: "Sözleşmeler ve Teklifler", total: retentionStats.contracts.total, expired: retentionStats.contracts.expired, rule: "1 Yıl / 10 Yıl", basis: retentionStats.contracts.legalBasis },
                              { name: "Projeler & Dosyalar & Faturalar", total: retentionStats.projects.total, expired: retentionStats.projects.expired, rule: "10 Yıl", basis: retentionStats.projects.legalBasis },
                              { name: "Pasif / Silinmiş Kullanıcılar", total: retentionStats.users.total, expired: retentionStats.users.expired, rule: "10 Yıl", basis: retentionStats.users.legalBasis },
                            ].map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-semibold text-white">{row.name}</td>
                                <td className="p-4 text-[#94A3B8]">{row.rule}</td>
                                <td className="p-4 text-[#64748B] italic max-w-xs truncate" title={row.basis}>{row.basis}</td>
                                <td className="p-4 text-center font-mono">{row.total}</td>
                                <td className="p-4 text-center font-mono font-bold text-rose-400">
                                  {row.expired}
                                </td>
                                <td className="p-4 text-right">
                                  {row.expired > 0 ? (
                                    <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                                      Temizlik Gerekli
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                      Güncel & Temiz
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Operations Section */}
                <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      Yasal İmha ve Temizlik İşlemleri
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Süresi dolmuş verileri yasalara uygun olarak veritabanından ve ilişkili depolama alanlarından kalıcı olarak kaldırın.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>UYARI:</strong> Bu temizlik işlemi veri imha politikasına göre verileri kalıcı olarak silecektir. İşlem geri alınamaz. Silinen projeler, ilişkili tüm dosyalarını (Assets) ve faturalarını da otomatik olarak silecek şekilde veritabanı bütünlüğünü korur.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleCleanup}
                      disabled={isCleaning || isLoadingStats}
                      className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isCleaning ? "Temizlik Yapılıyor..." : "Yasal Temizliği Çalıştır"}
                    </button>

                    <button
                      onClick={handleSeedMock}
                      disabled={isSeeding || isCleaning}
                      className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 border border-white/[0.05] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                      Test İçin Mock Veri Ekle (Geçmiş Tarihli)
                    </button>
                  </div>
                </div>

                {/* Audit Logs History */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-500" />
                    İmha Denetim Geçmişi (Audit Logs)
                  </h3>

                  <div className="border border-white/[0.05] rounded-xl overflow-hidden bg-[#05050A]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[#94A3B8] font-bold">
                            <th className="p-4">İşlem Kodu</th>
                            <th className="p-4">Çalıştırılma Tarihi</th>
                            <th className="p-4">Çalıştıran</th>
                            <th className="p-4">İmha Edilen Kayıtlar</th>
                            <th className="p-4 text-right">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-[#E2E8F0]">
                          {!(settings?.preferences?.cleanupHistory) || settings.preferences.cleanupHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-[#64748B] font-medium">
                                Kayıtlı imha geçmişi bulunmamaktadır.
                              </td>
                            </tr>
                          ) : (
                            settings.preferences.cleanupHistory.map((log: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-mono font-bold text-blue-400">#{log.id}</td>
                                <td className="p-4 text-[#94A3B8]">
                                  {new Date(log.runAt).toLocaleString('tr-TR')}
                                </td>
                                <td className="p-4 font-semibold">{log.runBy}</td>
                                <td className="p-4 text-[#94A3B8]">
                                  <div className="flex flex-wrap gap-2 text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Günlük: {log.deletedCounts.logs || 0}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Aday: {log.deletedCounts.leads || 0}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Randevu: {log.deletedCounts.appointments || 0}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Sözleşme: {log.deletedCounts.contracts || 0}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Proje: {log.deletedCounts.projects || 0}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Dosya: {log.deletedCounts.assets || 0}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                      Kullanıcı: {log.deletedCounts.users || 0}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                    Başarılı (DSGVO)
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-500" />
                      Bildirimler
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Platform içi ve dışı bildirim kanallarını detaylı yönetin.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Bell className="w-4 h-4 text-[#94A3B8]" />
                      Bildirim Kanalları
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: "emailNotifications", label: "E-Posta Bildirimleri", desc: "Önemli raporlar ve sistem uyarıları e-posta ile gelsin." },
                        { key: "smsNotifications", label: "SMS Bildirimleri", desc: "Kritik güvenlik ve acil durum uyarıları SMS olarak gelsin." },
                        { key: "browserNotifications", label: "Tarayıcı (Push) Bildirimleri", desc: "Masaüstünde anlık etkileşim uyarıları al." }
                      ].map(setting => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-white/[0.05] rounded-xl">
                          <div>
                            <p className="text-sm font-bold text-white">{setting.label}</p>
                            <p className="text-[10px] text-[#64748B] mt-1">{setting.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={preferences.notifications?.[setting.key] ?? false}
                              onChange={(e) => setSettings({
                                ...settings,
                                preferences: {
                                  ...preferences,
                                  notifications: {
                                    ...preferences.notifications,
                                    [setting.key]: e.target.checked
                                  }
                                }
                              })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {preferences.notifications?.smsNotifications && (
                      <div className="pt-4 border-t border-white/[0.05] animate-in fade-in">
                        <label className="text-xs font-medium text-[#94A3B8] block mb-1.5">Acil Durum SMS Numarası</label>
                        <input 
                          type="tel" 
                          placeholder="+90 5XX XXX XX XX"
                          value={preferences.notifications?.adminPhone || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            preferences: {
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                adminPhone: e.target.value
                              }
                            }
                          })}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                      <Settings className="w-4 h-4 text-[#94A3B8]" />
                      Bildirim Türleri
                    </h3>
                    <div className="space-y-4">
                      {[
                        { key: "notifyNewLead", label: "Yeni Aday (Lead) Oluşumu", desc: "Siteye yeni form düştüğünde bildir." },
                        { key: "notifyInvoice", label: "Fatura ve Ödeme", desc: "Ödeme alındığında veya fatura kesildiğinde bildir." },
                        { key: "notifySystemError", label: "Kritik Sistem Hataları", desc: "Sunucu hatası veya entegrasyon kopmalarında bildir." },
                        { key: "notifyDailyReport", label: "Günlük Özet Raporu", desc: "Her gün sabah 08:00'de sistem özetini gönder." }
                      ].map(setting => (
                        <div key={setting.key} className="flex items-center justify-between p-3 border-b border-white/[0.05] last:border-0 pb-3">
                          <div>
                            <p className="text-sm font-medium text-white">{setting.label}</p>
                            <p className="text-[10px] text-[#64748B] mt-0.5">{setting.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={preferences.notifications?.types?.[setting.key] ?? true}
                              onChange={(e) => setSettings({
                                ...settings,
                                preferences: {
                                  ...preferences,
                                  notifications: {
                                    ...preferences.notifications,
                                    types: {
                                      ...(preferences.notifications?.types || {}),
                                      [setting.key]: e.target.checked
                                    }
                                  }
                                }
                              })}
                            />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Entegrasyonlar
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Sistemi favori araçlarınıza bağlayın ve iş akışlarınızı otomatikleştirin.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {[
                    {
                      title: "Dahili (Yerleşik) StarWebFlow Modülleri",
                      items: [
                        { id: "native_crm", name: "Yerleşik CRM", icon: "👥", desc: "Müşteri ve Lead veritabanını sistemde tutar.", placeholder: "Otomatik Aktif", guide: "Bu özellik StarWebFlow içine gömülüdür. Sol menüden 'CRM ve Leadler' sekmesini kullanabilirsiniz." },
                        { id: "native_projects", name: "Yerleşik Görev Panosu", icon: "📋", desc: "Müşteriler için Kanban panosu sunar.", placeholder: "Otomatik Aktif", guide: "Sol menüden 'Projeler' sekmesine giderek Trello/Asana benzeri panolara erişebilirsiniz." },
                        { id: "native_analytics", name: "Yerleşik Analitik", icon: "📈", desc: "Sistem içi site trafiğini takip eder.", placeholder: "Otomatik Aktif", guide: "Sol menüden 'Analitik & Trafik' sekmesinden günlük trafiğinizi izleyebilirsiniz." },
                        { id: "native_email", name: "Yerleşik E-Posta Motoru", icon: "📧", desc: "Sistem içi bülten gönderimi sağlar.", placeholder: "SMTP Ayarları Gerekli", guide: "Bu sayfada 'API & Webhooks' veya 'Genel Ayarlar' altından SMTP sunucu bilgilerinizi girebilirsiniz." }
                      ]
                    },
                    {
                      title: "Zorunlu Harici API Entegrasyonları",
                      items: [
                        { id: "stripe", name: "Stripe", icon: "💳", desc: "Abonelik ve ödemeleri otomatik alır.", placeholder: "Secret Key (sk_live_...)", guide: "Stripe Dashboard > Developers > API Keys bölümünden Secret Key'i alın." },
                        { id: "openai", name: "OpenAI (ChatGPT)", icon: "🤖", desc: "İçerik üretimini ve SEO asistanını besler.", placeholder: "API Key (sk-...)", guide: "OpenAI platformunda API Keys sayfasına gidin, yeni bir anahtar oluşturun ve buraya girin." },
                        { id: "metaads", name: "Meta Pixel & Ads", icon: "📱", desc: "Facebook ve Instagram dönüşümlerini izler.", placeholder: "Pixel ID girin", guide: "Meta Events Manager üzerinden Pixel ID'nizi alın ve buraya yapıştırın." },
                        { id: "zapier", name: "Zapier / Make", icon: "⚡", desc: "Sistem olaylarını Zapier'e aktarır.", placeholder: "Webhook URL'si girin", guide: "Make.com veya Zapier'de bir Webhook tetikleyicisi oluşturup URL'yi buraya yapıştırın." }
                      ]
                    }
                  ].map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-4">
                      <h3 className="text-sm font-bold text-white border-b border-white/[0.05] pb-2">{group.title}</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {group.items.map(integration => {
                          const isConnected = !!preferences.integrations?.[integration.id];
                          return (
                            <div key={integration.id} className="p-5 bg-[#05050A] border border-white/[0.05] rounded-xl flex items-center justify-between group hover:border-white/[0.1] transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center text-xl border border-white/[0.05]">
                                  {integration.icon}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white flex items-center gap-2">
                                    {integration.name}
                                    {isConnected && <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />}
                                  </p>
                                  <p className="text-xs text-[#64748B] mt-0.5">{integration.desc}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (isConnected) {
                                    if (confirm(`${integration.name} bağlantısını kesmek istediğinize emin misiniz?`)) {
                                      const newIntegrations = { ...preferences.integrations };
                                      delete newIntegrations[integration.id];
                                      setSettings({
                                        ...settings,
                                        preferences: { ...preferences, integrations: newIntegrations }
                                      });
                                    }
                                  } else {
                                    setActiveIntegrationModal(integration);
                                    setIntegrationFormData("");
                                  }
                                }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                  isConnected 
                                    ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                }`}
                              >
                                {isConnected ? 'Bağlantıyı Kes' : 'Bağlan'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bağlantı & Rehber Modal (Popup) */}
                {activeIntegrationModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0F] border border-white/[0.1] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                      {/* Modal Header */}
                      <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{activeIntegrationModal.icon}</span>
                          <h3 className="text-lg font-bold text-white">{activeIntegrationModal.name} Kurulumu</h3>
                        </div>
                        <button 
                          onClick={() => setActiveIntegrationModal(null)}
                          className="text-[#94A3B8] hover:text-white transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                      
                      {/* Modal Body */}
                      <div className="p-6 space-y-6">
                        {/* Rehber (Guide) */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4" /> Nasıl Bağlanırım?
                          </h4>
                          <p className="text-sm text-[#94A3B8] leading-relaxed">
                            {activeIntegrationModal.guide}
                          </p>
                        </div>

                        {/* Input Form */}
                        {activeIntegrationModal.isOAuth ? (
                          <div className="text-center py-4">
                            <button 
                              onClick={async () => {
                                // In a real scenario, this would redirect to an OAuth provider
                                // and the callback would store the real token securely.
                                // For now, we simulate a secure token generation via backend.
                                const mockSecureToken = "oauth_" + btoa(Date.now().toString() + Math.random().toString()).substring(0, 32);
                                setSettings({
                                  ...settings,
                                  preferences: {
                                    ...preferences,
                                    integrations: {
                                      ...preferences.integrations,
                                      [activeIntegrationModal.id]: mockSecureToken
                                    }
                                  }
                                });
                                setActiveIntegrationModal(null);
                              }}
                              className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors w-full flex items-center justify-center gap-2"
                            >
                              <Globe className="w-5 h-5" />
                              {activeIntegrationModal.name} ile Giriş Yap (OAuth)
                            </button>
                            <p className="text-xs text-[#64748B] mt-4">Güvenli yetkilendirme penceresi açılacaktır.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-white block">
                              Bağlantı Bilgisi (Key/URL)
                            </label>
                            <input 
                              type="text" 
                              placeholder={activeIntegrationModal.placeholder}
                              value={integrationFormData}
                              onChange={(e) => setIntegrationFormData(e.target.value)}
                              className="w-full bg-[#05050A] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                              autoFocus
                            />
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/[0.05]">
                              <button 
                                onClick={() => setActiveIntegrationModal(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                              >
                                İptal
                              </button>
                              <button 
                                onClick={() => {
                                  if (!integrationFormData.trim()) {
                                    alert("Lütfen bağlantı bilgisini girin.");
                                    return;
                                  }
                                  setSettings({
                                    ...settings,
                                    preferences: {
                                      ...preferences,
                                      integrations: {
                                        ...preferences.integrations,
                                        [activeIntegrationModal.id]: integrationFormData.trim()
                                      }
                                    }
                                  });
                                  setActiveIntegrationModal(null);
                                }}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20"
                              >
                                Kaydet & Bağlan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-500" />
                      Güvenlik & Erişim Kontrolü
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Oturum kuralları, parola zorunlulukları, IP filtreleme ve giriş denetimi.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Temel Güvenlik Önlemleri */}
                    <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                        <Shield className="w-4 h-4 text-[#94A3B8]" />
                        Kimlik Doğrulama Politikaları
                      </h3>
                      {[
                        { key: "twoFactorAuth", label: "İki Faktörlü Doğrulama (2FA)", desc: "Giriş yaparken SMS veya Authenticator kod isteği zorunlu olur." },
                        { key: "requireStrongPasswords", label: "Güçlü Parola Zorunluluğu", desc: "Tüm kullanıcılar için Büyük/Küçük harf, Sayı ve Özel karakter içeren şifre zorunlu olur." },
                        { key: "blockConcurrentSessions", label: "Eşzamanlı Oturumu Engelle", desc: "Aynı hesapla farklı tarayıcılardan giriş yapıldığında eski oturumu kapatır." }
                      ].map(setting => (
                        <div key={setting.key} className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-white/[0.05] rounded-xl">
                          <div>
                            <p className="text-sm font-bold text-white">{setting.label}</p>
                            <p className="text-[10px] text-[#64748B] mt-1">{setting.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={preferences.security?.[setting.key] ?? false}
                              onChange={(e) => setSettings({
                                ...settings,
                                preferences: {
                                  ...preferences,
                                  security: {
                                    ...preferences.security,
                                    [setting.key]: e.target.checked
                                  }
                                }
                              })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-white/[0.05]">
                        <label className="text-xs font-medium text-[#94A3B8] block mb-2">Boşta Kalma (Oturum Zaman Aşımı)</label>
                        <select 
                          value={preferences.security?.sessionTimeout || "30"}
                          onChange={(e) => setSettings({
                            ...settings,
                            preferences: {
                              ...preferences,
                              security: {
                                ...preferences.security,
                                sessionTimeout: e.target.value
                              }
                            }
                          })}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="15">15 Dakika sonra otomatik çıkış yap</option>
                          <option value="30">30 Dakika sonra otomatik çıkış yap</option>
                          <option value="60">1 Saat sonra otomatik çıkış yap</option>
                          <option value="never">Sınırsız (Çıkış yapılana kadar açık kalsın)</option>
                        </select>
                      </div>
                    </div>

                    {/* IP İzin Listesi */}
                    <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3">
                        <Globe className="w-4 h-4 text-[#94A3B8]" />
                        IP İzin Listesi (Whitelist)
                      </h3>
                      <p className="text-xs text-[#94A3B8]">Sadece listelenen IP adreslerinden admin paneline erişime izin verilir. Boş bırakılırsa her yerden erişilebilir.</p>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Örn: 192.168.1.1" 
                          className="flex-1 bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value;
                              if (val && !preferences.security?.ipWhitelist?.includes(val)) {
                                setSettings({
                                  ...settings,
                                  preferences: {
                                    ...preferences,
                                    security: {
                                      ...preferences.security,
                                      ipWhitelist: [...(preferences.security?.ipWhitelist || []), val]
                                    }
                                  }
                                });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input && input.value && !preferences.security?.ipWhitelist?.includes(input.value)) {
                              setSettings({
                                ...settings,
                                preferences: {
                                  ...preferences,
                                  security: {
                                    ...preferences.security,
                                    ipWhitelist: [...(preferences.security?.ipWhitelist || []), input.value]
                                  }
                                }
                              });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold border border-blue-500/20 transition-colors"
                        >
                          Ekle
                        </button>
                      </div>
                      
                      {preferences.security?.ipWhitelist?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                          {preferences.security.ipWhitelist.map((ip: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 bg-[#0A0A0F] border border-white/[0.1] px-3 py-1.5 rounded-lg text-xs font-mono text-white">
                              <Globe className="w-3 h-3 text-[#64748B]" /> {ip}
                              <button 
                                onClick={() => {
                                  setSettings({
                                    ...settings,
                                    preferences: {
                                      ...preferences,
                                      security: {
                                        ...preferences.security,
                                        ipWhitelist: preferences.security.ipWhitelist.filter((_: any, idx: number) => idx !== i)
                                      }
                                    }
                                  })
                                }}
                                className="text-rose-500 hover:text-rose-400 ml-1 transition-colors flex items-center justify-center w-4 h-4 rounded-full bg-rose-500/10"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Son Giriş Logları */}
                  <div className="p-6 bg-[#05050A] border border-white/[0.05] rounded-xl flex flex-col h-full">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.05] pb-3 mb-4">
                      <History className="w-4 h-4 text-[#94A3B8]" />
                      Son Yönetici Girişleri (Audit Log)
                    </h3>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      {[
                        { date: "Bugün 10:45", ip: "85.101.23.45", location: "Istanbul, TR", status: "success", device: "Chrome / Windows" },
                        { date: "Bugün 09:12", ip: "85.101.23.45", location: "Istanbul, TR", status: "success", device: "Chrome / Windows" },
                        { date: "Dün 14:20", ip: "193.14.88.11", location: "Ankara, TR", status: "success", device: "Safari / macOS" },
                        { date: "Dün 09:15", ip: "45.155.12.9", location: "Unknown", status: "failed", device: "Unknown Device" },
                        { date: "18 Haz 11:30", ip: "85.101.23.45", location: "Istanbul, TR", status: "success", device: "Chrome / Windows" },
                        { date: "17 Haz 16:45", ip: "185.22.11.9", location: "Izmir, TR", status: "success", device: "Edge / Windows" },
                        { date: "16 Haz 02:10", ip: "103.45.11.2", location: "Moscow, RU", status: "failed", device: "Unknown Device" }
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#0A0A0F] border border-white/[0.05] rounded-xl hover:border-white/[0.1] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                            <div>
                              <p className="text-xs font-bold text-white">{log.device}</p>
                              <p className="text-[10px] text-[#64748B] mt-0.5">{log.ip} &bull; {log.location}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#94A3B8]">{log.date}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full mt-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Tüm Logları İndir (CSV)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      Veritabanı & Yedekleme Yönetimi
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      PostgreSQL bağlantı durumu, otomatik yedekleme kuralları ve anlık snapshot işlemleri.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Bağlantı Aktif (12ms)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bağlantı Bilgileri */}
                  <div className="p-5 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#94A3B8]" />
                      Bağlantı Bilgileri
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Host</label>
                        <p className="text-sm text-white font-mono mt-0.5">db.starwebflow.internal</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Port</label>
                          <p className="text-sm text-white font-mono mt-0.5">5432</p>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Veritabanı</label>
                          <p className="text-sm text-white font-mono mt-0.5">starwebflow_prod</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Kullanıcı</label>
                        <p className="text-sm text-white font-mono mt-0.5">swf_admin_master</p>
                      </div>
                    </div>
                  </div>

                  {/* Otomatik Yedekleme Ayarları */}
                  <div className="p-5 bg-[#05050A] border border-white/[0.05] rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Save className="w-4 h-4 text-[#94A3B8]" />
                      Otomatik Yedekleme Kuralları
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Günlük Yedekleme</p>
                          <p className="text-xs text-[#64748B]">Her gece 03:00'te tam yedek alınır.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={preferences.database?.dailyBackup ?? true} 
                            onChange={(e) => setSettings({...settings, preferences: {...preferences, database: {...preferences.database, dailyBackup: e.target.checked}}})}
                          />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#94A3B8]">Yedeklerin Saklanma Süresi</label>
                        <select 
                          value={preferences.database?.retentionDays || "30"}
                          onChange={(e) => setSettings({...settings, preferences: {...preferences, database: {...preferences.database, retentionDays: e.target.value}}})}
                          className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="7">7 Gün</option>
                          <option value="15">15 Gün</option>
                          <option value="30">30 Gün</option>
                          <option value="90">90 Gün (Arşiv)</option>
                        </select>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg text-sm font-semibold transition-colors border border-white/[0.05]">
                        <RefreshCw className="w-4 h-4" /> Manuel Yedekleme Başlat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Son Yedeklemeler */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-500" />
                    Son Yedeklemeler (Snapshots)
                  </h3>
                  <div className="border border-white/[0.05] rounded-xl overflow-hidden bg-[#05050A]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[#94A3B8] font-bold">
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Tür</th>
                            <th className="p-4">Boyut</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05] text-[#E2E8F0]">
                          <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">{new Date().toLocaleDateString('tr-TR')} 03:00</td>
                            <td className="p-4"><span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">Otomatik</span></td>
                            <td className="p-4 font-mono text-[#94A3B8]">142.5 MB</td>
                            <td className="p-4"><span className="text-emerald-400 flex items-center gap-1.5 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Başarılı</span></td>
                            <td className="p-4 text-right">
                              <button className="text-blue-400 hover:text-white transition-colors font-medium">İndir</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">{new Date(Date.now() - 86400000).toLocaleDateString('tr-TR')} 03:00</td>
                            <td className="p-4"><span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">Otomatik</span></td>
                            <td className="p-4 font-mono text-[#94A3B8]">140.2 MB</td>
                            <td className="p-4"><span className="text-emerald-400 flex items-center gap-1.5 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Başarılı</span></td>
                            <td className="p-4 text-right">
                              <button className="text-blue-400 hover:text-white transition-colors font-medium">İndir</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">{new Date(Date.now() - 172800000).toLocaleDateString('tr-TR')} 14:30</td>
                            <td className="p-4"><span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">Manuel</span></td>
                            <td className="p-4 font-mono text-[#94A3B8]">138.8 MB</td>
                            <td className="p-4"><span className="text-emerald-400 flex items-center gap-1.5 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Başarılı</span></td>
                            <td className="p-4 text-right">
                              <button className="text-blue-400 hover:text-white transition-colors font-medium">İndir</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
