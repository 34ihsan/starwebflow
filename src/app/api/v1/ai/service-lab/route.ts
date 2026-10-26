import { NextResponse } from 'next/server';
import { generateTextResilient, extractJsonFromText, type StarWebflowAiDomain } from '@/lib/ai/gemini-client';

/* ─────────────────────────────────────────────────────────────────────────────
 * Service Lab — Canlı AI demo motoru (/hizmetler sayfaları)
 * kind: agent | automation | webdev | ads
 * Yerel Ollama domain modelleri → bulut yedekleri → girdiye duyarlı akıllı şablon
 * ──────────────────────────────────────────────────────────────────────────── */

export type LabKind = 'agent' | 'automation' | 'webdev' | 'ads';
type Lang = 'tr' | 'en' | 'de';

export interface LabMeta {
  provider: string;
  model: string;
  latencyMs: number;
  live: boolean;
}

export interface AgentLabResult {
  reply: string;
  intent: 'price' | 'booking' | 'info' | 'complaint' | 'other';
  leadScore: number;
  nextAction: string;
}

export interface AutomationLabResult {
  title: string;
  manualSteps: string[];
  nodes: { app: string; label: string }[];
  automationRate: number;
  hoursSavedPerMonth: number;
  monthlySavingEur: number;
  yearlySavingEur: number;
  errorReduction: number;
  insight: string;
}

export interface WebdevLabResult {
  score: number;
  issues: { title: string; fix: string }[];
  newHeadline: string;
  newSubheadline: string;
  cta: string;
  trustLine: string;
  projectedLift: number;
}

export interface AdsLabResult {
  audienceInsight: string;
  bestVariantIndex: number;
  variants: { angle: string; hook: string; primaryText: string; cta: string; predictedCtr: number }[];
}

const DOMAIN: Record<LabKind, StarWebflowAiDomain> = {
  agent: 'agent',
  automation: 'automation',
  webdev: 'growth',
  ads: 'growth',
};

/* ─── Basit IP rate limit (bellek içi) ─── */
const hits = new Map<string, number[]>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_HITS = 25;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_HITS;
}

const s = (v: unknown, max = 300) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const num = (v: unknown, def: number) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : def;
};
const langRule = (l: Lang) =>
  l === 'de' ? 'Antworte ausschließlich auf Deutsch.' : l === 'en' ? 'Respond only in English.' : 'Yalnızca Türkçe yanıt ver.';
const pick = <T,>(l: Lang, tr: T, en: T, de: T): T => (l === 'de' ? de : l === 'en' ? en : tr);

async function runModel(kind: LabKind, prompt: string, system: string, maxTokens: number, timeoutMs: number) {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
  const gen = generateTextResilient({
    prompt,
    system,
    temperature: kind === 'agent' ? 0.5 : 0.35,
    maxTokens,
    preferredModel: DOMAIN[kind],
  }).catch(() => null);
  return Promise.race([gen, timeout]);
}

function parseJson<T = any>(text: string): T | null {
  try {
    return JSON.parse(extractJsonFromText(text)) as T;
  } catch {
    return null;
  }
}

/* ════════════════════════════ AGENT ════════════════════════════ */

interface CompanyKB {
  locations: Record<Lang, string>;
  services: Record<Lang, string>;
  leadOffer: Record<Lang, string>;
}

const COMPANY_KB: Record<string, CompanyKB> = {
  'atlas emlak': {
    locations: {
      tr: 'İstanbul genelinde (özellikle Beşiktaş, Kadıköy, Sarıyer, Şişli, Ataşehir) ve Bodrum lüks portföyünde',
      en: 'across Istanbul (especially Beşiktaş, Kadıköy, Sarıyer, Şişli) and the Bodrum prime portfolio',
      de: 'in ganz Istanbul (insbesondere Beşiktaş, Kadıköy, Sarıyer, Şişli) sowie Bodrum',
    },
    services: {
      tr: 'kiralık ve satılık daireler (1+1, 2+1, 3+1, rezidans), ticari gayrimenkul ve resmi değerleme',
      en: 'rental and sale apartments (1-3 bedrooms, penthouses), commercial assets, and valuation',
      de: 'Miet- und Kaufwohnungen (1 bis 3 Zimmer), Penthouses, Gewerbeimmobilien und Wertermittlung',
    },
    leadOffer: {
      tr: 'Kriterlerinize ve bütçenize tam uyan güncel ilan listesini ve sanal tur linklerini doğrudan WhatsApp’tan gönderebilirim.',
      en: 'I can send you the exact matching listing PDF and virtual tours directly via WhatsApp.',
      de: 'Ich kann Ihnen passende Exposés und virtuelle Besichtigungslinks direkt per WhatsApp senden.',
    },
  },
  'smile dental': {
    locations: {
      tr: 'İstanbul Nişantaşı ve Kadıköy kliniklerimizde',
      en: 'at our Istanbul Nişantaşı and Kadıköy clinics',
      de: 'in unseren Kliniken in Istanbul Nişantaşı und Kadıköy',
    },
    services: {
      tr: 'İsviçre Straumann implant, Philips Zoom lazer beyazlatma, Invisalign şeffaf plak ve estetik gülüş tasarımı',
      en: 'Swiss Straumann implants, Philips Zoom whitening, Invisalign clear aligners, and smile design',
      de: 'Schweizer Straumann-Implantate, Philips Zoom Bleaching, Invisalign und Smile-Design',
    },
    leadOffer: {
      tr: 'Kliniğimizde ücretsiz 3D çene tomografisi ve uzman hekim ön muayenesi organize edebilirim.',
      en: 'I can arrange a complimentary 3D scan and specialist doctor consultation at our clinic.',
      de: 'Ich kann für Sie einen kostenlosen 3D-Scan und eine Erstuntersuchung beim Facharzt buchen.',
    },
  },
  'kaya oto servis': {
    locations: {
      tr: 'İstanbul Maslak ve Kartal Oto Sanayi servis merkezlerimizde',
      en: 'at our Istanbul Maslak and Kartal auto service centers',
      de: 'in unseren Servicezentren in Istanbul Maslak und Kartal',
    },
    services: {
      tr: 'bilgisayarlı arıza tespiti, garantili periyodik bakım, fren/lastik ve orijinal yedek parça değişimi',
      en: 'diagnostic testing, certified maintenance, brakes/tires, and original OEM parts replacement',
      de: 'computergestützte Diagnose, zertifizierte Inspektion, Bremsen/Reifen und Original-Ersatzteile',
    },
    leadOffer: {
      tr: 'Aracınızın plaka/modeline göre net parça ve işçilik dökümü çıkarıp aynı güne servis randevusu açabilirim.',
      en: 'I can generate an exact parts and labor estimate for your vehicle and reserve same-day intake.',
      de: 'Ich kann für Ihr Fahrzeug ein transparentes Teile-/Arbeitsangebot erstellen und einen Werkstatttermin buchen.',
    },
  },
  'lumi aesthetics': {
    locations: {
      tr: 'İstanbul Nişantaşı ve Bağdat Caddesi şubelerimizde',
      en: 'at our Nişantaşı and Bağdat Avenue aesthetic centers',
      de: 'in unseren Zentren in Nişantaşı und der Bağdat-Allee',
    },
    services: {
      tr: 'FDA onaylı Candela Alexandrite lazer epilasyon, medikal Hydrafacial cilt bakımı ve kolajen protokolleri',
      en: 'FDA-approved Candela laser hair removal, clinical Hydrafacial, and collagen treatments',
      de: 'FDA-zertifizierte Laser-Haarentfernung, klinisches Hydrafacial und Anti-Aging-Protokolle',
    },
    leadOffer: {
      tr: 'Uzman estetisyenimizle ücretsiz dijital cilt analizi ve deneme seansı oluşturabilirim.',
      en: 'I can book a complimentary digital skin scan and trial session with our senior aesthetician.',
      de: 'Ich kann für Sie eine kostenfreie digitale Hautanalyse und eine Probesitzung buchen.',
    },
  },
};

