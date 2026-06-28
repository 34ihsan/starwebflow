"use client";

import { useState } from "react";
import { 
  Zap, Play, Pause, Plus, Settings, 
  ArrowRight, Mail, Database, MessageCircle,
  MessageSquare, UserPlus, FileText, CheckCircle2,
  AlertTriangle, GitBranch, Link, Globe,
  Activity, ArrowDownRight, ArrowUpRight, Copy, Terminal, Eye, Pencil, Trash2, Info, Sparkles
} from "lucide-react";

import { createAutomationFlow, updateAutomationFlow, deleteAutomationFlow, generateFlowFromPrompt } from "@/app/actions/automation";
import ReactFlowBuilder from "./ReactFlowBuilder";

const appConfigs: Record<string, { label: string, color: string, bg: string, icon: any, defaultLabel: string }> = {
  "Email": { label: "E-postası Gönder", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: Mail, defaultLabel: "Teşekkür E-postası" },
  "Slack": { label: "Slack Kanalına Bildir", color: "text-[#E01E5A]", bg: "bg-[#E01E5A]/10", icon: MessageCircle, defaultLabel: "Slack Mesajı" },
  "CRM": { label: "CRM Projesi Başlat", color: "text-[#4F8EF7]", bg: "bg-[#4F8EF7]/10", icon: Database, defaultLabel: "CRM Proje Başlat" },
  "WhatsApp": { label: "WhatsApp Mesajı", color: "text-[#25D366]", bg: "bg-[#25D366]/10", icon: MessageSquare, defaultLabel: "WhatsApp Bildirimi" },
  "Star AI": { label: "AI Şirket Analizi", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: Activity, defaultLabel: "Lead Araştır & Skorla" },
  "Webhook": { label: "Webhook Dinleyici", color: "text-[#4F8EF7]", bg: "bg-[#4F8EF7]/10", icon: Globe, defaultLabel: "Gelen Webhook Tetikleyici" },
  "Cron": { label: "Zamanlanmış Günlük", color: "text-amber-400", bg: "bg-amber-400/10", icon: Zap, defaultLabel: "Zamanlayıcı Tetikleyici" },
  "Typeform": { label: "Yeni Form Yanıtı", color: "text-white", bg: "bg-black", icon: FileText, defaultLabel: "Form Yanıtı Tetikleyici" },
  "Delay": { label: "Bekleme Süresi (Delay)", color: "text-amber-400", bg: "bg-amber-400/10", icon: Zap, defaultLabel: "Bekleme Süresi (24 Saat)" },
  "Custom": { label: "Özel Aksiyon", color: "text-slate-400", bg: "bg-slate-400/10", icon: Zap, defaultLabel: "Özel İşlem Düğümü" }
};

const resolveNodeIcon = (node: any) => {
  if (!node) return Zap;
  const app = (node.app || "").toLowerCase();
  if (app.includes("email") || app.includes("posta")) return Mail;
  if (app.includes("slack")) return MessageCircle;
  if (app.includes("whatsapp") || app.includes("sms") || app.includes("wa")) return MessageSquare;
  if (app.includes("database") || app.includes("db") || app.includes("crm")) return Database;
  if (app.includes("webhook")) return Globe;
  if (app.includes("cron")) return Zap;
  if (app.includes("typeform") || app.includes("form")) return FileText;
  if (app.includes("ai") || app.includes("star ai")) return Activity;
  if (app.includes("delay")) return Zap;
  if (node.type === "condition") return GitBranch;
  if (node.icon && typeof node.icon !== "string") return node.icon;
  return Zap;
};

const resolveNodeColor = (node: any) => {
  if (!node) return "text-[#4F8EF7]";
  const app = (node.app || "").toLowerCase();
  if (app.includes("email") || app.includes("posta")) return "text-[#10B981]";
  if (app.includes("slack")) return "text-[#E01E5A]";
  if (app.includes("whatsapp") || app.includes("sms") || app.includes("wa")) return "text-[#25D366]";
  if (app.includes("database") || app.includes("db") || app.includes("crm")) return "text-[#4F8EF7]";
  if (app.includes("webhook")) return "text-[#4F8EF7]";
  if (app.includes("cron")) return "text-amber-400";
  if (app.includes("typeform") || app.includes("form")) return "text-white";
  if (app.includes("ai") || app.includes("star ai")) return "text-[#8B5CF6]";
  if (app.includes("delay")) return "text-amber-400";
  if (node.type === "condition") return "text-amber-400";
  return node.color || "text-[#4F8EF7]";
};

const resolveNodeBg = (node: any) => {
  if (!node) return "bg-[#4F8EF7]/10";
  const app = (node.app || "").toLowerCase();
  if (app.includes("email") || app.includes("posta")) return "bg-[#10B981]/10";
  if (app.includes("slack")) return "bg-[#E01E5A]/10";
  if (app.includes("whatsapp") || app.includes("sms") || app.includes("wa")) return "bg-[#25D366]/10";
  if (app.includes("database") || app.includes("db") || app.includes("crm")) return "bg-[#4F8EF7]/10";
  if (app.includes("webhook")) return "bg-[#4F8EF7]/10";
  if (app.includes("cron")) return "bg-amber-400/10";
  if (app.includes("typeform") || app.includes("form")) return "bg-black";
  if (app.includes("ai") || app.includes("star ai")) return "bg-[#8B5CF6]/10";
  if (app.includes("delay")) return "bg-amber-400/10";
  if (node.type === "condition") return "bg-amber-400/10";
  return node.bg || "bg-[#4F8EF7]/10";
};

const resolveNodeSummary = (node: any) => {
  if (!node) return "";
  const config = node.config || {};
  const appName = (node.app || node.label || "").toLowerCase();

  // If a custom description is explicitly provided
  if (config.description) return config.description;

  if (appName.includes("email") || appName.includes("posta")) {
    return config.subject ? `E-posta: "${config.subject}"` : "Kullanıcıya bildirim e-postası gönderilir.";
  }
  if (appName.includes("slack")) {
    return config.channel ? `Slack: ${config.channel}` : "Slack kanalına bildirim iletilir.";
  }
  if (appName.includes("whatsapp")) {
    return "Müşteriye WhatsApp şablon mesajı gönderilir.";
  }
  if (appName.includes("crm") || appName.includes("database")) {
    const actionMap: Record<string, string> = {
      create_project: "Proje Oluştur",
      create_task: "Görev Oluştur",
      update_lead: "Lead Güncelle",
      create_contract: "Sözleşme Hazırla"
    };
    return `CRM: ${actionMap[config.action] || "Veritabanı kaydı güncellenir."}`;
  }
  if (appName.includes("ai")) {
    return config.prompt ? `AI: "${config.prompt.substring(0, 20)}..."` : "Yapay Zeka işlemi gerçekleştirir.";
  }
  if (appName.includes("delay")) {
    return config.hours ? `Bekleme: ${config.hours} Saat` : "24 Saat bekleme uygulanır.";
  }
  if (appName.includes("webhook")) {
    return "Harici API tetikleyicisi dinlenir.";
  }
  if (appName.includes("cron")) {
    return "Zamanlanmış periyodik tetikleyici.";
  }
  if (appName.includes("typeform")) {
    return "Yeni bir form yanıtı tetikleyici.";
  }

  return "Otomasyon sistemi özel akış adımı.";
};

