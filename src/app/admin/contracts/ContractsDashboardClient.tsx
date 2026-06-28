"use client";

import { useState } from "react";
import { 
  FileSignature, Search, Plus, Filter, 
  CheckCircle2, Clock, AlertTriangle, Eye,
  Download, MoreVertical, FileText, Wand2, History, PenTool,
  Trash2, Settings, PlusCircle, LayoutList
} from "lucide-react";

import { createContract, updateContractStatus, updateContract, deleteContract, generatePflichtenheftFromLastenheft, generateLastenheftFromChoices, generateOfficialContract } from "@/app/actions/contract";
import { sendContractToClient } from "@/app/actions/dispatch";
import { CURRENCIES, formatCurrency } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

function renderMarkdownToHtmlSimple(md: string): string {
  if (!md) return "";
  
  let html = md
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-slate-900 border-b pb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-slate-800 border-b pb-1">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-700">$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc my-1">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return html;
}

const WIZARD_NEEDS: Record<string, string[]> = {
  WEB: [
    "Sub-second (saniye altı) sayfa hızı ve yüksek performans",
    "SEO Uyumlu Arama Motoru Optimizasyonu",
    "Mobil Öncelikli & Responsive Arayüz Tasarımı",
    "Modern Outfit & Inter yazı tipi entegrasyonu",
    "İletişim Formları ve Lead Yakalama modülleri"
  ],
  SAAS: [
    "Gelişmiş Admin Yönetim Paneli",
    "Kullanıcı Rolleri ve Yetkilendirme Sistemi (RBAC)",
    "Stripe veya yerel ödeme kanalları entegrasyonu",
    "Veri Tablosu filtreleme, dışa aktarma (Excel/CSV)",
    "Gerçek zamanlı bildirimler ve veri akışı"
  ],
  AGENTS: [
    "CRM ve Müşteri İlişkileri Entegrasyonu",
    "7/24 Otonom Dijital Destek Asistanı",
    "Doğal Dil Anlama (NLU) ve Akıllı Karar Verme",
    "Gemini & GPT LLM API entegrasyonu",
    "Kullanıcı veritabanı ile entegre hafıza (Memory) sistemi"
  ],
  AUTOMATION: [
    "n8n iş akışı otomasyonu kurulumu ve yönetimi",
    "API ve Webhook entegrasyonları",
    "Otomatik faturalama veya veri senkronizasyonu",
    "Manuel işleri 10 kat hızlandıracak veri işleme robotları",
    "E-posta veya Slack bildirim akışları"
  ],
  MARKETING: [
    "Yapay zeka destekli kreatif tasarımlar",
    "ROAS odaklı Meta (Facebook/Instagram) reklam yönetimi",
    "ROAS odaklı Google Ads reklam kampanya yönetimi",
    "Haftalık içerik planlama ve otomatik paylaşım",
    "Aylık performans ve bütçe verimliliği raporu"
  ]
};

