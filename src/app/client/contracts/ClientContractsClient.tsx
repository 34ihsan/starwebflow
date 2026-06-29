'use client'

import { useState } from 'react'
import { FileSignature, Search, Download, ExternalLink, PenTool, Eye, Wand2, Plus } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { updateContractStatus, createContract, updateContract, generateLastenheftFromChoices } from '@/app/actions/contract'
import ReactMarkdown from 'react-markdown'

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

const localDict = {
  tr: {
    title: 'Sözleşmelerim',
    subtitle: 'Gizlilik, hizmet ve proje sözleşmelerinizi yönetin ve onaylayın.',
    pendingApproval: 'Onay Bekleyen',
    activeContracts: 'Aktif Sözleşmeler',
    all: 'Tümü',
    pending: 'Bekleyen',
    approved: 'Onaylanan',
    searchPlaceholder: 'Sözleşme ara...',
    notFound: 'Sözleşme Bulunamadı',
    notFoundDesc: 'Kayıtlı sözleşmeniz bulunmuyor.',
    contractName: 'Sözleşme Adı',
    status: 'Durum',
    actions: 'İşlemler',
    sign: 'İmzala',
    view: 'Görüntüle',
    pcs: 'Adet',
    statusMapping: {
      'İmza Bekliyor': 'İmza Bekliyor',
      'Onaylandı': 'Onaylandı',
      'PENDING': 'İmza Bekliyor',
      'draft': 'İmza Bekliyor',
      'SIGNED': 'Onaylandı'
    }
  },
  en: {
    title: 'My Contracts',
    subtitle: 'Manage and approve your privacy, service, and project contracts.',
    pendingApproval: 'Pending Approval',
    activeContracts: 'Active Contracts',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    searchPlaceholder: 'Search contracts...',
    notFound: 'No Contracts Found',
    notFoundDesc: 'You have no registered contracts.',
    contractName: 'Contract Name',
    status: 'Status',
    actions: 'Actions',
    sign: 'Sign',
    view: 'View',
    pcs: 'pcs',
    statusMapping: {
      'İmza Bekliyor': 'Awaiting Signature',
      'Onaylandı': 'Approved',
      'PENDING': 'Awaiting Signature',
      'draft': 'Awaiting Signature',
      'SIGNED': 'Approved'
    }
  },
  de: {
    title: 'Meine Verträge',
    subtitle: 'Verwalten und genehmigen Sie Ihre Datenschutz-, Dienstleistungs- und Projektverträge.',
    pendingApproval: 'Ausstehende Genehmigung',
    activeContracts: 'Aktive Verträge',
    all: 'Alle',
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    searchPlaceholder: 'Verträge suchen...',
    notFound: 'Keine Verträge gefunden',
    notFoundDesc: 'Sie haben keine registrierten Verträge.',
    contractName: 'Vertragsname',
    status: 'Status',
    actions: 'Aktionen',
    sign: 'Unterschreiben',
    view: 'Ansehen',
    pcs: 'Stk.',
    statusMapping: {
      'İmza Bekliyor': 'Unterschrift ausstehend',
      'Onaylandı': 'Genehmigt',
      'PENDING': 'Unterschrift ausstehend',
      'draft': 'Unterschrift ausstehend',
      'SIGNED': 'Genehmigt'
    }
  }
}

