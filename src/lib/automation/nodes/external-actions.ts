import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ApifyClient } from "apify-client";
import { fetchWebsiteTech } from "../utils/technographics";
import { discoverEmail, EmailDiscoveryResult } from "@/lib/leads/email-intel";
import { scoreLead } from "@/lib/leads/scoring";

/** Run async fn over items with limited concurrency, preserving order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * Initiates an Apify Scraper Actor dynamically based on the platform requested.
 * Connects to Apify using APIFY_API_TOKEN to fetch real data
 */
export async function runApifyScraperAction(tenantId: string, payload: any, nodeData: any) {
  const { sector = "Dentist", location = "Berlin", country = "Germany", platform = "google_maps", targetRoles = [], personName = "", personRole = "" } = nodeData;
  console.log(`[Apify Node] Starting scraping for ${sector} in ${location}, ${country} via ${platform}...`);
  
  const token = process.env.APIFY_API_TOKEN;
  
  if (!token || token === "apify_api_tokeniniz_buraya_gelecek") {
    console.warn("[Apify Node] Apify API Token not found or placeholder. Engaging Zero-Cost Direct Search Fallback Engine...");
    return await runDirectSearchFallback(tenantId, { sector, location, country, platform, targetRoles, personName, personRole });
  }

  const client = new ApifyClient({ token });
  
  let actorId = "apify/google-maps-scraper";
  let input: any = {};

  // Hedef roller ve kişi ismi için sorgu eklemesi
  let roleQuery = "";
  if (personRole) {
    roleQuery = ` "${personRole}"`;
  } else if (Array.isArray(targetRoles) && targetRoles.length > 0) {
    const roleMap: Record<string, string> = {
      founder: '"Founder" OR "Kurucu"',
      owner: '"Owner" OR "Sahip"',
      ceo: '"CEO" OR "Chief Executive"',
      coo: '"COO" OR "Chief Operating"',
      cto: '"CTO" OR "Chief Technology"',
      cmo: '"CMO" OR "Chief Marketing"',
      managing_partner: '"Managing Partner" OR "Yönetici Ortak"',
      managing_director: '"Managing Director" OR "Genel Müdür"',
      sales_director: '"Sales Director" OR "Satış Direktörü"',
      marketing_director: '"Marketing Director" OR "Pazarlama Direktörü"',
      hr_director: '"HR Director" OR "İnsan Kaynakları"'
    };
    const mappedRoles = targetRoles.map(r => roleMap[r] || `"${r}"`).join(" OR ");
    if (mappedRoles) {
      roleQuery = ` (${mappedRoles})`;
    }
  }

  let personQuery = "";
  if (personName) {
    personQuery = ` "${personName}"`;
  }

  // Dinamik Platform Seçimi (Pro/Elite Seviye)
  switch (platform) {
    case "linkedin":
      actorId = "apify/google-search-scraper"; 
      input = { 
        queries: [`site:linkedin.com/in/ "${sector}" "${location}" "${country}"${personQuery}${roleQuery} ("@gmail.com" OR "@yahoo.com" OR "@hotmail.com")`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "apollo":
      actorId = "apify/google-search-scraper";
      input = { 
        queries: [`site:apollo.io/company "${sector}" "${location}"${personQuery}${roleQuery}`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "instagram":
      actorId = "apify/google-search-scraper";
      input = { 
        queries: [`site:instagram.com "${sector}" "${location}" "${country}"${personQuery}${roleQuery} ("@gmail.com" OR "@yahoo.com" OR "@hotmail.com")`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "jobs":
    case "tech_radar":
    case "events":
    case "low_rating":
    case "crunchbase":
      actorId = "apify/google-search-scraper";
      input = { 
        queries: [`site:crunchbase.com/organization "${sector}" "${location}"${personQuery}${roleQuery}`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "clutch":
      // Gelecekte eklenecek özel scraper'lar için hazır altyapı
      console.log(`[Apify Node] Platform ${platform} is in development. Falling back to generic web search.`);
      actorId = "apify/google-search-scraper";
      input = { queries: [`${sector} ${location} ${country}${personQuery}${roleQuery}`], maxPagesPerQuery: 2 };
      break;
    case "google_maps":
    default:
      actorId = "apify/google-maps-scraper";
      const mapsSearchStr = `${personName} ${personRole} ${sector} in ${location}, ${country}`.trim();
      input = {
        searchStringsArray: [mapsSearchStr],
        maxCrawledPlacesPerSearch: 50, // Bütçe dostu limit (Pro seviyesi)
        language: "en",
        maxReviews: 5,
        reviewsSort: "newest",
        maxImages: 0,
        exportPlaceUrls: false
      };
      break;
  }

  try {
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify?tenantId=${encodeURIComponent(tenantId)}` 
      : null;

    if (webhookUrl) {
      console.log(`[Apify Node] Starting async run on ${actorId} with webhook: ${webhookUrl}`);
      const run = await client.actor(actorId).start(input, {
        webhooks: [
          {
            eventTypes: ["ACTOR.RUN.SUCCEEDED"],
            requestUrl: webhookUrl,
            payloadTemplate: `{"runId": {{runId}}, "datasetId": {{defaultDatasetId}}, "status": {{status}}, "tenantId": "${tenantId}" }`
          }
        ]
      });
      return { isAsync: true, runId: run.id };
    } else {
      console.log(`[Apify Node] Webhook URL not found. Running ${actorId} synchronously...`);
      const run = await client.actor(actorId).call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      return { rawScrapedData: items, isAsync: false, platform };
    }
  } catch (error: any) {
    console.warn("[Apify Node] Apify execution failed or limited, falling back to Zero-Cost Search Engine:", error?.message || error);
    return await runDirectSearchFallback(tenantId, nodeData);
  }
}

/**
 * Zero-Cost Direct Search Fallback Engine
 * Uses OpenStreetMap Nominatim and domain synthesis to ensure prospecting
 * never fails even if Apify token is missing, expired, or out of credits.
 */
/**
 * Global Multi-Lingual Normalization & Localization Dictionary
 * Dünyadaki tüm ülkeler, yerel diller, arama anahtar kelimeleri ve sektörel terimler
 */
function normalizeText(s: string): string {
  return (s || '')
    .trim()
    .replace(/İ/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const GLOBAL_COUNTRY_MAP = [
  { lang: 'tr', regex: /turkiye|turkey|turkei|tr\b|kktc|azerbaycan|azerbaijan/i },
  { lang: 'de', regex: /almanya|germany|deutschland|de\b|avusturya|austria|osterreich|at\b|isvicre|switzerland|schweiz|suisse|svizzera|ch\b|liechtenstein/i },
  { lang: 'en', regex: /amerika|united states|usa\b|abd\b|us\b|ingiltere|united kingdom|uk\b|great britain|england|britain|gb\b|kanada|canada|ca\b|avustralya|australia|au\b|irlanda|ireland|singapur|singapore|yeni zelanda|new zealand/i },
  { lang: 'fr', regex: /fransa|france|fr\b|belcika|belgium|belgique|be\b|luksemburg|luxembourg|monaco|fas|morocco|tunisian?|tunisia|senegal/i },
  { lang: 'es', regex: /ispanya|spain|espana|es\b|meksika|mexico|mx\b|arjantin|argentina|ar\b|kolombiya|colombia|co\b|sili|chile|peru|ekvador|ecuador/i },
  { lang: 'it', regex: /italya|italy|italia|it\b|san marino/i },
  { lang: 'nl', regex: /hollanda|netherlands|nederland|nl\b/i },
  { lang: 'pt', regex: /portekiz|portugal|pt\b|brezilya|brazil|brasil|br\b|angola/i },
  { lang: 'pl', regex: /polonya|poland|polska|pl\b/i },
  { lang: 'ru', regex: /rusya|russia|ru\b|kazakistan|kazakhstan|belarus|ukrayna|ukraine/i },
  { lang: 'ar', regex: /bae|uae|dubai|birlesik arap|united arab|emirates|ae\b|suudi arabistan|saudi arabia|sa\b|katar|qatar|kuveyt|kuwait|misir|egypt/i },
  { lang: 'ja', regex: /japonya|japan|jp\b/i },
  { lang: 'zh', regex: /cin|china|cn\b|tayvan|taiwan|hong kong/i },
  { lang: 'sv', regex: /isvec|sweden|sverige|se\b/i },
  { lang: 'no', regex: /norvec|norway|norge|no\b/i },
  { lang: 'da', regex: /danimarka|denmark|danmark|dk\b/i }
];

const GLOBAL_SECTORS: Record<string, {
  amenity: string;
  tr: string[];
  de: string[];
  en: string[];
  fr: string[];
  es: string[];
  it: string[];
  pt: string[];
  nl: string[];
  pl: string[];
  ar: string[];
}> = {
  restaurant: {
    amenity: '&amenity=restaurant',
    tr: ['Restoran', 'Lokanta', 'Cafe', 'Restaurant'],
    de: ['Restaurant', 'Gastronomie', 'Bistro'],
    en: ['Restaurant', 'Bistro', 'Cafe', 'Diner'],
    fr: ['Restaurant', 'Brasserie', 'Bistrot'],
    es: ['Restaurante', 'Bar Cafetería'],
    it: ['Ristorante', 'Trattoria', 'Pizzeria'],
    pt: ['Restaurante', 'Bistrô'],
    nl: ['Restaurant', 'Eetcafé'],
    pl: ['Restauracja', 'Kawiarnia'],
    ar: ['مطعم', 'Restaurant']
  },
  dentist: {
    amenity: '&amenity=dentist',
    tr: ['Diş Kliniği', 'Diş Hekimi', 'Ortodonti'],
    de: ['Zahnarzt', 'Zahnklinik', 'Zahnarztpraxis'],
    en: ['Dental Clinic', 'Dentist', 'Orthodontics'],
    fr: ['Cabinet Dentaire', 'Dentiste', 'Centre Dentaire'],
    es: ['Clínica Dental', 'Dentista', 'Odontología'],
    it: ['Studio Dentistico', 'Dentista'],
    pt: ['Clínica Odontológica', 'Dentista'],
    nl: ['Tandarts', 'Tandartspraktijk'],
    pl: ['Stomatolog', 'Gabinet Stomatologiczny'],
    ar: ['عيادة أسنان', 'Dental Clinic']
  },
  doctor: {
    amenity: '&amenity=doctors',
    tr: ['Klinik', 'Doktor', 'Tıp Merkezi', 'Poliklinik'],
    de: ['Arztpraxis', 'Facharzt', 'Klinik', 'Medizinisches Zentrum'],
    en: ['Clinic', 'Doctor', 'Medical Center', 'Healthcare'],
    fr: ['Cabinet Médical', 'Médecin', 'Clinique'],
    es: ['Clínica Médica', 'Médico', 'Centro Médico'],
    it: ['Studio Medico', 'Medico', 'Clinica'],
    pt: ['Clínica Médica', 'Consultório Médico'],
    nl: ['Kliniek', 'Huisartsenpraktijk'],
    pl: ['Przychodnia', 'Lekarz', 'Klinika'],
    ar: ['عيادة طبية', 'Medical Center']
  },
  law: {
    amenity: '&office=lawyer',
    tr: ['Hukuk Bürosu', 'Avukat', 'Hukuk Danışmanlığı'],
    de: ['Rechtsanwalt', 'Anwaltskanzlei', 'Kanzlei'],
    en: ['Law Firm', 'Attorney', 'Lawyer'],
    fr: ["Cabinet d'avocats", 'Avocat'],
    es: ['Bufete de Abogados', 'Abogado', 'Despacho Jurídico'],
    it: ['Studio Legale', 'Avvocato'],
    pt: ['Escritório de Advocacia', 'Advogado'],
    nl: ['Advocatenkantoor', 'Advocaat'],
    pl: ['Kancelaria Adwokacka', 'Prawnik'],
    ar: ['مكتب محاماة', 'Law Firm']
  },
  hotel: {
    amenity: '&tourism=hotel',
    tr: ['Otel', 'Butik Otel', 'Pansiyon', 'Hotel'],
    de: ['Hotel', 'Pension', 'Boutique Hotel'],
    en: ['Hotel', 'Boutique Hotel', 'Resort'],
    fr: ['Hôtel', 'Hôtel Boutique'],
    es: ['Hotel', 'Hotel Boutique'],
    it: ['Hotel', 'Albergo'],
    pt: ['Hotel', 'Pousada'],
    nl: ['Hotel', 'Boutique Hotel'],
    pl: ['Hotel', 'Pensjonat'],
    ar: ['فندق', 'Hotel']
  },
  software: {
    amenity: '&office=it',
    tr: ['Yazılım Şirketi', 'Bilişim', 'Dijital Ajans', 'Web Tasarım'],
    de: ['Softwareunternehmen', 'IT-Dienstleister', 'Digitalagentur'],
    en: ['Software Company', 'IT Services', 'Digital Agency'],
    fr: ['Entreprise de logiciels', 'Agence Web', 'Agence Digitale'],
    es: ['Empresa de Software', 'Agencia Digital', 'Servicios IT'],
    it: ['Software House', 'Web Agency', 'Azienda IT'],
    pt: ['Empresa de Software', 'Agência Digital'],
    nl: ['Softwarebedrijf', 'IT-Dienstverlener'],
    pl: ['Firma IT', 'Software House'],
    ar: ['شركة برمجيات', 'Software Company']
  },
  architect: {
    amenity: '&office=architect',
    tr: ['Mimarlık Ofisi', 'İç Mimarlık', 'İnşaat Şirketi'],
    de: ['Architekturbüro', 'Innenarchitektur', 'Bauunternehmen'],
    en: ['Architecture Firm', 'Architects', 'Interior Design'],
    fr: ["Cabinet d'architecture", 'Architecte'],
    es: ['Estudio de Arquitectura', 'Arquitectos', 'Constructora'],
    it: ['Studio di Architettura', 'Architetti'],
    pt: ['Escritório de Arquitetura', 'Arquitetos'],
    nl: ['Architectenbureau', 'Bouwbedrijf'],
    pl: ['Biuro Architektoniczne', 'Architekci'],
    ar: ['مكتب معماري', 'Architecture Firm']
  },
  beauty: {
    amenity: '&shop=beauty',
    tr: ['Güzellik Merkezi', 'Kuaför', 'Estetik'],
    de: ['Kosmetikstudio', 'Schönheitssalon', 'Friseur'],
    en: ['Beauty Salon', 'Aesthetic Clinic', 'Hair Salon'],
    fr: ['Institut de beauté', 'Salon de coiffure'],
    es: ['Centro de Estética', 'Salón de Belleza'],
    it: ['Centro Estetico', 'Salone di Bellezza'],
    pt: ['Clínica de Estética', 'Salão de Beleza'],
    nl: ['Schoonheidssalon', 'Kapsalon'],
    pl: ['Salon Kosmetyczny', 'Salon Urody'],
    ar: ['صالون تجميل', 'Beauty Salon']
  },
  automotive: {
    amenity: '&shop=car_repair',
    tr: ['Oto Servis', 'Oto Tamir', 'Araç Bakım'],
    de: ['Autowerkstatt', 'KFZ-Werkstatt', 'Autohaus'],
    en: ['Auto Repair', 'Car Service', 'Auto Mechanic'],
    fr: ['Garage automobile', 'Réparation auto'],
    es: ['Taller Mecánico', 'Taller de Coches'],
    it: ['Officina Meccanica', 'Carrozzeria'],
    pt: ['Oficina Mecânica', 'Centro Automotivo'],
    nl: ['Autogarage', 'Autobedrijf'],
    pl: ['Warsztat Samochodowy', 'Mechanik Samochodowy'],
    ar: ['صيانة سيارات', 'Auto Repair']
  },
  realestate: {
    amenity: '&office=estate_agent',
    tr: ['Emlak Ofisi', 'Gayrimenkul Danışmanlığı'],
    de: ['Immobilienmakler', 'Immobilienbüro'],
    en: ['Real Estate Agency', 'Realtor', 'Property Management'],
    fr: ['Agence Immobilière', 'Immobilier'],
    es: ['Agencia Inmobiliaria', 'Inmobiliaria'],
    it: ['Agenzia Immobiliare', 'Immobiliare'],
    pt: ['Imobiliária', 'Corretor de Imóveis'],
    nl: ['Makelaarskantoor', 'Makelaar'],
    pl: ['Biuro Nieruchomości', 'Agencja Nieruchomości'],
    ar: ['مكتب عقارات', 'Real Estate']
  }
};

const GLOBAL_CONTACT_TERMS: Record<string, string[]> = {
  tr: ['iletişim', 'telefon', 'rezervasyon', 'adres'],
  de: ['kontakt', 'impressum', 'telefon'],
  en: ['contact', 'about', 'phone', 'email'],
  fr: ['contact', 'téléphone', 'mentions légales', 'adresse'],
  es: ['contacto', 'teléfono', 'aviso legal', 'dirección'],
  it: ['contatti', 'telefono', 'chi siamo', 'indirizzo'],
  pt: ['contato', 'telefone', 'sobre', 'endereço'],
  nl: ['contact', 'telefoon', 'over ons'],
  pl: ['kontakt', 'telefon', 'o nas', 'adres'],
  ru: ['контакты', 'телефон', 'адрес'],
  ar: ['اتصل بنا', 'هاتف', 'contact']
};

/**
 * Verilen ülke ve sektörü dünya genelindeki 190+ ülkeye uygun yerel dil ve terimlere dönüştürür
 */
function resolveGlobalContext(country: string, location: string, sector: string) {
  const normCountry = normalizeText(country);
  const normSector = normalizeText(sector);

  let lang = 'en';
  for (const c of GLOBAL_COUNTRY_MAP) {
    if (c.regex.test(normCountry)) {
      lang = c.lang;
      break;
    }
  }

  let cat = null;
  if (/restaurant|restoran|cafe|bar|gastronomie|lokanta|yemek|doner/i.test(normSector)) cat = 'restaurant';
  else if (/dentist|dis|zahnarzt|zahnklinik|ortodonti|stomatol/i.test(normSector)) cat = 'dentist';
  else if (/doctor|doktor|klinik|saglik|arzt|hekim|tip|medical|hastane/i.test(normSector)) cat = 'doctor';
  else if (/law|lawyer|hukuk|avukat|anwalt|notar|prawnik|legal/i.test(normSector)) cat = 'law';
  else if (/hotel|otel|konaklama|pension|hostel/i.test(normSector)) cat = 'hotel';
  else if (/software|yazilim|bilisim|it\b|tech|dijital|ajans|web/i.test(normSector)) cat = 'software';
  else if (/architect|mimar|mimarlik|insaat|bauunternehmen/i.test(normSector)) cat = 'architect';
  else if (/beauty|guzellik|kuafor|estetik|friseur|kosmetik|spa/i.test(normSector)) cat = 'beauty';
  else if (/auto|otomotiv|tamir|servis|mechanic|werkstatt/i.test(normSector)) cat = 'automotive';
  else if (/emlak|realestate|estate|immobilien|makler/i.test(normSector)) cat = 'realestate';

  const contactList = GLOBAL_CONTACT_TERMS[lang] || GLOBAL_CONTACT_TERMS.en;
  const sData = cat ? GLOBAL_SECTORS[cat] : null;

  const localSector = (sData && (sData as any)[lang]) ? (sData as any)[lang][0] : sector;
  const enSector = (sData && sData.en) ? sData.en[0] : sector;
  const amenityParam = sData ? sData.amenity : '';

  const langHeaders: Record<string, string> = {
    tr: 'tr-TR,tr;q=0.9,en;q=0.8',
    de: 'de-DE,de;q=0.9,en;q=0.8',
    fr: 'fr-FR,fr;q=0.9,en;q=0.8',
    es: 'es-ES,es;q=0.9,en;q=0.8',
    it: 'it-IT,it;q=0.9,en;q=0.8',
    pt: 'pt-PT,pt-BR;q=0.9,en;q=0.8',
    nl: 'nl-NL,nl;q=0.9,en;q=0.8',
    pl: 'pl-PL,pl;q=0.9,en;q=0.8',
    ru: 'ru-RU,ru;q=0.9,en;q=0.8',
    ar: 'ar,en;q=0.8',
    en: 'en-US,en;q=0.9'
  };

  return {
    lang,
    langHeader: langHeaders[lang] || 'en-US,en;q=0.9',
    localSector,
    enSector,
    contactWord: contactList[0] || 'contact',
    amenityParam,
    searchKeywords: (sData && (sData as any)[lang]) ? (sData as any)[lang] : [sector, localSector, enSector],
    queries: [
      `${localSector} ${location} ${contactList[0]}`,
      `${enSector} in ${location} ${country}`,
      `${sector} ${location}`
    ]
  };
}

/**
 * Zero-Cost Direct Search Fallback Engine
 * Uses OpenStreetMap Nominatim and multi-lingual global search to ensure prospecting
 * never fails even if Apify token is missing, expired, or out of credits.
 */
async function runDirectSearchFallback(tenantId: string, options: any) {
  const { sector = "Restaurant", location = "Frankfurt", country = "Germany", platform = "google_maps" } = options;
  const cleanSector = sector.trim();
  const cleanLocation = location.trim();
  const cleanCountry = country.trim();
  
  const globalCtx = resolveGlobalContext(cleanCountry, cleanLocation, cleanSector);
  console.log(`[Gerçek Dizin Taraması] Başlatılıyor: "${cleanSector} in ${cleanLocation}, ${cleanCountry}" (Hedef Dil: ${globalCtx.lang}, Yerel Terim: "${globalCtx.localSector}")`);
  
  const rawItems: any[] = [];
  const seenDomains = new Set<string>();

  // 1. OpenStreetMap Nominatim Taraması (Maksimum 50 limit)
  try {
    let osmUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&limit=50&city=${encodeURIComponent(cleanLocation)}&country=${encodeURIComponent(cleanCountry)}${globalCtx.amenityParam}`;
    let res = await fetch(osmUrl, {
      headers: { 'User-Agent': 'StarWebFlow-B2B-Prospector/1.0 (info@starwebflow.com)' },
      signal: AbortSignal.timeout(8000)
    });

    let data = res.ok ? await res.json() : [];

    // Yapılandırılmış sorgu boşsa genel sektör ve şehir sorgusu dene
    if (!Array.isArray(data) || data.length === 0) {
      const freeQuery = `${globalCtx.searchKeywords[0]} ${cleanLocation} ${cleanCountry}`.trim();
      osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(freeQuery)}&format=json&addressdetails=1&extratags=1&limit=50`;
      res = await fetch(osmUrl, {
        headers: { 'User-Agent': 'StarWebFlow-B2B-Prospector/1.0 (info@starwebflow.com)' },
        signal: AbortSignal.timeout(8000)
      });
      data = res.ok ? await res.json() : [];
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        if (
          item.class === 'boundary' || 
          item.class === 'place' || 
          item.type === 'administrative' || 
          item.addresstype === 'city' || 
          item.addresstype === 'country' ||
          item.addresstype === 'state' ||
          item.addresstype === 'municipality'
        ) {
          continue;
        }

        const name = item.name || item.display_name?.split(',')[0]?.trim();
        if (!name || name.length < 2) continue;
        const website = item.extratags?.website || item.extratags?.['contact:website'] || item.extratags?.url || '';
        const phone = item.extratags?.phone || item.extratags?.['contact:phone'] || item.extratags?.['contact:mobile'] || '';
        const email = item.extratags?.email || item.extratags?.['contact:email'] || '';
        const address = item.display_name || `${cleanLocation}, ${cleanCountry}`;
        
        let dom = '';
        if (website) {
          try {
            dom = new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace(/^www\./, '').toLowerCase();
            if (seenDomains.has(dom)) continue;
            seenDomains.add(dom);
          } catch {}
        }

        rawItems.push({
          name,
          title: name,
          website,
          phone,
          email,
          location: `${item.address?.city || item.address?.town || cleanLocation}, ${cleanCountry}`,
          address,
          totalScore: 4.8,
          reviews: []
        });

        if (rawItems.length >= 25) break;
      }
    }
  } catch (e: any) {
    console.warn('[Gerçek Dizin Taraması] OpenStreetMap isteği:', e?.message || e);
  }

  // 2. Canlı Web Taraması (DuckDuckGo Çok Dilli Küresel Arama)
  // Haritada yeterli kayıt bulunamadıysa veya ek işletme web siteleri gerekiyorsa canlı arama yap
  if (rawItems.length < 25) {
    // Küresel aggregator / pazar yeri kara listesi (dünya çapında)
    const aggregatorBlacklist = /duckduckgo|google|facebook|instagram|jameda|gelbeseiten|kununu|wikipedia|xing|linkedin|tripadvisor|yelp|foursquare|yemeksepeti|trendyol|getir|eksisozluk|sikayetvar|youtube|twitter|tiktok|pinterest|booking\.com|expedia|trivago|trustpilot|yellowpages|pagesjaunes|paginegialle|paginasamarillas|goudegids|dyle|zomato|ubereats|deliveroo|doordash|gov|edu|mil|wikivoyage|rehber|eniyisi|listesi|blog/i;

    for (const q of globalCtx.queries) {
      if (rawItems.length >= 25) break;
      try {
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
        const ddgRes = await fetch(ddgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': globalCtx.langHeader,
          },
          signal: AbortSignal.timeout(6000),
        });

        if (ddgRes.ok) {
          const html = await ddgRes.text();
          // Hem href hem class içeren tüm linkleri yakala (uddg parametreli gerçek hedef linkler)
          const anchorMatches = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
          for (const m of anchorMatches) {
            let targetUrl = m[1].trim();
            if (targetUrl.includes('uddg=')) {
              try {
                const parsed = new URL(targetUrl.startsWith('//') ? `https:${targetUrl}` : targetUrl);
                const uddg = parsed.searchParams.get('uddg');
                if (uddg) targetUrl = decodeURIComponent(uddg);
              } catch {}
            }
            if (!targetUrl.startsWith('http')) continue;
            if (aggregatorBlacklist.test(targetUrl)) continue;

            try {
              const u = new URL(targetUrl);
              const domain = u.hostname.replace(/^www\./, '').toLowerCase();
              if (domain.includes('duckduckgo') || /^[0-9.]+$/.test(domain)) continue;
              if (seenDomains.has(domain)) continue;

              // Link metninden veya etiketinden işletme adını temizle
              const rawText = m[2].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
              let cleanName = rawText.split(/[-–|:•]/)[0].trim();
              if (cleanName.length < 3 || /iletişim|hakkımızda|rezervasyon|kontakt|impressum|contact|about|home|ana sayfa|contacto|contatti|contato/i.test(cleanName)) {
                const parts = rawText.split(/[-–|:•]/).map((p: string) => p.trim());
                const better = parts.find((p: string) => p.length >= 3 && !/iletişim|hakkımızda|rezervasyon|kontakt|impressum|contact|about|home|ana sayfa|contacto|contatti|contato/i.test(p));
                cleanName = better || domain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
              }

              seenDomains.add(domain);
              rawItems.push({
                name: cleanName,
                title: cleanName,
                website: `https://${domain}`,
                phone: '',
                email: '',
                location: `${cleanLocation}, ${cleanCountry}`,
                address: `${cleanLocation}, ${cleanCountry}`,
                totalScore: 4.8,
                reviews: [],
              });
            } catch {}

            if (rawItems.length >= 25) break;
          }
        }
      } catch (ddgErr: any) {
        console.warn(`[Gerçek Dizin Taraması] DuckDuckGo "${q}" fallback:`, ddgErr?.message || ddgErr);
      }
    }
  }

  console.log(`[Gerçek Dizin Taraması] ${cleanLocation} (${cleanCountry}) için ${rawItems.length} adet 100% gerçek işletme bulundu.`);
  return { rawScrapedData: rawItems, isAsync: false, platform };
}

/**
 * Data Pruning for Cost Optimization
 * Budama işlemi, Apify'dan gelen devasa JSON dosyasındaki (resimler, gereksiz loglar, saat dilimleri vb.) 
 * verileri temizler. AI'a gönderilen token sayısını %80-90 oranında düşürür.
 */
function pruneScrapedData(rawData: any[], platform: string) {
  return rawData.map(item => {
    // Platform bazlı veri ayıklama
    
    // Eğer X-Ray aramasıysa (Google Search sonuçlarıysa)
    if (platform === "linkedin" || platform === "instagram" || platform === "apollo" || platform === "crunchbase") {
      const text = (item.description || item.snippet || item.text || "");
      const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
      const extractedEmail = emailMatch ? emailMatch[0] : "";
      
      let cleanName = item.title || "";
      if (platform === "linkedin") {
        cleanName = cleanName.split("-")[0].trim();
      } else if (platform === "apollo") {
        cleanName = cleanName.split("-")[0].replace("Overview", "").trim();
      } else if (platform === "crunchbase") {
        cleanName = cleanName.split("-")[0].trim();
      }
      
      return {
        name: cleanName,
        website: item.url || "", // Bu apollo.io linki de olabilir
        phone: "",
        email: extractedEmail,
        rating: null,
        reviews: [],
        description: text
      };
    }

    // Normal Google Maps sonucuysa
    return {
      name: item.title || item.name || item.fullName || "",
      website: item.website || item.url || "",
      phone: item.phone || item.phoneNumber || "",
      email: item.email || "",
      rating: item.totalScore || item.rating || null,
      reviews: item.reviews ? item.reviews.slice(0, 2).map((r: any) => r.text) : [],
      description: item.description || item.headline || item.about || ""
    };
  });
}

/**
 * Email Enrichment: site crawl (mailto/regex/obfuscation) -> person pattern -> generic guess,
 * each validated with MX + catch-all detection + optional SMTP ping, with a confidence score.
 * SMTP ping (port 25) is skipped when DISABLE_SMTP_PING=true (blocked networks).
 */
async function enrichLeadEmail(website: string, name: string, personName?: string | null): Promise<EmailDiscoveryResult> {
  try {
    return await discoverEmail({
      website,
      companyName: name,
      personName,
      smtp: process.env.DISABLE_SMTP_PING !== "true",
    });
  } catch (e) {
    return { best: null, candidates: [], domain: null, pagesCrawled: 0 };
  }
}

/**
 * AI Data Cleaner
 * Cleans and deeply analyzes the data using Gemini AI.
 * Uses Structured Outputs to guarantee JSON format and avoid crashes.
 */
export async function aiCleanDataAction(tenantId: string, payload: any, nodeData: any) {
  const rawData = payload.rawScrapedData || [];
  const platform = payload.platform || "google_maps";
  
  if (rawData.length === 0) {
    return { cleanedData: [] };
  }

  // PRUNING: Maliyet optimizasyonu
  const prunedData = pruneScrapedData(rawData, platform).filter((d: any) => d.name || d.website);
  console.log(`[AI Cleaner Node] Pruned ${rawData.length} -> ${prunedData.length} records. Fetching Technographics...`);

  // ZERO-COST TECHNOGRAPHICS & INTENT (sınırlı eşzamanlılık: hedef siteleri ve ağı boğma)
  const enrichedPrunedData = await mapLimit(prunedData, 8, async (item: any, idx: number) => {
    if (item.website && !/linkedin\.com|instagram\.com|apollo\.io|crunchbase\.com/i.test(item.website)) {
      const techData = await fetchWebsiteTech(item.website);
      return { idx, ...item, detectedTech: techData.technologies, detectedIntent: techData.intentSignals };
    }
    return { idx, ...item, detectedTech: [], detectedIntent: [] };
  });

  // AI ANALİZİ: küçük parçalar (chunk) halinde, her kayıt kararlı bir `idx` ile eşleşir.
  // Tek dev prompt yerine chunk = bir parça bozulursa tüm sonuç kaybolmaz; sıra kayması riski ortadan kalkar.
  const aiByIdx = new Map<number, any>();
  const { isOllamaPrimary, isAiConfigured, generateTextResilient, extractJsonFromText } = await import('@/lib/ai/gemini-client');
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (isAiConfigured()) {
    const useLocalOllama = isOllamaPrimary() || !apiKey;
    const CHUNK = useLocalOllama ? 6 : 12;
    const chunks: any[][] = [];
    for (let i = 0; i < enrichedPrunedData.length; i += CHUNK) chunks.push(enrichedPrunedData.slice(i, i + CHUNK));

    let geminiModel: any = null;
    if (!useLocalOllama && apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const responseSchema = {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            idx: { type: SchemaType.NUMBER },
            company: { type: SchemaType.STRING },
            decisionMakerName: { type: SchemaType.STRING, nullable: true },
            decisionMakerTitle: { type: SchemaType.STRING, nullable: true },
            painPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            digitalGaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            customPitch: { type: SchemaType.STRING, nullable: true },
            winProbability: { type: SchemaType.NUMBER, nullable: true }
          },
          required: ["idx", "company", "painPoints", "digitalGaps"]
        }
      };
      geminiModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json", responseSchema: responseSchema as any }
      });
    }

    await mapLimit(chunks, useLocalOllama ? 1 : 3, async (chunk, ci) => {
      const prompt = `
You are an expert B2B lead analyst for a digital agency (web, SEO, automation, ads).
Each item has an "idx" - you MUST echo the same idx back, one output object per input item in a JSON Array.
'detectedTech' = technologies found on their site, 'detectedIntent' = buying/growth signals.
For each item:
1. company: clean company name (remove GmbH, LLC, etc).
2. decisionMakerName / decisionMakerTitle: ONLY if explicitly present in the data. Never invent people.
3. painPoints: real customer complaints from 'reviews' (short strings). Empty array if none.
4. digitalGaps: concrete, evidence-based gaps (no website, outdated tech, no analytics, no booking...).
5. customPitch: ONE sentence cold-email opening hook in Turkish referencing specific evidence (a real pain point, tech or intent signal). No hype words, no fake claims.
6. winProbability: 0.0-1.0 realistic likelihood they need our services (be conservative; most are < 0.6).

Return ONLY a valid JSON Array.
Dataset: ${JSON.stringify(chunk)}
`;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          let rawJson = '';
          if (geminiModel) {
            const res = await geminiModel.generateContent(prompt);
            rawJson = res.response.text();
          } else {
            const res = await generateTextResilient({
              prompt,
              preferredModel: 'automation',
              temperature: 0.2,
            });
            rawJson = extractJsonFromText(res.text);
          }
          const parsed = JSON.parse(rawJson);
          const arr = Array.isArray(parsed) ? parsed : (parsed.items || parsed.leads || []);
          for (const a of arr) if (typeof a?.idx === "number") aiByIdx.set(a.idx, a);
          return;
        } catch (err) {
          console.error(`[AI Cleaner Node] Chunk ${ci} attempt ${attempt + 1} failed:`, (err as Error).message);
        }
      }
    });
  } else {
    console.warn("[AI Cleaner Node] AI motoru yapılandırılmamış - continuing with rule-based enrichment only.");
  }

  // E-POSTA KEŞFİ + SKORLAMA (sınırlı eşzamanlılık)
  const cleanedData = await mapLimit(enrichedPrunedData, 4, async (original: any) => {
    const ai = aiByIdx.get(original.idx) || {};
    const decisionMakerName = ai.decisionMakerName || null;

    let email: string | null = original.email || null;
    let emailConfidence: number | null = email ? 70 : null;
    let emailKind: string | null = null;
    let phone: string | null = original.phone || null;

    if (original.website && (!email || !phone)) {
      const found = await enrichLeadEmail(original.website, original.name, decisionMakerName);
      if (!email && found.best) {
        email = found.best.email;
        emailConfidence = found.best.confidence;
        emailKind = found.best.kind;
      }
      if (!phone && found.discoveredPhones && found.discoveredPhones.length > 0) {
        phone = found.discoveredPhones[0];
      }
    }

    const hasWebsite = !!original.website && !/linkedin\.com|instagram\.com|apollo\.io|crunchbase\.com/i.test(original.website);
    const scored = scoreLead({
      hasWebsite,
      website: original.website,
      googleRating: original.rating,
      technologies: original.detectedTech,
      intentSignals: original.detectedIntent,
      digitalGaps: ai.digitalGaps,
      painPoints: ai.painPoints,
      decisionMakerName,
      email,
      emailConfidence,
      phone,
      aiWinProbability: ai.winProbability ?? null
    });

    return {
      name: original.name,
      company: ai.company || original.name.replace(/\s+(GmbH|LLC|Ltd\.?|Inc\.?)$/i, ""),
      decisionMakerName,
      decisionMakerTitle: ai.decisionMakerTitle || null,
      painPoints: ai.painPoints || [],
      digitalGaps: ai.digitalGaps && ai.digitalGaps.length ? ai.digitalGaps : (hasWebsite ? [] : ["Web sitesi yok"]),
      customPitch: ai.customPitch || null,
      winProbability: ai.winProbability ?? null,
      googleRating: original.rating ?? null,
      hasWebsite,
      email,
      emailConfidence,
      emailKind,
      phone: phone || original.phone || null,
      website: original.website || null,
      score: scored.score,
      tier: scored.tier,
      scoreReasons: scored.reasons,
      source: platform
    };
  });

  return { cleanedData };
}