function getKb(company: string): CompanyKB | null {
  const norm = company.toLowerCase().trim();
  for (const [k, v] of Object.entries(COMPANY_KB)) {
    if (norm.includes(k) || k.includes(norm)) return v;
  }
  return null;
}

function detectIntent(msg: string): AgentLabResult['intent'] {
  const m = msg.toLowerCase();

  // 1. Complaint / Dissatisfaction
  if (
    /memnun\s*(kalma|değil|olma|edici)|şikayet|hata|kusur|berbat|rezalet|beğenme|problem|sorun|canım\s*acı|canım\s*yan|acıyor|ilgisiz|doktor.*gelmedi|yanlış|iptal|para\s*iade|telafi|unzufrieden|beschwerde|reklamation|schlecht|katastrophe|fehler|rückerstattung|enttäuscht|nicht zufrieden|dissatisfied|unhappy|complaint|bad service|refund|terrible|awful|horrible|mistake|disappointed|not satisfied|not happy/.test(
      m
    )
  ) {
    return 'complaint';
  }

  // 2. High-Intent Property Search / Requirement (Rental, Purchase, Budget search)
  if (
    /kiralık|satılık|daire|ev|konut|villa|arsa|ucuz|bütçe|arıyorum|bakıyorum|istiyorum|lazım|ihtiyaç|miet|kauf|wohnung|haus|suche|brauche|rent|buy|apartment|flat|house|looking for|need|searching/.test(
      m
    )
  ) {
    if (/fiyat|ücret|kaç para|ne kadar|fiyatı|kaça|price|cost|how much|preis|kosten/.test(m)) {
      return 'price';
    }
    return 'booking'; // High intent lead search
  }

  // 3. Price & Budget Inquiry
  if (/fiyat|ücret|kaç para|ne kadar|fiyatlar|fiyatı|kaça|price|cost|preis|kosten|teuer|indirim|rabatt|discount|bütçe|budget|tarife/.test(m)) {
    return 'price';
  }

  // 4. Booking & Appointment
  if (/randevu|rezerv|termin|book|appointment|müsait|available|frei|yarın|morgen|tomorrow|saat|slot|görüşme|muayene|keşif|ziyaret/.test(m)) {
    return 'booking';
  }

  // 5. Locations, Areas & General Info
  if (/\?|nasıl|ne zaman|nerede|hangi|bölge|şehir|ilçe|konum|adres|neredesiniz|how|when|where|which|location|city|wo|wann|welche|standort/.test(m)) {
    return 'info';
  }

  return 'other';
}

function scoreLead(history: { role: string; content: string }[], intent: AgentLabResult['intent']): number {
  if (intent === 'complaint') {
    return 94; // Critical churn alert
  }
  const userText = history.filter((h) => h.role === 'user').map((h) => h.content).join(' ').toLowerCase();
  let score = 45 + Math.min(history.length, 8) * 4;
  if (/kiralık|satılık|daire|ev|implant|bakım|tedavi|arıyorum|almak istiyorum/.test(userText)) score += 25;
  if (intent === 'booking') score += 20;
  if (intent === 'price') score += 15;
  if (/\d{3}[\s-]?\d{3}|@|telefon|phone|e-?mail|whatsapp/.test(userText)) score += 15;
  if (/acil|hemen|bugün|bu hafta|urgent|today|sofort|heute/.test(userText)) score += 10;
  return clamp(Math.round(score), 20, 98);
}

function agentNextAction(intent: AgentLabResult['intent'], l: Lang, company: string, message: string): string {
  const m = message.toLowerCase();
  const isRealEstate = /emlak|gayrimenkul|atlas/i.test(company) || /ev|daire|kiralık|satılık/i.test(m);

  if (intent === 'complaint') {
    return pick(
      l,
      '🚨 Öncelikli SLA bileti açıldı → Direktör & Sorumlu Ekibe anlık WhatsApp/Slack alarmı (SLA: 15dk)',
      '🚨 Priority ticket opened → Director & Team alerted via WhatsApp/Slack (15m SLA)',
      '🚨 Prioritäts-Ticket eröffnet → Geschäftsführung & Team sofort per Slack alarmiert (15-Min-SLA)'
    );
  }

  if (isRealEstate && (/kiralık|satılık|ev|daire|arıyorum|bütçe/.test(m) || intent === 'booking')) {
    return pick(
      l,
      'Portföy filtreleri CRM’e işlendi → Gayrimenkul danışmanına anlık bildirim & WhatsApp portföy listesi hazırlandı',
      'Property filters logged in CRM → Broker notified & WhatsApp portfolio PDF queued',
      'Suchkriterien im CRM erfasst → Makler informiert & WhatsApp-Exposéliste vorbereitet'
    );
  }

  const map: Record<AgentLabResult['intent'], [string, string, string]> = {
    complaint: [
      '🚨 Öncelikli SLA bileti açıldı → Direktör & Hekime anlık WhatsApp/Slack alarmı (SLA: 15dk)',
      '🚨 Priority ticket opened → Director & Lead alerted via WhatsApp/Slack (15m SLA)',
      '🚨 Prioritäts-Ticket eröffnet → Geschäftsführung & Facharzt sofort per Slack alarmiert (15-Min-SLA)',
    ],
    booking: [
      'Takvimde slot ayrıldı → WhatsApp onayı ve detay teyidi hazırlanıyor',
      'Calendar slot held → WhatsApp and SMS confirmation prepared',
      'Kalender-Slot reserviert → WhatsApp- und SMS-Bestätigung vorbereitet',
    ],
    price: [
      'Kişiye özel teklif PDF hazırlanıyor → CRM fırsatı ve randevu teklifi açıldı',
      'Personalised quote PDF drafted → CRM deal and assessment opened',
      'Individuelles Angebots-PDF erstellt → CRM-Deal angelegt',
    ],
    info: [
      'Uzman yanıtı verildi → ilgi alanı skorlanarak CRM’e senkronize edildi',
      'Expert answer provided → interest area scored and synced to CRM',
      'Fachauskunft erteilt → Interessenbereich im CRM synchronisiert',
    ],
    other: [
      'Sohbet bağlamı kaydedildi → akıllı müşteri temsilcisi takibine alındı',
      'Context saved → queued for smart representative follow-up',
      'Kontext gespeichert → in smarte Follow-up-Queue aufgenommen',
    ],
  };
  const [tr, en, de] = map[intent];
  return pick(l, tr, en, de);
}

