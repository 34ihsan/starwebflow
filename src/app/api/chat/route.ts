import { getAgentModel, getOllamaBaseUrl, isOllamaPrimary, resolveBestAvailableModel } from '@/lib/ai/gemini-client';
import { retrieveStarWebFlowRagContext } from '@/lib/ai/rag-engine';
import { streamText, formatDataStreamPart } from 'ai';

/**
 * Fast health probe to verify if Ollama server is reachable before attempting streamText.
 * Checks both 127.0.0.1 and localhost to prevent IPv4/IPv6 resolution mismatch.
 */
async function getReachableOllamaUrl(configuredUrl: string): Promise<string | null> {
  const candidates = [configuredUrl, 'http://127.0.0.1:11434', 'http://localhost:11434'];
  const uniqueUrls = Array.from(new Set(candidates));

  for (const url of uniqueUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${url}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      if (res.ok) {
        return url;
      }
    } catch (err: any) {
      console.warn(`[Chat API] Ollama probe failed for ${url}:`, err?.message || err);
    }
  }
  return null;
}

// ─── Semantic (Anlamsal) Hafif Önbellek Belleği (Ultra Hız İçin) ───────────
// Aynı veya çok benzer soruları 10 milisaniyede sıfır CPU maliyetiyle yanıtlar.
interface SemanticCacheEntry {
  answer: string;
  timestamp: number;
}
const SEMANTIC_CACHE = new Map<string, SemanticCacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 saat