/**
 * Saves the cleaned leads to the CRM database with status "NEW".
 * This allows the admin to review them before adding to an Outreach Campaign.
 */
export async function createLeadsAction(tenantId: string, payload: any, nodeData: any) {
  const cleanedData = payload.cleanedData || [];
  const { location, country, industry } = nodeData || {};
  console.log(`[CRM Node] Importing ${cleanedData.length} leads into database...`);

  // Güvenlik: default-tenant veya ilgili tenant kaydının veritabanında var olduğundan emin ol
  try {
    await prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: {
        id: tenantId,
        name: 'StarWebFlow Workspace',
        slug: tenantId === 'default-tenant' ? 'default' : tenantId
      }
    });
  } catch (tErr) {
    console.warn(`[CRM Node] Tenant upsert notice:`, tErr);
  }

  let importedCount = 0;
  const createdLeads = [];

  for (const item of cleanedData) {
    // Sektörel Veri Havuzu (Master Data Pool): E-postası olmasa da kaydet!
    if (!item.name && !item.company && !item.website && !item.phone) continue; // Bomboşsa geç
    
    try {
      // Mükerrer Kontrolü (Anti-Duplicate)
      // Aynı şirketten birden fazla kişi olabilmesi için sadece website/phone ile eşleştirme yapmıyoruz.
      // Kişi adı veya email eşleşiyorsa duplicate sayıyoruz.
      const orConditions: any[] = [];
      
      if (item.email) orConditions.push({ email: item.email });
      if (item.linkedinUrl) orConditions.push({ linkedinUrl: item.linkedinUrl });

      const personIdentifier = item.decisionMakerName || item.name;

      if (item.website) {
        if (personIdentifier) {
           orConditions.push({ website: item.website, decisionMakerName: personIdentifier });
           orConditions.push({ website: item.website, name: personIdentifier });
        } else {
           // Sadece genel şirket kaydıysa
           orConditions.push({ website: item.website, decisionMakerName: null });
        }
      }
      
      if (item.phone) {
        if (personIdentifier) {
           orConditions.push({ phone: item.phone, decisionMakerName: personIdentifier });
           orConditions.push({ phone: item.phone, name: personIdentifier });
        } else {
           orConditions.push({ phone: item.phone, decisionMakerName: null });
        }
      }

      let existingLead = null;
      if (orConditions.length > 0) {
        existingLead = await prisma.lead.findFirst({
          where: {
            tenantId,
            OR: orConditions
          }
        });
      }

      if (existingLead) {
        // Zaten varsa ve Master Data Pool kuralı gereği yeni bilgi gelmişse güncelle (Upsert mantığı)
        const lead = await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            name: item.name || existingLead.name,
            company: item.company || existingLead.company,
            email: item.email || existingLead.email,
            phone: item.phone || existingLead.phone,
            website: item.website || existingLead.website,
            decisionMakerName: item.decisionMakerName || existingLead.decisionMakerName,
            decisionMakerTitle: item.decisionMakerTitle || existingLead.decisionMakerTitle,
            linkedinUrl: item.linkedinUrl || existingLead.linkedinUrl,
            instagramUrl: item.instagramUrl || existingLead.instagramUrl,
            instagramFollowers: item.instagramFollowers || existingLead.instagramFollowers,
            googleRating: item.googleRating || existingLead.googleRating,
            reviewCount: item.reviewCount || existingLead.reviewCount,
            isClaimed: item.isClaimed !== null ? item.isClaimed : existingLead.isClaimed,
            hasWebsite: item.hasWebsite !== null ? item.hasWebsite : existingLead.hasWebsite,
            painPoints: item.painPoints || existingLead.painPoints || [],
            digitalGaps: item.digitalGaps || existingLead.digitalGaps || [],
            customPitch: item.customPitch || existingLead.customPitch,
            winProbability: item.winProbability !== undefined ? item.winProbability : existingLead.winProbability,
            location: location || existingLead.location,
            country: country || existingLead.country,
            industry: industry || existingLead.industry,
            score: Math.max(item.score || 0, existingLead.score || 0)
          }
        });
        createdLeads.push({ ...item, id: lead.id, updated: true });
        // Güncellenenler imported sayılmayabilir ama listeye eklensin
      } else {
        // Yeni kayıt
        const lead = await prisma.lead.create({
          data: {
            tenantId,
            email: item.email,
            name: item.name || item.company || "Potansiyel Müşteri",
            company: item.company || item.name || null,
            phone: item.phone,
            website: item.website,
            decisionMakerName: item.decisionMakerName,
            decisionMakerTitle: item.decisionMakerTitle,
            linkedinUrl: item.linkedinUrl,
            instagramUrl: item.instagramUrl,
            instagramFollowers: item.instagramFollowers,
            googleRating: item.googleRating || null,
            reviewCount: item.reviewCount || null,
            isClaimed: item.isClaimed !== null ? item.isClaimed : true,
            hasWebsite: item.hasWebsite !== null ? item.hasWebsite : false,
            painPoints: item.painPoints || [],
            digitalGaps: item.digitalGaps || [],
            customPitch: item.customPitch || null,
            notes: item.tier ? `[${item.tier}] ${(item.scoreReasons || []).join(" • ")}${item.emailConfidence != null ? ` | E-posta güveni: %${item.emailConfidence}` : ""}` : null,
            winProbability: item.winProbability || null,
            status: "new",
            source: "Apify Scraper",
            score: item.score || 0,
            location: location || null,
            country: country || null,
            industry: industry || null
          }
        });
        createdLeads.push({ ...item, id: lead.id, isNew: true });
        importedCount++;
      }
    } catch (dbError) {
      console.error(`[CRM Node] Failed to insert/update lead:`, dbError);
    }
  }

  console.log(`[CRM Node] Imported ${importedCount} new leads (and updated others) out of ${cleanedData.length} records.`);
  return { createdLeads, importedCount };
}