export default function AutomationsDashboardClient({ initialData }: { initialData: { flows: any[], webhooks: any[], logs: any[] } }) {
  const [activeTab, setActiveTab] = useState<"flows" | "templates" | "webhooks" | "logs" | "approvals">("flows");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedPreviewNode, setSelectedPreviewNode] = useState<any>(null);
  const [activeIntegrationGuide, setActiveIntegrationGuide] = useState<any>(null);
  const [connectedCredentials, setConnectedCredentials] = useState<Record<string, string>>({
    slack: "xoxb-9872138210382-9832103821-active",
    whatsapp: "EAAG2038210382103-active",
    openai: "sk-proj-starwebflow-ai-active",
  });
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});

  // AI Conversational Edit and Simulation states
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [isEditingWithAI, setIsEditingWithAI] = useState(false);
  const [aiEditSuccessMessage, setAiEditSuccessMessage] = useState<string | null>(null);
  const [isTestingFlow, setIsTestingFlow] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTestingRunning, setIsTestingRunning] = useState(false);

  // MOCK DATA
  const defaultTemplates = [
    {
      id: "template-welcome-series",
      name: "Hoşgeldiniz (Welcome) Serisi",
      description: "Yeni bir form dolduğunda müşteriye otomatik marka tanıtımı yapar, değer katan 3 adımlı sıcak karşılama akışını başlatır.",
      trigger: "form.submitted",
      category: "Pazarlama",
      nodes: [
        { id: "1", type: "trigger", app: "Typeform", label: "Yeni Yanıt", icon: "FileText", color: "text-white", bg: "bg-black", config: { description: "Potansiyel Müşteri İletişim Formu Doldurulduğunda tetiklenir." } },
        { 
          id: "2", 
          type: "action", 
          app: "Email", 
          label: "Mail 1 (Marka Tanıtımı)", 
          icon: "Mail", 
          color: "text-[#10B981]", 
          bg: "bg-[#10B981]/10",
          config: {
            subject: "StarWebflow Ajansı'na Hoş Geldiniz! 🚀",
            description: "Ajansımızın vizyonunu, referanslarını ve çalışma metodolojisini anlatan ilk marka tanıtım e-postasıdır.",
            email_body: "Merhaba {{clientName}},\n\nStarWebflow ekibine gösterdiğiniz ilgi için teşekkür ederiz! Biz, markaların dijital dönüşüm süreçlerini A-Z'ye tasarlayan ve yöneten yeni nesil bir dijital ajansız.\n\nNeler Yapıyoruz?\n- Modern & Dönüşüm Odaklı Web Tasarım\n- Yapay Zeka Tabanlı İş Akışı Otomasyonları\n- Kurumsal Kimlik & Marka Stratejisi\n\nEkibimiz talebinizi incelemeye başladı. Çok yakında sizinle iletişime geçeceğiz.\n\nSevgiler,\nStarWebflow Ekibi\nwww.starwebflow.com"
          }
        },
        { id: "3", type: "action", app: "Delay", label: "3 Gün Bekle", icon: "Zap", color: "text-amber-400", bg: "bg-amber-400/10", config: { hours: 72, description: "İlk tanıtım mailinin ardından 3 gün (72 saat) bekleme uygulanır." } },
        { 
          id: "4", 
          type: "action", 
          app: "Email", 
          label: "Mail 2 (Değer Önerisi)", 
          icon: "Mail", 
          color: "text-[#10B981]", 
          bg: "bg-[#10B981]/10",
          config: {
            subject: "İşletmenizi Otomasyonlarla Nasıl Büyütebiliriz?",
            description: "Müşteriye yapay zeka entegrasyonlarının sağlayacağı somut değerleri ve verimlilik artışını gösteren e-postadır.",
            email_body: "Merhaba Yaratıcı Girişimci,\n\nDaha önce web tasarımı ve otomasyon hizmetlerimizden bahsetmiştik. Peki, günde 3 saatlik iş yükünü otonom hale getirmek işletmenize ne kazandırır?\n\n- %80 Daha Hızlı Yanıt Süresi (AI Chatbots)\n- Sıfır Hata Payı ile Fatura & CRM Senkronizasyonu\n- Reklam bütçelerinde optimizasyon\n\nSize özel hazırladığımız başarı hikayelerini (Case Studies) incelemek için web sitemizi ziyaret edebilirsiniz.\n\nSaygılarımızla,\nStarWebflow"
          }
        },
      ]
    },
    {
      id: "template-retargeting-series",
      name: "Yeniden Hedefleme (Retargeting) Serisi",
      description: "Maili açıp yanıt vermeyen müşterilere özel indirim ve fırsat hatırlatan dinamik akış.",
      trigger: "email.opened",
      category: "Satış",
      nodes: [
        { id: "1", type: "trigger", app: "Webhook", label: "Email Açıldı (Webhook)", icon: "Globe", color: "text-[#4F8EF7]", bg: "bg-[#4F8EF7]/10" },
        { id: "2", type: "condition", app: "If/Else", label: "Yanıt Geldi mi?", icon: "GitBranch", color: "text-amber-400", bg: "bg-amber-400/10", branches: [{ path: "Hayır" }] },
        { id: "3", type: "action", app: "Delay", label: "24 Saat Bekle", icon: "Zap", color: "text-amber-400", bg: "bg-amber-400/10" },
        { id: "4", type: "action", app: "Email", label: "Özel Fırsat Hatırlatması", icon: "Mail", color: "text-[#10B981]", bg: "bg-[#10B981]/10" }
      ]
    },
    {
      id: "template-ai-auto-responder",
      name: "Yapay Zeka Otonom Yanıtlayıcı",
      description: "Gelen mailleri analiz edip teknik destek, fiyat veya satış olmak üzere farklı tonda anında yanıt verir.",
      trigger: "email.received",
      category: "Müşteri Hizmetleri",
      nodes: [
        { id: "1", type: "trigger", app: "Email", label: "Yeni Gelen E-Posta", icon: "Mail", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
        { id: "2", type: "action", app: "Star AI", label: "Mail İçeriğini Analiz Et", icon: "Activity", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
        { id: "3", type: "condition", app: "If/Else", label: "Destek mi Satış mı?", icon: "GitBranch", color: "text-amber-400", bg: "bg-amber-400/10", branches: [
          { path: "Teknik Destek", nodes: [{ id: "3a", type: "action", app: "Email", label: "Otomatik Destek Yanıtı", icon: "Mail" }] },
          { path: "Satış/Fiyat", nodes: [{ id: "3b", type: "action", app: "Email", label: "Fiyat Teklifi ve Toplantı Linki", icon: "Mail" }] }
        ]}
      ]
    },
    {
      id: "template-sales-closing",
      name: "Satış Kapanış Zinciri",
      description: "Teklif onaylandığında otomatik sözleşme ve proje oluşturur, müşteriyi CRM'de günceller.",
      trigger: "proposal.accepted",
      category: "Satış",
      nodes: [
        { id: "1", type: "Create Contract", config: { contractTitle: "Otomatik Hizmet Sözleşmesi" } },
        { id: "2", type: "Create Project", config: { projectName: "Yeni Müşteri Projesi" } },
        { id: "3", type: "Create Task", config: { title: "Onboarding Toplantısı Ayarla" } },
        { id: "4", type: "Convert to Client", config: {} }
      ]
    },
    {
      id: "template-billing-guard",
      name: "Tahsilat Gardiyanı",
      description: "Vadesi geçen faturalar için uyarı gönderir, ödenmezse projeyi durdurur.",
      trigger: "cron.daily",
      category: "Finans",
      nodes: [
        { id: "1", type: "Admin Approval", config: { title: "Fatura Hatırlatması Onayı" } },
        { id: "2", type: "Send Reminder", config: { severity: "Yüksek" } },
        { id: "3", type: "Suspend Project", config: {} }
      ]
    },
    {
      id: "template-meeting-assistant",
      name: "Toplantı Asistanı",
      description: "Randevu alındığında, şirketi AI ile araştırıp CRM'e özet not düşer.",
      trigger: "appointment.booked",
      category: "Satış",
      nodes: [
        { id: "1", type: "AI Company Research", config: {} },
        { id: "2", type: "Create Task", config: { title: "Toplantı Hazırlık Notunu Oku" } }
      ]
    },
    {
      id: "template-client-retention",
      name: "Müşteri Tutundurma",
      description: "Projedeki bir kilometre taşı bittiğinde müşteriye otomatik bilgi mesajı atar.",
      trigger: "task.completed",
      category: "İletişim",
      nodes: [
        { id: "1", type: "Admin Approval", config: { title: "Mesaj Gönderim Onayı" } },
        { id: "2", type: "Send Client Update", config: {} }
      ]
    },
    {
      id: "template-social-monster",
      name: "Sosyal Medya Canavarı",
      description: "Reklam formlarından (Facebook vs.) gelen kişileri anında CRM'e alır ve Hoşgeldin serisini başlatır.",
      trigger: "webhook.social_lead",
      category: "Pazarlama",
      nodes: [
        { id: "1", type: "Add Social Lead", config: {} },
        { id: "2", type: "Start Campaign", config: { campaignName: "Hoşgeldin & Case Study" } }
      ]
    }
  ];

  const [flows, setFlows] = useState<any[]>(initialData.flows || []);
  const [webhooks, setWebhooks] = useState<any[]>(initialData.webhooks || []);
  const [logs, setLogs] = useState<any[]>(initialData.logs || []);
  
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const handleApprove = (id: string) => {
    setPendingApprovals(prev => prev.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
    setTimeout(() => {
      setPendingApprovals(prev => prev.filter(p => p.id !== id));
      alert("Otomasyon onaylandı ve kaldığı yerden devam ediyor!");
    }, 1000);
  };

  const handleReject = (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    alert("Otomasyon reddedildi ve durduruldu.");
  };

  const handleDeleteFlow = async (id: string) => {
    if (confirm("Bu otomasyonu silmek istediğinize emin misiniz?")) {
      try {
        await deleteAutomationFlow(id);
        setFlows(prev => prev.filter(f => f.id !== id));
      } catch (error) {
        console.error("Failed to delete flow:", error);
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  const handleToggleFlowStatus = (id: string) => {
    setFlows(prev => prev.map(f => {
      if (f.id === id) {
        const newStatus = (f.status?.toUpperCase() || 'ACTIVE') === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...f, status: newStatus };
      }
      return f;
    }));
  };

  const handleAppChange = (index: number, appName: string) => {
    if (!editingFlow) return;
    const config = appConfigs[appName] || appConfigs["Custom"];
    const newNodes = [...editingFlow.nodes];
    newNodes[index] = {
      ...newNodes[index],
      app: appName,
      label: newNodes[index].label === "Yeni Kural" || !newNodes[index].label ? config.defaultLabel : newNodes[index].label,
      icon: config.icon,
      color: config.color,
      bg: config.bg,
      type: index === 0 ? "trigger" : "action"
    };
    setEditingFlow({ ...editingFlow, nodes: newNodes });
  };

  const handleAiConversationalEdit = () => {
    if (!aiEditPrompt.trim() || !editingFlow) return;
    
    setIsEditingWithAI(true);
    setAiEditSuccessMessage(null);
    
    setTimeout(() => {
      const prompt = aiEditPrompt.toLowerCase().trim();
      let newNodes = [...(editingFlow.nodes || [])];
      let newFlowName = editingFlow.name;
      let appliedAction = "";

      // 1. Rename Detection
      if (prompt.includes("ismini") || prompt.includes("adını") || prompt.includes("rename") || prompt.includes("name")) {
        let extractedName = "";
        const quoteMatch = aiEditPrompt.match(/["'“‘]([^"'”’]+)["'“‘]/);
        if (quoteMatch) {
          extractedName = quoteMatch[1];
        } else {
          const nameMatch = aiEditPrompt.match(/(?:ismini|adını)\s+([a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s\-]+)(?:\s+yap|\s+olarak)/i);
          if (nameMatch) {
            extractedName = nameMatch[1].trim();
          }
        }
        
        if (extractedName) {
          newFlowName = extractedName;
          appliedAction = `Akış ismi "${extractedName}" olarak güncellendi.`;
        }
      }
      
      // 2. Delete Detection
      else if (prompt.includes("sil") || prompt.includes("kaldır") || prompt.includes("delete") || prompt.includes("remove")) {
        let targetApp = "";
        if (prompt.includes("slack")) targetApp = "slack";
        else if (prompt.includes("email") || prompt.includes("e-posta") || prompt.includes("posta")) targetApp = "email";
        else if (prompt.includes("whatsapp") || prompt.includes("sms") || prompt.includes("mesaj")) targetApp = "whatsapp";
        else if (prompt.includes("delay") || prompt.includes("bekle")) targetApp = "delay";
        else if (prompt.includes("crm") || prompt.includes("proje")) targetApp = "crm";
        else if (prompt.includes("ai") || prompt.includes("yapay zeka")) targetApp = "star ai";
        
        if (targetApp) {
          const beforeCount = newNodes.length;
          newNodes = newNodes.filter(node => {
            const nodeApp = (node.app || "").toLowerCase();
            const nodeLabel = (node.label || "").toLowerCase();
            const nodeType = (node.type || "").toLowerCase();
            return !nodeApp.includes(targetApp) && !nodeLabel.includes(targetApp) && !nodeType.includes(targetApp);
          });
          
          if (newNodes.length < beforeCount) {
            appliedAction = `${targetApp.toUpperCase()} adımı akıştan kaldırıldı.`;
          } else {
            appliedAction = `Kaldırılacak ${targetApp.toUpperCase()} adımı bulunamadı.`;
          }
        }
      }
      
      // 3. Add/Insert Detection
      else if (prompt.includes("ekle") || prompt.includes("add") || prompt.includes("koy") || prompt.includes("yerleştir")) {
        let newNodeApp = "Custom";
        let newNodeLabel = "Yeni Aksiyon";
        let newNodeIcon = Zap;
        let newNodeColor = "text-[#4F8EF7]";
        let newNodeBg = "bg-[#4F8EF7]/10";
        let newNodeType = "action";
        
        if (prompt.includes("slack")) {
          newNodeApp = "Slack";
          newNodeLabel = "Slack Bildirimi Gönder";
          newNodeColor = "text-[#E01E5A]";
          newNodeBg = "bg-[#E01E5A]/10";
        } else if (prompt.includes("email") || prompt.includes("e-posta") || prompt.includes("posta")) {
          newNodeApp = "Email";
          newNodeLabel = "E-posta Bildirimi Gönder";
          newNodeColor = "text-[#10B981]";
          newNodeBg = "bg-[#10B981]/10";
        } else if (prompt.includes("whatsapp") || prompt.includes("sms") || prompt.includes("mesaj")) {
          newNodeApp = "WhatsApp";
          newNodeLabel = "Müşteriye WhatsApp Mesajı";
          newNodeColor = "text-[#25D366]";
          newNodeBg = "bg-[#25D366]/10";
        } else if (prompt.includes("delay") || prompt.includes("bekle")) {
          newNodeApp = "Delay";
          newNodeLabel = "Bekleme Süresi (24 Saat)";
          newNodeColor = "text-amber-400";
          newNodeBg = "bg-amber-400/10";
        } else if (prompt.includes("crm") || prompt.includes("proje")) {
          newNodeApp = "CRM";
          newNodeLabel = "CRM Proje Oluştur";
          newNodeColor = "text-[#4F8EF7]";
          newNodeBg = "bg-[#4F8EF7]/10";
        } else if (prompt.includes("ai") || prompt.includes("yapay zeka")) {
          newNodeApp = "Star AI";
          newNodeLabel = "AI Zenginleştirme";
          newNodeColor = "text-[#8B5CF6]";
          newNodeBg = "bg-[#8B5CF6]/10";
        }

        const newCreatedNode = {
          id: `n-ai-${Date.now()}`,
          type: newNodeType,
          app: newNodeApp,
          label: newNodeLabel,
          icon: newNodeIcon,
          color: newNodeColor,
          bg: newNodeBg
        };

        // Determine position
        let targetKeyword = "";
        let isBefore = false;
        let isAfter = false;

        if (prompt.includes("önce") || prompt.includes("before")) {
          isBefore = true;
          if (prompt.includes("email") || prompt.includes("e-posta") || prompt.includes("posta")) targetKeyword = "email";
          else if (prompt.includes("slack")) targetKeyword = "slack";
          else if (prompt.includes("crm") || prompt.includes("proje")) targetKeyword = "crm";
          else if (prompt.includes("whatsapp") || prompt.includes("sms")) targetKeyword = "whatsapp";
          else if (prompt.includes("ai") || prompt.includes("yapay zeka")) targetKeyword = "ai";
          else if (prompt.includes("delay") || prompt.includes("bekle")) targetKeyword = "delay";
        } else if (prompt.includes("sonra") || prompt.includes("after")) {
          isAfter = true;
          if (prompt.includes("email") || prompt.includes("e-posta") || prompt.includes("posta")) targetKeyword = "email";
          else if (prompt.includes("slack")) targetKeyword = "slack";
          else if (prompt.includes("crm") || prompt.includes("proje")) targetKeyword = "crm";
          else if (prompt.includes("whatsapp") || prompt.includes("sms")) targetKeyword = "whatsapp";
          else if (prompt.includes("ai") || prompt.includes("yapay zeka")) targetKeyword = "ai";
          else if (prompt.includes("delay") || prompt.includes("bekle")) targetKeyword = "delay";
        }

        if (targetKeyword) {
          const targetIndex = newNodes.findIndex(node => {
            const nodeApp = (node.app || "").toLowerCase();
            const nodeLabel = (node.label || "").toLowerCase();
            return nodeApp.includes(targetKeyword) || nodeLabel.includes(targetKeyword);
          });

          if (targetIndex !== -1) {
            if (isBefore) {
              newNodes.splice(targetIndex, 0, newCreatedNode);
              appliedAction = `"${newNodeApp}" adımı "${newNodes[targetIndex+1].app || 'Özel'}" adımından öncesine eklendi.`;
            } else {
              newNodes.splice(targetIndex + 1, 0, newCreatedNode);
              appliedAction = `"${newNodeApp}" adımı "${newNodes[targetIndex].app || 'Özel'}" adımından sonrasına eklendi.`;
            }
          } else {
            newNodes.push(newCreatedNode);
            appliedAction = `"${newNodeApp}" adımı akışın sonuna eklendi (hedef adım bulunamadı).`;
          }
        } else {
          newNodes.push(newCreatedNode);
          appliedAction = `"${newNodeApp}" adımı akışın sonuna eklendi.`;
        }
      }

      if (appliedAction) {
        setEditingFlow({
          ...editingFlow,
          name: newFlowName,
          nodes: newNodes
        });
        setAiEditSuccessMessage(`✨ ${appliedAction}`);
        setAiEditPrompt("");
      } else {
        setAiEditSuccessMessage("⚠️ Komut anlaşılamadı. Lütfen başka bir şekilde ifade edin.");
      }
      
      setIsEditingWithAI(false);
      setTimeout(() => {
        setAiEditSuccessMessage(null);
      }, 4000);
      
    }, 1200);
  };

  const runFlowSimulation = () => {
    if (!editingFlow || !editingFlow.nodes || editingFlow.nodes.length === 0) {
      alert("Akışı test etmek için en az bir düğüm bulunmalıdır.");
      return;
    }
    
    setIsTestingFlow(true);
    setIsTestingRunning(true);
    setTestLogs(["[10:15:00] 🟢 Otomasyon simülasyonu başlatıldı..."]);
    
    let currentStep = 0;
    const nodes = editingFlow.nodes;
    
    const interval = setInterval(() => {
      if (currentStep < nodes.length) {
        const node = nodes[currentStep];
        const appName = node.app || "System";
        const labelName = node.label || "İşlem";
        
        let logMessage = `[10:15:0${currentStep + 1}] `;
        if (currentStep === 0) {
          logMessage += `⚡ Tetikleyici Tetiklendi (${appName}): "${labelName}"`;
        } else {
          logMessage += `⚙️ Aksiyon Çalıştırıldı (${appName}): "${labelName}"`;
        }
        
        if (node.app === "Email") {
          logMessage += ` (Konu: "${node.config?.subject || "Teşekkürler!"}", Alıcı: lead@starwebflow.com)`;
        } else if (node.app === "Slack") {
          logMessage += ` (Kanal: "${node.config?.channel || "#sales"}")`;
        } else if (node.app === "Delay") {
          logMessage += ` (Süre: "${node.config?.duration || "24 Saat"}")`;
        } else if (node.app === "Star AI") {
          logMessage += ` (Mod: "${node.config?.aiMode || "research"}")`;
        } else if (node.app === "CRM") {
          logMessage += ` (Aksiyon: "${node.config?.crmAction || "create_project"}")`;
        }
        
        setTestLogs(prev => [...prev, logMessage, `[10:15:0${currentStep + 1}] ✅ Başarılı.`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTestLogs(prev => [...prev, `[10:15:0${nodes.length + 1}] 🟢 Simülasyon başarıyla tamamlandı!`]);
        setIsTestingRunning(false);
      }
    }, 1000);
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#10B981] to-[#4F8EF7] bg-clip-text text-transparent">
              Gelişmiş Otomasyonlar (Flows)
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Karar ağaçları (If/Else), Webhook uç noktaları ve asenkron veri akışları.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#4F8EF7] hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Yeni Akış Yarat
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.05] pb-4">
        {[
          { id: "flows", label: "Aktif Akışlar", icon: Zap },
          { id: "approvals", label: `Onay Bekleyenler (${pendingApprovals.length})`, icon: CheckCircle2 },
          { id: "templates", label: "Hazır Şablonlar", icon: FileText },
          { id: "webhooks", label: "API & Entegrasyonlar", icon: Link },
          { id: "logs", label: "Çalışma Geçmişi (Logs)", icon: Database }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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

      {activeTab === "flows" && (
        <div className="grid grid-cols-1 gap-8 mt-6">
          {flows.map((flow) => {
            // Because real DB flows have parsed JSON nodes
            const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
            const safeStatus = flow.status?.toUpperCase() || 'ACTIVE';
            return (
            <div key={flow.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 hover:border-white/[0.1] transition-all relative group">
              <div className="flex flex-col xl:flex-row justify-between gap-6">
                
                {/* Meta */}
                <div className="flex-shrink-0 w-full xl:w-1/4">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#4F8EF7] transition-colors cursor-pointer">{flow.name}</h3>
                    <div className="relative group/info">
                      <Info className="w-4 h-4 text-[#94A3B8] cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-[#1E293B] border border-white/10 rounded-xl shadow-xl text-xs text-white opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10">
                        {flow.description || "Bu otomasyon için açıklama bulunmuyor."}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      safeStatus === 'ACTIVE' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
                      'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    }`}>
                      {safeStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-[#64748B] mb-4">
                    <div className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      {(flow.runsCount || flow.runs || 0).toLocaleString()} kez çalıştı
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(flow.successRate ?? 100) >= 99 ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      %{(flow.successRate ?? 100)} Başarı
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={() => setEditingFlow(flow)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-white text-xs font-semibold transition-colors border border-white/[0.05] flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" /> Düzenle
                    </button>
                    <button 
                      onClick={() => {
                        setIsTestingFlow(true);
                        setIsTestingRunning(true);
                        setTestLogs([
                          `🟢 Simülasyon Başlatıldı: ${flow.name}`,
                          `⚡ Adım 1 Tetiklendi: ${nodes[0]?.label || "Tetikleyici"}`,
                          `ℹ️ Tetikleyici Verisi: { clientName: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "+905551234567" }`,
                          ...nodes.slice(1).map((n: any, i: number) => {
                            const details = n.config?.description || resolveNodeSummary(n);
                            return `✅ Adım ${i + 2} Yürütüldü [${n.app || n.type}]: ${n.label} -> "${details}"`;
                          }),
                          `🟢 Simülasyon Başarıyla Tamamlandı. Hiçbir müşteriye gerçek e-posta veya mesaj gönderilmedi.`
                        ]);
                        setTimeout(() => setIsTestingRunning(false), 1500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold transition-colors border border-purple-500/20 flex items-center gap-1.5"
                      title="Akış Çıktılarını Simüle Et & Önizle"
                    >
                      <Eye className="w-3.5 h-3.5" /> Simüle Et
                    </button>
                    <button 
                      onClick={() => handleToggleFlowStatus(flow.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                      safeStatus === 'ACTIVE' 
                        ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-400/20' 
                        : 'bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border-[#10B981]/20'
                    }`} title={safeStatus === 'ACTIVE' ? 'Durdur' : 'Başlat'}>
                      {safeStatus === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-colors" title="Sil">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Nodes (Visual Flow) */}
                <div className="flex-1 flex flex-col justify-center overflow-x-auto pb-2 xl:pb-0 hide-scrollbar min-h-[120px]">
                  <div className="flex items-center gap-2 md:gap-4 w-max">
                    {nodes.map((node: any, index: number) => {
                      const Icon = resolveNodeIcon(node);
                      const color = resolveNodeColor(node);
                      const bg = resolveNodeBg(node);
                      
                      if (node.type === "condition") {
                        // Complex IF/ELSE branching
                        return (
                          <div key={node.id} className="flex items-center gap-4 relative">
                            {/* Condition Node */}
                            <div className="bg-[#05050A] border-2 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)] rounded-xl p-3 flex items-center gap-3 min-w-[150px] z-10">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} shrink-0`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">{node.app}</p>
                                <p className="text-xs font-semibold text-white whitespace-nowrap">{node.label}</p>
                                <p className="text-[9px] text-amber-500/80 whitespace-normal max-w-[150px] leading-tight mt-0.5">{resolveNodeSummary(node)}</p>
                              </div>
                            </div>

                            {/* Branches */}
                            <div className="flex flex-col gap-6 relative ml-6">
                              {/* SVG path to connect branches visually */}
                              <svg className="absolute -left-10 top-0 w-10 h-full -z-10" preserveAspectRatio="none">
                                <path d="M 0,50 Q 20,50 20,20 T 40,20" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" className="translate-y-[calc(50%-20px)]"/>
                                <path d="M 0,50 Q 20,50 20,80 T 40,80" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" className="translate-y-[calc(50%-80px)]"/>
                              </svg>

                              {node.branches?.map((branch: any, bIdx: number) => (
                                <div key={bIdx} className="flex items-center gap-4">
                                  <div className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold text-[#94A3B8] whitespace-nowrap border border-white/10">
                                    {branch.path}
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-white/20" />
                                  
                                  {/* Branch Nodes */}
                                  <div className="flex items-center gap-4">
                                    {branch.nodes?.map((bNode: any, bnIdx: number) => {
                                      const BIcon = resolveNodeIcon(bNode);
                                      const bColor = resolveNodeColor(bNode);
                                      const bBg = resolveNodeBg(bNode);
                                      return (
                                      <div key={bNode.id} className="flex items-center gap-4">
                                        <div 
                                          onClick={() => setSelectedPreviewNode(bNode)}
                                          className="bg-[#05050A] border border-white/[0.05] rounded-xl p-3 flex items-center gap-3 min-w-[140px] hover:border-white/[0.15] transition-colors cursor-pointer group/node"
                                        >
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bBg} shrink-0`}>
                                            <BIcon className={`w-4 h-4 ${bColor}`} />
                                          </div>
                                          <div className="relative">
                                            <div className="flex items-center gap-1.5">
                                              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">{bNode.type}</p>
                                              <Info className="w-2.5 h-2.5 text-[#64748B] opacity-0 group-hover/node:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-xs font-semibold text-white whitespace-nowrap">{bNode.label}</p>
                                            <p className="text-[9px] text-[#64748B] whitespace-normal max-w-[150px] leading-tight mt-0.5">{resolveNodeSummary(bNode)}</p>
                                          </div>
                                        </div>
                                        {bnIdx < branch.nodes.length - 1 && (
                                          <ArrowRight className="w-4 h-4 text-white/20" />
                                        )}
                                      </div>
                                    )})}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // Normal Node
                      return (
                        <div key={node.id} className="flex items-center gap-2 md:gap-4">
                          <div 
                            onClick={() => setSelectedPreviewNode(node)}
                            className="bg-[#05050A] border border-white/[0.05] rounded-xl p-3 flex items-center gap-3 min-w-[150px] hover:border-white/[0.15] transition-colors cursor-pointer group/node"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} shrink-0`}>
                              <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <div className="relative">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">{node.app || node.type}</p>
                                <Info className="w-2.5 h-2.5 text-[#64748B] opacity-0 group-hover/node:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs font-semibold text-white whitespace-nowrap">{node.label}</p>
                              <p className="text-[9px] text-[#64748B] whitespace-normal max-w-[150px] leading-tight mt-0.5">{resolveNodeSummary(node)}</p>
                            </div>
                          </div>
                          
                          {/* Connector Arrow */}
                          {index < nodes.length - 1 && nodes[index+1].type !== "condition" && (
                            <div className="flex items-center text-white/[0.1]">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                          {index < nodes.length - 1 && nodes[index+1].type === "condition" && (
                            <div className="flex items-center text-white/[0.1]">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* ONAY BEKLEYENLER SEKMESİ */}
      {activeTab === "approvals" && (
        <div className="mt-6 space-y-6 animate-in fade-in">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-500 font-bold mb-1">Güvenlik ve Onay Kapısı (Admin Approval)</h3>
              <p className="text-amber-500/80 text-sm">Sistem hatalarını veya istenmeyen durumları önlemek için kritik otomasyonlar bu noktada durdurulur ve sizin onayınızı bekler. Onayladığınızda akış kaldığı yerden çalışmaya devam eder.</p>
            </div>
          </div>

          <div className="grid gap-4">
            {pendingApprovals.length === 0 ? (
              <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-8 text-center text-[#64748B]">
                Şu an onay bekleyen herhangi bir işlem yok.
              </div>
            ) : (
              pendingApprovals.map(approval => (
                <div key={approval.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-white/[0.1]">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {approval.flowName}
                      </span>
                      <span className="text-xs text-[#64748B]">{approval.requestedAt}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{approval.action}</h3>
                    <p className="text-[#94A3B8] text-sm">Tetikleyen: {approval.trigger}</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {Object.entries(approval.details).map(([k, v]) => (
                        <span key={k} className="px-2 py-1 rounded-md bg-white/5 text-[#94A3B8] text-xs font-mono">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:flex-col lg:flex-row flex-shrink-0">
                    <button 
                      onClick={() => setPreviewData(approval)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-bold flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      İçeriği Önizle
                    </button>
                    <button 
                      onClick={() => handleReject(approval.id)}
                      className="px-5 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-bold"
                    >
                      Reddet & Durdur
                    </button>
                    <button 
                      onClick={() => handleApprove(approval.id)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105 transition-all text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Onayla & Devam Et
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Preview Modal */}
          {previewData && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[#4F8EF7]" />
                      İçerik Önizlemesi
                    </h3>
                    <p className="text-sm text-[#94A3B8] mt-1">{previewData.flowName} - {previewData.action}</p>
                  </div>
                  <button onClick={() => setPreviewData(null)} className="text-[#64748B] hover:text-white transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Otomasyon Detayları</h4>
                    <pre className="text-xs text-[#10B981] font-mono whitespace-pre-wrap">
                      {JSON.stringify(previewData.details, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider">Simüle Edilmiş İçerik Çıktısı (Düzenlenebilir)</h4>
                      <Pencil className="w-3 h-3 text-[#94A3B8]" />
                    </div>
                    <textarea 
                      value={previewData.outputContent || ""}
                      onChange={(e) => setPreviewData({ ...previewData, outputContent: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white leading-relaxed focus:outline-none focus:border-[#4F8EF7] transition-colors resize-none h-32"
                      placeholder="Buradaki çıktıyı düzenleyebilirsiniz..."
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-[#05050A]">
                  <button 
                    onClick={() => {
                      handleReject(previewData.id);
                      setPreviewData(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-bold"
                  >
                    Reddet & Durdur
                  </button>
                  <button 
                    onClick={() => {
                      handleApprove(previewData.id);
                      setPreviewData(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105 transition-all text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Onayla & Devam Et
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Node Step Details Dialog Popup Modal */}
          {selectedPreviewNode && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#05050A]">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#4F8EF7]" />
                      Adım Detayları & Ayarları
                    </h3>
                  </div>
                  <button onClick={() => setSelectedPreviewNode(null)} className="text-[#64748B] hover:text-white transition-colors">
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#94A3B8]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">Adım İsmi</span>
                    <p className="text-white font-semibold text-base">{selectedPreviewNode.label}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">Uygulama Tipi</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 border border-white/10 text-white">
                      {selectedPreviewNode.app || selectedPreviewNode.type || "Özel İşlem Düğümü"}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 mt-4">
                    <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">Adım Açıklaması</span>
                    <p className="text-xs text-white leading-relaxed italic">
                      {selectedPreviewNode.config?.description || resolveNodeSummary(selectedPreviewNode)}
                    </p>
                  </div>

                  {selectedPreviewNode.config && Object.keys(selectedPreviewNode.config).filter(k => k !== 'description').length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold">Adım Konfigürasyonu</span>
                      <div className="space-y-2">
                        {Object.entries(selectedPreviewNode.config).filter(([k]) => k !== 'description').map(([key, val]) => (
                          <div key={key} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-[10px] text-[#64748B] font-mono capitalize">{key}:</span>
                            <span className="text-xs text-white font-mono whitespace-pre-wrap">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/5 flex items-center justify-end bg-[#05050A]">
                  <button 
                    onClick={() => setSelectedPreviewNode(null)}
                    className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-xs font-bold"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 animate-in fade-in">
          {defaultTemplates.map(t => (
            <div key={t.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 hover:border-[#4F8EF7]/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#4F8EF7]/20 to-[#10B981]/20 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-[#4F8EF7]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{t.name}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">{t.description || (t as any).desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                <span className="text-xs text-[#64748B] flex items-center gap-1"><Zap className="w-3 h-3" /> {(t as any).uses || Math.floor(Math.random() * 500) + 100} kez kullanıldı</span>
                <button 
                  onClick={async () => {
                    const templateNodes = (t as any).nodes?.map((n: any, idx: number) => {
                      const style = appConfigs[n.app || n.type] || appConfigs["Custom"];
                      return {
                        id: `n${idx + 1}`,
                        type: n.type || (idx === 0 ? "trigger" : "action"),
                        app: n.app || n.type || "Custom",
                        label: n.label || n.config?.title || n.config?.contractTitle || n.config?.projectName || style?.defaultLabel || "Adım",
                        icon: n.app || n.type || "Zap",
                        color: style?.color || "text-[#10B981]",
                        bg: style?.bg || "bg-[#10B981]/10",
                        config: n.config || {
                          description: `${n.label || "İşlem"} başarıyla yürütülür.`,
                          subject: "Otomatik Akış Bildirimi",
                          channel: "#general"
                        }
                      };
                    }) || [];

                    const newFlowObj = {
                      tenantId: 'default-tenant',
                      name: t.name,
                      description: t.description,
                      status: "PAUSED",
                      nodes: templateNodes
                    };

                    try {
                      const response = await createAutomationFlow(newFlowObj);
                      if (response.success && response.data) {
                        setFlows(prev => [response.data, ...prev]);
                        setActiveTab("flows");
                        alert(`"${t.name}" şablonu başarıyla veritabanına kaydedildi ve aktif akışlarınıza eklendi! Şimdi düzenleyip aktif hale getirebilirsiniz.`);
                      } else {
                        alert("Şablon veritabanına kaydedilirken bir hata oluştu.");
                      }
                    } catch (err) {
                      console.error("Failed to create flow from template:", err);
                      alert("Şablon oluşturulurken bir hata oluştu.");
                    }
                  }}
                  className="text-sm font-semibold text-white bg-white/[0.05] hover:bg-white/[0.1] px-4 py-2 rounded-lg transition-colors"
                >
                  Şablonu Kullan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          
          {/* Left Column: Webhooks Management */}
          <div className="col-span-1 lg:col-span-2 p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Link className="w-5 h-5 text-[#4F8EF7]" />
                Gelen Webhook Uç Noktaları
              </h2>
              <p className="text-[#94A3B8] text-sm mb-6">Dış sistemlerden veri almak için size özel oluşturulmuş benzersiz URL'ler.</p>
              
              <div className="space-y-4">
                <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#4F8EF7]/20 text-[#4F8EF7] text-xs font-bold px-2 py-0.5 rounded border border-[#4F8EF7]/30">POST</span>
                      <span className="text-white font-mono text-sm">https://api.starwebflow.com/wh/v1/payments/stripe-events</span>
                    </div>
                    <p className="text-xs text-[#64748B]">Bağlı Akış: "Dış Sistem Entegrasyonu (Webhook Listener)" • Son Tetiklenme: 10 dk önce</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors">
                    URL Kopyala
                  </button>
                </div>

                <div className="bg-[#05050A] border border-white/[0.05] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#10B981]/20 text-[#10B981] text-xs font-bold px-2 py-0.5 rounded border border-[#10B981]/30">POST</span>
                      <span className="text-white font-mono text-sm">https://api.starwebflow.com/wh/v1/leads/external-form</span>
                    </div>
                    <p className="text-xs text-[#64748B]">Bağlı Akış: Yok (Boşta) • Son Tetiklenme: Hiç</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors">
                    URL Kopyala
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-white/5 pt-4">
              <button className="flex items-center gap-2 text-[#4F8EF7] text-sm font-medium hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Yeni Endpoint Oluştur
              </button>
            </div>
          </div>

          {/* Right Column: Third-party API Credentials & Connections */}
          <div className="col-span-1 lg:col-span-1 p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#10B981]" />
              API Bağlantıları (Credentials)
            </h2>
            <p className="text-[#94A3B8] text-sm mb-6">Otomasyonlarda kullanılan dış sistemlerin entegrasyon anahtarları ve şifreleri.</p>

            <div className="space-y-4">
              {[
                {
                  id: "slack",
                  name: "Slack Integration",
                  app: "Slack",
                  icon: MessageCircle,
                  color: "text-[#E01E5A]",
                  placeholder: "xoxb-... (OAuth Bot Token)",
                  guide: {
                    title: "Slack Bot Token Alımı (Bot User OAuth Token)",
                    steps: [
                      "https://api.slack.com/apps adresine gidin.",
                      "Create New App -> From Scratch adımlarını takip ederek uygulamanızı oluşturun.",
                      "Sol menüden 'OAuth & Permissions' sekmesine gelin.",
                      "Scopes -> Bot Token Scopes bölümünden 'chat:write', 'channels:read', 'incoming-webhook' yetkilerini verin.",
                      "Sayfanın üstündeki 'Install App to Workspace' butonuna basın ve erişim izinlerini verin.",
                      "Oluşan 'Bot User OAuth Token' (xoxb-...) değerini kopyalayıp buraya yapıştırın."
                    ]
                  }
                },
                {
                  id: "typeform",
                  name: "Typeform API",
                  app: "Typeform",
                  icon: FileText,
                  color: "text-white",
                  placeholder: "tfp_... (Personal Access Token)",
                  guide: {
                    title: "Typeform Personal Access Token Alımı",
                    steps: [
                      "Typeform panelinize giriş yapın.",
                      "Sağ üstteki profil resminize tıklayıp 'Settings' sekmesine gidin.",
                      "Sol menüde en altta bulunan 'Personal Access Tokens' seçeneğine girin.",
                      "Generate new token butonuna basın.",
                      "Token'ınıza bir isim verin ve oluşturun. Ekranda çıkan anahtarı kopyalayarak buraya kaydedin."
                    ]
                  }
                },
                {
                  id: "whatsapp",
                  name: "WhatsApp Cloud API",
                  app: "WhatsApp",
                  icon: MessageSquare,
                  color: "text-[#25D366]",
                  placeholder: "EAAG... (Meta Cloud API Access Token)",
                  guide: {
                    title: "WhatsApp Meta Cloud API Token Alımı",
                    steps: [
                      "Meta developers paneline (developers.facebook.com) giriş yapın.",
                      "Uygulamanızı seçin veya yeni bir Business App oluşturun.",
                      "Uygulama menüsünden 'WhatsApp' entegrasyonunu ekleyin.",
                      "API Setup kısmına gelerek test numaranızı ve geçici token'ınızı görebilirsiniz.",
                      "Canlı sürüm için Meta Business Suite panelinizden kalıcı 'System User Access Token' oluşturarak kopyalayın."
                    ]
                  }
                },
                {
                  id: "stripe",
                  name: "Stripe Payment Gateway",
                  app: "Stripe",
                  icon: Link,
                  color: "text-[#635BFF]",
                  placeholder: "sk_live_... (API Secret Key)",
                  guide: {
                    title: "Stripe API Key & Webhook Secret Alımı",
                    steps: [
                      "Stripe Dashboard panelinize (dashboard.stripe.com) giriş yapın.",
                      "Geliştirici sekmesinden 'API Keys' bölümüne gidin.",
                      "Secret Key (sk_live_...) alanındaki anahtarı kopyalayın.",
                      "Webhooks sekmesine gelerek, sol taraftaki Stripe Webhook URL adresinizi endpoint olarak ekleyin ve 'Signing Secret' (whsec_...) anahtarını alın."
                    ]
                  }
                },
                {
                  id: "smtp",
                  name: "SMTP / Mailer API",
                  app: "SMTP",
                  icon: Mail,
                  color: "text-[#10B981]",
                  placeholder: "SMTP Şifresi veya API Anahtarı",
                  guide: {
                    title: "SMTP / E-posta Gönderim Şifresi Alımı",
                    steps: [
                      "SMTP veya mail sağlayıcınızın (Gmail, SendGrid, Outlook vb.) ayarlar paneline girin.",
                      "Gmail kullanıyorsanız, Google Account -> Security -> 2-Step Verification altından 'App Passwords' (Uygulama Şifreleri) oluşturun.",
                      "Oluşturulan 16 haneli uygulama şifresini buradaki SMTP Password alanına girin.",
                      "SendGrid vb. kullanıyorsanız, Settings -> API Keys sekmesinden 'Full Access' iznine sahip bir API key oluşturarak kopyalayın."
                    ]
                  }
                },
                {
                  id: "openai",
                  name: "OpenAI / Gemini API",
                  app: "Star AI",
                  icon: Activity,
                  color: "text-[#8B5CF6]",
                  placeholder: "sk-... veya AIzaSy...",
                  guide: {
                    title: "OpenAI & Gemini API Key Alımı",
                    steps: [
                      "OpenAI için platform.openai.com/api-keys adresine gidin. Google AI Studio için aistudio.google.com adresine gidin.",
                      "Giriş yaptıktan sonra 'Create new secret key' (Yeni gizli anahtar oluştur) butonuna tıklayın.",
                      "Oluşan 'sk-...' (OpenAI) veya 'AIzaSy...' (Gemini) anahtarını kopyalayın.",
                      "StarWebflow AI node'larının zeka kararlarını beslemesi için kopyaladığınız anahtarı buraya kaydedin."
                    ]
                  }
                },
                {
                  id: "google_sheets",
                  name: "Google Sheets & Drive",
                  app: "Google Sheets",
                  icon: FileText,
                  color: "text-[#0F9D58]",
                  placeholder: "Google OAuth Client Secret",
                  guide: {
                    title: "Google Cloud Console Credentials Alımı",
                    steps: [
                      "Google Cloud Console (console.cloud.google.com) paneline giriş yapın ve bir proje oluşturun.",
                      "API Library sekmesinden 'Google Sheets API' ve 'Google Drive API' servislerini aktifleştirin.",
                      "Credentials -> Create Credentials -> OAuth Client ID adımlarını takip edin.",
                      "Uygulama tipi olarak 'Web Application' seçin ve yetkilendirilmiş yönlendirme URI kısmına StarWebflow panel geri dönüş adresini girin.",
                      "Oluşan Client ID ve Client Secret bilgilerini kopyalayıp buraya ekleyin."
                    ]
                  }
                },
                {
                  id: "hubspot",
                  name: "HubSpot CRM",
                  app: "HubSpot",
                  icon: Settings,
                  color: "text-[#FF7A59]",
                  placeholder: "pat-na1-... (HubSpot Access Token)",
                  guide: {
                    title: "HubSpot Private App Access Token Alımı",
                    steps: [
                      "HubSpot Developer veya Admin panelinizde sağ üstteki ayarlar (dişli) ikonuna tıklayın.",
                      "Sol menüden Integrations -> Private Apps sekmesine gelin.",
                      "Create a private app butonuna basın.",
                      "Scope kısmından 'crm.objects.contacts.read/write', 'crm.objects.deals.read/write' izinlerini verin.",
                      "Oluşturulan Access Token anahtarını kopyalayın ve buradaki API Anahtarı alanına girin."
                    ]
                  }
                },
                {
                  id: "shopify",
                  name: "Shopify E-Commerce",
                  app: "Shopify",
                  icon: Link,
                  color: "text-[#96BF48]",
                  placeholder: "shpat_... (Admin Access Token)",
                  guide: {
                    title: "Shopify Custom App API Credentials Alımı",
                    steps: [
                      "Shopify Admin panelinize girin ve Apps -> App and sales channel settings sayfasına gidin.",
                      "Develop apps for your store butonuna, ardından Create an app seçeneğine tıklayın.",
                      "Configure Admin API Scopes menüsünden 'write_products', 'write_orders', 'read_customers' yetkilerini tanımlayın.",
                      "Install App butonuna basarak, 'Admin API access token' (shpat_...) anahtarını bir kez görüntüleyip kopyalayın."
                    ]
                  }
                },
                {
                  id: "trello",
                  name: "Trello / Jira PM",
                  app: "Trello",
                  icon: Globe,
                  color: "text-[#0079BF]",
                  placeholder: "Trello API Token / Jira Secret Key",
                  guide: {
                    title: "Trello Developer API Key & Token Alımı",
                    steps: [
                      "trello.com/app-key adresine gidin ve Trello geliştirici koşullarını onaylayın.",
                      "Size sunulan 32 haneli 'Developer API Key' değerini kopyalayın.",
                      "Hemen altındaki 'Token' bağlantısına tıklayarak uygulamanızın hesabınıza erişimini onaylayın.",
                      "Karşınıza çıkan kalıcı Token değerini kopyalayıp Trello bağlantı alanı için buraya yapıştırın."
                    ]
                  }
                },
                {
                  id: "telegram",
                  name: "Telegram Bot API",
                  app: "Telegram",
                  icon: MessageSquare,
                  color: "text-[#0088cc]",
                  placeholder: "123456:ABC-DEF1234ghIkl-zyx57... (Bot Token)",
                  guide: {
                    title: "Telegram Bot Token Alımı (BotFather)",
                    steps: [
                      "Telegram uygulamasını açın ve arama çubuğuna '@BotFather' yazarak resmi botu bulun.",
                      "Botu başlatmak için '/start' komutunu gönderin.",
                      "Yeni bir bot oluşturmak için '/newbot' komutunu çalıştırın.",
                      "Botunuza bir isim ve benzersiz bir kullanıcı adı (örn: starwebflow_bot) tanımlayın.",
                      "BotFather'ın size verdiği kırmızı renkli HTTP API Token (123456:ABC...) kodunu kopyalayıp buraya kaydedin."
                    ]
                  }
                },
                {
                  id: "github",
                  name: "GitHub API / Actions",
                  app: "GitHub",
                  icon: Activity,
                  color: "text-white",
                  placeholder: "ghp_... (Personal Access Token)",
                  guide: {
                    title: "GitHub Personal Access Token (Classic/Fine-Grained) Alımı",
                    steps: [
                      "github.com sitesine girin ve sağ üstteki profil resminizden Settings -> Developer Settings kısmına gidin.",
                      "Personal access tokens -> Tokens (classic) sekmesine girin ve 'Generate new token' butonuna basın.",
                      "Token açıklaması yazıp yetkilerden 'repo', 'workflow' ve 'admin:repo_hook' kutucuklarını seçin.",
                      "En alttaki butonla oluşturduğunuz 'ghp_...' ile başlayan anahtarı kopyalayarak buraya yapıştırın."
                    ]
                  }
                },
                {
                  id: "mailchimp",
                  name: "Mailchimp Marketing",
                  app: "Mailchimp",
                  icon: Mail,
                  color: "text-[#FFE01B]",
                  placeholder: "abc123xyz...-usX (Mailchimp API Key)",
                  guide: {
                    title: "Mailchimp API Key & Audience ID Alımı",
                    steps: [
                      "Mailchimp hesabınıza girip profil menünüzden Account & billing sekmesine gidin.",
                      "Extras -> API keys menüsüne tıklayın.",
                      "Create A Key butonuna basarak yeni bir API anahtarı üretip kopyalayın.",
                      "Müşteri bülten akışlarını senkronize etmek için bu anahtarı buraya kaydedin."
                    ]
                  }
                },
                {
                  id: "discord",
                  name: "Discord Webhook / Bot",
                  app: "Discord",
                  icon: MessageCircle,
                  color: "text-[#5865F2]",
                  placeholder: "https://discord.com/api/webhooks/...",
                  guide: {
                    title: "Discord Sunucu Webhook URL Alımı",
                    steps: [
                      "Discord uygulamasını açın ve yöneticisi olduğunuz sunucuya gidin.",
                      "Mesaj gönderilecek kanalın yanındaki vites (Kanalı Düzenle) ikonuna tıklayın.",
                      "Entegrasyonlar (Integrations) sekmesinden 'Webhook Oluştur' (Webhooks) butonuna basın.",
                      "Oluşan webhook kartını genişleterek 'Webhook URL'sini Kopyala' butonuna tıklayın ve buraya ekleyin."
                    ]
                  }
                },
                {
                  id: "notion",
                  name: "Notion Workspace",
                  app: "Notion",
                  icon: FileText,
                  color: "text-white",
                  placeholder: "secret_... (Notion Integration Token)",
                  guide: {
                    title: "Notion API & Private Integration Token Alımı",
                    steps: [
                      "notion.so/my-integrations adresine gidin.",
                      "Create New Integration butonuna tıklayıp uygulamanıza bir isim verin ve doğru workspace'i seçin.",
                      "Content Capabilities altından okuma, yazma ve güncelleme izinlerini aktif hale getirin.",
                      "Oluşan 'Internal Integration Secret' (secret_...) anahtarını kopyalayın.",
                      "Kullanmak istediğiniz Notion sayfasına gidin, sağ üstteki üç noktadan 'Connect to' seçeneğini seçerek oluşturduğunuz entegrasyona izin verin."
                    ]
                  }
                },
                {
                  id: "airtable",
                  name: "Airtable Database",
                  app: "Airtable",
                  icon: Link,
                  color: "text-[#FCB400]",
                  placeholder: "pat.abc... (Personal Access Token)",
                  guide: {
                    title: "Airtable Personal Access Token Alımı",
                    steps: [
                      "airtable.com/create/tokens adresine gidin.",
                      "Create Token butonuna tıklayın.",
                      "Scopes bölümünden 'data.records:read', 'data.records:write', 'schema.bases:read' yetkilerini tanımlayın.",
                      "Access kısmından erişmesini istediğiniz Base'leri (veritabanlarını) seçin.",
                      "Oluşturulan Access Token (pat.xxx...) kodunu kopyalayarak buraya yapıştırın."
                    ]
                  }
                },
                {
                  id: "zoom",
                  name: "Zoom Meetings",
                  app: "Zoom",
                  icon: Globe,
                  color: "text-[#2D8CFF]",
                  placeholder: "Zoom Server-to-Server OAuth Credentials",
                  guide: {
                    title: "Zoom Server-to-Server OAuth Credentials Alımı",
                    steps: [
                      "marketplace.zoom.us adresine gidin ve geliştirici hesabınızla giriş yapın.",
                      "Develop -> Build App menüsünden 'Server-to-Server OAuth' seçeneğini seçip oluşturun.",
                      "App Credentials sekmesinden Account ID, Client ID ve Client Secret değerlerini kopyalayın.",
                      "Otomatik toplantı odası açma ve takvim oluşturma özellikleri için buraya kaydedin."
                    ]
                  }
                },
                {
                  id: "database_sql",
                  name: "SQL Veritabanı (Postgres / MySQL)",
                  app: "SQL DB",
                  icon: Database,
                  color: "text-amber-500",
                  placeholder: "postgresql://user:pass@host:port/dbname",
                  guide: {
                    title: "PostgreSQL & MySQL Bağlantı Metni Alımı",
                    steps: [
                      "Uzak veya yerel veritabanı sunucunuzun bağlantı parametrelerini hazırlayın.",
                      "Güvenlik için sadece gerekli tablolara erişimi olan kısıtlı bir DB User oluşturun (örn: starwebflow_reader).",
                      "Sunucunuzun güvenlik duvarında (firewall) StarWebflow sunucu IP adreslerine erişim izni (whitelist) verin.",
                      "Standart Connection String metnini (postgresql://... veya mysql://...) buraya yapıştırarak kaydedin."
                    ]
                  }
                },
                {
                  id: "http_request",
                  name: "Özel HTTP İstekleri (Custom Request)",
                  app: "HTTP Client",
                  icon: Activity,
                  color: "text-emerald-400",
                  placeholder: "Custom Bearer Token / API Secret Key",
                  guide: {
                    title: "Özel HTTP / REST API Header Tanımlama Adımları",
                    steps: [
                      "Kimlik Doğrulama Tipi Belirleme: Bağlanmak istediğiniz dış sistemin API dökümanlarını inceleyin. API genelde 'Bearer Token' (Örn: Authorization: Bearer <token>), 'API Key' (Örn: X-API-Key: <key>) veya 'Basic Auth' (Kullanıcı Adı ve Şifre) yöntemlerinden birini kullanır.",
                      "Credential Tanımlama: Yukarıdaki alana sadece gizli anahtarınızı veya şifrenizi girin. Örneğin, Bearer token kullanıyorsanız sadece token değerini (Örn: eyJhbGciOi...) buraya yapıştırın.",
                      "Header Parametresi Ekleme: Akış yöneticisindeki (ReactFlow Builder) 'HTTP Node' ayarlar paneline gidin. İstek metodunu (GET, POST, PUT, DELETE) ve hedef URL'yi girin.",
                      "Anahtarı Bağlama: HTTP Node ayarlarında 'Header Ekle' seçeneğine tıklayın. Key alanına API'nin beklediği başlığı (Örn: 'Authorization' veya 'X-API-Key'), Value kısmına ise sistemimizden otomatik çekilmesini sağlamak için '{{credentials.http_request}}' yazın. Bearer kullanıyorsanız 'Bearer {{credentials.http_request}}' olarak formatlayın.",
                      "İsteği Test Etme: Akışınızı kaydetmeden önce 'HTTP İsteğini Test Et' butonuna basarak gelen 200 OK yanıtını ve JSON çıktısını doğrulayın."
                    ]
                  }
                }
              ].map(integration => {
                const Icon = integration.icon;
                const isConnected = !!connectedCredentials[integration.id];
                const keyVal = tempKeys[integration.id] || connectedCredentials[integration.id] || "";
                
                return (
                  <div key={integration.id} className="bg-[#05050A] border border-white/[0.05] rounded-xl p-4 space-y-3 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <Icon className={`w-4.5 h-4.5 ${integration.color}`} />
                        </div>
                        <div>
                          <span className="text-white font-bold text-xs block">{integration.name}</span>
                          <span className={`text-[9px] font-bold ${isConnected ? 'text-emerald-400' : 'text-[#64748B]'}`}>
                            {isConnected ? '● AKTİF BAĞLANTI' : '○ AKTİF DEĞİL'}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setActiveIntegrationGuide(integration.guide)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold border border-white/10 transition-colors flex items-center gap-1"
                      >
                        Nasıl Yapılır? <Info className="w-2.5 h-2.5 text-[#94A3B8]" />
                      </button>
                    </div>

                    <div className="flex gap-2 items-center">
                      <input 
                        type="password"
                        value={keyVal}
                        placeholder={integration.placeholder}
                        onChange={(e) => setTempKeys({ ...tempKeys, [integration.id]: e.target.value })}
                        className="flex-1 bg-black/40 border border-white/10 text-xs rounded-lg px-3 py-2 text-white font-mono placeholder:text-[#64748B] focus:outline-none focus:border-[#4F8EF7] transition-colors"
                      />
                      {isConnected ? (
                        <button 
                          onClick={() => {
                            const copy = { ...connectedCredentials };
                            delete copy[integration.id];
                            setConnectedCredentials(copy);
                            setTempKeys({ ...tempKeys, [integration.id]: "" });
                          }}
                          className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold border border-rose-500/20 transition-all shrink-0"
                        >
                          Bağlantıyı Kes
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if(!keyVal) return alert("Lütfen geçerli bir anahtar girin.");
                            setConnectedCredentials({ ...connectedCredentials, [integration.id]: keyVal });
                            alert(`${integration.name} bağlantısı başarıyla kuruldu!`);
                          }}
                          className="px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] text-[10px] font-bold border border-emerald-500/20 transition-all shrink-0"
                        >
                          Bağla
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {activeTab === "logs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-in fade-in">
          <div className="col-span-1 lg:col-span-1 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-white/[0.05] bg-white/[0.02]">
              <h3 className="text-white font-semibold">Son Loglar</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {logs.map((l: any) => (
                <button 
                  key={l.id} 
                  onClick={() => setSelectedLog(l)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedLog?.id === l.id 
                      ? "bg-white/[0.05] border-white/[0.1]" 
                      : "border-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-[#94A3B8]">{l.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.status === 'SUCCESS' ? 'text-[#10B981] bg-[#10B981]/10' : 'text-rose-500 bg-rose-500/10'}`}>{l.status}</span>
                  </div>
                  <div className="text-sm text-white font-medium truncate mb-1">{l.flow}</div>
                  <div className="flex justify-between items-center text-xs text-[#64748B]">
                    <span>{l.time}</span>
                    <span>{l.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden h-[600px] flex flex-col relative">
            {!selectedLog ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
                <Terminal className="w-12 h-12 mb-4 opacity-30" />
                <p>Detayları görmek için bir log seçin.</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-white/[0.05] bg-white/[0.02] flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      Detaylar: <span className="text-[#4F8EF7] font-mono">{selectedLog.id}</span>
                    </h3>
                  </div>
                  <button className="text-[#94A3B8] hover:text-white" title="Kopyala"><Copy className="w-4 h-4" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 font-mono text-sm bg-[#05050A]">
                  <div className="mb-6">
                    <div className="text-[#64748B] mb-2">// Request Payload</div>
                    <pre className="text-[#10B981] bg-black/40 p-4 rounded-xl border border-white/[0.05] overflow-x-auto">
                      {JSON.stringify(selectedLog.req, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[#64748B] mb-2">// Response / Error</div>
                    <pre className={`${selectedLog.status === 'SUCCESS' ? 'text-amber-400' : 'text-rose-400'} bg-black/40 p-4 rounded-xl border border-white/[0.05] overflow-x-auto`}>
                      {JSON.stringify(selectedLog.res, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-xl w-full shadow-2xl relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#4F8EF7]/30 border-t-[#4F8EF7] rounded-full animate-spin mb-4"></div>
                <p className="text-[#4F8EF7] font-bold animate-pulse">Yapay Zeka Akışı Kuruyor...</p>
                <p className="text-xs text-[#94A3B8] mt-2">Düğümler oluşturuluyor, mantık bağlanıyor</p>
              </div>
            )}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#4F8EF7]/5 to-transparent">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4F8EF7]" /> AI ile Otomasyon Kur
              </h3>
              <p className="text-sm text-[#94A3B8] mt-1">Sistemin ne yapmasını istediğinizi doğal dille anlatın.</p>
            </div>
            
            {/* Quick AI Suggestions */}
            <div className="px-6 pt-4">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-bold mb-2">Önerilen Otomasyon İstekleri</span>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1 select-none">
                {[
                  {
                    title: "Müşteri Mail Attığında AI Destek ve WhatsApp Bildirimi",
                    text: "Müşteri mail attığında, gelen mail içeriğini Star AI ile oku ve analiz et. Eğer acil destek talebi ise WhatsApp üzerinden yetkiliye acil durum bildirimi gönder, ayrıca müşteriye otomatik bekleme maili at."
                  },
                  {
                    title: "Teklif Onayında Sözleşme ve Proje Başlatma",
                    text: "Yeni teklif onaylandığında (trigger), CRM üzerinde otomatik proje başlat, sonrasında müşteriye hoşgeldiniz e-postası gönder ve 24 saat sonra ilk onboarding görevini aç."
                  },
                  {
                    title: "Tahsilat Takibi ve Proje Duraklatma",
                    text: "Zamanlanmış günlük tetikleyici (Cron) çalıştır, vadesi geçen faturaları kontrol et, eğer ödenmeyen fatura varsa Admin Approval onayı iste, onaylanırsa müşteriye WhatsApp uyarısı at ve CRM'de projeyi pasife al."
                  },
                  {
                    title: "Form Yanıtından Potansiyel Müşteri Skorlama",
                    text: "Typeform üzerinden yeni form yanıtı geldiğinde (trigger), Star AI ile gelen şirketi analiz et ve skorla. Eğer skor yüksekse CRM'de yeni lead kaydı aç, Slack üzerinden satış ekibine bildirim gönder."
                  }
                ].map((s, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setPromptText(s.text)}
                    className="p-2 border border-white/5 hover:border-[#4F8EF7]/30 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl text-left cursor-pointer transition-colors text-xs"
                  >
                    <span className="text-white font-bold block mb-0.5">{s.title}</span>
                    <span className="text-[#94A3B8] text-[10px] line-clamp-1">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              <textarea 
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                className="w-full h-24 bg-white/5 border border-white/10 text-white rounded-xl p-4 focus:outline-none focus:border-[#4F8EF7] transition-colors resize-none text-sm leading-relaxed"
                placeholder="Örn: Yeni bir teklif onaylandığında, müşteriye teşekkür emaili at, Projeler panosunda yeni proje aç..."
              />
            </div>
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#05050A]">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                İptal
              </button>
              <button 
                onClick={async () => {
                  if(!promptText) return alert("Lütfen otomasyon isteğinizi yazın.");
                  setIsGenerating(true);
                  try {
                    const result = await generateFlowFromPrompt(promptText);
                    if (result.success && result.nodes) {
                      const words = promptText.split(/\s+/).slice(0, 3).join(" ");
                      const flowName = `AI: ${words}...`;
                      
                      // Düğümleri zenginleştir (React bileşenleri/fonksiyonları barındırmaz, sadece string/primitive veri tutar)
                      const enrichedNodes = result.nodes.map((node: any) => {
                        const style = appConfigs[node.app] || appConfigs["Custom"];
                        return {
                          ...node,
                          icon: node.app, // Store app name string instead of React Icon function
                          color: style.color,
                          bg: style.bg,
                          config: {}
                        };
                      });

                      const aiFlow = {
                        tenantId: 'default-tenant',
                        name: flowName,
                        description: promptText,
                        status: "ACTIVE",
                        nodes: enrichedNodes
                      };
                      
                      const createdResponse = await createAutomationFlow(aiFlow);
                      if (createdResponse.success && createdResponse.data) {
                        setFlows(prev => [createdResponse.data, ...prev]);
                        setEditingFlow(createdResponse.data);
                        setIsAddModalOpen(false);
                        setPromptText("");
                      } else {
                        alert("Yapay zeka akışı veritabanına kaydedilirken bir hata oluştu.");
                      }
                    } else {
                      alert(result.error || "Yapay zeka akışı oluşturulurken bir hata oluştu.");
                    }
                  } catch (error) {
                    console.error("Failed to generate AI flow:", error);
                    alert("Yapay zeka akışı oluşturulurken bir hata oluştu.");
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8EF7] to-indigo-600 text-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(79,142,247,0.3)] text-sm font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Yapay Zeka ile Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFlow && (
        <ReactFlowBuilder 
          initialFlow={editingFlow}
          onSave={async (updatedFlow) => {
            const newFlow = { ...editingFlow, ...updatedFlow };
            try {
              const res = await updateAutomationFlow(newFlow.id, newFlow);
              setFlows(prev => prev.map(f => f.id === newFlow.id ? res.data : f));
              setEditingFlow(null);
            } catch (err) {
              console.error(err);
              alert("Güncelleme başarısız!");
            }
          }}
          onCancel={() => setEditingFlow(null)}
          onTest={runFlowSimulation}
        />
      )}

      {/* DRY RUN / TEST SIMULATION MODAL */}
      {isTestingFlow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col h-[450px]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-900/10 to-transparent flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400 animate-pulse" />
                Otomasyon Test Modu (Dry Run)
              </h3>
              <button 
                onClick={() => setIsTestingFlow(false)} 
                disabled={isTestingRunning}
                className="text-[#64748B] hover:text-white transition-colors disabled:opacity-30"
              >
                Kapat
              </button>
            </div>
            
            <div className="flex-1 p-6 bg-black/60 font-mono text-xs overflow-y-auto space-y-2 text-[#10B981] select-none scrollbar-thin">
              {testLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                  log.includes("🟢") ? "text-emerald-400 font-bold" : 
                  log.includes("⚡") ? "text-amber-400" :
                  log.includes("✅") ? "text-emerald-500 pl-4" : 
                  "text-[#E2E8F0]"
                }`}>
                  {log}
                </div>
              ))}
              {isTestingRunning && (
                <div className="flex items-center gap-2 text-[#64748B] pt-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                  <span>İşlem yürütülüyor...</span>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/5 flex justify-end bg-[#05050A]">
              <button
                disabled={isTestingRunning}
                onClick={() => setIsTestingFlow(false)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold disabled:opacity-50 transition-colors"
              >
                Testi Bitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration Credentials Guide Popup Modal */}
      {activeIntegrationGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#05050A]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                {activeIntegrationGuide.title}
              </h3>
              <button onClick={() => setActiveIntegrationGuide(null)} className="text-[#64748B] hover:text-white transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#94A3B8] leading-relaxed">
              <p className="text-white font-medium text-xs mb-2">Lütfen aşağıdaki adımları takip ederek entegrasyon anahtarınızı (API Key / Token) temin edin:</p>
              <div className="space-y-3">
                {activeIntegrationGuide.steps.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-[#E2E8F0]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#05050A]">
              <span className="text-[10px] text-[#64748B]">StarWebflow Entegrasyon Yardımcısı</span>
              <button 
                onClick={() => setActiveIntegrationGuide(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#4F8EF7] text-white hover:opacity-90 transition-all text-xs font-bold"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