function agentFallbackReply(company: string, sector: string, offer: string, intent: AgentLabResult['intent'], message: string, l: Lang): string {
  const c = company || pick(l, 'işletmemiz', 'our business', 'unser Unternehmen');
  const m = message.toLowerCase();
  const kb = getKb(company);

  // Scenario 1: Complaint
  if (intent === 'complaint') {
    return pick(
      l,
      `Bunu duyduğuma gerçekten çok üzüldüm; ${c} olarak hasta ve müşteri memnuniyeti bizim kırmızı çizgimizdir ve yaşadığınız deneyim kesinlikle kabul edilemez. Konuyu derhal klinik direktörümüz ve sorumlu uzman hekimimize iletiyorum. Dosyanızı hemen açıp bu durumu telafi edebilmemiz için adınızı ve telefon numaranızı paylaşabilir misiniz? En geç 15 dakika içinde bizzat sizi arayacağız.`,
      `I am genuinely sorry to hear this; at ${c}, patient satisfaction is our utmost priority and this experience is unacceptable. I am escalating your case directly to our clinical director and lead doctor right now. Could you please share your name and phone number so we can pull up your file? Our management will call you personally within 15 minutes to make this right.`,
      `Das tut mir aufrichtig leid; bei ${c} hat Ihre Zufriedenheit oberste Priorität und ein solches Erlebnis entspricht keinesfalls unserem Standard. Ich übergebe Ihr Anliegen sofort an unsere Praxisleitung und den leitenden Facharzt. Bitte nennen Sie mir Ihren Namen und Ihre Telefonnummer – die Leitung wird Sie innerhalb von 15 Minuten persönlich anrufen, um eine Lösung zu finden.`
    );
  }

  // Scenario 2: Locations / Where do you operate?
  if (/nerede|bölge|şehir|ilçe|hangi iller|hangi şehir|hangi bölge|lokasyon|konum|adres|where|location|city|wo|standort/.test(m)) {
    const loc = kb ? kb.locations[l] || kb.locations.tr : pick(l, 'merkez lokasyonlarımızda', 'at our primary locations', 'an unseren Hauptstandorten');
    return pick(
      l,
      `${c} olarak öncelikli olarak ${loc} hizmet veriyoruz. Siz tam olarak hangi ilçe veya bölgeyle ilgileniyorsunuz?`,
      `At ${c}, we primarily operate ${loc}. Which specific district or area are you interested in?`,
      `Bei ${c} sind wir vor allem ${loc} tätig. Für welchen Stadtteil oder welche Region interessieren Sie sich?`
    );
  }

  // Scenario 3: Real estate search (rental, sale, cheap apartments)
  if (/kiralık|satılık|daire|ev|konut|villa|arsa|ucuz|bütçe|arıyorum|bakıyorum|miet|kauf|wohnung|rent|buy|apartment/.test(m)) {
    return pick(
      l,
      `Portföyümüzde farklı bütçelere ve lokasyonlara uygun 1+1, 2+1 ve 3+1 seçeneklerimiz mevcut. Size nokta atışı ilanları çıkarabilmem için aradığınız ilçeyi ve maksimum aylık bütçenizi yazar mısınız? Dilerseniz güncel portföy listesini WhatsApp'tan da hemen iletebilirim.`,
      `We have carefully vetted 1 to 3-bedroom rental and sale listings suited to diverse budgets. To send you exact matches, which district do you prefer and what is your target monthly budget? I can also send the portfolio PDF directly via WhatsApp.`,
      `In unserem Portfolio haben wir passende 1- bis 3-Zimmer-Wohnungen für verschiedene Budgets. Welchen Bezirk und welches maximale Monatsbudget haben Sie im Sinn? Gerne sende ich Ihnen passende Exposés auch direkt per WhatsApp.`
    );
  }

  // Scenario 4: Pricing
  if (intent === 'price') {
    if (kb) {
      return pick(
        l,
        `${c} olarak fiyatlarımız yapılacak işleme ve ihtiyaçlarınıza göre şeffafça belirleniyor (${kb.services[l] || kb.services.tr}). Size net bir teklif sunabilmemiz için ${kb.leadOffer[l] || kb.leadOffer.tr} Hangi gün ve saat sizin için uygun olur?`,
        `At ${c}, pricing is transparently tailored to your specific scope (${kb.services[l] || kb.services.tr}). ${kb.leadOffer[l] || kb.leadOffer.tr} Which day works best for you?`,
        `Bei ${c} kalkulieren wir fair und transparent nach individuellem Umfang (${kb.services[l] || kb.services.tr}). ${kb.leadOffer[l] || kb.leadOffer.tr} Welcher Tag passt Ihnen?`
      );
    }
    return pick(
      l,
      `${c} olarak fiyatlandırmamız kişisel ihtiyaç ve kapsama göre netleştirilmektedir. Size özel dökümü hazırlayabilmemiz için kısaca detayları paylaşabilir misiniz? Dilerseniz WhatsApp üzerinden de hızlıca iletebilirim.`,
      `At ${c}, our pricing is tailored to your exact scope. Could you share brief details so I can draft an accurate estimate? I can also send it via WhatsApp.`,
      `Bei ${c} richten sich die Preise nach Ihrem individuellen Bedarf. Nennen Sie mir kurz Details für ein genaues Angebot – gerne auch per WhatsApp.`
    );
  }

  // Scenario 5: Booking / Appointment
  if (intent === 'booking') {
    return pick(
      l,
      `Harika! ${c} randevu ve görüşme takviminde bu hafta için açık saatlerimiz var: Yarın 14:30 ve Perşembe 11:00. Hangi saat sizin için daha uygun? Seçiminizi yaptığınız anda onayınızı hemen oluşturuyorum.`,
      `Wonderful! ${c} has open consultation slots this week: tomorrow at 2:30 PM and Thursday at 11:00 AM. Which one fits your schedule better? As soon as you choose, I will confirm it.`,
      `Sehr gerne! Bei ${c} haben wir diese Woche freie Termine: morgen um 14:30 Uhr und Donnerstag um 11:00 Uhr. Welcher Termin passt Ihnen besser? Ich reserviere ihn sofort für Sie.`
    );
  }

  // Scenario 6: Default fallback
  const svc = kb ? kb.services[l] || kb.services.tr : offer || sector || 'hizmetlerimiz';
  return pick(
    l,
    `${svc} konusunda size yardımcı olmaktan memnuniyet duyarım. Tam olarak neyi hedefliyorsunuz veya hangi detay hakkında bilgi almak istersiniz?`,
    `I would be delighted to assist you with ${svc}. What specific goal or detail would you like to explore?`,
    `Sehr gerne helfe ich Ihnen zu ${svc} weiter. Welches konkrete Anliegen steht für Sie im Vordergrund?`
  );
}

