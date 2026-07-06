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
    "Was (Ne): Headless CMS (örn. Strapi, Sanity) mimarisi ile Next.js 14 App Router entegrasyonu / Wofür (Neden): Pazarlama ekibinin yazılım geliştiriciye bağımlı olmadan dinamik içerik yönetebilmesi ve site performansının korunması için",
    "Was (Ne): Edge Middleware tabanlı dinamik i18n (çoklu dil) ve coğrafi yönlendirme / Wofür (Neden): Farklı ülkelerdeki kullanıcıların sayfayı kendi yerel dillerinde ve milisaniyeler içinde sıfır gecikmeyle açabilmesi için",
    "Was (Ne): Google Core Web Vitals (LCP, FID, CLS) standartlarında 95+ Lighthouse skoru optimizasyonu / Wofür (Neden): SEO görünürlüğünü en üst seviyeye çıkarmak ve organik arama sıralamalarında rakiplerin önüne geçmek için",
    "Was (Ne): HubSpot veya Salesforce CRM ile çift yönlü API entegrasyonu / Wofür (Neden): Siteden gelen lead ve teklif taleplerinin anlık olarak satış ekiplerine aktarılması ve hiçbir müşterinin kaçırılmaması için",
    "Was (Ne): Gizlilik dostu analitik araçlarının (Fathom, Plausible) ve KVKK/GDPR uyumlu dinamik çerez yönetiminin kurulması / Wofür (Neden): Kişisel verilerin korunması kanununa tam uyum sağlamak ve yasal riskleri sıfıra indirmek için",
    "Was (Ne): Tailwind CSS ve Framer Motion ile tasarlanmış premium mikro-animasyonlar ve etkileşimli öğeler / Wofür (Neden): Markanın dijital prestijini artırmak, modern ve premium bir kullanıcı deneyimi (UX) sunmak için"
  ],
  SAAS: [
    "Was (Ne): Auth0 veya NextAuth ile SSO (Single Sign-On) ve Multi-Tenant veri izolasyon yapısı / Wofür (Neden): Kurumsal B2B müşterilerin güvenle sisteme giriş yapabilmesi ve farklı tenant verilerinin birbirine asla karışmaması için",
    "Was (Ne): Rol Tabanlı Erişim Denetimi (RBAC) ve detaylı kullanıcı işlem loglama modülü (Audit Log) / Wofür (Neden): Güvenlik ve uyumluluk (compliance) denetimlerinde tam şeffaflık sağlamak ve veri sızıntılarını önlemek için",
    "Was (Ne): Stripe Billing API ile karmaşık abonelik (SaaS), faturalandırma ve kullanım bazlı (metered usage) ödeme planlarının entegrasyonu / Wofür (Neden): Gelir akışını otomatik yönetmek ve manuel fatura takibini ortadan kaldırmak için",
    "Was (Ne): RESTful / GraphQL API mimarisi ve Swagger/Redoc entegrasyonu / Wofür (Neden): B2B müşterilerin kendi yazılımlarını sistemimize güvenle entegre edebilmesi ve API ekosistemi oluşturabilmek için",
    "Was (Ne): Shadcn UI ve TanStack Table tabanlı gelişmiş veri tabloları (filtreleme, sıralama, Excel/CSV dışa aktarma) / Wofür (Neden): Operasyonel ve finansal verilerin analist ve yöneticiler tarafından hızlıca işlenebilmesi için",
    "Was (Ne): Redis önbellekleme (Caching) ve PostgreSQL okuma/yazma replikasyon altyapısı / Wofür (Neden): Eşzamanlı binlerce kullanıcının sorgularında minimum gecikme ve yüksek veritabanı kararlılığı sağlamak için"
  ],
  AGENTS: [
    "Was (Ne): LangChain / LangGraph ile dallanan iş akışlarına sahip otonom karar verici AI Agent mimarisi / Wofür (Neden): Basit botların aksine karmaşık müşteri taleplerini analiz edip bağımsız kararlar alabilen dijital çalışanlar kurgulamak için",
    "Was (Ne): Pinecone / pgvector veritabanı ile RAG (Retrieval-Augmented Generation) tabanlı kurumsal bilgi yönetim sistemi / Wofür (Neden): Yapay zekanın halüsinasyon görmesini engellemek ve sadece şirketinizin güncel belgelerine (PDF, Wiki, SQL) dayanarak %100 doğru yanıt vermesini sağlamak için",
    "Was (Ne): OpenAI GPT-4o ve Gemini 1.5 Pro API modellerinin fallback (yedekli) hibrit entegrasyonu / Wofür (Neden): Ana yapay zeka modelinde kesinti veya kota aşımı yaşandığında sistemin durmadan diğer model üzerinden çalışmaya devam etmesi için",
    "Was (Ne): Kullanıcı profilleriyle entegre geçmiş konuşma ve bağlam hafızası (Short/Long-term Memory) / Wofür (Neden): Yapay zekanın sonraki etkileşimlerde müşteriyi tanımasını ve kişiselleştirilmiş, tutarlı çözümler sunmasını sağlamak için",
    "Was (Ne): AI çıktı denetimi ve veri maskeleme katmanı (Guardrails) / Wofür (Neden): Müşteriyle paylaşılan AI yanıtlarında uygunsuz ifadeleri engellemek ve hassas müşteri verilerinin (KK numarası, şifre vb.) LLM sunucularına sızmasını önlemek için"
  ],
  AUTOMATION: [
    "Was (Ne): Kendi sunucumuzda barındırılan (Self-Hosted) n8n veya Airbyte veri entegrasyon altyapısı / Wofür (Neden): Bulut lisans maliyetlerinden tasarruf etmek ve hassas müşteri/şirket verilerini tamamen kendi güvenli sunucumuzda tutmak için",
    "Was (Ne): E-posta, PDF fatura ve sözleşmelerden OCR (Google Document AI) ile veri ayıklayıp ERP sistemine işleyen akışlar / Wofür (Neden): Muhasebe ve operasyon ekiplerinin haftalık 20+ saatlik veri giriş yükünü saniyeler düzeyine indirmek için",
    "Was (Ne): Slack, Microsoft Teams ve E-posta kanallarına bağlı merkezi hata bildirim ve kuyruk (Queue) yönetimi / Wofür (Neden): Başarısız olan API isteklerini otomatik tespit edip yeniden denemek ve veri kayıplarının önüne geçmek için",
    "Was (Ne): CRM (Salesforce/Pipedrive) ve ERP/Muhasebe (Logo, SAP vb.) sistemleri arasında iki yönlü gerçek zamanlı senkronizasyon / Wofür (Neden): Satış gerçekleştikten sonra fatura kesim ve envanter güncelleme adımlarını otonom hale getirmek için",
    "Was (Ne): API Hız Sınırlandırıcı (Rate Limiting) ve JWT yetkilendirmeli Webhook altyapısı / Wofür (Neden): Dışarıdan gelecek webhook çağrılarının güvenliğini sağlamak ve sunucuyu aşırı istek yükünden korumak için"
  ],
  MARKETING: [
    "Was (Ne): AI destekli kreatif otomasyon ve çok varyasyonlu dinamik görsel/video reklam içeriği üretimi / Wofür (Neden): Reklam kanallarında 'ad fatigue' (reklam körlüğü) etkisini kırmak ve dönüşüm maliyetlerini düşürmek için",
    "Was (Ne): Meta Conversions API (CAPI) ve Server-Side Tracking kurulumu / Wofür (Neden): iOS 14+ kısıtlamaları ve tarayıcı çerez engellerini aşarak reklam dönüşüm verilerini %100 doğrulukla ölçümlemek ve pikseli doğru eğitmek için",
    "Was (Ne): Yapay zeka destekli akıllı bütçe optimizasyonu (Advantage+ / CBO) ve kitle segmentasyonu / Wofür (Neden): Reklam bütçesini günün en aktif saatlerine ve en yüksek dönüşüm getiren niş kitlelere otonom dağıtmak için",
    "Was (Ne): Google Analytics 4 (GA4) e-ticaret gelişmiş ölçümleme ve özel dönüşüm hunisi (Funnel) raporları / Wofür (Neden): Ziyaretçilerin sitedesindeki alışveriş yolculuğunu uçtan uca takip edip sepeti terk etme noktalarını optimize etmek için",
    "Was (Ne): Otomatik rakip reklam izleme ve sektörel trend analiz paneli / Wofür (Neden): Rakiplerin hangi reklam kreatifleri ve kampanyalar ile pazara çıktığını anlık analiz ederek pazar payını korumak ve geliştirmek için"
  ]
};