const CONTRACT_TEMPLATES: Record<string, string> = {
  NDA: `### **GİZLİLİK SÖZLEŞMESİ (NON-DISCLOSURE AGREEMENT)**

**Sözleşme Tarihi:** [GG.AA.YYYY]
**Sözleşme No:** [Sözleşme Numarası, örn: ANKA-NDA-2024-01]

---

#### **TARAFLAR**

**1. BİLGİ SAHİBİ (Müşteri):**
*   **Unvanı:** [Müşteri / Kurum Adı]
*   **E-Posta:** [Müşteri E-Posta]
*   (Bundan sonra "**Müşteri**" olarak anılacaktır.)

**2. BİLGİ ALAN (Yazılım Geliştirici):**
*   **Unvanı:** StarWebFlow
*   **E-Posta:** info@starwebflow.com
*   (Bundan sonra "**StarWebFlow**" veya "**Hizmet Sağlayıcı**" olarak anılacaktır.)

---

#### **MADDE 1: SÖZLEŞMENİN KONUSU VE AMACI**
**1.1. Amaç:** İşbu sözleşmenin amacı, Müşteri tarafından yürütülmesi planlanan projenin değerlendirilmesi, tekliflendirilmesi ve gerçekleştirilmesi amacıyla, Müşteri tarafından StarWebFlow'a ifşa edilecek olan gizli bilgilerin korunmasına yönelik hüküm ve koşulları belirlemektir.
**1.2. Proje Ön Bilgisi:** Proje kapsamında yapılacak işlerin bütçesi [Bütçe Tutar] olarak öngörülmüştür.

#### **MADDE 2: GİZLİ BİLGİNİN TANIMI VE KAPSAMI**
**2.1. Tanım:** "Gizli Bilgi", Müşteri tarafından StarWebFlow'a sağlanan, kamuya açık olmayan her türlü bilgi, veri ve belgeyi ifade eder.
**2.2. Kapsam:** Gizli Bilgi; Next.js mimarisi, sub-second hız hedefleri, kullanılan fontlar/tasarım sistemleri, teknik SEO stratejileri, kaynak kodları, API anahtarları ve veritabanı şemaları dahil tüm teknik ve ticari unsurları kapsar.

#### **MADDE 3: TARAFLARIN YÜKÜMLÜLÜKLERİ**
**3.1. Gizlilik:** StarWebFlow, edinilen Gizli Bilgi'yi büyük bir özenle korumayı ve yetkisiz üçüncü şahıslarla paylaşmamayı taahhüt eder.
**3.2. Süre:** Gizlilik yükümlülükleri, sözleşmenin sona ermesinden itibaren beş (5) yıl boyunca geçerli kalacaktır.
**3.3. Cezai Şart:** StarWebFlow'un sözleşmeyi ihlal etmesi durumunda, Müşteri'nin uğradığı doğrudan zararların tazmininin yanı sıra 10.000 EUR cezai şart ödemeyi kabul eder.

---

**Müşteri Adına**
**İmza:**

---

**StarWebFlow Adına**
**İmza:**`,

  SLA: `### **HİZMET SEVİYESİ SÖZLEŞMESİ (SERVICE LEVEL AGREEMENT - SLA)**

**Sözleşme Tarihi:** [GG.AA.YYYY]
**Sözleşme No:** [Sözleşme Numarası, örn: ANKA-SLA-2024-01]

---

#### **TARAFLAR**
*   **Hizmet Alan (Müşteri):** [Müşteri / Kurum Adı] (Bundan sonra "**Müşteri**" olarak anılacaktır.)
*   **Hizmet Sağlayıcı:** StarWebFlow (Bundan sonra "**StarWebFlow**" olarak anılacaktır.)

---

#### **MADDE 1: HİZMET KAPSAMI**
Bu sözleşme, StarWebFlow tarafından Müşteri'ye sunulacak olan bakım, teknik destek, sunucu yönetimi ve güvenlik güncelleme hizmetlerinin standartlarını belirler.

#### **MADDE 2: DESTEK VE YANIT SÜRELERİ**
- **Kritik Arızalar (Çalışmayı Engelleyen):** Maksimum 2 saat içinde yanıt, 12 saat içinde çözüm.
- **Normal Hatalar (Kısmen Engelleyen):** Maksimum 6 saat içinde yanıt, 24 saat içinde çözüm.
- **Düşük Öncelikli Talepler:** Maksimum 24 saat içinde yanıt ve planlama.

#### **MADDE 3: UPTIME VE ERİŞİLEBİLİRLİK GARANTİSİ**
StarWebFlow, barındırma altyapısının aylık bazda minimum %99.9 oranında kesintisiz çalışacağını taahhüt eder. Aksi durumlarda hizmet bedeli iade koşulları devreye girer.

#### **MADDE 4: BEDEL VE FATURALANDIRMA**
Hizmet bedeli aylık [Bütçe Tutar] veya toplam tutar üzerinden faturalandırılacaktır. Ödemeler fatura tarihinden itibaren 14 gün içinde yapılmalıdır.

---

**Müşteri Adına**
**İmza:**

---

**StarWebFlow Adına**
**İmza:**`,

  LASTENHEFT: `### **İŞ GEREKSİNİMLERİ DÖKÜMANI (LASTENHEFT)**

**Proje Sahibi (Müşteri):** [Müşteri / Kurum Adı]
**Yazılım Yüklenicisi:** StarWebFlow

---

#### **1. PROJENİN AMACI VE HEDEFLERİ**
Müşteri tarafından talep edilen projenin temel hedefleri, iş süreçleri ve sistem gereksinimleri bu dökümanda özetlenmiştir.

#### **2. İŞLEVSEL GEREKSİNİMLER (FUNCTIONAL REQUIREMENTS)**
- Kullanıcıların güvenli kayıt, e-posta doğrulama ve şifre sıfırlama işlemlerini yapabilmesi.
- Müşterilerin faturalarını Stripe entegrasyonu üzerinden kredi kartı ile güvenle ödeyebilmesi.

#### **3. PERFORMANS VE ARAYÜZ GEREKSİNİMLERİ**
- Next.js ve Tailwind CSS kullanılarak modern, premium ve responsive tasarım yapılması.
- Sub-second (saniye altı) sayfa yüklenme sürelerine ve yüksek SEO puanlarına ulaşılması.`,

  PFLICHTENHEFT: `### **TEKNİK ŞARTNAME & UYGULAMA PLANI (PFLICHTENHEFT)**

**Yazılım Yüklenicisi:** StarWebFlow
**Müşteri (Hizmet Alan):** [Müşteri / Kurum Adı]

---

#### **1. SİSTEM MİMARİSİ VE TEKNİK DETAYLAR**
İşbu döküman, Müşteri'den gelen Lastenheft gereksinimlerinin StarWebFlow tarafından teknik olarak nasıl hayata geçirileceğini tanımlar.

- **Teknoloji:** Next.js (App Router), Prisma ORM, PostgreSQL.
- **Güvenlik:** API girdilerinde Zod şema doğrulaması, CORS/CSRF filtreleri ve Stripe Webhook imza zorunluluğu.
- **E-posta:** Resend e-posta dağıtım sistemi ve şablon yönetimi.

#### **2. FAZLAR VE TESLİMAT PLANI**
- **Faz 1 (Veritabanı & API):** DB şemasının oluşturulması ve entegrasyon testleri.
- **Faz 2 (Arayüz & Entegrasyonlar):** Stripe ödeme ve doğrulama sayfalarının tamamlanması.
- **Faz 3 (Canlıya Çıkış):** Güvenlik sertifikalarının yüklenmesi ve teslimat.

#### **3. KABUL KRİTERLERİ**
Sözleşme konusu projenin nihai teslimi, tüm birim testlerinin ve güvenlik taramalarının (tip doğruluğu dahil) hatasız geçmesiyle gerçekleşecektir.`,
  MSA: `### **ANA HİZMET SÖZLEŞMESİ (MASTER SERVICE AGREEMENT)**

**Sözleşme Tarihi:** [GG.AA.YYYY]
**Sözleşme No:** [Sözleşme Numarası]

---

#### **1. SÖZLEŞMENİN AMACI VE KAPSAMI**
İşbu sözleşme, Müşteri'nin talebi doğrultusunda Hizmet Sağlayıcı tarafından geliştirilecek yazılım/web/dijital projenin ("Proje") genel sınırlarını, yasal yükümlülüklerini, ödeme koşullarını ve teslimat süreçlerini kapsar. Bu sözleşme, projeye ait detaylı teknik gereksinimleri içeren **Lastenheft** ve **Pflichtenheft** dokümanlarını ayrılmaz bir ek (Ek-1 ve Ek-2) olarak kabul eder ve tüm bu belgeleri tek bir yasal çatı altında toplar.

#### **2. TARAFLARIN YÜKÜMLÜLÜKLERİ**
**2.1. Hizmet Sağlayıcı'nın Yükümlülükleri:**
- Projeyi, onaylanmış Pflichtenheft dokümanında belirtilen teknik özelliklere ve zaman çizelgesine uygun olarak geliştirmek ve teslim etmek.
- Geliştirme süreci boyunca Müşteri'yi düzenli olarak (haftalık/aylık) bilgilendirmek.
- Teslimattan sonraki [Belirlenen Süre] boyunca teknik destek ve hata (bug) düzeltme hizmeti sağlamak.

**2.2. Müşteri'nin Yükümlülükleri:**
- Proje geliştirimi için gerekli olan tüm materyalleri (logo, metin, sunucu erişim bilgileri vb.) zamanında ve eksiksiz olarak teslim etmek.
- Teslim edilen fazları zamanında incelemek ve onay/ret bildirimini [X] iş günü içinde yapmak.
- Belirlenen ödeme takvimine eksiksiz uymak.

#### **3. SINIRLAR VE EK TALEPLER (SCOPE CREEP)**
- İşbu sözleşme kapsamı, yalnızca ekte sunulan (veya önceden imzalanan) Pflichtenheft dokümanı ile sınırlıdır.
- Sözleşme imzalandıktan sonra Müşteri tarafından talep edilecek her türlü yeni özellik, tasarım değişikliği veya ek fonksiyon, "Ek Talep (Change Request)" olarak değerlendirilecek olup, ayrıca fiyatlandırılacak ve zaman çizelgesine eklenecektir.

#### **4. FİKRİ MÜLKİYET VE GİZLİLİK**
- Sözleşme bedelinin tamamının ödenmesi şartıyla, Müşteri'ye özel olarak geliştirilen yazılımın kullanım hakları Müşteri'ye devredilir.
- Hizmet Sağlayıcı'nın kendi mülkiyetinde olan ve önceden geliştirdiği standart kütüphaneler veya altyapılar (Background IP) Müşteri'ye devredilmez, ancak Müşteri'ye projede kullanması için kalıcı, devredilemez bir lisans verilir.
- Taraflar, proje kapsamında birbirlerinden edindikleri ticari veya teknik sırları (Gizlilik Sözleşmesi - NDA kuralları çerçevesinde) 3. şahıslarla paylaşamazlar.

#### **5. KABUL VE TESLİMAT**
Projenin canlı ortama alınması veya Müşteri sunucularına kurulması ile teslimat gerçekleşmiş sayılır. Müşteri, teslimat sonrası [X] iş günü içinde itiraz etmezse proje kabul edilmiş sayılır.`
};