export default function ClientContractsClient({ 
  initialContracts, 
  clientInfo 
}: { 
  initialContracts: any[]; 
  clientInfo: { name: string; email: string } | null;
}) {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [contracts, setContracts] = useState<any[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Client edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSaveClientEdit = async () => {
    if (!selectedContract) return;
    setIsSavingEdit(true);
    try {
      const res = await updateContract(selectedContract.id, {
        title: editTitle,
        content: editContent
      });
      if (res && res.success && res.data) {
        setContracts(prev => prev.map(c => c.id === res.data.id ? res.data : c));
        setIsEditModalOpen(false);
        setSelectedContract(null);
        alert(language === 'tr' ? "Talebiniz başarıyla güncellendi!" : "Request successfully updated!");
      } else {
        alert("Hata oluştu.");
      }
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Client Wizard States
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [wizardData, setWizardData] = useState({
    title: "",
    budget: "",
    currency: "TRY",
    serviceType: "WEB",
    selectedSector: "OTHER",
    selectedNeeds: [] as string[],
    customNotes: "",
    projectDescription: "",
    lastenheftContent: ""
  });
  const [generatingLastenheft, setGeneratingLastenheft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleWizardSubmit = async () => {
    if (!wizardData.title) {
      alert(language === 'tr' ? "Lütfen Proje Başlığı girin." : "Please enter a project title.");
      return;
    }
    setGeneratingLastenheft(true);
    try {
      const clientName = clientInfo?.name || "Müşteri";
      const clientEmail = clientInfo?.email || "";
      
      const res = await generateLastenheftFromChoices({
        serviceType: wizardData.serviceType,
        clientName: clientName,
        clientEmail: clientEmail,
        title: wizardData.title,
        budget: wizardData.budget,
        currency: wizardData.currency,
        selectedNeeds: wizardData.selectedNeeds,
        customNotes: wizardData.customNotes,
        sector: wizardData.selectedSector,
        projectDescription: wizardData.projectDescription,
        language: language
      });
      
      if (res && res.success && res.data) {
        setIsSaving(true);
        const dbRes = await createContract({
          tenantId: 'default-tenant',
          title: wizardData.title,
          clientName: clientName,
          clientEmail: clientEmail,
          type: "LASTENHEFT",
          value: wizardData.budget ? Number(wizardData.budget) : undefined,
          currency: wizardData.currency,
          status: "draft"
        });
        
        if (dbRes && dbRes.success && dbRes.data) {
          const updated = await updateContract(dbRes.data.id, {
            content: res.data
          });
          if (updated && updated.success && updated.data) {
            setContracts(prev => [updated.data, ...prev]);
            setIsGeneratorModalOpen(false);
            setWizardData({
              title: "",
              budget: "",
              currency: "TRY",
              serviceType: "WEB",
              selectedSector: "OTHER",
              selectedNeeds: [],
              customNotes: "",
              projectDescription: "",
              lastenheftContent: ""
            });
            alert(language === 'tr' ? "Proje talebiniz (Lastenheft) başarıyla oluşturuldu ve ekibe iletildi!" : "Project request (Lastenheft) successfully created and sent!");
          }
        } else {
          alert("Kayıt sırasında hata oluştu.");
        }
      } else {
        alert(res?.error || "Gereksinimler derlenirken hata oluştu. Sunucu zaman aşımına uğramış olabilir.");
      }
    } catch (e) {
      console.error(e);
      alert("Hata oluştu.");
    } finally {
      setGeneratingLastenheft(false);
      setIsSaving(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === "ALL" ? true :
      activeTab === "PENDING" ? (c.status === "İmza Bekliyor" || c.status === "PENDING" || c.status === "draft") :
      (c.status === "Onaylandı" || c.status === "SIGNED");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-[#06B6D4]" />
            {dict.title}
          </h1>
          <p className="text-slate-400 mt-2">{dict.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsGeneratorModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#06B6D4] to-cyan-500 hover:opacity-90 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] select-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {language === 'tr' ? "Yeni Proje Talebi (Lastenheft)" : "New Project Request"}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.pendingApproval}</p>
          <h3 className="text-2xl font-bold text-orange-400 font-['Outfit'] flex items-center gap-2">
            {contracts.filter(c => c.status === 'İmza Bekliyor' || c.status === 'PENDING' || c.status === 'draft').length}
            <span className="text-sm font-normal text-slate-400">{dict.pcs}</span>
          </h3>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.activeContracts}</p>
          <h3 className="text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            {contracts.filter(c => c.status === 'Onaylandı' || c.status === 'SIGNED').length}
            <span className="text-sm font-normal text-slate-400">{dict.pcs}</span>
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0A0A0F] border border-white/[0.05] p-4 rounded-2xl">
        <div className="flex bg-[#131B2A] rounded-lg p-1 border border-white/[0.05] w-full sm:w-auto">
          {["ALL", "PENDING", "APPROVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-[#06B6D4] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "ALL" ? dict.all : tab === "PENDING" ? dict.pending : dict.approved}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
          />
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-lg">
        {filteredContracts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-dashed border border-white/[0.05] rounded-2xl m-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FileSignature className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">{dict.notFound}</h3>
            <p className="text-slate-400 text-center max-w-md">
              {dict.notFoundDesc}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-[#131B2A]/50">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.contractName}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.status}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract, i) => {
                  const isPending = contract.status === 'İmza Bekliyor' || contract.status === 'PENDING' || contract.status === 'draft';
                  const localizedStatus = dict.statusMapping[contract.status as keyof typeof dict.statusMapping] || contract.status;
                  return (
                    <tr key={contract.id} className={`group hover:bg-white/[0.02] transition-colors ${i !== filteredContracts.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isPending ? 'bg-[#06B6D4]/10' : 'bg-orange-500/10'}`}>
                            <FileSignature className={`w-5 h-5 ${!isPending ? 'text-[#06B6D4]' : 'text-orange-400'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-white">{contract.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {contract.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          !isPending ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {localizedStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedContract(contract); setIsViewModalOpen(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {dict.view}
                          </button>
                          {contract.type === 'LASTENHEFT' && (
                            <button 
                              onClick={() => {
                                setSelectedContract(contract);
                                setEditTitle(contract.title || "");
                                setEditContent(contract.content || "");
                                setIsEditModalOpen(true);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
                              title="Talebi Düzenle"
                            >
                              <PenTool className="w-4 h-4 text-amber-400" />
                              Düzenle
                            </button>
                          )}
                          {isPending && contract.type !== 'LASTENHEFT' && (
                            <button 
                              onClick={() => { setSelectedContract(contract); setIsSignModalOpen(true); }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-white text-xs font-bold transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                            >
                              <PenTool className="w-4 h-4" />
                              {dict.sign}
                            </button>
                          )}
                          <button 
                            onClick={() => handlePrintContract(contract)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" 
                            title="PDF İndir"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* E-Signature Modal */}
      {isSignModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><PenTool className="w-5 h-5 text-[#06B6D4]" /> Güvenli E-İmza</h3>
              <button onClick={() => setIsSignModalOpen(false)} className="text-[#64748B] hover:text-white p-2">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#94A3B8] mb-4">
                <strong className="text-white">{selectedContract.title}</strong> başlıklı belgeyi dijital olarak imzalamak üzeresiniz.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-32 flex flex-col items-center justify-center mb-4 border-dashed cursor-crosshair">
                <span className="text-[#06B6D4] font-signature text-2xl opacity-50">Buraya imzanızı çizin...</span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/40 text-[#06B6D4] focus:ring-[#06B6D4]" />
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
                className="px-5 py-2.5 rounded-xl bg-[#06B6D4] text-white font-medium text-sm hover:bg-cyan-400 transition-colors"
              >
                İmzayı Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Contract Modal */}
      {isViewModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#131B2A] to-black/40">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-[#06B6D4]" />
                  {selectedContract.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Sözleşme tipi: {selectedContract.type} • Belge No: {selectedContract.contractNo || selectedContract.id}</p>
              </div>
              <button 
                onClick={() => { setIsViewModalOpen(false); setSelectedContract(null); }}
                className="text-slate-400 hover:text-white p-2 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                <span className="text-sm text-slate-400">Belge Önizleme (A4 Kağıt Düzeni)</span>
                <button 
                  onClick={() => handlePrintContract(selectedContract)}
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
                    <h2 className="text-2xl font-light text-slate-400 uppercase tracking-widest">{selectedContract.type}</h2>
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
                    <p className="font-semibold text-slate-800">{selectedContract.clientName || 'Müşteri'}</p>
                    <p className="text-slate-600">{selectedContract.clientEmail || '-'}</p>
                    {selectedContract.value && (
                      <p className="text-slate-600">Bütçe: {Number(selectedContract.value).toLocaleString('tr-TR')} {selectedContract.currency}</p>
                    )}
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mb-16">
                  <ReactMarkdown>{selectedContract.content}</ReactMarkdown>
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
                    {selectedContract.status === 'SIGNED' || selectedContract.status === 'signed' ? (
                      <>
                        <span className="font-signature text-2xl text-emerald-600 block">{selectedContract.clientName}</span>
                        <p className="font-semibold text-slate-800 mt-2">{selectedContract.clientName}</p>
                        <p className="text-[10px] text-slate-400">Dijital Olarak Onaylandı</p>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300 italic block">İmza Bekliyor</span>
                        <p className="font-semibold text-slate-800 mt-2">{selectedContract.clientName}</p>
                        <p className="text-[10px] text-slate-400">Beklemede</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-[#0A0A0F]">
              <button 
                onClick={() => { setIsViewModalOpen(false); setSelectedContract(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Kapat
              </button>
              {(selectedContract.status === 'PENDING' || selectedContract.status === 'draft' || selectedContract.status === 'İmza Bekliyor') && (
                <button 
                  onClick={() => { setIsViewModalOpen(false); setIsSignModalOpen(true); }}
                  className="px-5 py-2.5 rounded-xl bg-[#06B6D4] text-white hover:bg-cyan-500 transition-colors text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <PenTool className="w-4 h-4" />
                  Sözleşmeyi İmzala
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Client Lastenheft Edit Modal */}
      {isEditModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#131B2A] to-black/40">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#06B6D4]" />
                  Talep Formu Düzenle (Lastenheft)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Gereksinim detaylarını özelleştirin.</p>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setSelectedContract(null); }}
                className="text-slate-400 hover:text-white p-2 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Proje Başlığı</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#06B6D4] transition-colors"
                />
              </div>
              
              <div className="flex-1 flex flex-col min-h-[300px]">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gereksinimler İçeriği (Markdown)</label>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 bg-[#131B2A] border border-white/[0.05] rounded-xl p-4 text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-[#06B6D4] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-[#0A0A0F]">
              <button 
                onClick={() => { setIsEditModalOpen(false); setSelectedContract(null); }}
                disabled={isSavingEdit}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button 
                onClick={handleSaveClientEdit}
                disabled={isSavingEdit || !editTitle}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {isSavingEdit ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    Kaydet ve Güncelle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Lastenheft Builder Wizard Modal */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#131B2A] to-black/40">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#06B6D4]" />
                  Yeni Proje Talebi (Lastenheft)
                </h3>
                <p className="text-xs text-slate-400 mt-1">İhtiyaçlarınızı belirleyin ve yapay zeka ile iş gereksinimleri şartnamesini hazırlayın.</p>
              </div>
              <button 
                onClick={() => setIsGeneratorModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Proje Başlığı */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Proje Başlığı</label>
                <input 
                  type="text"
                  placeholder="Örn: E-Ticaret Mobil Entegrasyonu veya Müşteri Destek Asistanı"
                  value={wizardData.title}
                  onChange={(e) => setWizardData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
                />
              </div>

              {/* Hizmet Türü Seçimi */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hizmet Türü</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'WEB', name: 'Web Geliştirme', desc: 'Modern ve hızlı web siteleri' },
                    { id: 'SAAS', name: 'B2B SaaS / Panel', desc: 'Web uygulamaları ve paneller' },
                    { id: 'AGENTS', name: 'AI Ajanları', desc: 'Akıllı LLM / Yapay zeka asistanları' },
                    { id: 'AUTOMATION', name: 'İş Akış Otomasyonu', desc: 'API / n8n / webhook entegrasyonu' },
                    { id: 'MARKETING', name: 'Sosyal Medya & Reklam', desc: 'ROAS odaklı kampanya yönetimi' }
                  ].map((srv) => (
                    <div 
                      key={srv.id}
                      onClick={() => setWizardData(prev => ({ ...prev, serviceType: srv.id, selectedNeeds: [] }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        wizardData.serviceType === srv.id 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/5' 
                          : 'border-white/5 hover:border-white/10 bg-white/[0.01]'
                      }`}
                    >
                      <h4 className="font-bold text-white text-sm">{srv.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{srv.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sektör Seçimi */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sektörünüzü Seçin (Taleplerinizi Sektöre Özel Özelleştirir)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SECTORS.map((sec) => (
                    <div 
                      key={sec.code}
                      onClick={() => setWizardData(prev => ({ ...prev, selectedSector: sec.code, selectedNeeds: [] }))}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                        wizardData.selectedSector === sec.code 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/5 text-white' 
                          : 'border-white/5 hover:border-white/10 bg-[#131B2A]/30 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-[10px] block">{sec.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hedefler & İhtiyaçlar Checkbox Listesi */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Bu Projeden Beklentileriniz & Hedefleriniz (Çoklu Seçim)
                </label>
                <div className="space-y-2">
                  {[
                    ...(WIZARD_NEEDS[wizardData.serviceType] || []),
                    ...(WIZARD_SECTOR_NEEDS[wizardData.selectedSector] || [])
                  ].map((need) => {
                    const isSelected = wizardData.selectedNeeds.includes(need);
                    return (
                      <label 
                        key={need}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? 'border-[#06B6D4]/40 bg-[#06B6D4]/5 text-white' : 'border-white/5 hover:border-white/10 text-slate-400'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setWizardData(prev => {
                              const alreadySelected = prev.selectedNeeds.includes(need);
                              const next = alreadySelected 
                                ? prev.selectedNeeds.filter(x => x !== need)
                                : [...prev.selectedNeeds, need];
                              return { ...prev, selectedNeeds: next };
                            });
                          }}
                          className="mt-0.5 rounded border-white/10 bg-black/40 text-[#06B6D4] focus:ring-[#06B6D4]"
                        />
                        <span className="text-sm">{need}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Bütçe Aralığı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Öngörülen Bütçe</label>
                  <input 
                    type="number"
                    placeholder="Örn: 2500"
                    value={wizardData.budget}
                    onChange={(e) => setWizardData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Para Birimi</label>
                  <select 
                    value={wizardData.currency}
                    onChange={(e) => setWizardData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#06B6D4] transition-colors"
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Proje Fikri / Açıklaması */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Proje Fikri / Detaylı Açıklaması (Müşteri ne yapmak istediğini yazıyor)</label>
                <textarea 
                  rows={5}
                  placeholder="Örn: Site bir online shop olacak. Ürün kategorileri, üyelik, abonelik vs. Kategori 1: Marie Kocht haftalık sabit menü..."
                  value={wizardData.projectDescription}
                  onChange={(e) => setWizardData(prev => ({ ...prev, projectDescription: e.target.value }))}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors resize-none"
                />
              </div>

              {/* Ekstra Notlar */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ekstra Notlar / İstekler (Opsiyonel)</label>
                <textarea 
                  rows={3}
                  placeholder="Projenizle ilgili belirtmek istediğiniz diğer özel gereksinimleri yazın..."
                  value={wizardData.customNotes}
                  onChange={(e) => setWizardData(prev => ({ ...prev, customNotes: e.target.value }))}
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-[#0A0A0F]">
              <button 
                onClick={() => setIsGeneratorModalOpen(false)}
                disabled={generatingLastenheft || isSaving}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium disabled:opacity-50"
              >
                İptal
              </button>
              <button 
                onClick={handleWizardSubmit}
                disabled={generatingLastenheft || isSaving || !wizardData.title}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {generatingLastenheft || isSaving ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Lastenheft Derleniyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Talebi Gönder (Lastenheft Üret)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