const SECTORS = [
  { code: 'RETAIL', name: 'E-Ticaret & Perakende (Giyim, Mağaza vb.)' },
  { code: 'FOOD', name: 'Gıda & Restoran (Kafe, Sipariş vb.)' },
  { code: 'REAL_ESTATE', name: 'Gayrimenkul & Emlak' },
  { code: 'HEALTH', name: 'Sağlık & Klinik (Medikal, Doktor vb.)' },
  { code: 'EDUCATION', name: 'Eğitim & Kurs (Akademi, E-Öğrenme vb.)' },
  { code: 'LOGISTICS', name: 'Lojistik & Taşımacılık' },
  { code: 'FINANCE', name: 'Finans, Danışmanlık & B2B' },
  { code: 'OTHER', name: 'Diğer / Genel Sektör' }
];

const WIZARD_SECTOR_NEEDS: Record<string, string[]> = {
  RETAIL: [
    "Was (Ne): Beden, renk ve beden filtresi içeren dinamik giyim katalog modülü / Wofür (Neden): Müşterilerin aradıkları ürün varyasyonlarına kolayca ulaşıp satın alım sürecini hızlandırmak için",
    "Was (Ne): Akıllı beden tablosu ve 'Bedenimi Bul' algoritması / Wofür (Neden): Hatalı beden siparişlerinden kaynaklanan ürün iade oranlarını en aza indirmek için",
    "Was (Ne): Instagram Shop ve Facebook katalog XML entegrasyonu / Wofür (Neden): Sosyal medya üzerinden gelen kullanıcıların doğrudan ilgili ürüne yönlenip satın almasını sağlamak için",
    "Was (Ne): Terk edilen sepetleri kurtarma (abandoned cart) e-posta otomasyonu / Wofür (Neden): Alışverişi tamamlamadan çıkan müşterilere özel indirimler sunarak sepet dönüşüm oranını artırmak için"
  ],
  FOOD: [
    "Was (Ne): İnteraktif QR Kod menü ve masadan sipariş modülü / Wofür (Neden): Garson iş yükünü azaltmak ve masada bekleyen müşterilere temassız, hızlı sipariş imkanı sunmak için",
    "Was (Ne): Besin değerleri, kalori hesabı ve alerjen uyarı etiketleri / Wofür (Neden): Hassas diyeti olan (glütensiz, vegan vb.) müşterilerin güvenle sipariş vermesini sağlamak için",
    "Was (Ne): Bölge bazlı dinamik teslimat süresi ve minimum paket tutarı hesaplayıcı / Wofür (Neden): Sipariş teslimat süreçlerini optimize etmek ve uzak bölgelerdeki lojistik maliyetlerini dengelemek için",
    "Was (Ne): Masa rezervasyon ve anlık doluluk oranı takip sistemi / Wofür (Neden): Restoran doluluk kapasitesini önceden yönetmek ve müşterilerin kapıda sıra beklemesini engellemek için"
  ],
  REAL_ESTATE: [
    "Was (Ne): Harita üzerinde filtreleme (Google Maps) destekli interaktif portföy modülü / Wofür (Neden): Müşterilerin istedikleri bölgedeki satılık/kiralık ilanları görsel olarak anında inceleyebilmesi için",
    "Was (Ne): 3D Sanal Tur ve video galeri yerleştirme alanı / Wofür (Neden): Gayrimenkulü fiziksel olarak ziyaret edemeyen yerli/yabancı yatırımcılara gerçekçi bir uzaktan inceleme deneyimi sunmak için",
    "Was (Ne): Kredi hesaplama aracı ve aylık taksit simülatörü / Wofür (Neden): Alıcıların satın alma güçlerini site üzerinde hızlıca test edip doğrudan emlak danışmanıyla iletişime geçmesini kolaylaştırmak için",
    "Was (Ne): Otomatik PDF ilan broşürü oluşturma ve WhatsApp ile paylaşım modülü / Wofür (Neden): Portföy detaylarının müşterilere profesyonel bir formatta hızlıca iletilmesi ve sunum kalitesinin artırılması için"
  ],
  HEALTH: [
    "Was (Ne): Doktor çalışma takvimiyle entegre online randevu ve SMS hatırlatma sistemi / Wofür (Neden): Klinik telefon trafiğini azaltmak ve randevuya gelinmeme (no-show) oranlarını düşürmek için",
    "Was (Ne): Tedavi branşları, semptom rehberi ve hekim uzmanlık sayfaları / Wofür (Neden): Hastaların kendi rahatsızlıklarına en uygun doktoru bulmasını ve kliniğe olan güveni artırmayı sağlamak için",
    "Was (Ne): KVKK uyumlu dijital hasta onay formları ve ön-konsültasyon modülü / Wofür (Neden): Tedavi öncesi gerekli anamnez verilerini güvenle toplayıp yasal mevzuat gerekliliklerini yerine getirmek için",
    "Was (Ne): Online danışmanlık (Teletıp) görüntülü görüşme entegrasyonu / Wofür (Neden): Kliniğe fiziksel olarak gelemeyen hastalara uzaktan teşhis ve takip hizmeti sunarak hizmet kapsamını genişletmek için"
  ],
  EDUCATION: [
    "Was (Ne): Müfredat, ders içerikleri ve eğitmen profilleri tanıtım alanı / Wofür (Neden): Kurs veya eğitim programının detaylarını şeffafça sunarak kayıt olma isteğini (lead dönüşümünü) artırmak için",
    "Was (Ne): Sınav/sertifika kontrolü ve online başarı belgesi sorgulama modülü / Wofür (Neden): Mezun öğrencilerin kazandığı sertifikaların doğruluğunu işverenlerin sorgulayabilmesi ve kurumsal prestiji artırmak için",
    "Was (Ne): Canlı ders takvimi, Zoom entegrasyonu ve interaktif eğitim ajandası / Wofür (Neden): Öğrencilerin yaklaşan dersleri kolayca takip etmesi ve tek tıkla eğitime katılabilmesi için",
    "Was (Ne): Eğitim öncesi seviye belirleme (quiz/test) modülü / Wofür (Neden): Öğrencileri seviyelerine en uygun sınıflara yönlendirerek eğitim kalitesini ve öğrenci memnuniyetini maksimize etmek için"
  ],
  LOGISTICS: [
    "Was (Ne): Gerçek zamanlı kargo/gönderi takip (tracking) ve durum güncelleme modülü / Wofür (Neden): Müşterilerin gönderilerinin nerede olduğunu 7/24 sorgulayabilmesi ve destek merkezinin telefon yükünü azaltmak için",
    "Was (Ne): Hacimsel (Desi) hesaplama ve anlık navlun fiyat teklifi alma motoru / Wofür (Neden): B2B müşterilerin gönderi detaylarını girerek anında fiyat teklifi almasını sağlamak ve teklif sürecini hızlandırmak için",
    "Was (Ne): Araç filosu, güzergahlar ve gümrükleme hizmetleri detay sayfaları / Wofür (Neden): Taşımacılık kapasitesini ve operasyonel gücü potansiyel müşterilere eksiksiz gösterip güven oluşturmak için",
    "Was (Ne): Sürücü ve sevkiyat yönetim paneli entegrasyonu / Wofür (Neden): Saha operasyonlarının dijital izlenebilirliğini artırmak ve sevkiyat gecikmelerini minimize etmek için"
  ],
  FINANCE: [
    "Was (Ne): İnteraktif ROI (Yatırım Getirisi) hesaplayıcı ve bütçe planlama araçları / Wofür (Neden): Müşterilerin hizmetten elde edeceği finansal kazancı somut olarak görerek satın alma kararını hızlandırması için",
    "Was (Ne): Mevzuat, finansal makaleler, pazar analizleri ve bilgi bankası (Wiki) / Wofür (Neden): Sektörel gelişmeleri paylaşarak firmanın otorite konumunu pekiştirmek ve SEO gücünü artırmak için",
    "Was (Ne): Güvenli müşteri portalı, doküman yükleme/paylaşma katmanı / Wofür (Neden): Hassas finansal raporların, analizlerin ve sözleşmelerin müşteriyle şifreli bir ortamda güvenle paylaşılması için",
    "Was (Ne): Hizmet paketleri, fiyat karşılaştırma tabloları ve teklif özelleştirici / Wofür (Neden): Müşterilerin ihtiyaçlarına en uygun danışmanlık paketini seçmesini kolaylaştırmak ve net sınırlar belirlemek için"
  ],
  OTHER: [
    "Was (Ne): Detaylı SSS (Sıkça Sorulan Sorular) ve interaktif destek merkezi / Wofür (Neden): Müşteri sorularını hızlıca yanıtlayarak destek ekibinin yükünü azaltmak için",
    "Was (Ne): Referanslar, müşteri yorumları (Testimonials) ve vaka analizleri / Wofür (Neden): Markanın güvenirliğini ve sosyal kanıt (social proof) değerini artırmak için",
    "Was (Ne): Blog ve makale paylaşım altyapısı / Wofür (Neden): Sektörel aramaları hedefleyerek organik Google trafiğini sürekli yukarı taşımak için"
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

export const handlePrintContract = (contract: any, companySettings?: any) => {
  const contentHtml = contract.content || "";
  
  const docType = contract.type || "LASTENHEFT";
  const docNo = contract.contractNo || contract.id || "TASLAK-001";
  const dateStr = contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');
  const validUntilStr = contract.validUntil ? new Date(contract.validUntil).toLocaleDateString('tr-TR') : 'Süresiz';
  const clientName = contract.clientName || 'Müşteri';
  const clientEmail = contract.clientEmail || '-';
  const valStr = contract.value ? `${Number(contract.value).toLocaleString('tr-TR')} ${contract.currency || 'TRY'}` : 'Belirtilmedi';

  const company = companySettings || {
    name: "StarWebFlow Digital Agent",
    address: "Anilinerstr 3, 67105 Schifferstadt, Deutschland",
    taxId: "41/056/80705",
    vatId: "DE4105680705",
    email: "info@starwebflow.com",
    website: "www.starwebflow.com",
    phone: "+49 179 492 4556"
  };

  let docTypeName = docType;
  if (docType === "LASTENHEFT") {
    docTypeName = "LASTENHEFT / MÜŞTERİ TALEPLERİ";
  } else if (docType === "PFLICHTENHEFT") {
    docTypeName = "PFLICHTENHEFT / TEKNİK UYGULAMA ŞARTNAMESİ";
  } else if (docType === "CONTRACT" || docType === "MSA") {
    docTypeName = "B2B ANA HİZMET SÖZLEŞMESİ";
  }

  const htmlContent = `<!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <title>${contract.title || 'Sözleşme'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@1,500;1,600&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            line-height: 1.6;
          }
          .page-wrapper {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
          }
          /* Control bar */
          .no-print {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            background: #f1f5f9;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            margin-bottom: 2rem;
          }
          .btn-print {
            background: #4f46e5;
            color: #fff;
            border: none;
            padding: 0.6rem 1.25rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-print:hover { background: #4338ca; }
          .btn-close {
            background: #fff;
            color: #475569;
            border: 1px solid #d1d5db;
            padding: 0.6rem 1.25rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-close:hover { background: #f8fafc; }
          /* Cover page */
          .cover-page {
            background: #fff;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 1rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.07);
            padding: 60px;
            min-height: 277mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            margin-bottom: 3rem;
          }
          .cover-page::before {
            content: "";
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 6px;
            background: linear-gradient(90deg, #4f46e5, #06b6d4);
          }
          .cover-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 1.5rem; }
          .cover-company-name { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; color: #1e293b; margin: 0; }
          .cover-website { font-size: 0.75rem; color: #94a3b8; margin: 0.25rem 0 0; }
          .cover-doc-no { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }
          .cover-body { padding: 4rem 0; }
          .cover-tag { font-size: 0.7rem; font-weight: 700; color: #4f46e5; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 1rem; }
          .cover-title { font-size: 2.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; line-height: 1.2; margin: 0 0 1.5rem; }
          .cover-divider { width: 60px; height: 4px; background: linear-gradient(90deg, #4f46e5, #06b6d4); border-radius: 9999px; margin: 0 0 1.5rem; }
          .cover-subtitle { font-size: 1.125rem; color: #475569; font-weight: 500; margin: 0; }
          .cover-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; border-top: 1px solid #f1f5f9; padding-top: 2rem; }
          .cover-footer-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.5rem; }
          .cover-footer-name { font-weight: 600; color: #1e293b; margin: 0; }
          .cover-footer-detail { font-size: 0.75rem; color: #64748b; margin: 0.125rem 0 0; }
          .cover-footer-micro { font-size: 0.65rem; color: #94a3b8; margin: 0.125rem 0 0; }
          /* Document page */
          .document-page {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            padding: 60px;
          }
          .doc-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 2rem; }
          .doc-type-tag { font-size: 0.7rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
          .doc-header-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0.25rem 0 0; }
          .doc-header-no { font-size: 0.7rem; color: #94a3b8; font-family: monospace; }
          /* Prose */
          .prose { font-size: 0.875rem; line-height: 1.8; }
          .prose h1 { font-size: 1.375rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
          .prose h2 { font-size: 1.125rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
          .prose h3 { font-size: 1rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #334155; }
          .prose p { margin: 0 0 1rem; text-align: justify; color: #334155; }
          .prose strong { font-weight: 600; color: #0f172a; }
          .prose ul { list-style: disc; padding-left: 1.5rem; margin: 0 0 1rem; }
          .prose ol { list-style: decimal; padding-left: 1.5rem; margin: 0 0 1rem; }
          .prose li { color: #334155; margin-bottom: 0.25rem; }
          /* Signature block */
          .sig-block { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; border-top: 1px solid #e2e8f0; padding-top: 2rem; margin-top: 3rem; }
          .sig-item { text-align: center; }
          .sig-label { font-size: 0.8rem; color: #64748b; margin: 0 0 2rem; }
          .sig-name-provider { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 1.5rem; color: #4f46e5; display: block; height: 3rem; display: flex; align-items: center; justify-content: center; }
          .sig-name-client { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 1.5rem; color: #059669; display: flex; align-items: center; justify-content: center; height: 3rem; }
          .sig-name-pending { font-size: 0.875rem; color: #cbd5e1; font-style: italic; display: flex; align-items: center; justify-content: center; height: 3rem; }
          .sig-company { font-weight: 600; color: #1e293b; font-size: 0.875rem; margin: 0.5rem 0 0; }
          .sig-status { font-size: 0.7rem; color: #94a3b8; margin: 0.25rem 0 0; }
          @media print {
            body { background: #fff; }
            .no-print { display: none !important; }
            .page-wrapper { padding: 0; max-width: 100%; }
            .cover-page {
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              min-height: 100vh !important;
              padding: 60px 40px !important;
              margin-bottom: 0 !important;
              page-break-after: always !important;
              break-after: page !important;
            }
            .document-page {
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 40px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="no-print">
            <button onclick="window.print()" class="btn-print">PDF Olarak Kaydet / Yazdır</button>
            <button onclick="window.close()" class="btn-close">Kapat</button>
          </div>

          <!-- COVER PAGE -->
          <div class="cover-page">
            <div class="cover-header">
              <div>
                <p class="cover-company-name">${company.name.toUpperCase()}</p>
                <p class="cover-website">${company.website}</p>
              </div>
              <span class="cover-doc-no">Belge No: ${docNo}</span>
            </div>

            <div class="cover-body">
              <span class="cover-tag">${docType} DOKÜMANI</span>
              <h1 class="cover-title">${docTypeName}</h1>
              <div class="cover-divider"></div>
              <p class="cover-subtitle">${contract.title || 'Proje Belgesi'}</p>
            </div>

            <div class="cover-footer">
              <div>
                <p class="cover-footer-label">HAZIRLAYAN</p>
                <p class="cover-footer-name">${company.name}</p>
                <p class="cover-footer-detail">${company.address}</p>
                <p class="cover-footer-detail">E: ${company.email}</p>
                ${company.taxId ? `<p class="cover-footer-micro">St-Nr.: ${company.taxId}</p>` : ''}
                ${company.vatId ? `<p class="cover-footer-micro">USt-IdNr.: ${company.vatId}</p>` : ''}
              </div>
              <div>
                <p class="cover-footer-label">MUHATAP / MÜŞTERİ</p>
                <p class="cover-footer-name">${clientName}</p>
                <p class="cover-footer-detail">${clientEmail}</p>
                <p class="cover-footer-detail">Sözleşme Bedeli: ${valStr}</p>
                <p class="cover-footer-detail">Tarih: ${dateStr}</p>
              </div>
            </div>
          </div>

          <!-- DOCUMENT PAGE -->
          <div class="document-page">
            <div class="doc-header">
              <div>
                <span class="doc-type-tag">${docTypeName}</span>
                <p class="doc-header-title">${contract.title || 'Proje Belgesi'}</p>
              </div>
              <span class="doc-header-no">Belge No: ${docNo}</span>
            </div>

            <div class="prose">
              ${renderMarkdownToHtmlSimple(contentHtml)}
            </div>

            <div class="sig-block">
              <div class="sig-item">
                <p class="sig-label">Hizmet Sağlayıcı İmza</p>
                <span class="sig-name-provider">StarWebFlow</span>
                <p class="sig-company">${company.name}</p>
                <p class="sig-status">Dijital Olarak İmzalandı</p>
              </div>
              <div class="sig-item">
                <p class="sig-label">Alıcı / Müşteri İmza</p>
                ${contract.status === 'SIGNED' || contract.status === 'signed'
                  ? `<span class="sig-name-client">${clientName}</span><p class="sig-company">${clientName}</p><p class="sig-status">Dijital Olarak Onaylandı</p>`
                  : `<span class="sig-name-pending">İmza Bekliyor</span><p class="sig-company">${clientName}</p><p class="sig-status">İmza Bekliyor</p>`
                }
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      URL.revokeObjectURL(blobUrl);
    });
  }
};

export default function ContractsDashboardClient({ initialContracts, tenantSettings }: { initialContracts: any[], tenantSettings?: any }) {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "signed" | "expiring" | "tasks">("all");
  
  const prefs: any = tenantSettings?.preferences || {};
  const billingSettings = prefs.billing || {};
  const companySettings = {
    name: billingSettings.legalName || tenantSettings?.companyName || "StarWebFlow Digital Agent",
    logo: prefs.branding?.logoUrl || "",
    address: billingSettings.address || "Anilinerstr 3, 67105 Schifferstadt, Deutschland",
    taxId: billingSettings.taxNumber || "41/056/80705",
    vatId: billingSettings.vatId || "DE4105680705",
    email: prefs.general?.supportEmail || "info@starwebflow.com",
    website: prefs.general?.website || "www.starwebflow.com",
    phone: prefs.general?.supportPhone || "+49 179 492 4556"
  };
  
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
    selectedSector: "OTHER",
    selectedNeeds: [] as string[],
    customNotes: "",
    projectDescription: "",
    lastenheftContent: "",
    pflichtenheftContent: "",
    officialContractContent: ""
  });
  const [generatingLastenheft, setGeneratingLastenheft] = useState(false);
  const [generatingPflichtenheft, setGeneratingPflichtenheft] = useState(false);
  const [generatingContract, setGeneratingContract] = useState(false);

  // Edit states for unified Viewer/Editor Modal
  const [editContent, setEditContent] = useState("");
  const [editLanguage, setEditLanguage] = useState("tr");
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
        clientEmail: wizardData.clientEmail,
        title: wizardData.title,
        budget: wizardData.budget,
        currency: wizardData.currency,
        selectedNeeds: wizardData.selectedNeeds,
        customNotes: wizardData.customNotes,
        sector: wizardData.selectedSector,
        projectDescription: wizardData.projectDescription
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
            selectedSector: "OTHER",
            selectedNeeds: [],
            customNotes: "",
            projectDescription: "",
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
      const res = await generatePflichtenheftFromLastenheft(editContent, editLanguage);
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

  const handleGenerateMainContract = async () => {
    if (!editContent || editContent.trim() === '') {
      alert("Lütfen önce Pflichtenheft teknik şartname içeriğinin hazır olduğundan emin olun.");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateOfficialContract({
        lastenheft: "Pflichtenheft dokümanında belirtilen iş gereksinimleri.",
        pflichtenheft: editContent,
        clientName: editClientName || "Müşteri",
        title: editTitle || "B2B Projesi",
        value: editValue ? Number(editValue) : undefined,
        currency: editCurrency,
        language: editLanguage
      });
      if (res.success && res.data) {
        setEditContent(res.data);
        setEditType('MSA');
        alert("Teknik şartname (Pflichtenheft) başarıyla tüm yasal ve teknik maddeleri (NDA, SLA vb.) içeren Ana B2B Hizmet Sözleşmesine dönüştürüldü!");
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
                          setEditLanguage("tr");
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
                        onClick={() => handlePrintContract(contract, companySettings)}
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
                    <option value="MSA" className="bg-[#0A0A0F] text-white">Ana Hizmet Sözleşmesi (MSA)</option>
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

                  {/* Sektör Seçimi */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">Müşteri Sektörünü Seçin (İçerik Şablonunu Özelleştirir)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                      {SECTORS.map((sec) => {
                        const isSelected = wizardData.selectedSector === sec.code;
                        return (
                          <div 
                            key={sec.code}
                            onClick={() => {
                              setWizardData({
                                ...wizardData, 
                                selectedSector: sec.code,
                                selectedNeeds: [] // Reset selected needs on sector change
                              });
                            }}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 select-none flex flex-col justify-center min-h-[50px] ${
                              isSelected 
                                ? "bg-emerald-500/20 border-emerald-500/40 text-white" 
                                : "bg-black/30 border-white/5 text-[#94A3B8] hover:bg-white/[0.05]"
                            }`}
                          >
                            <span className="font-bold text-[10px] block">{sec.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Choice Checklist of Needs */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">Proje Hedefleri ve İhtiyaçlar (Çoklu Seçim)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                      {[
                        ...(WIZARD_NEEDS[wizardData.serviceType] || []),
                        ...(WIZARD_SECTOR_NEEDS[wizardData.selectedSector] || [])
                      ].map((need, idx) => {
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

                  {/* Proje Fikri / Açıklaması */}
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1.5 font-bold uppercase tracking-wider">Proje Fikri / Detaylı Açıklaması (Müşteri ne yapmak istediğini yazıyor)</label>
                    <textarea 
                      rows={5} 
                      value={wizardData.projectDescription}
                      onChange={(e) => setWizardData({...wizardData, projectDescription: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                      placeholder="Örn: Site bir online shop olacak. Ürün kategorileri, üyelik, abonelik vb. Kategori 1: Marie Kocht haftalık sabit menü..."
                    />
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
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setWizardStep(1)}
                        className="px-5 py-2.5 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                      >
                        Geri Dön
                      </button>

                      <button
                        onClick={async () => {
                          if (!wizardData.lastenheftContent) {
                            alert("Lastenheft içeriği bulunamadı.");
                            return;
                          }
                          setIsCreating(true);
                          try {
                            const res = await createContract({
                              tenantId: 'default-tenant',
                              title: `${wizardData.title} - Lastenheft`,
                              clientName: wizardData.clientName,
                              clientEmail: wizardData.clientEmail,
                              type: "LASTENHEFT",
                              value: wizardData.budget ? Number(wizardData.budget) : undefined,
                              currency: wizardData.currency,
                              status: "draft"
                            });
                            if (res && res.success && res.data) {
                              const updated = await updateContract(res.data.id, {
                                content: wizardData.lastenheftContent
                              });
                              if (updated && updated.success && updated.data) {
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
                                  selectedSector: "OTHER",
                                  selectedNeeds: [],
                                  customNotes: "",
                                  projectDescription: "",
                                  lastenheftContent: "",
                                  pflichtenheftContent: "",
                                  officialContractContent: ""
                                });
                                alert("Lastenheft başarıyla oluşturuldu ve kaydedildi!");
                              }
                            } else {
                              alert("Kayıt sırasında hata oluştu.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Hata oluştu.");
                          } finally {
                            setIsCreating(false);
                          }
                        }}
                        disabled={isCreating}
                        className="px-5 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-white text-sm font-semibold transition-all cursor-pointer"
                      >
                        {isCreating ? 'Kaydediliyor...' : 'Sadece Lastenheft Kaydet (Müşteri Adına)'}
                      </button>

                      {wizardData.pflichtenheftContent && (
                        <button
                          onClick={async () => {
                            setIsCreating(true);
                            try {
                              const res = await createContract({
                                tenantId: 'default-tenant',
                                title: `${wizardData.title} - Pflichtenheft`,
                                clientName: wizardData.clientName,
                                clientEmail: wizardData.clientEmail,
                                type: "PFLICHTENHEFT",
                                value: wizardData.budget ? Number(wizardData.budget) : undefined,
                                currency: wizardData.currency,
                                status: "draft"
                              });
                              if (res && res.success && res.data) {
                                const updated = await updateContract(res.data.id, {
                                  content: wizardData.pflichtenheftContent
                                });
                                if (updated && updated.success && updated.data) {
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
                                    selectedSector: "OTHER",
                                    selectedNeeds: [],
                                    customNotes: "",
                                    projectDescription: "",
                                    lastenheftContent: "",
                                    pflichtenheftContent: "",
                                    officialContractContent: ""
                                  });
                                  alert("Pflichtenheft başarıyla oluşturuldu ve kaydedildi!");
                                }
                              } else {
                                alert("Kayıt sırasında hata oluştu.");
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Hata oluştu.");
                            } finally {
                              setIsCreating(false);
                            }
                          }}
                          disabled={isCreating}
                          className="px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-white text-sm font-semibold transition-all cursor-pointer"
                        >
                          {isCreating ? 'Kaydediliyor...' : 'Sadece Pflichtenheft Kaydet'}
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={handleWizardGenerateContract}
                      disabled={generatingContract || !wizardData.pflichtenheftContent}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  if (res && res.success && res.data) {
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
                            : ['PFLICHTENHEFT', 'NDA', 'SLA', 'MSA'].includes(editType)
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase">Aşama 1</span>
                            {['PFLICHTENHEFT', 'NDA', 'SLA', 'MSA'].includes(editType) && <span className="text-xs text-emerald-400">✓ Tamamlandı</span>}
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
                            : ['NDA', 'SLA', 'MSA'].includes(editType)
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase">Aşama 2</span>
                            {['NDA', 'SLA', 'MSA'].includes(editType) && <span className="text-xs text-emerald-400">✓ Tamamlandı</span>}
                            {editType === 'PFLICHTENHEFT' && <span className="text-xs text-blue-400 animate-pulse">● Aktif Aşamada</span>}
                          </div>
                          <h4 className="font-bold text-sm text-white">Pflichtenheft (Teknik Şartname)</h4>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Taleplerin nasıl gerçekleştirileceği tasarlanır. (Wie & Womit / Nasıl & Ne ile?)</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div 
                        onClick={async () => {
                          setEditType('MSA');
                          if (editContent && editContent.length > 50 && editType === 'PFLICHTENHEFT') {
                            if (confirm('Pflichtenheft teknik şartnamesini, tüm yasal maddeleri (NDA, SLA vb.) içeren Ana B2B Sözleşmesine (MSA) AI ile otomatik dönüştürmek ister misiniz?')) {
                              await handleGenerateMainContract();
                              return;
                            }
                          }
                          if (confirm('Ana B2B Hizmet Sözleşmesi (MSA) hazır şablonunu yüklemek ister misiniz?')) {
                            setEditContent(CONTRACT_TEMPLATES.MSA || '');
                          }
                        }}
                        className={`p-4 rounded-xl border flex flex-col justify-between h-28 transition-all cursor-pointer hover:bg-white/5 ${
                          ['NDA', 'SLA', 'MSA'].includes(editType)
                            ? 'bg-blue-500/10 border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase">Aşama 3</span>
                            {editStatus === 'SIGNED' && <span className="text-xs text-emerald-400">✓ İmzalandı</span>}
                            {['NDA', 'SLA', 'MSA'].includes(editType) && editStatus !== 'SIGNED' && <span className="text-xs text-blue-400 animate-pulse">● Uzlaşma Bekliyor</span>}
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
                        <option value="MSA">Ana Hizmet Sözleşmesi (MSA)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase mb-1">Belge Dili (AI)</label>
                      <select 
                        value={editLanguage}
                        onChange={e => setEditLanguage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="tr" className="bg-[#0A0A0F] text-white">Türkçe (TR)</option>
                        <option value="en" className="bg-[#0A0A0F] text-white">English (EN)</option>
                        <option value="de" className="bg-[#0A0A0F] text-white">Deutsch (DE)</option>
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
                        {['MSA', 'NDA', 'SLA'].includes(editType) && (
                          <button
                            type="button"
                            disabled={generating}
                            onClick={handleGenerateMainContract}
                            className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded hover:bg-blue-500/20 transition-colors disabled:opacity-50 ml-2 animate-pulse"
                          >
                            {generating ? 'Üretiliyor...' : "Pflichtenheft'ten AI ile Ana Sözleşme Üret"}
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
                      }, companySettings)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Download className="w-4 h-4" /> Yazdır / PDF Kaydet
                    </button>
                  </div>

                  {/* Elite Preview Container */}
                  <div className="bg-slate-100 dark:bg-zinc-950 p-4 sm:p-8 rounded-2xl border border-white/5 space-y-8 overflow-y-auto max-h-[60vh]">
                    
                    {/* CARD 1: COVER PAGE PREVIEW */}
                    <div className="bg-white text-slate-900 shadow-xl rounded-xl p-8 sm:p-12 border border-slate-200 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '800px' }}>
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
                      
                      <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                        <div>
                          <h2 className="text-lg font-bold tracking-tight text-slate-800">{companySettings.name.toUpperCase()}</h2>
                          <p className="text-[10px] text-slate-400 mt-1">{companySettings.website}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          Belge No: {selectedContract.contractNo || selectedContract.id}
                        </span>
                      </div>

                      <div className="my-auto py-12">
                        <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3 block">{editType} DOKÜMANI</span>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          {editType === "LASTENHEFT" ? "LASTENHEFT / MÜŞTERİ TALEPLERİ" :
                           editType === "PFLICHTENHEFT" ? "PFLICHTENHEFT / TEKNİK UYGULAMA ŞARTNAMESİ" :
                           "B2B ANA HİZMET SÖZLEŞMESİ"}
                        </h1>
                        <div className="cover-divider"></div>
                        <p className="text-slate-600 text-base font-medium">{editTitle || 'Proje Belgesi'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6 text-xs text-slate-500">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">HAZIRLAYAN</h4>
                          <p className="font-semibold text-slate-800">{companySettings.name}</p>
                          <p className="text-[11px] mt-1">{companySettings.address}</p>
                          <p className="text-[11px]">E: {companySettings.email}</p>
                          {companySettings.taxId && <p className="text-[9px] text-slate-400 mt-1">St-Nr.: {companySettings.taxId}</p>}
                          {companySettings.vatId && <p className="text-[9px] text-slate-400">USt-IdNr.: {companySettings.vatId}</p>}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MUHATAP / MÜŞTERİ</h4>
                          <p className="font-semibold text-slate-800">{editClientName || 'Müşteri'}</p>
                          <p className="text-[11px] mt-1">{editClientEmail || '-'}</p>
                          <p className="text-[11px]">Bütçe: {editValue ? `${Number(editValue).toLocaleString('tr-TR')} ${editCurrency}` : 'Belirtilmedi'}</p>
                          <p className="text-[11px] mt-1">Tarih: {new Date(selectedContract.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* PAGE BREAK INDICATOR */}
                    <div className="flex items-center justify-center gap-4 py-2">
                      <div className="h-px border-dashed border-slate-300 dark:border-zinc-800 flex-1"></div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest bg-slate-200 dark:bg-zinc-800 px-3 py-1 rounded-full border border-slate-300 dark:border-zinc-800">Sayfa Sonu / Belge İçeriği</span>
                      <div className="h-px border-dashed border-slate-300 dark:border-zinc-800 flex-1"></div>
                    </div>

                    {/* CARD 2: DOCUMENT CONTENT PREVIEW */}
                    <div className="bg-white text-slate-900 shadow-xl rounded-xl p-8 sm:p-12 border border-slate-200" style={{ minHeight: '800px' }}>
                      <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                            {editType === "LASTENHEFT" ? "LASTENHEFT / MÜŞTERİ TALEPLERİ" :
                             editType === "PFLICHTENHEFT" ? "PFLICHTENHEFT / TEKNİK UYGULAMA ŞARTNAMESİ" :
                             "B2B ANA HİZMET SÖZLEŞMESİ"}
                          </span>
                          <h3 className="text-sm font-bold text-slate-800 mt-1">{editTitle || 'Proje Belgesi'}</h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Belge No: {selectedContract.contractNo || selectedContract.id}</span>
                      </div>

                      {/* Content */}
                      <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mb-12">
                        <ReactMarkdown>{editContent}</ReactMarkdown>
                      </div>

                      {/* Signatures */}
                      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs mt-12">
                        <div className="text-center">
                          <p className="text-slate-500 mb-6">Hizmet Sağlayıcı İmza</p>
                          <div className="h-12 flex items-center justify-center">
                            <span className="font-signature text-2xl text-indigo-600 block">StarWebFlow</span>
                          </div>
                          <p className="font-semibold text-slate-800 mt-2">{companySettings.name}</p>
                          <p className="text-[10px] text-slate-400">Dijital Olarak İmzalandı</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500 mb-6">Alıcı / Müşteri İmza</p>
                          <div className="h-12 flex items-center justify-center">
                            {editStatus === 'SIGNED' ? (
                              <span className="font-signature text-2xl text-emerald-600 block">{editClientName}</span>
                            ) : (
                              <span className="text-slate-300 italic block">İmza Bekliyor</span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 mt-2">{editClientName}</p>
                          <p className="text-[10px] text-slate-400">
                            {editStatus === 'SIGNED' ? 'Dijital Olarak Onaylandı' : 'İmza Bekliyor'}
                          </p>
                        </div>
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
                      if (res && res.success) {
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
                    if (res && res.success && res.data) {
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