export const handlePrintContract = (contract: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const contentHtml = contract.content || "";
  
  const docType = contract.type || "LASTENHEFT";
  const docNo = contract.contractNo || contract.id || "TASLAK-001";
  const dateStr = contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');
  const validUntilStr = contract.validUntil ? new Date(contract.validUntil).toLocaleDateString('tr-TR') : 'Süresiz';
  const clientName = contract.clientName || 'Müşteri';
  const clientEmail = contract.clientEmail || '-';
  const valStr = contract.value ? `${Number(contract.value).toLocaleString('tr-TR')} ${contract.currency || 'TRY'}` : 'Belirtilmedi';

  printWindow.document.write(`
    <html>
      <head>
        <title>${contract.title || 'Sözleşme'}</title>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 0;
          }
          .font-signature {
            font-family: 'Playfair Display', serif;
            font-style: italic;
          }
          @media print {
            body {
              background: #ffffff;
              color: #000000;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body class="p-12 max-w-4xl mx-auto">
        <div class="no-print mb-8 flex justify-end gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm">
            PDF Olarak Kaydet / Yazdır
          </button>
          <button onclick="window.close()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer">
            Kapat
          </button>
        </div>

        <div class="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">STARWEBFLOW</h1>
            <p class="text-xs text-slate-500 max-w-xs mt-1">Musterstr. 1, 12345 Berlin, Germany<br/>info@starwebflow.com | www.starwebflow.com</p>
          </div>
          <div class="text-right">
            <h2 class="text-3xl font-light text-slate-400 uppercase tracking-widest">${docType}</h2>
            <p class="text-xs text-slate-600 mt-2 font-mono">Belge No: ${docNo}</p>
            <p class="text-xs text-slate-600 font-mono">Tarih: ${dateStr}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8 text-sm bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">HİZMET SAĞLAYICI</h3>
            <p class="font-semibold text-slate-800">StarWebFlow Gmbh</p>
            <p class="text-slate-600 text-xs">Musterstr. 1, 12345 Berlin</p>
            <p class="text-slate-600 text-xs">Steuernummer: 12/345/67890</p>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">MÜŞTERİ / ALICI</h3>
            <p class="font-semibold text-slate-800">${clientName}</p>
            <p class="text-slate-600 text-xs">${clientEmail}</p>
            <p class="text-slate-600 text-xs">Sözleşme Tutarı: ${valStr}</p>
            <p class="text-slate-600 text-xs">Geçerlilik: ${validUntilStr}</p>
          </div>
        </div>

        <div class="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mb-16">
          ${renderMarkdownToHtmlSimple(contentHtml)}
        </div>

        <div class="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-sm">
          <div class="text-center">
            <p class="text-slate-500 mb-8">Hizmet Sağlayıcı İmza</p>
            <div class="h-12 flex items-center justify-center">
              <span class="font-signature text-2xl text-blue-600">StarWebFlow</span>
            </div>
            <p class="font-semibold text-slate-800 mt-2">StarWebFlow Gmbh</p>
            <p class="text-xs text-slate-400 mt-1">Dijital Olarak İmzalandı</p>
          </div>
          <div class="text-center">
            <p class="text-slate-500 mb-8">Alıcı / Müşteri İmza</p>
            <div class="h-12 flex items-center justify-center">
              ${contract.status === 'SIGNED' || contract.status === 'signed' ? '<span class="font-signature text-2xl text-emerald-600">' + clientName + '</span>' : '<span class="text-slate-300 font-light italic">İmza Bekliyor</span>'}
            </div>
            <p class="font-semibold text-slate-800 mt-2">${clientName}</p>
            <p class="text-xs text-slate-400 mt-1">
              ${contract.status === 'SIGNED' || contract.status === 'signed' ? 'Dijital Olarak Onaylandı' : 'İmza Bekliyor'}
            </p>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

export default function ContractsDashboardClient({ initialContracts }: { initialContracts: any[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "signed" | "expiring" | "tasks">("all");
  
  // Task Templates State
  const [taskTemplates, setTaskTemplates] = useState<Record<string, {id: string, title: string, priority: string}[]>>({
    LASTENHEFT: [{id: '1', title: 'Gereksinim analizi dokümantasyonu', priority: 'HIGH'}],
    PFLICHTENHEFT: [{id: '2', title: 'Veritabanı şeması tasarımı', priority: 'HIGH'}, {id: '2b', title: 'Geliştirme ortamı kurulumu', priority: 'HIGH'}],
    SLA: [{id: '3', title: 'Müşteri paneli erişimi sağlama', priority: 'HIGH'}, {id: '3b', title: 'Sunucu uptime aracı kurulumu', priority: 'MEDIUM'}],
    NDA: [{id: '4', title: 'İmzalı belgelerin şifreli arşive alınması', priority: 'LOW'}],
    SEO: [{id: '5', title: 'Anahtar kelime araştırması', priority: 'HIGH'}, {id: '6', title: 'On-page optimizasyonu', priority: 'HIGH'}],
    MAINTENANCE: [{id: '7', title: 'Sunucu uptime izleme kurulumu', priority: 'HIGH'}, {id: '7b', title: 'Aylık raporlama takvimi oluşturma', priority: 'MEDIUM'}],
    SOCIAL: [{id: '8', title: 'Sosyal medya hesaplarına erişim', priority: 'HIGH'}, {id: '8b', title: 'Aylık içerik planı hazırlığı', priority: 'MEDIUM'}],
    MSA: [{id: '9', title: 'Proje başlangıç toplantısı (Kick-off)', priority: 'HIGH'}, {id: '9b', title: 'Sözleşme kapsamı ve kilometre taşları oluşturma', priority: 'HIGH'}]
  });
  
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>("SEO");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [contracts, setContracts] = useState<any[]>(initialContracts);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [newContractData, setNewContractData] = useState({ title: "", clientName: "", clientEmail: "", type: "LASTENHEFT", serviceType: "WEB", value: "", currency: "TRY" });
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Wizard (AI Generator) States
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState({
    clientName: "",
    clientEmail: "",
    title: "",
    budget: "",
    currency: "TRY",
    serviceType: "WEB",
    selectedNeeds: [] as string[],
    customNotes: "",
    lastenheftContent: "",
    pflichtenheftContent: "",
    officialContractContent: ""
  });
  const [generatingLastenheft, setGeneratingLastenheft] = useState(false);
  const [generatingPflichtenheft, setGeneratingPflichtenheft] = useState(false);
  const [generatingContract, setGeneratingContract] = useState(false);

  // Edit states for unified Viewer/Editor Modal
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSignedPdfUrl, setEditSignedPdfUrl] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editCurrency, setEditCurrency] = useState("TRY");
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editType, setEditType] = useState("LASTENHEFT");
  const [editClientName, setEditClientName] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [modalTab, setModalTab] = useState<"edit" | "preview" | "pdf">("edit");

  const handleWizardGenerateLastenheft = async () => {
    if (!wizardData.clientName || !wizardData.title) {
      alert("Lütfen Müşteri Adı ve Proje Başlığı alanlarını doldurun.");
      return;
    }
    setGeneratingLastenheft(true);
    try {
      const res = await generateLastenheftFromChoices({
        serviceType: wizardData.serviceType,
        clientName: wizardData.clientName,
        title: wizardData.title,
        budget: wizardData.budget,
        currency: wizardData.currency,
        selectedNeeds: wizardData.selectedNeeds,
        customNotes: wizardData.customNotes
      });
      if (res.success && res.data) {
        setWizardData(prev => ({ ...prev, lastenheftContent: res.data || "" }));
        setWizardStep(2);
      } else {
        alert(res.error || "Lastenheft üretilirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setGeneratingLastenheft(false);
    }
  };

  const handleWizardGeneratePflichtenheft = async () => {
    if (!wizardData.lastenheftContent) {
      alert("Lütfen önce Lastenheft içeriğinin hazır olduğundan emin olun.");
      return;
    }
    setGeneratingPflichtenheft(true);
    try {
      const res = await generatePflichtenheftFromLastenheft(wizardData.lastenheftContent);
      if (res.success && res.data) {
        setWizardData(prev => ({ ...prev, pflichtenheftContent: res.data || "" }));
      } else {
        alert(res.error || "Pflichtenheft üretilirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setGeneratingPflichtenheft(false);
    }
  };

  const handleWizardGenerateContract = async () => {
    if (!wizardData.lastenheftContent || !wizardData.pflichtenheftContent) {
      alert("Sözleşme üretebilmek için hem Lastenheft hem de Pflichtenheft dökümanlarının hazırlanmış olması gerekir.");
      return;
    }
    setGeneratingContract(true);
    try {
      const res = await generateOfficialContract({
        lastenheft: wizardData.lastenheftContent,
        pflichtenheft: wizardData.pflichtenheftContent,
        clientName: wizardData.clientName,
        title: wizardData.title,
        value: wizardData.budget ? Number(wizardData.budget) : undefined,
        currency: wizardData.currency
      });
      if (res.success && res.data) {
        setWizardData(prev => ({ ...prev, officialContractContent: res.data || "" }));
        setWizardStep(3);
      } else {
        alert(res.error || "Sözleşme üretilirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setGeneratingContract(false);
    }
  };

  const handleWizardSaveContract = async () => {
    if (!wizardData.officialContractContent) {
      alert("Kaydedilecek sözleşme içeriği bulunamadı.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await createContract({
        tenantId: 'default-tenant',
        title: wizardData.title,
        clientName: wizardData.clientName,
        clientEmail: wizardData.clientEmail,
        type: "MSA",
        value: wizardData.budget ? Number(wizardData.budget) : undefined,
        currency: wizardData.currency,
        status: "PENDING"
      });
      if (res.success && res.data) {
        const updated = await updateContract(res.data.id, {
          content: wizardData.officialContractContent
        });
        if (updated.success && updated.data) {
          setContracts(prev => [updated.data, ...prev]);
          setIsGeneratorModalOpen(false);
          setWizardStep(1);
          setWizardData({
            clientName: "",
            clientEmail: "",
            title: "",
            budget: "",
            currency: "TRY",
            serviceType: "WEB",
            selectedNeeds: [],
            customNotes: "",
            lastenheftContent: "",
            pflichtenheftContent: "",
            officialContractContent: ""
          });
          alert("Profesyonel B2B Sözleşmesi başarıyla oluşturuldu ve kaydedildi!");
        } else {
          alert("Sözleşme kaydedildi fakat içerik güncellenemedi.");
        }
      } else {
        alert("Sözleşme oluşturulurken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendContract = async () => {
    if (!selectedContract) return;
    setSending(true);
    try {
      const res = await sendContractToClient(selectedContract.id, 'default-tenant');
      if (res.success) {
        alert(`Sözleşme müşteriye başarıyla iletildi! (${res.method === 'portal' ? 'Müşteri Paneli + E-posta Bildirimi' : 'Doğrudan Detaylı E-posta'})`);
      } else {
        alert(res.error || 'İletim sırasında hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      alert('Sözleşme iletilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePflichtenheft = async () => {
    if (!editContent || editContent.trim() === '') {
      alert("Lütfen önce Lastenheft yasal içeriği kısmına gereksinimleri girin.");
      return;
    }
    setGenerating(true);
    try {
      const res = await generatePflichtenheftFromLastenheft(editContent);
      if (res.success && res.data) {
        setEditContent(res.data);
        setEditType('PFLICHTENHEFT');
        alert("Lastenheft gereksinimleri başarıyla Pflichtenheft teknik şartnamesine dönüştürüldü!");
      } else {
        alert(res.error || "Dönüştürme sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Dönüştürme başarısız oldu.");
    } finally {
      setGenerating(false);
    }
  };

  // Stats
  const totalContracts = contracts.length;
  const pendingContracts = contracts.filter(c => c.status?.toUpperCase() === 'PENDING' || c.status === 'draft').length;
  const signedContracts = contracts.filter(c => c.status?.toUpperCase() === 'SIGNED' || c.status === 'signed').length;
  const expiringContracts = contracts.filter(c => c.status?.toUpperCase() === 'EXPIRING_SOON').length;
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNo?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (contract.clientName || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === "all") return true;
    if (activeTab === "expiring") return contract.status === "EXPIRING_SOON";
    return contract.status.toLowerCase() === activeTab;
  });

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Sözleşmeler & Belgeler
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">SLA, Lastenheft, Pflichtenheft ve Bakım sözleşmelerinin dijital yönetimi.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Firma veya sözleşme no ara..." 
              className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors w-64 placeholder:text-[#64748B]"
            />
          </div>
          <button 
            onClick={() => setIsGeneratorModalOpen(true)}
            className="flex items-center gap-2 bg-[#0A0A0F] border border-white/[0.05] hover:bg-white/[0.02] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
          >
            <Wand2 className="w-4 h-4 text-emerald-400" />
            AI Sözleşme Üret
          </button>
          <button 
            onClick={() => setIsAddContractModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Yeni Sözleşme
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <FileSignature className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Toplam Sözleşme</p>
              <h3 className="text-2xl font-bold text-white">{totalContracts}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">İmza Bekleyen</p>
              <h3 className="text-2xl font-bold text-white">{pendingContracts}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Aktif / İmzalı</p>
              <h3 className="text-2xl font-bold text-white">{signedContracts}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-red-500/20 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-400">Süresi Yaklaşan</p>
              <h3 className="text-2xl font-bold text-red-400">{expiringContracts}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "Tümü" },
              { id: "pending", label: "İmza Bekleyenler" },
              { id: "signed", label: "İmzalanmış" },
              { id: "expiring", label: "Süresi Biten/Bitecek" },
              { id: "tasks", label: "Görev Şablonları (Otomasyon)" },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-[#64748B] hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.1] text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>

        {/* Main Content Area based on Tab */}
        {activeTab === "tasks" ? (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-1/4 space-y-2">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><LayoutList className="w-4 h-4 text-emerald-400" /> Sözleşme Türleri</h3>
                {Object.keys(taskTemplates).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedTemplateType(type)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm border ${
                      selectedTemplateType === type 
                        ? "bg-white/10 text-emerald-400 border-white/20 shadow-lg" 
                        : "bg-[#0A0A0F] text-[#94A3B8] border-white/5 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {type} ({taskTemplates[type]?.length || 0})
                  </button>
                ))}
              </div>
              
              {/* Content */}
              <div className="w-full md:w-3/4">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedTemplateType} Görev Şablonları</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">Bu sözleşme onaylandığında oluşacak Kanban görevleri.</p>
                    </div>
                  </div>
                  
                  {/* Task List */}
                  <div className="space-y-3 mb-8">
                    {taskTemplates[selectedTemplateType]?.length === 0 && (
                      <div className="text-center py-8 text-[#64748B] bg-black/20 rounded-xl border border-white/5 border-dashed">
                        Henüz görev şablonu eklenmemiş.
                      </div>
                    )}
                    {taskTemplates[selectedTemplateType]?.map((task, idx) => (
                      <div key={task.id || idx} className="flex items-center justify-between bg-[#0A0A0F] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">{task.title}</span>
                          <span className={`text-[10px] font-bold mt-1 tracking-wider ${task.priority === 'HIGH' ? 'text-red-400' : task.priority === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'}`}>
                            {task.priority} ÖNCELİK
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setTaskTemplates(prev => ({
                              ...prev,
                              [selectedTemplateType]: prev[selectedTemplateType].filter(t => t.id !== task.id)
                            }))
                          }}
                          className="p-2 text-[#64748B] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Task Form */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex gap-3">
                    <input 
                      type="text" 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Yeni görev başlığı..." 
                      className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <select 
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="HIGH" className="bg-[#0A0A0F]">Yüksek</option>
                      <option value="MEDIUM" className="bg-[#0A0A0F]">Orta</option>
                      <option value="LOW" className="bg-[#0A0A0F]">Düşük</option>
                    </select>
                    <button 
                      onClick={() => {
                        if (!newTaskTitle) return;
                        setTaskTemplates(prev => ({
                          ...prev,
                          [selectedTemplateType]: [
                            ...(prev[selectedTemplateType] || []), 
                            { id: Date.now().toString(), title: newTaskTitle, priority: newTaskPriority }
                          ]
                        }));
                        setNewTaskTitle("");
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] font-semibold text-xs text-[#64748B] uppercase tracking-wider">
                <th className="py-4 px-6">Sözleşme No / Müşteri</th>
                <th className="py-4 px-6">Tür / Proje</th>
                <th className="py-4 px-6">Tutar</th>
                <th className="py-4 px-6">Tarihler</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-sm">
              {filteredContracts.map(contract => (
                <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white flex items-center gap-2 group-hover:text-emerald-400 transition-colors cursor-pointer">
                      <FileText className="w-4 h-4 text-[#64748B]" />
                      {contract.contractNo || contract.id}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">{contract.clientName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold text-white mb-1">
                      {contract.type}
                    </span>
                    <div className="text-xs text-[#64748B] truncate max-w-[200px]">{contract.title}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-white">
                    {contract.value ? formatCurrency(Number(contract.value), contract.currency || 'TRY') : "-"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#64748B]">Oluşturulma:</span>
                        <span className="text-[#94A3B8] font-mono">{new Date(contract.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#64748B]">Bitiş:</span>
                        <span className={`font-mono ${contract.status === 'EXPIRING_SOON' ? 'text-red-400 font-bold' : 'text-[#94A3B8]'}`}>{contract.validUntil ? new Date(contract.validUntil).toLocaleDateString('tr-TR') : 'Süresiz'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      contract.status === 'SIGNED' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
                      contract.status === 'PENDING' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                      'text-red-400 bg-red-400/10 border-red-400/20'
                    }`}>
                      {contract.status === 'SIGNED' ? <CheckCircle2 className="w-3 h-3" /> : 
                       contract.status === 'PENDING' ? <Clock className="w-3 h-3" /> : 
                       <AlertTriangle className="w-3 h-3" />}
                      {contract.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {contract.status === 'PENDING' && (
                        <button 
                          onClick={() => { setSelectedContract(contract); setIsSignModalOpen(true); }}
                          className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors" title="E-İmza ile İmzala"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" title="Versiyon Geçmişi">
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedContract(contract);
                          setEditContent(contract.content || "");
                          setEditTitle(contract.title || "");
                          setEditValue(contract.value ? String(contract.value) : "");
                          setEditCurrency(contract.currency || "TRY");
                          setEditStatus(contract.status || "PENDING");
                          setEditType(contract.type || "LASTENHEFT");
                          setEditClientName(contract.clientName || "");
                          setEditClientEmail(contract.clientEmail || "");
                          setEditSignedPdfUrl(contract.signedPdfUrl || null);
                          setModalTab("edit");
                          setIsViewEditModalOpen(true);
                        }}
                        className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" 
                        title="Görüntüle & Düzenle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePrintContract(contract)}
                        className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" 
                        title="PDF İndir"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {isAddContractModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl my-8">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Yeni Sözleşme Oluştur</h3>
              <p className="text-sm text-[#94A3B8] mt-1">Sistemden yeni bir sözleşme oluşturun.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Müşteri Adı / Firma</label>
                <input 
                  disabled={isCreating}
                  type="text" 
                  value={newContractData.clientName}
                  onChange={e => setNewContractData({...newContractData, clientName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                  placeholder="Örn: Yılmazlar A.Ş."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Müşteri E-Posta</label>
                <input 
                  disabled={isCreating}
                  type="email" 
                  value={newContractData.clientEmail}
                  onChange={e => setNewContractData({...newContractData, clientEmail: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                  placeholder="Örn: info@yilmazlar.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Proje Başlığı</label>
                <input 
                  disabled={isCreating}
                  type="text" 
                  value={newContractData.title}
                  onChange={e => setNewContractData({...newContractData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                  placeholder="Örn: E-Ticaret Dönüşümü"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Hizmet Türü (AI Şablon İçin)</label>
                <select 
                  disabled={isCreating}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  value={newContractData.serviceType}
                  onChange={e => setNewContractData({...newContractData, serviceType: e.target.value})}
                >
                  <option value="WEB" className="bg-[#0A0A0F] text-white">Web Sitesi Geliştirme (Next.js)</option>
                  <option value="SAAS" className="bg-[#0A0A0F] text-white">Web Uygulamaları (SaaS)</option>
                  <option value="AGENTS" className="bg-[#0A0A0F] text-white">Yapay Zeka Ajanları (AI Agents)</option>
                  <option value="AUTOMATION" className="bg-[#0A0A0F] text-white">AI İş Akış Otomasyonları (n8n)</option>
                  <option value="MARKETING" className="bg-[#0A0A0F] text-white">Reklam & Sosyal Medya</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Sözleşme Türü</label>
                  <select 
                    disabled={isCreating}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                    value={newContractData.type}
                    onChange={e => setNewContractData({...newContractData, type: e.target.value})}
                  >
                    <option value="LASTENHEFT" className="bg-[#0A0A0F] text-white">Lastenheft</option>
                    <option value="PFLICHTENHEFT" className="bg-[#0A0A0F] text-white">Pflichtenheft</option>
                    <option value="SLA" className="bg-[#0A0A0F] text-white">SLA</option>
                    <option value="NDA" className="bg-[#0A0A0F] text-white">NDA</option>
                    <option value="MSA" className="bg-[#0A0A0F] text-white">Ana Hizmet Sözleşmesi (MSA)</option>
                    <option value="SEO" className="bg-[#0A0A0F] text-white">SEO Sözleşmesi</option>
                    <option value="MAINTENANCE" className="bg-[#0A0A0F] text-white">Bakım Sözleşmesi</option>
                    <option value="SOCIAL" className="bg-[#0A0A0F] text-white">Sosyal Medya Yönetimi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Tutar</label>
                  <input 
                    disabled={isCreating}
                    type="number" 
                    value={newContractData.value}
                    onChange={e => setNewContractData({...newContractData, value: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                    placeholder="Örn: 150000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Para Birimi</label>
                  <select 
                    disabled={isCreating}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                    value={newContractData.currency}
                    onChange={e => setNewContractData({...newContractData, currency: e.target.value})}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code} className="bg-[#0A0A0F] text-white">
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
              <button 
                disabled={isCreating}
                onClick={() => setIsAddContractModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors text-sm font-medium disabled:opacity-50"
              >
                İptal
              </button>
              <button 
                disabled={isCreating}
                onClick={async () => {
                  if(!newContractData.clientName || !newContractData.title) return alert("Müşteri Adı ve Proje Başlığı zorunludur.");
                  setIsCreating(true);
                  try {
                    const res = await createContract({
                      tenantId: 'default-tenant',
                      title: newContractData.title,
                      clientName: newContractData.clientName,
                      clientEmail: newContractData.clientEmail,
                      type: newContractData.type,
                      serviceType: newContractData.serviceType,
                      value: newContractData.value ? Number(newContractData.value) : undefined,
                      currency: newContractData.currency
                    });
                    if(res.success && res.data) {
                      setContracts(prev => [res.data, ...prev]);
                      setIsAddContractModalOpen(false);
                      setNewContractData({ title: "", clientName: "", clientEmail: "", type: "LASTENHEFT", serviceType: "WEB", value: "", currency: "TRY" });
                    } else {
                      alert("Sözleşme oluşturulurken bir hata oluştu.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Bir hata oluştu.");
                  } finally {
                    setIsCreating(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    AI Şablonu Hazırlanıyor...
                  </>
                ) : (
                  "Oluştur"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal (Pro/Elit 3-Step Wizard) */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-950/30 to-cyan-950/30">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-emerald-400 animate-pulse" /> 
                  Pro/Elit AI Sözleşme Asistanı
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">İş gereksinimlerinden başlayarak teknik şartname ve korumacı resmi sözleşmeye adım adım ilerleyin.</p>
              </div>
              <button 
                onClick={() => {
                  setIsGeneratorModalOpen(false);
                  setWizardStep(1);
                }} 
                className="text-[#64748B] hover:text-white p-2 text-lg hover:bg-white/5 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white/[0.01] border-b border-white/5 px-8 py-4 flex items-center justify-between">
              {[
                { step: 1, title: "1. Lastenheft", desc: "Müşteri Talebi (Ne & Niçin)" },
                { step: 2, title: "2. Pflichtenheft", desc: "Teknik Şartname (Nasıl & Ne İle)" },
                { step: 3, title: "3. Sözleşme", desc: "Resmi Yasal Metin (Birleşim)" }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    wizardStep === s.step 
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110" 
                      : wizardStep > s.step 
                      ? "bg-emerald-500 text-white" 
                      : "bg-white/5 text-[#64748B] border border-white/10"
                  }`}>
                    {wizardStep > s.step ? "✓" : s.step}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className={`text-xs font-semibold ${wizardStep === s.step ? "text-white" : "text-[#64748B]"}`}>{s.title}</p>
                    <p className="text-[10px] text-[#475569]">{s.desc}</p>
                  </div>
                  {s.step < 3 && <div className="w-12 md:w-20 h-px bg-white/10 hidden sm:block mx-2" />}
                </div>
              ))}
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* STEP 1: LASTENHEFT / TALEPLER */}
              {wizardStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Service Cards Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">Hizmet Türü Seçin</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { code: "WEB", label: "Web Tasarım", desc: "Next.js & Performance", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
                        { code: "SAAS", label: "Web App / SaaS", desc: "Panel & Cloud Software", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
                        { code: "AGENTS", label: "AI Ajanları", desc: "Autonomous AI & CRM", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
                        { code: "AUTOMATION", label: "AI Otomasyon", desc: "n8n, Webhooks & APIs", color: "from-amber-500/20 to-orange-500/20 border-amber-500/30" },
                        { code: "MARKETING", label: "Dijital Pazarlama", desc: "Meta/Google Ads & Creative", color: "from-rose-500/20 to-red-500/20 border-rose-500/30" }
                      ].map((item) => {
                        const isSelected = wizardData.serviceType === item.code;
                        return (
                          <div 
                            key={item.code}
                            onClick={() => {
                              setWizardData({
                                ...wizardData, 
                                serviceType: item.code,
                                selectedNeeds: [] // Reset selected needs on service type change
                              });
                            }}
                            className={`p-4 rounded-2xl border text-center cursor-pointer transition-all duration-300 select-none flex flex-col justify-between h-28 ${
                              isSelected 
                                ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-102` 
                                : "bg-white/[0.02] border-white/5 text-[#94A3B8] hover:bg-white/[0.05] hover:border-white/10"
                            }`}
                          >
                            <span className="font-bold text-xs block">{item.label}</span>
                            <span className="text-[9px] text-[#64748B] block mt-1 leading-normal">{item.desc}</span>
                            <span className={`text-[9px] font-bold block mt-2 ${isSelected ? "text-emerald-400" : "text-transparent"}`}>✓ Seçildi</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Company Info Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                    <div className="col-span-1 md:col-span-3 pb-2 border-b border-white/5 mb-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Müşteri & Proje Künyesi</h4>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Müşteri / Şirket Adı</label>
                      <input 
                        type="text" 
                        value={wizardData.clientName}
                        onChange={(e) => setWizardData({...wizardData, clientName: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                        placeholder="Örn: ABC Teknoloji Ltd."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Müşteri E-Posta</label>
                      <input 
                        type="email" 
                        value={wizardData.clientEmail}
                        onChange={(e) => setWizardData({...wizardData, clientEmail: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                        placeholder="Örn: info@abctech.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Proje / İş Başlığı</label>
                      <input 
                        type="text" 
                        value={wizardData.title}
                        onChange={(e) => setWizardData({...wizardData, title: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                        placeholder="Örn: Otonom CRM Entegrasyonu"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Tahmini Bütçe Tutar</label>
                      <input 
                        type="number" 
                        value={wizardData.budget}
                        onChange={(e) => setWizardData({...wizardData, budget: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                        placeholder="Örn: 250000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Para Birimi</label>
                      <select 
                        value={wizardData.currency}
                        onChange={(e) => setWizardData({...wizardData, currency: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="TRY">TRY (₺)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-Choice Checklist of Needs */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">Proje Hedefleri ve İhtiyaçlar (Çoklu Seçim)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                      {(WIZARD_NEEDS[wizardData.serviceType] || []).map((need, idx) => {
                        const isChecked = wizardData.selectedNeeds.includes(need);
                        return (
                          <label 
                            key={idx} 
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                              isChecked 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-white" 
                                : "bg-black/30 border-white/5 text-[#94A3B8] hover:border-white/10 hover:text-white"
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setWizardData({
                                    ...wizardData, 
                                    selectedNeeds: wizardData.selectedNeeds.filter(n => n !== need)
                                  });
                                } else {
                                  setWizardData({
                                    ...wizardData, 
                                    selectedNeeds: [...wizardData.selectedNeeds, need]
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500/50 mt-0.5" 
                            />
                            <span className="text-xs leading-relaxed">{need}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Notes */}
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5 font-medium">Ek Şartlar ve Ekstra Notlar (İsteğe Bağlı)</label>
                    <textarea 
                      rows={3} 
                      value={wizardData.customNotes}
                      onChange={(e) => setWizardData({...wizardData, customNotes: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                      placeholder="Geliştirme süresi 3 ay olacaktır, StarWebFlow sunucularında barındırılacaktır vb."
                    />
                  </div>

                  {/* Generate Button Step 1 */}
                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button 
                      onClick={handleWizardGenerateLastenheft}
                      disabled={generatingLastenheft}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
                    >
                      {generatingLastenheft ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                          Lastenheft Derleniyor...
                        </>
                      ) : (
                        <>
                          Lastenheft Üret ve İlerle <Wand2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PFLICHTENHEFT / TEKNIK SARTNAME */}
              {wizardStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Pane: Lastenheft Review */}
                    <div className="space-y-3 flex flex-col">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">1. Adım: Lastenheft (İş Talebi) İçeriği</label>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Derlendi</span>
                      </div>
                      <textarea 
                        value={wizardData.lastenheftContent}
                        onChange={(e) => setWizardData({...wizardData, lastenheftContent: e.target.value})}
                        className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none h-[400px]"
                      />
                    </div>

                    {/* Right Pane: Pflichtenheft Generation */}
                    <div className="space-y-3 flex flex-col">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">2. Adım: Pflichtenheft (Teknik Şartname)</label>
                        {wizardData.pflichtenheftContent ? (
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">Hazır</span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">Üretim Bekleniyor</span>
                        )}
                      </div>
                      
                      {wizardData.pflichtenheftContent ? (
                        <textarea 
                          value={wizardData.pflichtenheftContent}
                          onChange={(e) => setWizardData({...wizardData, pflichtenheftContent: e.target.value})}
                          className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none h-[400px]"
                        />
                      ) : (
                        <div className="flex-1 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-black/20 h-[400px]">
                          <Wand2 className="w-12 h-12 text-[#64748B] mb-4 animate-bounce" />
                          <h4 className="text-white font-medium mb-1">Teknik Şartname Henüz Üretilmedi</h4>
                          <p className="text-xs text-[#94A3B8] max-w-sm mb-6">Lastenheft gereksinimlerine göre mimariyi, kullanılacak teknolojileri ve teslimat fazlarını AI ile planlayın.</p>
                          <button 
                            onClick={handleWizardGeneratePflichtenheft}
                            disabled={generatingPflichtenheft}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
                          >
                            {generatingPflichtenheft ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                Teknik Plan Hazırlanıyor (Wie/Womit)...
                              </>
                            ) : (
                              <>
                                Pflichtenheft Üret (Wie & Womit) <Wand2 className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Step 2 */}
                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setWizardStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                    >
                      Geri Dön
                    </button>

                    <button 
                      onClick={handleWizardGenerateContract}
                      disabled={generatingContract || !wizardData.pflichtenheftContent}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingContract ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                          Resmi Sözleşme Birleştiriliyor...
                        </>
                      ) : (
                        <>
                          Resmi Sözleşmeye Dönüştür & İlerle <Wand2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: OFFICIAL CONTRACT REVIEW & SAVE */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs">
                      <strong>Harika!</strong> Lastenheft ve Pflichtenheft bilgileriniz birleştirildi ve StarWebFlow lehine korumacı yasal hükümler eklenerek elit düzeyde resmi B2B sözleşmesi hazırlandı.
                    </span>
                  </div>

                  <div className="space-y-2 flex flex-col h-[400px]">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">3. Adım: Nihai Resmi Sözleşme İçeriği (Düzenlenebilir)</label>
                      <button 
                        onClick={() => {
                          if (confirm("Sözleşmeyi baştan üretmek istediğinize emin misiniz? Yapılan düzenlemeler kaybolacaktır.")) {
                            handleWizardGenerateContract();
                          }
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Yeniden Üret
                      </button>
                    </div>
                    <textarea 
                      value={wizardData.officialContractContent}
                      onChange={(e) => setWizardData({...wizardData, officialContractContent: e.target.value})}
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none h-[350px]"
                    />
                  </div>

                  {/* Actions Step 3 */}
                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                    >
                      Geri Dön (Teknik Şartname)
                    </button>

                    <button 
                      onClick={handleWizardSaveContract}
                      disabled={isCreating}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                          Veritabanına Kaydediliyor...
                        </>
                      ) : (
                        "Sözleşmeyi Kaydet ve Tamamla"
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {isSignModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><PenTool className="w-5 h-5 text-emerald-400" /> Güvenli E-İmza</h3>
              <button onClick={() => setIsSignModalOpen(false)} className="text-[#64748B] hover:text-white p-2">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#94A3B8] mb-4">
                <strong className="text-white">{selectedContract.title}</strong> başlıklı belgeyi dijital olarak imzalamak üzeresiniz.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-32 flex flex-col items-center justify-center mb-4 border-dashed cursor-crosshair">
                <span className="text-emerald-400 font-signature text-2xl opacity-50">Buraya imzanızı çizin...</span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500" />
                <span className="text-xs text-[#94A3B8]">Okudum, anladım ve 5070 sayılı Elektronik İmza Kanunu kapsamında imzalamayı kabul ediyorum.</span>
              </label>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button 
                onClick={async () => {
                  const res = await updateContractStatus(selectedContract.id, 'SIGNED');
                  if (res.success && res.data) {
                    setContracts(prev => prev.map(c => c.id === res.data.id ? res.data : c));
                  }
                  setIsSignModalOpen(false);
                  setSelectedContract(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors"
              >
                İmzayı Tamamla
              </button>
            </div>
          </div>
        </div>
      )}      {/* View & Edit Contract Modal */}
      {isViewEditModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-900/10 to-cyan-900/10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Sözleşme Detayı & İçerik Düzenleyici
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">Sözleşme şartlarını ve yasal metin içeriğini güncelleyin.</p>
              </div>
              <button 
                onClick={() => { setIsViewEditModalOpen(false); setSelectedContract(null); }}
                className="text-[#64748B] hover:text-white p-2 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/5 bg-white/[0.02] px-6 py-2 gap-4 animate-in fade-in">
              <button 
                onClick={() => setModalTab("edit")} 
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${modalTab === 'edit' ? 'border-emerald-500 text-white' : 'border-transparent text-[#64748B] hover:text-white'}`}
              >
                Düzenle
              </button>
              <button 
                onClick={() => setModalTab("preview")} 
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${modalTab === 'preview' ? 'border-emerald-500 text-white' : 'border-transparent text-[#64748B] hover:text-white'}`}
              >
                Önizleme
              </button>
              <button 
                onClick={() => setModalTab("pdf")} 
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${modalTab === 'pdf' ? 'border-emerald-500 text-white' : 'border-transparent text-[#64748B] hover:text-white'}`}
              >
                İmzalı PDF
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {modalTab === "edit" ? (
                <>
                  {/* B2B Workflow Stepper */}
                  <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">B2B Sözleşme Süreci Aşamaları</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                      {/* Step 1 */}
                      <div 
                        onClick={() => {
                          setEditType('LASTENHEFT');
                          if (confirm('Bu aşamaya geçip "Lastenheft" (İş Gereksinimleri) hazır şablonunu yüklemek ister misiniz?')) {
                            setEditContent(CONTRACT_TEMPLATES.LASTENHEFT || '');
                          }
                        }}
                        className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all cursor-pointer hover:bg-white/5 ${
                          editType === 'LASTENHEFT' 
                            ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : ['PFLICHTENHEFT', 'NDA', 'SLA'].includes(editType)
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase">Aşama 1</span>
                            {['PFLICHTENHEFT', 'NDA', 'SLA'].includes(editType) && <span className="text-xs text-emerald-400">✓ Tamamlandı</span>}
                            {editType === 'LASTENHEFT' && <span className="text-xs text-blue-400 animate-pulse">● Aktif Aşamada</span>}
                          </div>
                          <h4 className="font-bold text-sm text-white">Lastenheft (İş Gereksinimleri)</h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Müşteri gereksinimleri ve hedefleri listelenir. (Was & Wofür / Ne & Neden?)</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div 
                        onClick={async () => {
                          if (editType === 'LASTENHEFT' && editContent && editContent.length > 50) {
                            if (confirm('Lastenheft gereksinimlerini Pflichtenheft teknik şartnamesine AI ile dönüştürmek ister misiniz? (Tüm maddeler "Wie & Womit" / "Nasıl & Ne ile?" prensibine göre teknik olarak planlanacaktır)')) {
                              await handleGeneratePflichtenheft();
                              return;
                            }
                          }
                          setEditType('PFLICHTENHEFT');
                          if (confirm('Pflichtenheft hazır şablonunu yüklemek ister misiniz?')) {
                            setEditContent(CONTRACT_TEMPLATES.PFLICHTENHEFT || '');
                          }
                        }}
                        className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all cursor-pointer hover:bg-white/5 ${
                          editType === 'PFLICHTENHEFT' 
                            ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : ['NDA', 'SLA'].includes(editType)
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase">Aşama 2</span>
                            {['NDA', 'SLA'].includes(editType) && <span className="text-xs text-emerald-400">✓ Tamamlandı</span>}
                            {editType === 'PFLICHTENHEFT' && <span className="text-xs text-blue-400 animate-pulse">● Aktif Aşamada</span>}
                          </div>
                          <h4 className="font-bold text-sm text-white">Pflichtenheft (Teknik Şartname)</h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Taleplerin nasıl gerçekleştirileceği tasarlanır. (Wie & Womit / Nasıl & Ne ile?)</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div 
                        onClick={() => {
                          setEditType('NDA');
                          if (confirm('Bu aşamaya geçip "NDA" (Gizlilik Sözleşmesi) hazır şablonunu yüklemek ister misiniz? (Dilerseniz form alanından SLA şablonunu da seçip yükleyebilirsiniz.)')) {
                            setEditContent(CONTRACT_TEMPLATES.NDA || '');
                          }
                        }}
                        className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all cursor-pointer hover:bg-white/5 ${
                          ['NDA', 'SLA'].includes(editType)
                            ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase">Aşama 3</span>
                            {editStatus === 'SIGNED' && <span className="text-xs text-emerald-400">✓ İmzalandı</span>}
                            {['NDA', 'SLA'].includes(editType) && editStatus !== 'SIGNED' && <span className="text-xs text-blue-400 animate-pulse">● Uzlaşma Bekliyor</span>}
                          </div>
                          <h4 className="font-bold text-sm text-white">Resmi Sözleşme & Hukuki Onay</h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">NDA ve SLA şartları belirlenerek karşılıklı ıslak veya dijital imza sürecine geçilir.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Müşteri / Kurum</label>
                      <input 
                        type="text" 
                        value={editClientName}
                        onChange={e => setEditClientName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">E-Posta Adresi</label>
                      <input 
                        type="email" 
                        value={editClientEmail}
                        onChange={e => setEditClientEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Proje Başlığı</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Sözleşme Türü</label>
                      <select 
                        value={editType}
                        onChange={e => {
                          const newType = e.target.value;
                          setEditType(newType);
                          if (!editContent || editContent === 'Sözleşme şartlarını buraya giriniz...' || editContent.trim() === '') {
                            setEditContent(CONTRACT_TEMPLATES[newType as keyof typeof CONTRACT_TEMPLATES] || '');
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="LASTENHEFT">Lastenheft</option>
                        <option value="PFLICHTENHEFT">Pflichtenheft</option>
                        <option value="SLA">SLA</option>
                        <option value="NDA">NDA</option>
                        <option value="MSA">Ana Hizmet Sözleşmesi (MSA)</option>
                        <option value="SEO">SEO Sözleşmesi</option>
                        <option value="MAINTENANCE">Bakım Sözleşmesi</option>
                        <option value="SOCIAL">Sosyal Medya Yönetimi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Bütçe Tutar</label>
                      <input 
                        type="number" 
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Durum</label>
                      <select 
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="PENDING">PENDING (Beklemede)</option>
                        <option value="SIGNED">SIGNED (İmzalandı / Onaylandı)</option>
                        <option value="EXPIRED">EXPIRED (Süresi Doldu)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col h-[380px]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-semibold text-[#94A3B8]">Sözleşme Yasal İçeriği (Yazılı Metin)</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Mevcut içeriği şablon ile değiştirmek istediğinize emin misiniz?')) {
                              setEditContent(CONTRACT_TEMPLATES[editType as keyof typeof CONTRACT_TEMPLATES] || '');
                            }
                          }}
                          className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/20 transition-colors"
                        >
                          Hazır Şablonu Yükle
                        </button>
                        {editType === 'PFLICHTENHEFT' && (
                          <button
                            type="button"
                            disabled={generating}
                            onClick={handleGeneratePflichtenheft}
                            className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded hover:bg-purple-500/20 transition-colors disabled:opacity-50 ml-2"
                          >
                            {generating ? 'Üretiliyor...' : "Lastenheft'ten AI ile Üret (Wie/Womit)"}
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-[#64748B]">HTML / Markdown biçiminde düzenleyebilirsiniz.</span>
                    </div>
                    <textarea 
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-none h-[280px]"
                      placeholder="Sözleşme şartlarını buraya giriniz..."
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                    <span className="text-sm text-[#94A3B8]">Belge Önizleme (A4 Kağıt Standartı)</span>
                    <button 
                      onClick={() => handlePrintContract({
                        id: selectedContract.id,
                        createdAt: selectedContract.createdAt,
                        contractNo: selectedContract.contractNo,
                        title: editTitle,
                        clientName: editClientName,
                        clientEmail: editClientEmail,
                        type: editType,
                        value: editValue,
                        currency: editCurrency,
                        content: editContent,
                        status: editStatus
                      })}
                      className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" /> Yazdır / PDF Kaydet
                    </button>
                  </div>

                  <div className="bg-white p-8 sm:p-12 text-slate-900 shadow-2xl rounded-xl max-w-3xl mx-auto text-sm border border-slate-200" style={{ minHeight: '842px' }}>
                    {/* Header */}
                    <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                      <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">STARWEBFLOW</h1>
                        <p className="text-[10px] text-slate-500 max-w-xs mt-1">Musterstr. 1, 12345 Berlin, Germany<br/>info@starwebflow.com | www.starwebflow.com</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl font-light text-slate-400 uppercase tracking-widest">{editType}</h2>
                        <p className="text-[10px] text-slate-600 mt-2 font-mono">Belge No: {selectedContract.contractNo || selectedContract.id}</p>
                        <p className="text-[10px] text-slate-600 font-mono">Tarih: {new Date(selectedContract.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="grid grid-cols-2 gap-8 mb-8 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1">HİZMET SAĞLAYICI</h3>
                        <p className="font-semibold text-slate-800">StarWebFlow Gmbh</p>
                        <p className="text-slate-600">Musterstr. 1, 12345 Berlin</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1">MÜŞTERİ / ALICI</h3>
                        <p className="font-semibold text-slate-800">{editClientName || 'Müşteri'}</p>
                        <p className="text-slate-600">{editClientEmail || '-'}</p>
                        <p className="text-slate-600">Bütçe: {editValue ? `${Number(editValue).toLocaleString('tr-TR')} ${editCurrency}` : 'Belirtilmedi'}</p>
                      </div>
                    </div>

                    {/* Markdown Content */}
                    <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mb-16">
                      <ReactMarkdown>{editContent}</ReactMarkdown>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-xs mt-12">
                      <div className="text-center">
                        <p className="text-slate-500 mb-6">Hizmet Sağlayıcı İmza</p>
                        <span className="font-signature text-2xl text-blue-600 block">StarWebFlow</span>
                        <p className="font-semibold text-slate-800 mt-2">StarWebFlow Gmbh</p>
                        <p className="text-[10px] text-slate-400">Dijital Olarak İmzalandı</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500 mb-6">Alıcı / Müşteri İmza</p>
                        {editStatus === 'SIGNED' ? (
                          <>
                            <span className="font-signature text-2xl text-emerald-600 block">{editClientName}</span>
                            <p className="font-semibold text-slate-800 mt-2">{editClientName}</p>
                            <p className="text-[10px] text-slate-400">Dijital Olarak Onaylandı</p>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-300 italic block">İmza Bekliyor</span>
                            <p className="font-semibold text-slate-800 mt-2">{editClientName}</p>
                            <p className="text-[10px] text-slate-400">Beklemede</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === "pdf" && (
                <div className="bg-white/[0.01] border border-white/[0.05] p-6 rounded-2xl">
                  <h4 className="text-white font-bold mb-4">İmzalı PDF Belgesi</h4>
                  
                  {editSignedPdfUrl ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium text-sm">Sisteme imzalı PDF belgesi yüklenmiş durumda.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={editSignedPdfUrl} 
                            download={`${editTitle || 'sozlesme'}.pdf`}
                            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                            title="PDF'i İndir"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => {
                              if(confirm('Mevcut PDF silinsin mi?')) setEditSignedPdfUrl(null);
                            }}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="PDF'i Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <iframe src={editSignedPdfUrl} className="w-full h-[500px] rounded-xl border border-white/10 bg-white" />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors">
                      <FileSignature className="w-12 h-12 text-[#64748B] mb-4" />
                      <p className="text-white font-medium mb-1">Henüz PDF yüklenmemiş</p>
                      <p className="text-sm text-[#94A3B8] mb-6">Islak imzalı veya harici bir dijital platformda imzalanmış belgeyi buraya yükleyin.</p>
                      <label className="cursor-pointer px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium text-sm transition-colors">
                        PDF Seç
                        <input 
                          type="file" 
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Dosya boyutu 2MB'den küçük olmalıdır.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setEditSignedPdfUrl(event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#0A0A0F]">
              <div className="text-xs text-[#64748B]">
                Son Güncelleme: {selectedContract.updatedAt ? new Date(selectedContract.updatedAt).toLocaleString('tr-TR') : 'Bilinmiyor'}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={async () => {
                    if (confirm('Bu sözleşmeyi tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                      const res = await deleteContract(selectedContract.id);
                      if (res.success) {
                        setContracts(prev => prev.filter(c => c.id !== selectedContract.id));
                        setIsViewEditModalOpen(false);
                        setSelectedContract(null);
                      } else {
                        alert("Sözleşme silinirken hata oluştu.");
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all text-xs font-semibold mr-2"
                >
                  Sözleşmeyi Sil
                </button>
                <button 
                  onClick={handleSendContract}
                  disabled={sending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium disabled:opacity-50 mr-2"
                >
                  {sending ? 'İletiliyor...' : 'Müşteriye İlet'}
                </button>
                <button 
                  onClick={() => { setIsViewEditModalOpen(false); setSelectedContract(null); }}
                  className="px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                <button 
                  onClick={async () => {
                    const res = await updateContract(selectedContract.id, {
                      title: editTitle,
                      clientName: editClientName,
                      clientEmail: editClientEmail,
                      type: editType,
                      value: editValue ? Number(editValue) : undefined,
                      currency: editCurrency,
                      content: editContent,
                      status: editStatus,
                      signedPdfUrl: editSignedPdfUrl || undefined
                    });
                    if (res.success && res.data) {
                      if (editStatus === 'SIGNED' && selectedContract.status !== 'SIGNED') {
                        const templates = taskTemplates[editType] || [];
                        if (templates.length > 0) {
                          alert(`${templates.length} adet otomatik görev (Kanban) şablonlardan projeye başarıyla eklendi!`);
                        }
                      }
                      setContracts(prev => prev.map(c => c.id === res.data.id ? res.data : c));
                      setIsViewEditModalOpen(false);
                      setSelectedContract(null);
                    } else {
                      alert("Sözleşme güncellenirken bir hata oluştu.");
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  Değişiklikleri Kaydet
                </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