async function handleAgent(p: any, l: Lang) {
  const company = s(p.company, 80);
  const sector = s(p.sector, 80);
  const offer = s(p.offer, 200);
  const message = s(p.message, 400);
  const history: { role: string; content: string }[] = (Array.isArray(p.history) ? p.history : [])
    .slice(-6)
    .map((h: any) => ({ role: h?.role === 'assistant' ? 'assistant' : 'user', content: s(h?.content, 400) }))
    .filter((h: { content: string }) => h.content);

  if (!message) return { error: 'message required' };
  const fullHistory = [...history, { role: 'user', content: message }];
  const intent = detectIntent(message);
  const kb = getKb(company);

  let scenarioRules = '';
  if (intent === 'complaint') {
    scenarioRules = `DURUM: MÜŞTERİ MEMNUNİYETSİZLİK VEYA ŞİKAYET BİLDİRİYOR.
- KESİNLİKLE HİZMET SATMAYA VEYA HİZMETLERİ TEKRAR SAYMAYA ÇALIŞMA! "Ne öğrenmek istersiniz" DEME!
- Cümleye samimi ve derin bir empati/özürle başla. Müşteri memnuniyetinin kurumun kırmızı çizgisi olduğunu vurgula.
- Durumu derhal direktörümüze ve sorumlu hekime/uzmana ilettiğini söyle.
- Dosyayı inceleyip hemen telafi edebilmek için adını ve telefonunu iste; 15 dakika içinde bizzat aranacağını söyle.`;
  } else if (/nerede|bölge|şehir|ilçe|hangi iller|hangi şehir|hangi bölge|lokasyon|konum|adres/.test(message.toLowerCase())) {
    const loc = kb ? kb.locations[l] || kb.locations.tr : 'merkez lokasyonlarımız';
    scenarioRules = `DURUM: MÜŞTERİ HİZMET BÖLGESİNİ VEYA ŞEHRİ SORUYOR.
- KESİNLİKLE "herhangi bir şehirde" DEME!
- Gerçek lokasyonlarımızı belirt: ${loc}.
- Müşteriye hangi ilçe veya bölgeyle ilgilendiğini sor.`;
  } else if (/kiralık|satılık|daire|ev|konut|villa|ucuz|bütçe|arıyorum/.test(message.toLowerCase())) {
    scenarioRules = `DURUM: MÜŞTERİ KİRALIK VEYA SATILIK EV/DAİRE ARIYOR.
- Portföyümüzde 1+1, 2+1 ve 3+1 seçeneklerin olduğunu belirt.
- Müşteriye aradığı semti ve maksimum aylık bütçesini sor.
- WhatsApp'tan güncel portföy listesi göndermeyi teklif et.`;
  } else if (intent === 'price') {
    scenarioRules = `DURUM: MÜŞTERİ FİYAT SORUYOR.
- Uydurma kesin fiyat verme; tedavinin/hizmetin kişiye göre değiştiğini söyle.
- Ücretsiz ön görüşme/analiz önererek randevu veya WhatsApp teklif et.`;
  } else if (intent === 'booking') {
    scenarioRules = `DURUM: MÜŞTERİ RANDEVU İSTİYOR.
- Yarın 14:30 veya Perşembe 11:00 gibi 2 somut saat öner ve hangisini tercih ettiğini sor.`;
  } else {
    scenarioRules = `DURUM: GENEL SORU VEYA SOHBET.
- Müşterinin sorduğu spesifik noktaya doğrudan cevap ver.`;
  }

  const kbContext = kb
    ? `
GERÇEK KURUMSAL BİLGİLER:
- Lokasyonlar / Şehirler: ${kb.locations[l] || kb.locations.tr}
- Sunulan Portföy / Hizmetler: ${kb.services[l] || kb.services.tr}
- Eylem / Fırsat: ${kb.leadOffer[l] || kb.leadOffer.tr}
`
    : '';

  const system = `Sen "${company || 'Atlas Emlak'}" adlı ${sector || 'kurumun'} tecrübeli, empati yeteneği yüksek, çözüm odaklı dijital yöneticisisin. Sunulan alanlar: ${offer || sector || 'hizmetler'}.
${kbContext}
Kurallar:
${langRule(l)}
- EN ÖNEMLİ KURAL: Konuşma devam ediyorsa (history > 0), ASLA "Merhaba", "Hoş geldiniz", "Ben dijital asistanıyım" veya "${company} dijital asistanıyım" DEME! Tekrar kendini tanıtma!
- KESİNLİKLE "herhangi bir şehirde hizmet veririm" veya "size nasıl yardımcı olabilirim" gibi ezber bot cümleleri kurma!
- En fazla 2-3 kısa, akıcı ve profesyonel cümle kur.
${scenarioRules}
- Markdown, yıldız işareti (*), madde imi veya JSON formatı KULLANMA. Düz konuşma dili kullan.`;

  const transcript = fullHistory.map((h) => `${h.role === 'user' ? 'Müşteri' : 'Temsilci'}: ${h.content}`).join('\n');
  const prompt = `${transcript}\nTemsilci:`;

  const t0 = Date.now();
  const res = await runModel('agent', prompt, system, 180, 25000);
  const latencyMs = Date.now() - t0;

  let reply = '';
  if (res && res.providerUsed !== 'fallback' && res.text) {
    reply = res.text
      .replace(/^(Temsilci|Agent|Assistant|Mitarbeiter)\s*:\s*/i, '')
      .split(/\n(Müşteri|Customer|Kunde)\s*:/i)[0]
      .replace(/[*#`]/g, '')
      .trim()
      .slice(0, 600);
  }

  // Strict Anti-Loop & Anti-Echo Guardrails
  const lastAssistantMsg = (history.filter((h) => h.role === 'assistant').pop()?.content || '').toLowerCase();
  const replyLower = reply.toLowerCase();

  const isSelfIntroLoop =
    history.length > 0 &&
    /(dijital\s*asistanı(yım|dır)|olarak\s*hizmet\s*verir(im|iz)|herhangi\s*bir\s*şehirde|hoş\s*geldiniz|merhaba.*dijital\s*asistan)/i.test(
      reply
    );

  const isEchoLoop =
    lastAssistantMsg.length > 15 &&
    (replyLower === lastAssistantMsg ||
      replyLower.includes(lastAssistantMsg.slice(0, 30)) ||
      lastAssistantMsg.includes(replyLower.slice(0, 30)));

  const isEvasiveLoop = /(size\s*nasıl\s*yardımcı\s*olabilirim\??$|herhangi\s*bir\s*şehirde)/i.test(reply);

  const isComplaintMishandled =
    intent === 'complaint' &&
    (isSelfIntroLoop || !/(üzgün|özür|telafi|ileti|yetkili|direktör|yönetici|numara|telefon)/i.test(reply));

  const isLocationDeflected =
    /nerede|bölge|şehir|ilçe/.test(message.toLowerCase()) &&
    !/(istanbul|kadıköy|beşiktaş|sarıyer|şişli|bodrum|nişantaşı|maslak|kartal|bağdat|merkez)/i.test(reply);

  const isRejected = isSelfIntroLoop || isEchoLoop || isEvasiveLoop || isComplaintMishandled || isLocationDeflected;
  const live = reply.length > 8 && !isRejected;

  if (!live) {
    reply = agentFallbackReply(company, sector, offer, intent, message, l);
  }

  const data: AgentLabResult = {
    reply,
    intent,
    leadScore: scoreLead(fullHistory, intent),
    nextAction: agentNextAction(intent, l, company, message),
  };
  return {
    data,
    meta: { provider: live ? res!.providerUsed : 'smart-template', model: live ? res!.modelUsed : 'starwebflow-agent', latencyMs, live } satisfies LabMeta,
  };
}

/* ════════════════════════════ AUTOMATION ════════════════════════════ */

function automationFallback(proc: string, l: Lang): Omit<AutomationLabResult, 'hoursSavedPerMonth' | 'monthlySavingEur' | 'yearlySavingEur'> {
  const q = proc.toLowerCase();
  if (/fatura|invoice|rechnung|muhasebe|ocr|evrak|beleg/.test(q)) {
    return {
      title: pick(l, 'Otonom Fatura & Evrak İşleme Hattı', 'Autonomous Invoice & Document Pipeline', 'Autonome Rechnungs- & Beleg-Pipeline'),
      manualSteps: pick(
        l,
        ['E-postadan PDF faturayı indir', 'Kalemleri Excel’e elle gir', 'ERP ile karşılaştır, hataları ara', 'Yöneticiye onaya gönder, takip et'],
        ['Download PDF invoice from email', 'Type line items into Excel', 'Cross-check against ERP, hunt errors', 'Send to manager for approval, chase'],
        ['PDF-Rechnung aus E-Mail laden', 'Positionen manuell in Excel tippen', 'Mit ERP abgleichen, Fehler suchen', 'Zur Freigabe senden, nachhaken']
      ),
      nodes: [
        { app: 'Gmail / IMAP', label: pick(l, 'Fatura yakalandı', 'Invoice captured', 'Rechnung erfasst') },
        { app: 'Star AI OCR', label: pick(l, 'Kalem & KDV çıkarımı', 'Line-item & VAT extraction', 'Positionen & MwSt. extrahiert') },
        { app: 'ERP / DATEV', label: pick(l, 'Otomatik eşleştir & kaydet', 'Auto-match & post', 'Auto-Abgleich & Buchung') },
        { app: 'Slack', label: pick(l, 'Tek tık onay', 'One-click approval', 'Freigabe per Klick') },
      ],
      automationRate: 0.88,
      errorReduction: 97,
      insight: pick(l, 'Elle veri girişi kalkınca hem zaman hem de ay sonu mutabakat stresi biter.', 'Removing manual entry kills both the hours and month-end reconciliation stress.', 'Ohne manuelle Eingabe verschwinden Stunden und Monatsabschluss-Stress.'),
    };
  }
  if (/randevu|termin|appointment|whatsapp|müşteri mesaj|anfrage|telefon/.test(q)) {
    return {
      title: pick(l, '7/24 Talep → Randevu Otomasyonu', '24/7 Inquiry → Booking Automation', '24/7 Anfrage → Termin-Automation'),
      manualSteps: pick(
        l,
        ['Mesaj/aramaları tek tek yanıtla', 'Takvime bakıp uygun saat bul', 'Müşteriyle saat pazarlığı yap', 'Hatırlatma mesajı at, no-show takibi'],
        ['Answer messages/calls one by one', 'Check calendar for free slots', 'Negotiate times back and forth', 'Send reminders, chase no-shows'],
        ['Nachrichten/Anrufe einzeln beantworten', 'Kalender nach freien Slots prüfen', 'Termine hin und her abstimmen', 'Erinnerungen senden, No-Shows verfolgen']
      ),
      nodes: [
        { app: 'WhatsApp Cloud', label: pick(l, 'Gelen talep (7/24)', 'Inbound request (24/7)', 'Eingehende Anfrage (24/7)') },
        { app: 'Star AI', label: pick(l, 'Niyet & aciliyet analizi', 'Intent & urgency analysis', 'Absicht & Dringlichkeit') },
        { app: 'Google Calendar', label: pick(l, 'Slot ayır & onayla', 'Hold slot & confirm', 'Slot reservieren & bestätigen') },
        { app: 'HubSpot CRM', label: pick(l, 'Kayıt + 24s hatırlatma', 'Record + 24h reminder', 'Eintrag + 24h-Erinnerung') },
      ],
      automationRate: 0.82,
      errorReduction: 91,
      insight: pick(l, 'Mesai dışı gelen taleplerin %40’ı artık kaybolmuyor — doğrudan takvime düşüyor.', '40% of after-hours requests no longer vanish — they land straight in the calendar.', '40 % der Anfragen nach Feierabend gehen nicht mehr verloren – sie landen direkt im Kalender.'),
    };
  }
  return {
    title: pick(l, 'Uçtan Uca Otonom İş Akışı', 'End-to-End Autonomous Workflow', 'End-to-End Autonomer Workflow'),
    manualSteps: pick(
      l,
      ['Veriyi farklı kaynaklardan topla', 'Excel’e kopyala-yapıştır', 'Kontrol et, düzelt, raporla', 'İlgili kişilere e-postayla dağıt'],
      ['Collect data from multiple sources', 'Copy-paste into spreadsheets', 'Check, fix, build report', 'Email it to stakeholders'],
      ['Daten aus mehreren Quellen sammeln', 'In Tabellen kopieren', 'Prüfen, korrigieren, berichten', 'Per E-Mail verteilen']
    ),
    nodes: [
      { app: 'Webhook / Form', label: pick(l, 'Tetikleyici olay', 'Trigger event', 'Auslöser') },
      { app: 'Star AI', label: pick(l, 'Sınıflandır & zenginleştir', 'Classify & enrich', 'Klassifizieren & anreichern') },
      { app: 'Google Sheets / CRM', label: pick(l, 'Otomatik kayıt', 'Auto record', 'Auto-Eintrag') },
      { app: 'E-Mail / Slack', label: pick(l, 'Akıllı rapor dağıtımı', 'Smart report delivery', 'Smarte Berichtsverteilung') },
    ],
    automationRate: 0.78,
    errorReduction: 89,
    insight: pick(l, 'Tekrarlayan iş bir kez kurgulanır, sonra sonsuza kadar sıfır maliyetle çalışır.', 'Repetitive work is designed once — then runs forever at near-zero marginal cost.', 'Wiederkehrende Arbeit wird einmal gebaut – und läuft dann dauerhaft fast kostenlos.'),
  };
}

async function handleAutomation(p: any, l: Lang) {
  const proc = s(p.process, 400);
  if (!proc) return { error: 'process required' };
  const sector = s(p.sector, 60);
  const weeklyHours = clamp(num(p.weeklyHours, 10), 1, 80);
  const staff = clamp(Math.round(num(p.staff, 2)), 1, 200);
  const hourlyCost = clamp(num(p.hourlyCost, 28), 8, 250);

  const fb = automationFallback(proc, l);
  const prompt = `Manuel süreç: "${proc}" (Sektör: ${sector || 'genel'})
${langRule(l)}
Bu süreci otomatikleştir. SADECE geçerli JSON döndür:
{"title":"kısa çarpıcı otomasyon adı","manualSteps":["bugünkü manuel adım 1","adım 2","adım 3","adım 4"],"nodes":[{"app":"Araç adı","label":"kısa görev"},{"app":"Star AI","label":"..."},{"app":"...","label":"..."},{"app":"...","label":"..."}],"automationRate":0.85,"errorReduction":95,"insight":"işletme sahibine 1 cümlelik çarpıcı içgörü"}`;

  const t0 = Date.now();
  const res = await runModel('automation', prompt, 'Sen kıdemli bir iş süreçleri otomasyon mimarısın. Yalnızca JSON döndürürsün.', 210, 55000);
  const latencyMs = Date.now() - t0;
  const parsed = res && res.providerUsed !== 'fallback' ? parseJson(res.text) : null;

  const live = !!(parsed && Array.isArray(parsed.nodes) && parsed.nodes.length >= 3);
  const manualSteps: string[] =
    live && Array.isArray(parsed.manualSteps) && parsed.manualSteps.length >= 3 ? parsed.manualSteps.slice(0, 4).map((x: any) => s(x, 90)) : fb.manualSteps;
  const nodes = live
    ? parsed.nodes.slice(0, 5).map((n: any, i: number) => ({ app: s(n?.app || (i === 1 ? 'Star AI' : 'API'), 30), label: s(n?.label || n?.name, 60) }))
    : fb.nodes;
  const rawRate = live ? num(parsed.automationRate, fb.automationRate) : fb.automationRate;
  const rate = clamp(rawRate > 1 ? rawRate / 100 : rawRate, 0.5, 0.95);
  const errorReduction = clamp(Math.round(live ? num(parsed.errorReduction, fb.errorReduction) : fb.errorReduction), 60, 99);

  const hoursSavedPerMonth = Math.round(weeklyHours * 4.33 * staff * rate);
  const monthlySavingEur = Math.round(hoursSavedPerMonth * hourlyCost);

  const data: AutomationLabResult = {
    title: live && parsed.title ? s(parsed.title, 70) : fb.title,
    manualSteps,
    nodes,
    automationRate: rate,
    hoursSavedPerMonth,
    monthlySavingEur,
    yearlySavingEur: monthlySavingEur * 12,
    errorReduction,
    insight: live && parsed.insight ? s(parsed.insight, 220) : fb.insight,
  };
  return {
    data,
    meta: { provider: live ? res!.providerUsed : 'smart-template', model: live ? res!.modelUsed : 'starwebflow-automation', latencyMs, live } satisfies LabMeta,
  };
}

/* ════════════════════════════ WEBDEV (Conversion Rewriter) ════════════════════════════ */

function webdevFallback(business: string, headline: string, audience: string, goal: string, l: Lang): WebdevLabResult {
  const b = business || pick(l, 'işletmeniz', 'your business', 'Ihr Unternehmen');
  const a = audience || pick(l, 'müşterileriniz', 'your customers', 'Ihre Kunden');
  const len = headline.split(/\s+/).filter(Boolean).length;
  const generic = /hoş geldiniz|welcome|willkommen|kaliteli|quality|qualität|lider|leading|führend|en iyi|best|beste/i.test(headline);
  const score = clamp(62 - (generic ? 18 : 0) - (len > 12 ? 10 : 0) - (len < 3 ? 12 : 0) - (/\d/.test(headline) ? 0 : 6), 18, 71);
  return {
    score,
    issues: pick(
      l,
      [
        { title: generic ? 'Başlık jenerik — herkes bunu söylüyor' : 'Başlık özellik anlatıyor, sonuç değil', fix: `${a} için elde edilen somut sonucu (zaman, para, kazanç) ilk 5 kelimeye taşıyın.` },
        { title: 'Kanıt (sayı / referans) yok', fix: 'Ölçülebilir bir rakam ve tanınan bir referans ekleyerek güveni 3 saniyede kurun.' },
        { title: 'Tek ve net bir eylem çağrısı yok', fix: `“${goal || 'İletişim'}” hedefi için düşük riskli, net bir CTA kullanın.` },
      ],
      [
        { title: generic ? 'Headline is generic — everyone says it' : 'Headline sells features, not outcomes', fix: `Put the concrete outcome for ${a} (time, money, gain) in the first 5 words.` },
        { title: 'No proof (numbers / references)', fix: 'Add one measurable number and a recognisable reference to build trust in 3 seconds.' },
        { title: 'No single, clear call to action', fix: `Use one low-risk, specific CTA for your “${goal || 'contact'}” goal.` },
      ],
      [
        { title: generic ? 'Headline ist austauschbar – das sagt jeder' : 'Headline verkauft Features, keine Ergebnisse', fix: `Stellen Sie das konkrete Ergebnis für ${a} (Zeit, Geld, Gewinn) in die ersten 5 Wörter.` },
        { title: 'Kein Beweis (Zahlen / Referenzen)', fix: 'Eine messbare Zahl und eine bekannte Referenz schaffen Vertrauen in 3 Sekunden.' },
        { title: 'Kein eindeutiger Call-to-Action', fix: `Nutzen Sie einen risikoarmen, konkreten CTA für Ihr Ziel „${goal || 'Kontakt'}“.` },
      ]
    ),
    newHeadline: pick(l, `${a} için daha fazla müşteri, daha az uğraş — ${b} ile 30 günde.`, `More customers, less hassle for ${a} — with ${b} in 30 days.`, `Mehr Kunden, weniger Aufwand für ${a} – mit ${b} in 30 Tagen.`),
    newSubheadline: pick(
      l,
      `Yüzlerce işletmenin tercih ettiği ${b}, ilk görüşmeden sonra ölçülebilir sonuç garantisiyle çalışır. Risk yok, sürpriz yok.`,
      `Trusted by hundreds of businesses, ${b} works with a measurable-results guarantee from the first call. No risk, no surprises.`,
      `${b} – von Hunderten Unternehmen geschätzt – arbeitet ab dem ersten Gespräch mit Ergebnisgarantie. Kein Risiko, keine Überraschungen.`
    ),
    cta: pick(l, 'Ücretsiz Analizimi Al →', 'Get My Free Analysis →', 'Kostenlose Analyse sichern →'),
    trustLine: pick(l, '★★★★★ 4.9/5 · 300+ mutlu müşteri · Kredi kartı gerekmez', '★★★★★ 4.9/5 · 300+ happy clients · No credit card needed', '★★★★★ 4,9/5 · 300+ zufriedene Kunden · Keine Kreditkarte nötig'),
    projectedLift: clamp(Math.round((100 - score) * 1.6), 38, 140),
  };
}

async function handleWebdev(p: any, l: Lang) {
  const business = s(p.business, 120);
  const headline = s(p.headline, 200);
  const audience = s(p.audience, 120);
  const goal = s(p.goal, 60);
  if (!business && !headline) return { error: 'business or headline required' };

  const fb = webdevFallback(business, headline, audience, goal, l);
  const prompt = `İşletme: "${business}"
Mevcut web sitesi ana başlığı: "${headline || '(yok)'}"
Hedef kitle: "${audience || 'genel'}" | Sayfa hedefi: "${goal || 'iletişim talebi'}"
${langRule(l)}
Dünya standartlarında bir dönüşüm (CRO) uzmanı olarak mevcut başlığı acımasızca ama yapıcı biçimde değerlendir ve yeniden yaz. SADECE geçerli JSON döndür:
{"score":45,"issues":[{"title":"kısa sorun","fix":"somut çözüm"},{"title":"...","fix":"..."},{"title":"...","fix":"..."}],"newHeadline":"sonuç odaklı, en fazla 10 kelime","newSubheadline":"güven veren 1-2 cümle","cta":"2-4 kelimelik buton metni","trustLine":"kısa sosyal kanıt satırı","projectedLift":85}`;

  const t0 = Date.now();
  const res = await runModel('webdev', prompt, 'Sen dönüşüm oranı optimizasyonu ve satış metni yazarlığı uzmanısın. Yalnızca JSON döndürürsün.', 210, 55000);
  const latencyMs = Date.now() - t0;
  const parsed = res && res.providerUsed !== 'fallback' ? parseJson(res.text) : null;
  const live = !!(parsed && typeof parsed.newHeadline === 'string' && parsed.newHeadline.length > 6);

  const data: WebdevLabResult = live
    ? {
        score: clamp(Math.round(num(parsed.score, fb.score)), 8, 82),
        issues:
          Array.isArray(parsed.issues) && parsed.issues.length
            ? parsed.issues.slice(0, 3).map((i: any) => ({ title: s(i?.title, 90), fix: s(i?.fix, 180) }))
            : fb.issues,
        newHeadline: s(parsed.newHeadline, 120),
        newSubheadline: s(parsed.newSubheadline || fb.newSubheadline, 240),
        cta: s(parsed.cta || fb.cta, 40),
        trustLine: s(parsed.trustLine || fb.trustLine, 120),
        projectedLift: clamp(Math.round(num(parsed.projectedLift, fb.projectedLift)), 20, 180),
      }
    : fb;
  return {
    data,
    meta: { provider: live ? res!.providerUsed : 'smart-template', model: live ? res!.modelUsed : 'starwebflow-growth', latencyMs, live } satisfies LabMeta,
  };
}

/* ════════════════════════════ ADS ════════════════════════════ */

function adsFallback(product: string, audience: string, platform: string, l: Lang): AdsLabResult {
  const pr = product || pick(l, 'ürününüz', 'your product', 'Ihr Produkt');
  const au = audience || pick(l, 'hedef kitleniz', 'your audience', 'Ihre Zielgruppe');
  return {
    audienceInsight: pick(
      l,
      `${au} reklam görmekten yorgun; ürün değil “kendi sorunlarının çözüldüğü anı” görmek istiyor. İlk 1.5 saniyede acıyı adlandıran kreatif kazanır.`,
      `${au} are ad-fatigued; they don't want a product, they want to see the moment their problem disappears. Creatives that name the pain in 1.5s win.`,
      `${au} sind werbemüde; sie wollen kein Produkt, sondern den Moment sehen, in dem ihr Problem verschwindet. Creatives, die den Schmerz in 1,5 s benennen, gewinnen.`
    ),
    bestVariantIndex: 0,
    variants: [
      {
        angle: pick(l, 'Acı Noktası', 'Pain Point', 'Schmerzpunkt'),
        hook: pick(l, `Hâlâ eski yöntemle mi uğraşıyorsun? 😩`, `Still doing it the hard way? 😩`, `Immer noch auf die mühsame Art? 😩`),
        primaryText: pick(l, `${pr} ile ${au} ilk haftada farkı görüyor. Kurulum 5 dakika, sonuç kalıcı.`, `With ${pr}, ${au} see the difference in week one. 5-minute setup, lasting results.`, `Mit ${pr} sehen ${au} den Unterschied in Woche eins. 5 Minuten Setup, dauerhafte Ergebnisse.`),
        cta: pick(l, 'Hemen Dene', 'Try It Now', 'Jetzt testen'),
        predictedCtr: 3.4,
      },
      {
        angle: pick(l, 'Sosyal Kanıt', 'Social Proof', 'Social Proof'),
        hook: pick(l, `2.300+ kişi geçen ay geçiş yaptı. Sebebi bu 👇`, `2,300+ people switched last month. Here's why 👇`, `2.300+ Menschen sind letzten Monat gewechselt. Darum 👇`),
        primaryText: pick(l, `★★★★★ “Keşke daha önce başlasaydım.” ${pr}, ${platform || 'Instagram'}’da en çok konuşulan çözüm.`, `★★★★★ “Wish I'd started sooner.” ${pr} is the most talked-about solution on ${platform || 'Instagram'}.`, `★★★★★ „Hätte ich nur früher angefangen.“ ${pr} ist die meistdiskutierte Lösung auf ${platform || 'Instagram'}.`),
        cta: pick(l, 'Yorumları Gör', 'See Reviews', 'Bewertungen ansehen'),
        predictedCtr: 2.9,
      },
      {
        angle: pick(l, 'Kıtlık / Teklif', 'Scarcity / Offer', 'Knappheit / Angebot'),
        hook: pick(l, `Sadece bu hafta: %30 indirim ⏳`, `This week only: 30% off ⏳`, `Nur diese Woche: 30 % Rabatt ⏳`),
        primaryText: pick(l, `${pr} için lansman fiyatı Pazar gece bitiyor. ${au} için sınırlı kontenjan.`, `Launch pricing for ${pr} ends Sunday night. Limited spots for ${au}.`, `Der Einführungspreis für ${pr} endet Sonntagnacht. Begrenzte Plätze für ${au}.`),
        cta: pick(l, 'Fırsatı Yakala', 'Claim Offer', 'Angebot sichern'),
        predictedCtr: 3.1,
      },
    ],
  };
}

async function handleAds(p: any, l: Lang) {
  const product = s(p.product, 160);
  const audience = s(p.audience, 120);
  const platform = s(p.platform, 30) || 'Instagram';
  const goal = s(p.goal, 40);
  if (!product) return { error: 'product required' };

  const fb = adsFallback(product, audience, platform, l);
  const prompt = `Ürün/Hizmet: "${product}"
Hedef kitle: "${audience || 'genel'}" | Platform: ${platform} | Kampanya hedefi: ${goal || 'satış'}
${langRule(l)}
Performans pazarlaması uzmanı olarak 3 farklı psikolojik açıdan (acı noktası, sosyal kanıt, kıtlık/teklif) yüksek dönüşümlü reklam varyasyonu üret. SADECE geçerli JSON döndür:
{"audienceInsight":"hedef kitle hakkında 1-2 cümlelik keskin içgörü","bestVariantIndex":0,"variants":[{"angle":"Acı Noktası","hook":"ilk 1.5 saniye kancası, emoji olabilir","primaryText":"en fazla 2 cümle reklam metni","cta":"2-3 kelime","predictedCtr":3.2},{"angle":"...","hook":"...","primaryText":"...","cta":"...","predictedCtr":2.8},{"angle":"...","hook":"...","primaryText":"...","cta":"...","predictedCtr":3.0}]}`;

  const t0 = Date.now();
  const res = await runModel('ads', prompt, 'Sen Meta ve Google Ads için dönüşüm odaklı reklam metni yazan kıdemli bir performans pazarlamacısısın. Yalnızca JSON döndürürsün.', 240, 55000);
  const latencyMs = Date.now() - t0;
  const parsed = res && res.providerUsed !== 'fallback' ? parseJson(res.text) : null;
  const live = !!(parsed && Array.isArray(parsed.variants) && parsed.variants.length >= 2);

  const data: AdsLabResult = live
    ? {
        audienceInsight: s(parsed.audienceInsight || fb.audienceInsight, 260),
        bestVariantIndex: 0,
        variants: parsed.variants.slice(0, 3).map((v: any, i: number) => ({
          angle: s(v?.angle || fb.variants[i]?.angle, 30),
          hook: s(v?.hook || fb.variants[i]?.hook, 120),
          primaryText: s(v?.primaryText || v?.text || fb.variants[i]?.primaryText, 260),
          cta: s(v?.cta || fb.variants[i]?.cta, 30),
          predictedCtr: clamp(Math.round(num(v?.predictedCtr, fb.variants[i]?.predictedCtr ?? 2.8) * 10) / 10, 0.8, 6.5),
        })),
      }
    : fb;
  data.bestVariantIndex = data.variants.reduce((best, v, i, arr) => (v.predictedCtr > arr[best].predictedCtr ? i : best), 0);

  return {
    data,
    meta: { provider: live ? res!.providerUsed : 'smart-template', model: live ? res!.modelUsed : 'starwebflow-growth', latencyMs, live } satisfies LabMeta,
  };
}

/* ════════════════════════════ ROUTER ════════════════════════════ */

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || '') as LabKind;
    const raw = String(body.language || 'tr').toLowerCase();
    const lang: Lang = raw === 'de' || raw === 'en' ? raw : 'tr';
    const payload = body.payload || {};

    let out: { data?: unknown; meta?: LabMeta; error?: string };
    switch (kind) {
      case 'agent':
        out = await handleAgent(payload, lang);
        break;
      case 'automation':
        out = await handleAutomation(payload, lang);
        break;
      case 'webdev':
        out = await handleWebdev(payload, lang);
        break;
      case 'ads':
        out = await handleAds(payload, lang);
        break;
      default:
        return NextResponse.json({ error: 'Unknown lab kind' }, { status: 400 });
    }

    if (out.error) return NextResponse.json({ error: out.error }, { status: 400 });
    return NextResponse.json({ success: true, data: out.data, meta: out.meta });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Service lab error' }, { status: 500 });
  }
}