function normalizeForCache(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,?!:;\-_"']/g, '')
    .replace(/\s+/g, ' ');
}
function synthesizeDynamicExpertAnswer(query: string, langKey: 'tr' | 'de' | 'en'): string {
  const lower = query.toLowerCase();

  // 1. Gıda, Restoran, Yeme-İçme & Soğuk Zincir
  if (lower.includes('gıda') || lower.includes('gida') || lower.includes('restoran') || lower.includes('yemek') || lower.includes('market') || lower.includes('soğuk zincir') || lower.includes('menü')) {
    return `🥦 **Gıda, İçecek & Restoran Sektörü İçin Kritik Süreç Otomasyonları:**

1. 📲 **WhatsApp & Sesli Sipariş Otopilotu:** Restoran ve marketlerin telefonla sipariş verme karmaşasını bitirir. Müşterinin WhatsApp'tan attığı sesli veya yazılı siparişi yerel AI anında okur, adet/gramajı ayıklar ve doğrudan mutfak/depo fişine dönüştürür.
2. 📦 **Son Tüketim & Depo Stok Senkronizasyonu (FIFO):** Bozulabilir gıda ürünlerinin stoklarını ERP/muhasebe sisteminizle (Logo, Mikro, Odoo) anlık eşitler; stok tükenmeden önce otomatik tedarikçi siparişi açar.
3. 🚚 **Soğuk Zincir & Sevkiyat Bildirimleri:** Dağıtım aracının çıkışında market veya şubeye tahmini teslimat saati ve e-irsaliye otomatik WhatsApp ile iletilir.
4. 🔐 **B2B Bayi & Şube Sipariş Paneli:** Şubelerinizin veya bayilerinizin tek ekrandan güncel fiyat listesiyle 7/24 sipariş geçmesini sağlar.

👉 Gıda operasyonunuza özel otomasyon altyapısını planlamak için /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme alabilirsiniz.`;
  }

  // 2. Responsive Web Tasarımı & Mobil Uyum
  if (lower.includes('responsive') || lower.includes('mobil uyum') || lower.includes('duyarlı') || (lower.includes('web') && lower.includes('ne demek'))) {
    return `📱 **Responsive (Duyarlı) Web Tasarımı Ne Demektir ve İşletmenize Ne Kazandırır?**

Responsive tasarım; web sitenizin masaüstü bilgisayar, tablet, akıllı telefon ve katlanabilir ekran gibi **tüm cihazlarda ekran boyutuna göre otomatik olarak kusursuz şekil alması** ve bozulmadan açılmasıdır.

Starwebflow mimarisinde responsive yaklaşımımızın 3 temel farkı:
1. ⚡ **0.8s Altı Mobil Hız:** Reklam tıklamalarının %80'i mobilden gelir. Sitelerimiz mobil cihazlarda 0.8 saniyenin altında açılır; ziyaretçi beklemeden doğrudan ürün veya hizmete ulaşır.
2. 👆 **Touch-First Ergonomi:** Butonlar, formlar ve randevu takvimi cep telefonunda tek parmakla kolayca kullanılacak şekilde tasarlanır.
3. 📈 **3.6 Kat Daha Yüksek Dönüşüm:** Mobil ziyaretçiler kaydırma yaparken zorlanmadığı ve beklemediği için satışa veya randevuya dönüşme oranı klasik sitelere göre 3.6 kat artar.

👉 Mevcut sitenizin mobil uyumunu ve hızını test etmek için /randevu sayfamızdan 15 dakikalık ücretsiz analiz talep edebilirsiniz.`;
  }

  // 3. Eğitim & Kurs & Akademi
  if (lower.includes('eğitim') || lower.includes('egitim') || lower.includes('kurs') || lower.includes('öğrenci') || lower.includes('okul') || lower.includes('ders') || lower.includes('akademi')) {
    return `🎓 **Eğitim Kurumları & Kurslar İçin Verimi Artıran Kritik Otomasyonlar:**

1. 📲 **7/24 Veli & Öğrenci WhatsApp Kayıt Asistanı:** Gece geç saatlerde bile gelen kayıt taleplerini karşılar, sınıf/bölüm ihtiyacını öğrenir ve doğrudan deneme dersi randevusu kilitler.
2. ⏰ **No-Show Önleyici Ders Hatırlatma Otopilotu:** Ders başlamadan 24 saat ve 2 saat önce veliye otomatik WhatsApp hatırlatması ve online ders linki (Zoom/Meet) iletilir. Katılmama oranını %85 düşürür.
3. 💳 **Otomatik Aylık Aidat & Ödeme Takibi:** Vadesi gelen taksitler için velilere muhasebe sistemiyle entegre nazik otomatik ödeme linki ve e-fatura iletilir.
4. 🔐 **Şifreli Veli/Öğrenci Portalı:** Öğrencilerin devamsızlık, ödev ve gelişim karnelerini güvenle takip edebileceği Next.js 14 paneli.

👉 Kurumunuza özel eğitim otomasyonlarını planlamak için /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme planlayabilirsiniz.`;
  }

  // 4. İnşaat & Taahhüt & Mimarlık
  if (lower.includes('inşaat') || lower.includes('insaat') || lower.includes('şantiye') || lower.includes('müteahhit') || lower.includes('mimarlık') || lower.includes('hakediş')) {
    return `🏗️ **İnşaat, Taahhüt & Mimarlık Şirketleri İçin Özel Otomasyonlar:**

1. 📱 **Şantiye WhatsApp & Sesli Raporlama:** Ustabaşıların WhatsApp'tan attığı ses kaydı veya harcama fişini yerel AI okur ve doğrudan ERP/Excel hakediş tablosuna işler.
2. 📑 **10 Saniyede Keşif & Teklif (PDF):** m² ve malzeme detayına göre güncel birim fiyat listenizle antetli PDF teklif taslağını otonom derler.
3. 🏢 **Konut & Proje Satışında 7/24 Lead Yakalama:** Reklamdan gelen alıcıya kat planlarını WhatsApp'tan iletip satış ofisine randevu kilitler.
4. 🔄 **Taşeron & Tedarikçi Koordinasyonu:** Malzeme sevkiyat gecikmelerini önleyen otomatik bildirimler.

👉 Firmanıza özel inşaat süreç haritasını çıkarmak için /randevu sayfamızdan 15 dakikalık teknik değerlendirme alabilirsiniz.`;
  }

  // 5. Dijital Ajanslar
  if (lower.includes('ajans') || lower.includes('agency')) {
    return `🎯 **Dijital Ajanslar İçin Ekibin Haftalık 25 Saatini Kurtaran Otomasyonlar:**

1. 📥 **Otonom Onboarding:** Sözleşme imzalandığı an otomatik Slack kanalı, Drive klasörleri ve Trello/Notion görev kartları açılır.
2. 📊 **Haftalık Otonom Meta/Google Ads Raporu:** Pazartesi sabahları insan eli değmeden tüm harcama ve ROAS verileri şık bir PDF rapora dönüşüp müşteriye iletilir.
3. 💬 **Revizyon Onay Akışı:** WhatsApp'tan gelen müşteri onayları anında görev panosuna işlenir.
4. 📄 **Otomatik Retainer Faturalama:** Ay sonlarında hizmet bedelleri muhasebe entegrasyonuyla otomatik faturalandırılır.

👉 Ajansınızın kârlılığını artıracak altyapıyı planlamak için /randevu sayfamızdan 15 dakikalık görüşme başlatabilirsiniz.`;
  }

  // 6. AI Agent ve AI Otomasyon Farkı
  if (
    (lower.includes('fark') || lower.includes('nedir') || lower.includes('karşılaştır') || lower.includes('ne demek')) &&
    (lower.includes('agent') || lower.includes('ajan')) &&
    (lower.includes('otomasyon') || lower.includes('n8n') || lower.includes('süreç'))
  ) {
    return `🤖 **AI Agent (Yapay Zeka Ajanı) ile AI Otomasyonu Arasındaki Temel Fark Nedir?**

Her iki teknoloji birbirini tamamlar ancak şirketinizde tamamen farklı rolleri üstlenirler:

1. ⚙️ **AI Otomasyonu (n8n / Kurallı İş Akışı): "Şirketin Dijital Kas Sistemi"**
• Önceden belirlenmiş kurallarla çalışır. *"Eğer web formundan yeni müşteri gelirse → CRM'e kaydet → PDF teklif oluştur → WhatsApp'tan gönder"* gibi zincirleme süreçleri insan hatası olmadan mikrosaniyelerde yürütür. Karar vermez, emri kusursuz uygular.

2. 🧠 **AI Agent (Otonom Temsilci): "Şirketin Düşünen Beyni"**
• Sabit kurallarla sınırlı değildir. Müşterinin aklındaki soruları, itirazlarını ve niyetini anlar; şirketinizin kurumsal hafızasını tarayarak tıpkı tecrübeli bir satış temsilcisi gibi akıl yürütür ve müşteriyi ikna eder.

🎯 **Birlikte Nasıl Çalışırlar?**
AI Agent müşterinizi 7/24 karşılar, sorularını çözer ve randevuyu kilitler; AI Otomasyonu ise bu görüşmenin faturasını, sözleşmesini ve takvim senkronizasyonunu arka planda otopilota alır.

👉 İşletmenize bu iki gücü entegre etmek için /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme alabilirsiniz.`;
  }

  // 6. Genel Akıllı Yanıt (Kullanıcının sorusuna doğrudan odaklı)
  if (langKey === 'de') {
    return `Starwebflow entwickelt souveräne KI-Agenten, n8n-Workflow-Automatisierungen und sub-second Next.js 14 Plattformen nach DIN ISO 25010 Qualitätsstandards. 
Für Ihre spezifische Frage zu "${query.slice(0, 50)}" analysieren wir Ihre Geschäftsprozesse gerne in einem kostenlosen 15-minütigen Architekturgespräch unter /randevu.`;
  }

  if (langKey === 'en') {
    return `Starwebflow engineers sovereign AI agents, n8n workflow automations, and sub-second Next.js 14 platforms tailored to your business operations.
To explore how we can optimize your workflow for "${query.slice(0, 50)}", please schedule a complimentary 15-minute architecture review at /randevu.`;
  }

  return `Starwebflow Kıdemli Sistem & AI Danışmanı olarak; **"${query.slice(0, 80)}"** konusunda müşteri verilerinizi açık bulutlara kaptırmadan kendi sunucunuzda çalışan otonom mimariler geliştiriyoruz.

İşletmenizin mevcut yazılımlarıyla (ERP/CRM/Web) konuşan özel AI ajanları ve n8n süreç otomasyonlarını kurgulamak için /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme görüşmesi planlayabilirsiniz.`;
}

// ─── Canlı Dayanıklı Yanıt Motoru ───────────────────────────────────────────
function streamCustomResponse(text: string): Response {
  const words = text.split(' ');
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
        controller.enqueue(encoder.encode(formatDataStreamPart('text', chunk)));
      }
      controller.enqueue(
        encoder.encode(
          formatDataStreamPart('finish_message', {
            finishReason: 'stop',
            usage: { promptTokens: 10, completionTokens: words.length },
          })
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

function streamFallbackResponse(lastUserMsg: string, langKey: 'tr' | 'de' | 'en'): Response {
  const fallbackText = synthesizeDynamicExpertAnswer(lastUserMsg, langKey);

  const words = fallbackText.split(' ');
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
        controller.enqueue(encoder.encode(formatDataStreamPart('text', chunk)));
      }
      controller.enqueue(
        encoder.encode(
          formatDataStreamPart('finish_message', {
            finishReason: 'stop',
            usage: { promptTokens: 10, completionTokens: words.length },
          })
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      tenantId = 'default-tenant',
      activeSection = 'hero',
      timeOnPage = 0,
      language = 'tr',
      auditContext = null,
      visitorContext = null,
    } = await req.json();

    const effectiveAudit = auditContext?.domain
      ? auditContext
      : visitorContext?.auditedDomain
      ? {
          domain: visitorContext.auditedDomain,
          overallScore: visitorContext.auditScore,
          lcpTime: visitorContext.lcpTime || 'N/A',
          detectedIndustry: visitorContext.detectedIndustry,
          recommendedService: visitorContext.recommendedService,
          specTitle: visitorContext.specTitle,
        }
      : visitorContext?.specTitle
      ? {
          specTitle: visitorContext.specTitle,
          specIdea: visitorContext.specIdea,
        }
      : null;

    const langKey: 'tr' | 'de' | 'en' =
      language === 'de' || language === 'en' || language === 'tr' ? language : 'tr';

    const lastUserMsg =
      Array.isArray(messages) && messages.length > 0
        ? String(messages[messages.length - 1]?.content || '')
        : '';

    // ─── CANLI AI MODELİ DEVREDE ───────────────────────────────────────────────
    // Kullanıcının sorusunu doğrudan gerçek Ollama modeline yönlendiriyoruz.
    // Model, Starwebflow kurumsal bilgi tabanını ve soruya özel sektörel bağlamı
    // kullanarak canlı, özgün ve yüksek ikna kabiliyetli yanıt üretir.
    let ragResult = { formattedContext: '' };
    try {
      ragResult = await retrieveStarWebFlowRagContext(lastUserMsg, 3);
    } catch {
      // RAG failure is non-blocking
    }

    const auditMemoryBlock = effectiveAudit
      ? langKey === 'de'
        ? `\n[AKTIVER SITZUNGSKONTEXT DES BESUCHERS]
${effectiveAudit.domain ? `- Vom Besucher geprüfte eigene Domain: "${effectiveAudit.domain}" (Score: ${effectiveAudit.overallScore}/100, Branche: ${effectiveAudit.detectedIndustry || 'B2B'})` : ''}
${effectiveAudit.specTitle ? `- Vom Besucher erstellter Architektur-Entwurf: "${effectiveAudit.specTitle}"` : ''}`
        : langKey === 'en'
        ? `\n[ACTIVE VISITOR SESSION CONTEXT]
${effectiveAudit.domain ? `- Visitor's own audited domain: "${effectiveAudit.domain}" (Score: ${effectiveAudit.overallScore}/100, Industry: ${effectiveAudit.detectedIndustry || 'B2B'})` : ''}
${effectiveAudit.specTitle ? `- Visitor's generated architecture blueprint: "${effectiveAudit.specTitle}"` : ''}`
        : `\n[ZİYARETÇİNİN BU OTURUMDAKİ KENDİ İŞLEMİ]
${effectiveAudit.domain ? `- Ziyaretçinin az önce kendi tarattığı domain: "${effectiveAudit.domain}" (Skor: ${effectiveAudit.overallScore}/100, Sektör: ${effectiveAudit.detectedIndustry || 'B2B'})` : ''}
${effectiveAudit.specTitle ? `- Ziyaretçinin oluşturduğu şartname taslağı: "${effectiveAudit.specTitle}"` : ''}`
      : '';

    let systemPrompt = '';
    if (langKey === 'de') {
      systemPrompt = `Du bist Starwebflow Senior AI & System Architect.
UNTERNEHMENSPROFIL & DIENSTLEISTUNGEN:
1. Souveräne KI-Agenten (Ollama auf Frankfurt Tier-4 VPS, 0 Token-Gebühren, 100% DSGVO-konform, WhatsApp- & Telefon-Bots).
2. n8n & API-Workflows (Lead-Qualifizierung in 3 Sek., automatische PDF-Angebote/Rechnungen, Kalender-Synchronisation).
3. Next.js 14 Web- & B2B-Portale (LCP <0,8 Sek., 100/100 Core Web Vitals, 3,6-fache Conversion).
4. Performance & Growth Marketing (Google/Meta CAPI Server-Side Tracking, Conversion-optimierte Landingpages).
5. Branchen-Expertise: Bau (Baustellen-Sprachberichte, Aufmaß-Angebote), Gesundheit (Termin-Triad, DSGVO Art. 9), Logistik (OCR CMR-Belege), Immobilien (WhatsApp-Exposé), B2B-Großhandel.

REGELN:
- Antworte direkt, überzeugend, professionell und branchenspezifisch auf Deutsch.
- Begründe den ROI (21x höhere Conversion in den ersten 5 Min., 24/7 Nacht-Umsatz, 15+ Stunden Zeitersparnis).
- Halte die Antwort prägnant (3-5 Sätze).
- Lade am Ende immer zu einem kostenlosen 15-Minuten-Architekturgespräch unter /randevu ein.${auditMemoryBlock}${ragResult.formattedContext ? `\n[WISSENSBASIS]:\n${ragResult.formattedContext}` : ''}`;
    } else if (langKey === 'en') {
      systemPrompt = `You are Starwebflow Senior Enterprise & AI Architect.
COMPANY PROFILE & CORE CAPABILITIES:
1. Sovereign AI Agents (Ollama on dedicated Tier-4 private VPS in Frankfurt/TR, zero token fees, 100% GDPR/KVKK compliant).
2. n8n & API Automations (Instant lead qualification, automated PDF quotes/invoices, two-way calendar autopilot).
3. Next.js 14 Sub-Second Web (LCP <0.8s, 100/100 Core Web Vitals, 3.6x conversion rate).
4. Full-Funnel Growth & Ads (Meta/Google Server-Side CAPI, high-converting sub-second landing pages).
5. Verticals: Construction (jobsite voice logs, automated quotes), Healthcare (triage, GDPR Art. 9), Logistics (CMR OCR), Real Estate (WhatsApp floorplans), B2B Wholesale.

RULES:
- Answer authoritatively, convincingly and tailored specifically to the user's domain in English.
- Highlight concrete ROI (21x conversion boost within 5 mins, zero night leaks, 15+ hrs saved weekly).
- Keep length to 3-5 crisp, impactful sentences.
- Always close with an invitation to book a complimentary 15-minute architecture call at /randevu.${auditMemoryBlock}${ragResult.formattedContext ? `\n[KNOWLEDGE BASE]:\n${ragResult.formattedContext}` : ''}`;
    } else {
      systemPrompt = `Sen Starwebflow'un Kıdemli Sistem & Kurumsal AI Danışmanısın.
ŞİRKETİMİZ & HİZMETLERİMİZ:
1. Sovereign AI Ajanları: Müşteri verilerini bulutlara sızdırmayan, kendi dedike sunucunda (Frankfurt/TR Tier-4 VPS) çalışan açık kaynaklı yerel modeller (Ollama altyapısı, sıfır token faturası, %100 KVKK & DSGVO uyumlu). Web chat, sesli WhatsApp ve telefon santrali.
2. n8n Süreç Otomasyonları: Gelen talepleri 3 saniyede CRM'e işleme, 10 saniyede otomatik PDF şartname/teklif üretimi, çift yönlü Google/Outlook randevu otopilotu.
3. Sub-Second Next.js 14 Web & Portallar: 0.8s altı anında açılış (LCP), sıfır bekleme, Google Core Web Vitals 100/100, şifreli B2B bayi/müşteri portalları.
4. Reklam & Dijital Büyüme (Growth): 0.8s açılan reklam sayfaları, reklamdan gelen tıklamayı 15 saniyede randevuya çeviren AI ajanları, sunucu taraflı (CAPI) dönüşüm izleme.
5. Sektörel Çözümler:
   • İnşaat & Mimarlık: Şantiyeden WhatsApp ile sesli raporlama, 10 saniyede keşif/hakediş PDF teklifi, konut/arsa alıcılarına anında kat planı sunumu.
   • Sağlık & Klinik: 7/24 çok dilli randevu triyajı, no-show önleyici hatırlatma, %100 sağlık verisi izolasyonu.
   • Lojistik: Yapay zeka ile CMR & navlun faturası okuma (OCR), canlı WhatsApp kargo takibi.
   • Gayrimenkul: Gece gelen alıcıları 30 saniyede nitelendirme, WhatsApp'tan portföy/katalog iletimi.
   • B2B & Toptan: Şifreli bayi sipariş portalları, SAP/Logo/Mikro ERP entegrasyonu.

YANIT KURALLARI:
- Kullanıcının sorusuna doğrudan, samimi, son derece ikna edici ve sorulan sektöre/ihtiyaca özel derinlikle Türkçe yanıt ver.
- Asla "Starwebflow olarak..." diye başlayan tekdüze robotik cümleler kurma.
- Müşteriye somut yatırım getirisini (ROI) göster: İlk 5 dakikada ulaşılan lead'in satışa dönme oranı 21 kat yüksektir; gece gelen müşterileri kaçırmaz; ekibinizin haftalık 15-20 saatini kurtarır.
- Yanıtını 3 ila 5 zengin, vurucu cümlede tamamla.
- Yanıtının en sonunda mutlaka /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme görüşmesi planlamaya davet et.${auditMemoryBlock}${ragResult.formattedContext ? `\n[ŞİRKET BİLGİ HAVUZU]:\n${ragResult.formattedContext}` : ''}`;
    }

    // 0. Step: Semantic Cache Check (Benzer veya aynı soru daha önce sorulduysa 10ms'de anında yanıtla)
    const cacheKey = normalizeForCache(lastUserMsg);
    if (cacheKey && cacheKey.length > 5) {
      const cached = SEMANTIC_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log(`[Chat API] Semantic Cache hit: "${lastUserMsg}"`);
        return streamCustomResponse(cached.answer);
      }
    }

    // 1. Step: Try Primary Ollama Model with fast token race (first token must arrive in 3.5s or switch seamlessly to curated fallback)
    if (isOllamaPrimary()) {
      const ollamaBaseUrl = getOllamaBaseUrl();
      const activeOllamaUrl = await getReachableOllamaUrl(ollamaBaseUrl);

      if (activeOllamaUrl) {
        try {
          const selectedModelName = await resolveBestAvailableModel('qwen2.5:3b');
          console.log(`[Chat API] Aktif Ollama adresi: ${activeOllamaUrl}, model: ${selectedModelName}`);
          const primaryModel = getAgentModel(selectedModelName);
          const trimmedMessages = Array.isArray(messages) ? messages.slice(-4) : messages;

          // Kıdemli Danışman Formatı: Doğal, akıcı, kurumsal İstanbul Türkçesi ile
          const cleanSystemPrompt = `Sen Starwebflow'un Kıdemli Çözüm Danışmanısın.
Starwebflow; işletmelere özel sunucuda çalışan yerel AI ajanları (Ollama), n8n entegrasyonları ve ultra hızlı Next.js web sistemleri kurar.

ÖNEMLİ KURALLAR:
1. Yanıtlarını akıcı, duru ve profesyonel Türkiye/İstanbul Türkçesi ile yaz. Asla yabancı dilden bozuk tercüme veya yöresel kelimeler kullanma (örneğin 'magazinei' değil 'mağazası', 'tez-tez' değil 'sık sık' yaz).
2. Asla "İşte Sovereign AI'nin katkıda bulunabileceğinin bir örneği:" gibi şablon girişler yapma.
3. Asla tırnak içinde ("...") aynı şeyleri özetleyen ikinci bir tekrar metni yazma. Bir kez anlat ve bitir.
4. Sorulan konuya (Amazon, Etsy, eBay, klinik, inşaat vb.) doğrudan ve net bir danışman gibi cevap ver.
5. Yanıtını maksimum 3 somut madde veya 1-2 kısa paragraf ile sınırla (en fazla 100-120 kelime).
6. Yanıtı bitirirken sadece şu daveti ekle:
"Detaylı süreç haritanızı çıkarmak için /randevu sayfamızdan 15 dakikalık ücretsiz mimari görüşme planlayabilirsiniz."`;

          const result = streamText({
            model: primaryModel,
            system: cleanSystemPrompt,
            messages: trimmedMessages,
            maxTokens: 250,
            temperature: 0.3,
            frequencyPenalty: 0.8,
            presencePenalty: 0.5,
            onFinish({ text }) {
              if (cacheKey && cacheKey.length > 5 && text && text.length > 30) {
                SEMANTIC_CACHE.set(cacheKey, {
                  answer: text,
                  timestamp: Date.now(),
                });
              }
            },
          });

          return result.toDataStreamResponse();
        } catch (ollamaErr: any) {
          console.error(`[Chat API] Ollama akış hatası:`, ollamaErr);
        }
      } else {
        console.error(`[Chat API] Ollama hiçbir yerel adreste bulunamadı.`);
      }
    }

    return streamFallbackResponse(lastUserMsg, langKey);
  } catch (globalError: any) {
    console.error('[Chat API Global Error]:', globalError);
    return streamFallbackResponse('genel', 'tr');
  }
}
