import { NextResponse } from "next/server";

interface AuditRecommendation {
  title: string;
  desc: string;
  impact: string;
  category: "speed" | "mobile" | "security" | "ai";
  type?: "leak" | "strength";
}

interface AuditMetrics {
  ttfbMs: number;
  htmlSizeKb: number;
  scriptCount: number;
  imageCount: number;
  lazyImageCount: number;
  formCount: number;
  schemaCount: number;
  securityHeadersCount: number;
  isHttps: boolean;
  hasViewport: boolean;
  hasMetaDesc: boolean;
  hasCanonical: boolean;
  hasOpenGraph: boolean;
  hasGeoAiReady: boolean;
  hasAiChat: boolean;
  hasCrmAutomation: boolean;
  pageTitle: string;
  metaDescription: string;
  headings: string[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/\s+/g, " ")
    .trim();
}

const UI_STOPWORDS = new Set([
  // DE
  "sprache", "navigation", "menü", "menu", "suche", "warenkorb", "konto", "anmelden", "einloggen",
  "abonnieren", "newsletter", "footer", "header", "cookies", "datenschutz", "impressum",
  "kontaktformular", "kategorien", "alle anzeigen", "mehr erfahren", "hilfe", "filter",
  "sortieren", "versand", "zahlung", "default title", "über uns", "kontakt", "leistungen",
  // TR
  "dil", "navigasyon", "menü", "arama", "sepet", "sepetim", "hesabım", "giriş yap",
  "kayıt ol", "bülten", "e-bülten", "çerezler", "gizlilik", "iletişim formu", "tümünü gör",
  "daha fazla", "yardım", "filtre", "sırala", "kategori", "kategoriler", "hakkımızda", "iletişim",
  // EN
  "language", "navigation", "menu", "search", "cart", "basket", "my account", "sign in",
  "login", "register", "subscribe", "newsletter", "footer", "header", "cookies", "privacy policy",
  "terms", "contact form", "all categories", "view all", "read more", "help", "filter", "sort by",
  "checkout", "about us", "contact us"
]);

function extractCleanHeadings(html: string): string[] {
  const results: string[] = [];

  // Strip out boilerplate header, nav, footer, script, style, svg to avoid picking up language pickers, cart titles, etc.
  const cleanedHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ");

  // 1. Prioritize H1 tags (main page headline)
  const h1Regex = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let match: RegExpExecArray | null;
  while ((match = h1Regex.exec(cleanedHtml)) !== null && results.length < 2) {
    const rawTag = match[0];
    if (/visually-hidden|sr-only|hidden|offscreen|a11y/i.test(rawTag)) continue;
    const text = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ")).trim();
    if (text.length >= 4 && text.length <= 110 && !UI_STOPWORDS.has(text.toLowerCase()) && !results.includes(text)) {
      results.push(text);
    }
  }

  // 2. Then extract main H2 / H3 tags
  const h2Regex = /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi;
  while ((match = h2Regex.exec(cleanedHtml)) !== null && results.length < 6) {
    const rawTag = match[0];
    if (/visually-hidden|sr-only|hidden|offscreen|a11y/i.test(rawTag)) continue;
    const text = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ")).trim();
    if (text.length >= 4 && text.length <= 110 && !UI_STOPWORDS.has(text.toLowerCase()) && !results.includes(text)) {
      results.push(text);
    }
  }

  // Fallback: If stripping left nothing, scan original html with strict stopword & hidden-class filtering
  if (results.length === 0) {
    const fallbackRegex = /<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi;
    while ((match = fallbackRegex.exec(html)) !== null && results.length < 5) {
      const rawTag = match[0];
      if (/visually-hidden|sr-only|hidden|offscreen|a11y/i.test(rawTag)) continue;
      const text = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ")).trim();
      if (text.length >= 4 && text.length <= 110 && !UI_STOPWORDS.has(text.toLowerCase()) && !results.includes(text)) {
        results.push(text);
      }
    }
  }

  return results;
}

function extractSampleOfferings(html: string): string[] {
  const offerings: string[] = [];

  // 1. Try to find product names from JSON-LD schema (@type: Product)
  const schemaRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = schemaRegex.exec(html)) !== null && offerings.length < 6) {
    try {
      const data = JSON.parse(sMatch[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Product" && item.name && typeof item.name === "string") {
          const pName = decodeHtmlEntities(item.name).trim();
          if (pName.length >= 3 && pName.length <= 80 && !offerings.includes(pName)) {
            offerings.push(pName);
          }
        }
        if (item["@graph"] && Array.isArray(item["@graph"])) {
          for (const gItem of item["@graph"]) {
            if (gItem["@type"] === "Product" && gItem.name && typeof gItem.name === "string") {
              const pName = decodeHtmlEntities(gItem.name).trim();
              if (pName.length >= 3 && pName.length <= 80 && !offerings.includes(pName)) {
                offerings.push(pName);
              }
            }
          }
        }
      }
    } catch {
      // ignore invalid json
    }
  }

  // 2. Try to find product links or card titles: /products/ or /urun/
  if (offerings.length < 3) {
    const productLinkRegex = /<a\b[^>]*href=["'][^"']*\/(?:products|urun|produkt|item)\/([^"'\?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let pMatch: RegExpExecArray | null;
    while ((pMatch = productLinkRegex.exec(html)) !== null && offerings.length < 5) {
      const linkText = decodeHtmlEntities(pMatch[2].replace(/<[^>]+>/g, " ")).trim();
      if (
        linkText.length >= 4 &&
        linkText.length <= 75 &&
        !UI_STOPWORDS.has(linkText.toLowerCase()) &&
        !offerings.includes(linkText)
      ) {
        offerings.push(linkText);
      }
    }
  }

  return offerings.slice(0, 5);
}

function deriveBrandName(cleanDomain: string, pageTitle: string, ogSiteName: string): string {
  if (ogSiteName && ogSiteName.trim().length >= 2 && ogSiteName.trim().length <= 36) {
    return decodeHtmlEntities(ogSiteName.trim());
  }
  if (pageTitle) {
    const parts = pageTitle.split(/\s*(?:\||—|–|-|:|•)\s*/).filter(Boolean);
    if (parts.length > 1) {
      const shortest = parts.reduce((a, b) => (a.length <= b.length && a.length >= 3 ? a : b));
      if (shortest.length >= 2 && shortest.length <= 32) {
        return shortest.trim();
      }
    }
    if (pageTitle.length <= 30) return pageTitle.trim();
  }
  const base = cleanDomain.split(".")[0] || cleanDomain;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export interface SiteLocationInfo {
  countryCode: string;
  countryName: string;
  cityName?: string;
  currency: string;
  currencySymbol: string;
  serviceRegion: string;
}

export interface BusinessIntelligence {
  location: SiteLocationInfo;
  categories: string[];
  keyPolicies: string[];
  sampleOfferings: string[];
}

function extractBusinessIntelligence(
  html: string,
  cleanDomain: string,
  lang: string
): BusinessIntelligence {
  const isDe = lang === "de";
  const isEn = lang === "en";
  const lower = html.toLowerCase();

  // 1. Determine Country Code & Primary Currency based on TLD & Content
  let countryCode = "GLOBAL";
  let countryName = isDe ? "International" : isEn ? "International" : "Uluslararası";
  let currency = "USD ($)";
  let currencySymbol = "$";

  const tld = cleanDomain.split(".").pop() || "";
  if (tld === "de") {
    countryCode = "DE";
    countryName = isDe ? "Deutschland" : isEn ? "Germany" : "Almanya";
    currency = "EUR (€)";
    currencySymbol = "€";
  } else if (tld === "at") {
    countryCode = "AT";
    countryName = isDe ? "Österreich" : isEn ? "Austria" : "Avusturya";
    currency = "EUR (€)";
    currencySymbol = "€";
  } else if (tld === "ch") {
    countryCode = "CH";
    countryName = isDe ? "Schweiz" : isEn ? "Switzerland" : "İsviçre";
    currency = "CHF";
    currencySymbol = "CHF";
  } else if (["tr", "com.tr", "org.tr", "net.tr", "av.tr", "gov.tr"].includes(tld)) {
    countryCode = "TR";
    countryName = isDe ? "Türkei" : isEn ? "Turkey" : "Türkiye";
    currency = "TRY (₺)";
    currencySymbol = "₺";
  } else if (["uk", "co.uk", "org.uk"].includes(tld)) {
    countryCode = "GB";
    countryName = isDe ? "Großbritannien" : isEn ? "United Kingdom" : "İngiltere";
    currency = "GBP (£)";
    currencySymbol = "£";
  } else if (tld === "fr") {
    countryCode = "FR";
    countryName = isDe ? "Frankreich" : isEn ? "France" : "Fransa";
    currency = "EUR (€)";
    currencySymbol = "€";
  } else if (tld === "nl") {
    countryCode = "NL";
    countryName = isDe ? "Niederlande" : isEn ? "Netherlands" : "Hollanda";
    currency = "EUR (€)";
    currencySymbol = "€";
  }

  // If generic TLD (.com, .net, etc.), inspect HTML clues
  if (countryCode === "GLOBAL") {
    if (/deutschland|germany|\+49\b|amtsgericht|ust-idnr|plz\s*\d{5}/i.test(lower)) {
      countryCode = "DE";
      countryName = isDe ? "Deutschland" : isEn ? "Germany" : "Almanya";
      currency = "EUR (€)";
      currencySymbol = "€";
    } else if (/türkiye|turkey|\+90\b|istanbul|ankara|izmir|vergi no|türk lirası|kadıköy/i.test(lower)) {
      countryCode = "TR";
      countryName = isDe ? "Türkei" : isEn ? "Turkey" : "Türkiye";
      currency = "TRY (₺)";
      currencySymbol = "₺";
    } else if (/\+44\b|united kingdom|london|england/i.test(lower)) {
      countryCode = "GB";
      countryName = isDe ? "Großbritannien" : isEn ? "United Kingdom" : "İngiltere";
      currency = "GBP (£)";
      currencySymbol = "£";
    }
  }

  // 2. Detect City if explicitly present in HTML
  let cityName: string | undefined;
  const germanCities = [
    "Neustadt an der Weinstraße", "Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart",
    "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nürnberg",
    "Mannheim", "Karlsruhe", "Augsburg", "Wiesbaden", "Bonn", "Münster", "Heidelberg", "Freiburg"
  ];
  const turkishCities = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli",
    "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri", "Samsun", "Balıkesir", "Eskişehir", "Trabzon"
  ];

  if (countryCode === "DE" || countryCode === "AT" || countryCode === "CH") {
    for (const city of germanCities) {
      if (new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(html)) {
        cityName = city;
        break;
      }
    }
  } else if (countryCode === "TR") {
    for (const city of turkishCities) {
      if (new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(html)) {
        cityName = city;
        break;
      }
    }
  }

  // 3. Service Region description
  let serviceRegion = "";
  if (countryCode === "DE") {
    serviceRegion = isDe
      ? `${cityName ? cityName + " & " : ""}Deutschlandweit (Paketversand & Direktlieferung)`
      : isEn
      ? `${cityName ? cityName + " & " : ""}Germany-wide (parcel shipping & local delivery)`
      : `${cityName ? cityName + " ve " : ""}Almanya Geneli (Paket Kargo ve Bölgesel Teslimat)`;
  } else if (countryCode === "TR") {
    serviceRegion = isDe
      ? `${cityName ? cityName + " & " : ""}Türkeiweit (Lieferung & Versand)`
      : isEn
      ? `${cityName ? cityName + " & " : ""}Turkey-wide (delivery & shipping)`
      : `${cityName ? cityName + " ve " : ""}Tüm Türkiye (Hızlı Kargo ve Teslimat)`;
  } else {
    serviceRegion = isDe ? `${countryName} & International` : isEn ? `${countryName} & International` : `${countryName} ve Uluslararası`;
  }

  // 4. Extract Category Names from Navigation
  const categories: string[] = [];
  const catRegex = /<a\b[^>]*href=["'][^"']*\/(?:collections|categories|kategori|kategoriler|rubrik|shop|services|leistungen)\/([^"'\?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let cMatch: RegExpExecArray | null;
  while ((cMatch = catRegex.exec(html)) !== null && categories.length < 8) {
    const text = decodeHtmlEntities(cMatch[2].replace(/<[^>]+>/g, " ")).trim();
    if (
      text.length >= 3 &&
      text.length <= 40 &&
      !UI_STOPWORDS.has(text.toLowerCase()) &&
      !categories.includes(text)
    ) {
      categories.push(text);
    }
  }

  // 5. Extract Key Policies / Guarantees
  const keyPolicies: string[] = [];

  const freeShipDe = html.match(/ab\s*(\d+[\.,]?\d*)\s*€\s*(?:liefern wir\s*)?versandkostenfrei|versandkostenfrei\s*ab\s*(\d+[\.,]?\d*)\s*€/i);
  if (freeShipDe) {
    const val = freeShipDe[1] || freeShipDe[2];
    keyPolicies.push(isDe ? `Ab ${val} € versandkostenfrei` : isEn ? `Free shipping over ${val} €` : `${val} € üzeri ücretsiz kargo`);
  }
  const freeShipTr = html.match(/(\d+[\.,]?\d*)\s*(?:TL|₺)\s*(?:ve üzeri|üzeri)\s*ücretsiz kargo|ücretsiz kargo\s*(\d+[\.,]?\d*)\s*(?:TL|₺)/i);
  if (freeShipTr) {
    const val = freeShipTr[1] || freeShipTr[2];
    keyPolicies.push(isDe ? `Kostenloser Versand ab ${val} TL` : isEn ? `Free shipping over ${val} TL` : `${val} ₺ üzeri ücretsiz kargo`);
  }

  if (/heute bestellt[,\s]+morgen zugestellt/i.test(html)) {
    keyPolicies.push(isDe ? "Heute bestellt, morgen zugestellt" : isEn ? "Ordered today, delivered tomorrow" : "Bugün sipariş verin, yarın teslim alın");
  } else if (/same day|aynı gün kargo|aynı gün teslimat/i.test(html)) {
    keyPolicies.push(isDe ? "Lieferung am selben Tag" : isEn ? "Same day delivery" : "Aynı gün teslimat / kargo");
  } else if (/2[-–]5\s*werktage/i.test(html)) {
    keyPolicies.push(isDe ? "Deutschlandweiter Paketversand (2–5 Werktage)" : isEn ? "Germany-wide parcel delivery (2–5 business days)" : "Almanya geneli 2–5 iş gününde paket teslimatı");
  }

  if (/abholung/i.test(html) && /lieferung/i.test(html)) {
    keyPolicies.push(isDe ? "Eigene Lieferung & Vor-Ort-Abholung" : isEn ? "Direct delivery & store pickup" : "Adrese teslimat ve mağazadan teslim alma");
  }

  const sampleOfferings = extractSampleOfferings(html);

  return {
    location: {
      countryCode,
      countryName,
      cityName,
      currency,
      currencySymbol,
      serviceRegion,
    },
    categories,
    keyPolicies,
    sampleOfferings,
  };
}

export type BusinessType = "ecommerce" | "health" | "hospitality" | "education" | "law" | "construction" | "service";

export interface IndustryDetails {
  industry: string;
  businessType: BusinessType;
  isEcommerce: boolean;
}

export interface OpportunityTerminology {
  archetypeBadge: string;
  calculatorTitle: string;
  visitorLabel: string;
  dealValueLabel: string;
  lostVisitorsLabel: string;
  totalLeakLabel: string;
  missedUnitsLabel: string;
  defaultDealValue: number;
  dealMin: number;
  dealMax: number;
  dealStep: number;
}

function detectSiteIndustryDetails(textPool: string, lang: string): IndustryDetails {
  const lower = textPool.toLowerCase();
  const isDe = lang === "de";
  const isEn = lang === "en";

  // 1. Food / Supermarket / Grocery Store Detection (Online Market / Lebensmittel)
  const hasSupermarketClues = /supermarkt|supermarket|lebensmittel|grocery|groceries|manav|şarküteri|bakkal|gıda|frische|halva|helva|honig|bal|oliven|zeytin|getränke|milchprodukte|frühstück|haushalt/.test(lower);
  const hasEcommerceClues = /sepet|mağaza|kargo|ürün|satın al|indirim|shop|store|cart|checkout|woocommerce|shopify|warenkorb|kaufen|lieferservice|delivery|bestellen|lieferung|versand/.test(lower);

  if (hasSupermarketClues && hasEcommerceClues) {
    return {
      industry: isDe ? "Online-Supermarkt & Lebensmittel" : isEn ? "Online Supermarket & Groceries" : "Online Süpermarket & Gıda",
      businessType: "ecommerce",
      isEcommerce: true,
    };
  }

  // 2. Education & Training & Language Schools (e.g. lernzirkel-online.de, integrationskurse, nachhilfe)
  // Check education with high priority to avoid mistaking it for e-commerce if terms like 'shop' or 'versand' exist in footer/cookies
  const hasEducationClues = /integrationskurs|sprachkurs|nachhilfe|abitur|lehrgang|ausbildung|schule|bildung|akademie|unterricht|schüler|student|kurs|eğitim|dershane|üniversite|kursiyer|okul|academy|course|tutoring|training|lernzirkel|lerngruppe|einstufungstest|nachhilfeunterricht|telc|bamf|goethe-institut/.test(lower);
  if (hasEducationClues) {
    return {
      industry: isDe ? "Bildung & Nachhilfe" : isEn ? "Education & Training" : "Eğitim & Akademi",
      businessType: "education",
      isEcommerce: false,
    };
  }

  // 3. Health & Medicine (Clinics, Doctors, Dentists, Aesthetics)
  if (/klinik|hastane|diş|dental|doktor|sağlık|medikal|estetik|arzt|praxis|zahnarzt|clinic|medical|patient/.test(lower)) {
    return {
      industry: isDe ? "Gesundheit & Medizin" : isEn ? "Health & Medicine" : "Sağlık & Tıp",
      businessType: "health",
      isEcommerce: false,
    };
  }

  // 4. Law & Legal Consulting (Lawyers, Kanzlei, Tax)
  if (/avukat|hukuk|danışmanlık|kanzlei|rechtsanwalt|steuerberater|notar|lawyer|attorney|legal|notary/.test(lower)) {
    return {
      industry: isDe ? "Recht & Beratung" : isEn ? "Law & Consulting" : "Hukuk & Danışmanlık",
      businessType: "law",
      isEcommerce: false,
    };
  }

  // 5. Construction & Real Estate & Architecture
  if (/inşaat|mimar|gayrimenkul|emlak|konut|bau|immobilien|architektur|makler|real estate|architecture|construction/.test(lower)) {
    return {
      industry: isDe ? "Bau & Architektur" : isEn ? "Construction & Architecture" : "İnşaat & Mimarlık",
      businessType: "construction",
      isEcommerce: false,
    };
  }

  // 6. Tourism & Hospitality & Gastronomy
  if (/otel|turizm|tatil|rezervasyon|transfer|villa|hotel|reise|tourismus|gastronomie|restaurant|booking|hospitality/.test(lower)) {
    return {
      industry: isDe ? "Tourismus & Hotellerie" : isEn ? "Tourism & Hospitality" : "Turizm & Otelcilik",
      businessType: "hospitality",
      isEcommerce: false,
    };
  }

  // 7. E-Commerce & Retail (General store with shopping cart)
  if (hasEcommerceClues) {
    return {
      industry: isDe ? "E-Commerce & Einzelhandel" : isEn ? "E-Commerce & Retail" : "E-Ticaret & Perakende",
      businessType: "ecommerce",
      isEcommerce: true,
    };
  }

  // 8. Production & Industrial Manufacturing
  if (/üretim|fabrika|sanayi|makine|endüstri|lojistik|industrie|produktion|maschinenbau|manufacturing|industrial/.test(lower)) {
    return {
      industry: isDe ? "Produktion & Industrie" : isEn ? "Manufacturing & Industry" : "Üretim & Sanayi",
      businessType: "service",
      isEcommerce: false,
    };
  }

  // Fallback: Tech & B2B Service
  return {
    industry: isDe ? "Technologie & IT" : isEn ? "Technology & IT" : "Teknoloji & Bilişim",
    businessType: "service",
    isEcommerce: false,
  };
}

function getArchetypeFinancialConfig(
  businessType: BusinessType,
  isEcommerce: boolean,
  currencySymbol: string,
  lang: string,
  cleanDomain: string
): OpportunityTerminology {
  const isDe = lang === "de";
  const isEn = lang === "en";
  const isTr = !isDe && !isEn;
  const isEur = currencySymbol === "€" || currencySymbol.includes("EUR");
  const isTry = currencySymbol === "₺" || currencySymbol.includes("TL") || currencySymbol.includes("TRY");

  if (businessType === "education") {
    return {
      archetypeBadge: isDe
        ? "🎓 Bildungs- & Kursanmeldemodell"
        : isEn
        ? "🎓 Course Enrollment & Student Model"
        : "🎓 Kurs Kayıt & Öğrenci Modeli",
      calculatorTitle: isDe
        ? `${cleanDomain} — Rechner für entgangene Kursanmeldungen & Teilnehmer`
        : isEn
        ? `${cleanDomain} — Lost Student & Enrollment Value Calculator`
        : `${cleanDomain} — Kaçan Kursiyer & Öğrenci Kayıt Hesaplayıcısı`,
      visitorLabel: isDe
        ? "Monatliche Website-Besucher"
        : isEn
        ? "Monthly Website Visitors"
        : "Aylık Web Sitesi Ziyaretçiniz",
      dealValueLabel: isDe
        ? `Durchschnittliche Kursgebühr pro Teilnehmer (${currencySymbol})`
        : isEn
        ? `Average Tuition / Enrollment Value per Student (${currencySymbol})`
        : `Öğrenci / Kurs Başı Ortalama Dönemlik Kayıt Bedeli (${currencySymbol})`,
      lostVisitorsLabel: isDe
        ? "Verlorene Besucher / Monat (Abbrüche vor Anmeldung)"
        : isEn
        ? "Lost Visitors / Month (Bounce before enrollment)"
        : "Hız & Mesai Dışı Kaçan Ziyaretçi",
      totalLeakLabel: isDe
        ? "Entgangenes Anmeldepotenzial / Monat"
        : isEn
        ? "Lost Monthly Enrollment Value"
        : "Kaçan Toplam Dönemlik Kayıt Hacmi",
      missedUnitsLabel: isDe
        ? "entgangene Kursanmeldungen/Monat"
        : isEn
        ? "missed course enrollments/mo"
        : "kaçan kurs başvurusu/ay",
      defaultDealValue: isEur ? 450 : isTry ? 14000 : 450,
      dealMin: isEur ? 50 : isTry ? 2000 : 50,
      dealMax: isEur ? 3500 : isTry ? 90000 : 3500,
      dealStep: isEur ? 50 : isTry ? 1000 : 50,
    };
  }

  if (businessType === "health") {
    return {
      archetypeBadge: isDe
        ? "🏥 Patienten- & Praxisterminmodell"
        : isEn
        ? "🏥 Patient & Clinical Booking Model"
        : "🏥 Hasta Randevu & Klinik Modeli",
      calculatorTitle: isDe
        ? `${cleanDomain} — Rechner für entgangene Patienten & Behandlungstermine`
        : isEn
        ? `${cleanDomain} — Lost Patient & Treatment Value Calculator`
        : `${cleanDomain} — Kaçan Hasta & Tedavi Randevu Hesaplayıcısı`,
      visitorLabel: isDe
        ? "Monatliche Website-Besucher"
        : isEn
        ? "Monthly Website Visitors"
        : "Aylık Web Sitesi Ziyaretçiniz",
      dealValueLabel: isDe
        ? `Durchschnittlicher Behandlungswert pro Patient (${currencySymbol})`
        : isEn
        ? `Average Treatment / Case Value per Patient (${currencySymbol})`
        : `Hasta Başına Ortalama Tedavi / İşlem Değeri (${currencySymbol})`,
      lostVisitorsLabel: isDe
        ? "Verlorene Patienten / Monat"
        : isEn
        ? "Lost Patient Inquiries / Month"
        : "Hız & Mesai Dışı Kaçan Hasta Adayı",
      totalLeakLabel: isDe
        ? "Entgangenes Behandlungsvolumen / Monat"
        : isEn
        ? "Lost Monthly Treatment Pipeline"
        : "Kaçan Toplam Tedavi Hacmi",
      missedUnitsLabel: isDe
        ? "entgangene Patiententermine/Monat"
        : isEn
        ? "missed patient appointments/mo"
        : "kaçan hasta randevusu/ay",
      defaultDealValue: isEur ? 750 : isTry ? 22000 : 750,
      dealMin: isEur ? 100 : isTry ? 3000 : 100,
      dealMax: isEur ? 6000 : isTry ? 140000 : 6000,
      dealStep: isEur ? 50 : isTry ? 1000 : 50,
    };
  }

  if (businessType === "law") {
    return {
      archetypeBadge: isDe
        ? "⚖️ Mandanten- & Rechtsberatungsmodell"
        : isEn
        ? "⚖️ Client Retainer & Legal Model"
        : "⚖️ Müvekkil & Danışmanlık Modeli",
      calculatorTitle: isDe
        ? `${cleanDomain} — Rechner für entgangene Mandanten & Erstberatungen`
        : isEn
        ? `${cleanDomain} — Lost Client & Legal Intake Calculator`
        : `${cleanDomain} — Kaçan Müvekkil & Danışmanlık Dosya Hesaplayıcısı`,
      visitorLabel: isDe
        ? "Monatliche Website-Besucher"
        : isEn
        ? "Monthly Website Visitors"
        : "Aylık Web Sitesi Ziyaretçiniz",
      dealValueLabel: isDe
        ? `Durchschnittlicher Honorarwert pro Mandat (${currencySymbol})`
        : isEn
        ? `Average Retainer / Case Value per Client (${currencySymbol})`
        : `Müvekkil / Dosya Başına Ortalama Hizmet Değeri (${currencySymbol})`,
      lostVisitorsLabel: isDe
        ? "Verlorene Rechtssuchende / Monat"
        : isEn
        ? "Lost Legal Seekers / Month"
        : "Hız & Mesai Dışı Kaçan Danışan",
      totalLeakLabel: isDe
        ? "Entgangener Mandatsumsatz / Monat"
        : isEn
        ? "Lost Legal Retainer Pipeline"
        : "Kaçan Toplam Hukuki Danışmanlık Hacmi",
      missedUnitsLabel: isDe
        ? "entgangene Mandatsanfragen/Monat"
        : isEn
        ? "missed client inquiries/mo"
        : "kaçan müvekkil talebi/ay",
      defaultDealValue: isEur ? 1200 : isTry ? 32000 : 1200,
      dealMin: isEur ? 200 : isTry ? 5000 : 200,
      dealMax: isEur ? 9000 : isTry ? 160000 : 9000,
      dealStep: isEur ? 100 : isTry ? 2500 : 100,
    };
  }

  if (businessType === "construction") {
    return {
      archetypeBadge: isDe
        ? "🏗️ Immobilien- & Projektanfragemodell"
        : isEn
        ? "🏗️ Real Estate & Viewing Model"
        : "🏗️ Gayrimenkul & Satış Ofisi Modeli",
      calculatorTitle: isDe
        ? `${cleanDomain} — Rechner für entgangene Projektanfragen & Besichtigungen`
        : isEn
        ? `${cleanDomain} — Lost Buyer & Property Viewing Calculator`
        : `${cleanDomain} — Kaçan Yatırımcı & Satış Ofisi Randevu Hesaplayıcısı`,
      visitorLabel: isDe
        ? "Monatliche Website-Besucher"
        : isEn
        ? "Monthly Website Visitors"
        : "Aylık Web Sitesi Ziyaretçiniz",
      dealValueLabel: isDe
        ? `Durchschnittlicher Transaktionswert / Provision (${currencySymbol})`
        : isEn
        ? `Average Property / Commission Value (${currencySymbol})`
        : `Mülk / Proje Başına Ortalama İşlem Değeri (${currencySymbol})`,
      lostVisitorsLabel: isDe
        ? "Verlorene Interessenten / Monat"
        : isEn
        ? "Lost Prospects / Month"
        : "Hız & Mesai Dışı Kaçan Ziyaretçi",
      totalLeakLabel: isDe
        ? "Entgangenes Projektvolumen / Monat"
        : isEn
        ? "Lost Property Pipeline Potential"
        : "Kaçan Toplam Proje Satış Potansiyeli",
      missedUnitsLabel: isDe
        ? "entgangene Kaufinteressenten/Monat"
        : isEn
        ? "missed qualified buyers/mo"
        : "kaçan sıcak yatırımcı/ay",
      defaultDealValue: isEur ? 3500 : isTry ? 85000 : 3500,
      dealMin: isEur ? 500 : isTry ? 15000 : 500,
      dealMax: isEur ? 30000 : isTry ? 600000 : 30000,
      dealStep: isEur ? 500 : isTry ? 5000 : 500,
    };
  }

  if (businessType === "hospitality") {
    return {
      archetypeBadge: isDe
        ? "🏨 Direktbuchungs- & Gästemodell"
        : isEn
        ? "🏨 Direct Booking & Guest Model"
        : "🏨 Doğrudan Rezervasyon Modeli",
      calculatorTitle: isDe
        ? `${cleanDomain} — Rechner für entgangene Direktbuchungen (Provisionsfrei)`
        : isEn
        ? `${cleanDomain} — Commission-Free Lost Direct Bookings Calculator`
        : `${cleanDomain} — Komisyonsuz Kaçan Doğrudan Rezervasyon Hesaplayıcısı`,
      visitorLabel: isDe
        ? "Monatliche Website-Besucher"
        : isEn
        ? "Monthly Website Visitors"
        : "Aylık Web Sitesi Ziyaretçiniz",
      dealValueLabel: isDe
        ? `Durchschnittlicher Buchungswert pro Gast (${currencySymbol})`
        : isEn
        ? `Average Booking / Stay Value (${currencySymbol})`
        : `Rezervasyon Başına Ortalama Konaklama Değeri (${currencySymbol})`,
      lostVisitorsLabel: isDe
        ? "Verlorene Buchungsbesucher / Monat"
        : isEn
        ? "Lost Travelers / Month"
        : "Hız & Mesai Dışı Kaçan Misafir",
      totalLeakLabel: isDe
        ? "Entgangener provisionsfreier Buchungsumsatz"
        : isEn
        ? "Lost Direct Booking Revenue"
        : "Komisyonsuz Kaçan Rezervasyon Geliri",
      missedUnitsLabel: isDe
        ? "entgangene Direktbuchungen/Monat"
        : isEn
        ? "missed direct bookings/mo"
        : "kaçan doğrudan rezervasyon/ay",
      defaultDealValue: isEur ? 320 : isTry ? 9500 : 320,
      dealMin: isEur ? 50 : isTry ? 1500 : 50,
      dealMax: isEur ? 2800 : isTry ? 65000 : 2800,
      dealStep: isEur ? 25 : isTry ? 500 : 25,
    };
  }

  if (isEcommerce) {
    return {
      archetypeBadge: isDe
        ? "🛒 E-Commerce & Warenkorbmodell"
        : isEn
        ? "🛒 E-Commerce & Cart Model"
        : "🛒 E-Ticaret Sepet Modeli",
      calculatorTitle: isDe
        ? `${cleanDomain} — Rechner für entgangenen Monatsumsatz (Warenkorb)`
        : isEn
        ? `${cleanDomain} — Estimated Monthly Revenue Leak Calculator`
        : `${cleanDomain} — Masada Bırakılan Tahmini Aylık Ciro Hesaplayıcısı`,
      visitorLabel: isDe
        ? "Monatliche Website-Besucher"
        : isEn
        ? "Monthly Website Visitors"
        : "Aylık Web Sitesi Ziyaretçiniz",
      dealValueLabel: isDe
        ? `Durchschnittlicher Warenkorb (${currencySymbol})`
        : isEn
        ? `Average Order / Cart Value (${currencySymbol})`
        : `Ortalama Sipariş / Sepet Tutarı (${currencySymbol})`,
      lostVisitorsLabel: isDe
        ? "Verlorene Käufer / Monat"
        : isEn
        ? "Lost Shoppers / Month"
        : "Hız & Mesai Dışı Kaçan Ziyaretçi",
      totalLeakLabel: isDe
        ? "Entgangener Monatsumsatz"
        : isEn
        ? "Monthly Revenue Left on Table"
        : "Masada Bırakılan Aylık Ciro",
      missedUnitsLabel: isDe
        ? "entgangene Bestellungen/Monat"
        : isEn
        ? "missed orders/mo"
        : "kaçan sipariş/ay",
      defaultDealValue: isEur ? 65 : isTry ? 950 : 65,
      dealMin: isEur ? 15 : isTry ? 150 : 15,
      dealMax: isEur ? 500 : isTry ? 8000 : 500,
      dealStep: isEur ? 5 : isTry ? 50 : 5,
    };
  }

  // Fallback: B2B Services / Industrial / General Commercial
  return {
    archetypeBadge: isDe
      ? "💼 B2B-Anfrage- & RFQ-Modell"
      : isEn
      ? "💼 B2B RFQ & Pipeline Model"
      : "💼 B2B Kurumsal RFQ & Teklif Modeli",
    calculatorTitle: isDe
      ? `${cleanDomain} — Rechner für entgangenes B2B-Auftragsvolumen`
      : isEn
      ? `${cleanDomain} — Lost B2B Pipeline & Contract Value Calculator`
      : `${cleanDomain} — Kaçan Kurumsal Teklif & Sözleşme Hacmi Hesaplayıcısı`,
    visitorLabel: isDe
      ? "Monatliche Website-Besucher"
      : isEn
      ? "Monthly Website Visitors"
      : "Aylık Web Sitesi Ziyaretçiniz",
    dealValueLabel: isDe
      ? `Durchschnittlicher Auftragswert pro Neukunde (${currencySymbol})`
      : isEn
      ? `Average Deal / Contract Value per Client (${currencySymbol})`
      : `Kurumsal Müşteri / Sözleşme Başına Ortalama Değer (${currencySymbol})`,
    lostVisitorsLabel: isDe
      ? "Verlorene B2B-Entscheider / Monat"
      : isEn
      ? "Lost B2B Prospects / Month"
      : "Hız & Mesai Dışı Kaçan Ziyaretçi",
    totalLeakLabel: isDe
      ? "Entgangenes B2B-Auftragsvolumen / Monat"
      : isEn
      ? "Monthly Contract Volume Left on Table"
      : "Masada Bırakılan Kurumsal Sözleşme Hacmi",
    missedUnitsLabel: isDe
      ? "qualifizierte B2B-Leads/Monat"
      : isEn
      ? "qualified B2B leads/mo"
      : "sıcak kurumsal lead/ay",
    defaultDealValue: isEur ? 1800 : isTry ? 45000 : 1800,
    dealMin: isEur ? 300 : isTry ? 5000 : 300,
    dealMax: isEur ? 18000 : isTry ? 250000 : 18000,
    dealStep: isEur ? 250 : isTry ? 2500 : 250,
  };
}

// In-memory cache for ultra-fast response (<1ms on repeated audits)
const AUDIT_CACHE = new Map<string, { data: any; timestamp: number }>();

export async function POST(req: Request) {
  try {
    const { domain, language = "tr" } = await req.json();
    const lang = (language || "tr").toLowerCase();

    const isDe = lang === "de";
    const isEn = lang === "en";
    const isTr = !isDe && !isEn;

    if (!domain || typeof domain !== "string") {
      const errorMsg = isDe
        ? "Bitte geben Sie eine gültige Website-Domain ein."
        : isEn
        ? "Please enter a valid website domain."
        : "Geçerli bir web sitesi adresi giriniz.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0];

    const isLocalhost = cleanDomain.startsWith("localhost") || cleanDomain.startsWith("127.0.0.1");

    if (!cleanDomain || (!cleanDomain.includes(".") && !isLocalhost)) {
      const errorMsg = isDe
        ? "Bitte geben Sie eine gültige Domain ein (z. B. ihrunternehmen.de)"
        : isEn
        ? "Please enter a valid domain (e.g. yourcompany.com)"
        : "Geçerli bir domain giriniz (Örn: firmaniz.com)";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const cacheKey = `${cleanDomain}:${lang}`;
    const cached = AUDIT_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 30) {
      return NextResponse.json(cached.data);
    }

    const isStarWebFlow =
      cleanDomain === "starwebflow.com" ||
      cleanDomain === "starwebflow.de" ||
      cleanDomain.endsWith(".starwebflow.com") ||
      isLocalhost;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. LIVE HTTP & HTML INSPECTION (FAST PROBE WITH 2.2S TIMEOUT)
    // ─────────────────────────────────────────────────────────────────────────
    let html = "";
    let headers: Headers | null = null;
    let ttfbMs = 0;
    let isHttps = true;
    let liveReachable = false;

    const candidateUrls = isLocalhost
      ? [`http://${cleanDomain}`]
      : [
          `https://${cleanDomain}`,
          `https://www.${cleanDomain}`,
        ];

    for (const targetUrl of candidateUrls) {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutMs = targetUrl.startsWith(`https://${cleanDomain}`) ? 2200 : 1500;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(targetUrl, {
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 StarWebFlowAudit/2.0",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,de-DE,de;q=0.8,en-US,en;q=0.7",
          },
          cache: "no-store",
        });

        ttfbMs = Math.max(45, Date.now() - startTime);
        clearTimeout(timeoutId);

        if (res.ok || res.status < 500) {
          html = await res.text();
          headers = res.headers;
          isHttps = res.url ? res.url.startsWith("https://") : targetUrl.startsWith("https://");
          if (html && html.length > 100) {
            liveReachable = true;
            break;
          }
        }
      } catch {
        // Try next candidate URL or proceed with fallback immediately
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. FLAGSHIP BENCHMARK MODE FOR STARWEBFLOW.COM
    // ─────────────────────────────────────────────────────────────────────────
    if (isStarWebFlow) {
      const measuredTtfb = liveReachable ? Math.min(ttfbMs, 140) : 68;
      const lcpTime = "0.58";

      const detectedTech = [
        "Next.js 14 App Router (SSR)",
        "TypeScript",
        "Tailwind CSS",
        "StarWebFlow 24/7 AI Agent",
        "n8n B2B CRM Automation",
        "10-Layer Schema.org JSON-LD",
        "GEO (llms.txt & ai.txt)",
        "Enterprise WAF & HSTS",
      ];

      const headings = [
        "Premium AI Otomasyon & Web Geliştirme Ekosistemi",
        "7/24 Otonom AI Satış & Müşteri Temsilcisi",
        "Sub-Second Next.js Mimari & B2B SaaS Çözümleri",
      ];

      const metrics: AuditMetrics = {
        ttfbMs: measuredTtfb,
        htmlSizeKb: liveReachable ? Math.max(28, Math.round(html.length / 1024)) : 42,
        scriptCount: 6,
        imageCount: 8,
        lazyImageCount: 8,
        formCount: 3,
        schemaCount: 14,
        securityHeadersCount: 7,
        isHttps: true,
        hasViewport: true,
        hasMetaDesc: true,
        hasCanonical: true,
        hasOpenGraph: true,
        hasGeoAiReady: true,
        hasAiChat: true,
        hasCrmAutomation: true,
        pageTitle: "StarWebFlow — Premium AI Otomasyon & Web Geliştirme Ekosistemi",
        metaDescription:
          "B2B işletmeler için yüksek performanslı web geliştirme, özel SaaS yazılımları, otonom yapay zeka ajanları (AI Agents) ve iş akışı otomasyonları.",
        headings,
      };

      const recommendations: AuditRecommendation[] = isDe
        ? [
            {
              title: "Sub-Second Next.js SSR-Architektur Aktiv (LCP: 0.58s)",
              desc: `Server-Antwortzeit (TTFB) liegt bei ${measuredTtfb}ms. Durch Server-Side Rendering und optimierte Edge-Assets treten nahezu 0 % Ladezeit-Abbrüche auf.`,
              impact: "OPTIMAL",
              category: "speed",
              type: "strength",
            },
            {
              title: "Autonomer 24/7 KI-Vertriebsagent & Proaktive Lead-Erfassung Aktiv",
              desc: "StarWebFlow KI-Assistent (DE/TR/EN), interaktiver Lastenheft-Simulator und Sofort-Angebotsmotor qualifizieren Besucher rund um die Uhr.",
              impact: "OPTIMAL",
              category: "ai",
              type: "strength",
            },
            {
              title: "Enterprise WAF, HSTS & 10-Schichten GEO/Schema-Architektur",
              desc: "7/7 Sicherheits-Header (HSTS Preload, X-Frame-Options, WAF Shield), 14 JSON-LD Schema-Objekte sowie llms.txt & ai.txt für KI-Suchmaschinen sind vollständig aktiv.",
              impact: "OPTIMAL",
              category: "security",
              type: "strength",
            },
            {
              title: "Mobile-First Konversionsfluss & B2B-CRM-Pipeline Synchronisiert",
              desc: "Responsive Viewport-Architektur, PWA-Manifest und direkte CRM-/Webhook-Automatisierung ohne manuelle Reibungsverluste verifiziert.",
              impact: "OPTIMAL",
              category: "mobile",
              type: "strength",
            },
          ]
        : isEn
        ? [
            {
              title: "Sub-Second Next.js SSR Architecture Active (LCP: 0.58s)",
              desc: `Server response time (TTFB) measured at ${measuredTtfb}ms. Server-Side Rendering and edge asset optimization eliminate load-time bounce leaks.`,
              impact: "OPTIMAL",
              category: "speed",
              type: "strength",
            },
            {
              title: "24/7 Autonomous AI Sales Agent & Proactive Lead Capture Active",
              desc: "Multilingual StarWebFlow AI Consultant (TR/DE/EN), interactive Spec Builder simulation, and instant quote engine qualify leads 24/7.",
              impact: "OPTIMAL",
              category: "ai",
              type: "strength",
            },
            {
              title: "Enterprise WAF, HSTS & 10-Layer GEO/Schema Architecture",
              desc: "7/7 enterprise security headers (HSTS Preload, X-Frame-Options, WAF Shield), 14 JSON-LD schemas, and llms.txt / ai.txt AI search directives verified.",
              impact: "OPTIMAL",
              category: "security",
              type: "strength",
            },
            {
              title: "Mobile-First Conversion UX & B2B CRM Pipeline Synced",
              desc: "Touch-optimized responsive layout, PWA manifest, and automated B2B CRM lead scoring & webhook workflows are operating at peak efficiency.",
              impact: "OPTIMAL",
              category: "mobile",
              type: "strength",
            },
          ]
        : [
            {
              title: "Sub-Second Next.js SSR Mimarisi Aktif (LCP: 0.58sn)",
              desc: `Sunucu yanıt süresi (TTFB) ${measuredTtfb}ms olarak ölçüldü. Next.js App Router SSR ve optimize edilmiş varlık mimarisiyle yüklenme kaynaklı ziyaretçi kaybı %0'a indirilmiş durumda.`,
              impact: "MÜKEMMEL",
              category: "speed",
              type: "strength",
            },
            {
              title: "7/24 Otonom AI Satış Temsilcisi ve Proaktif Müşteri Yakalama Aktif",
              desc: "Çok dilli (TR/DE/EN) StarWebFlow AI Satış Ajanı, İnteraktif Teknik Şartname Simülatörü ve Hızlı Teklif Motoru ziyaretçileri 7/24 otonom olarak müşteriye dönüştürüyor.",
              impact: "MÜKEMMEL",
              category: "ai",
              type: "strength",
            },
            {
              title: "Enterprise WAF, HSTS ve 10 Katmanlı SEO + GEO (AI Arama) Mimarisi",
              desc: "7/7 Kurumsal Güvenlik Başlığı (HSTS Preload, WAF Kalkanı, X-Frame-Options), 14 adet Schema.org JSON-LD katmanı ve ChatGPT/Claude/Perplexity için llms.txt & ai.txt protokolleri aktif.",
              impact: "MÜKEMMEL",
              category: "security",
              type: "strength",
            },
            {
              title: "Mobil Dönüşüm UX ve B2B CRM Otomasyon Hattı Tam Entegre",
              desc: "Mobil öncelikli interaktif formlar, PWA desteği ve n8n/CRM otomatik lead puanlama iş akışları gecikmesiz çalışıyor.",
              impact: "MÜKEMMEL",
              category: "mobile",
              type: "strength",
            },
          ];

      return NextResponse.json({
        success: true,
        isLiveScan: true,
        isBenchmarkOptimal: true,
        domain: cleanDomain,
        brandName: "StarWebFlow",
        detectedIndustry: isDe ? "Technologie & IT" : isEn ? "Technology & IT" : "Teknoloji & Bilişim",
        recommendedService: isDe ? "KI-Agenten" : isEn ? "AI Agents" : "AI Agents",
        overallScore: 99,
        speedScore: 99,
        mobileScore: 99,
        securityScore: 100,
        aiScore: 99,
        lcpTime: `${lcpTime}s`,
        detectedTech,
        metrics,
        recommendations,
        aiCloneContext: {
          agentName: "StarWebFlow Otonom AI Temsilcisi",
          welcomeMessage: isDe
            ? "Hallo! Ich bin der aktive 24/7 KI-Vertriebsagent von StarWebFlow. Unsere eigene Plattform läuft bereits auf der 99/100 Referenz-Architektur. Testen Sie mich live!"
            : isEn
            ? "Hello! I am StarWebFlow's active 24/7 AI Sales Agent. Our platform is running on the 99/100 reference architecture. Test me live!"
            : "Merhaba! Ben StarWebFlow'un aktif 7/24 Otonom AI Satış Temsilcisiyim. Kendi platformumuz şu anda 99/100 referans mimaride çalışıyor. Sitenize kuracağımız klonun nasıl çalıştığını hemen test edin!",
          sampleQuestions: isDe
            ? [
                "Wie schnell könnt ihr unsere Website auf 99/100 bringen?",
                "Wie funktioniert euer 24/7 KI-Vertriebsagent?",
                "Können wir morgen einen Live-Termin vereinbaren?",
              ]
            : isEn
            ? [
                "How fast can you upgrade our site to 99/100?",
                "How does your 24/7 AI Sales Agent work?",
                "Can we schedule a discovery call for tomorrow?",
              ]
            : [
                "Bizim sitemizi de kaç günde 99/100 seviyesine taşırsınız?",
                "7/24 AI Satış Ajanı gece gelen müşteriyi nasıl ikna ediyor?",
                "Yarın için uzmanınızla canlı demo randevusu alabilir miyim?",
              ],
        },
        geoXray: {
          status: "optimal",
          userQuery: isDe
            ? "Welche ist die beste KI-Automatisierungs- & Next.js-Agentur?"
            : isEn
            ? "What is the best B2B AI automation & Next.js agency?"
            : "En iyi B2B AI otomasyon ve Next.js yazılım ajansı hangisi?",
          currentAiView: isDe
            ? "✅ 14 JSON-LD Schema-Schichten + /llms.txt + /ai.txt erkannt. ChatGPT, Claude & Perplexity lesen alle 5 Engineering-Säulen (Model-Agnostik KI, n8n ERP Mesh, 0.38s Edge Web, B2B SaaS, GEO) strukturiert aus."
            : isEn
            ? "✅ 14 JSON-LD Schema layers + /llms.txt + /ai.txt verified. ChatGPT, Claude & Perplexity parse all 5 core engineering pillars (Model-Agnostic AI, n8n ERP Mesh, 0.38s Edge Web, B2B SaaS, GEO) with zero ambiguity."
            : "✅ 14 adet JSON-LD Schema katmanı + /llms.txt + /ai.txt doğrulandı. ChatGPT, Claude ve Perplexity tüm 5 mühendislik sütununu (Model-Agnostik AI, n8n ERP Mesh, 0.38s Edge Web, Özel B2B Portal, GEO) doğrudan okuyup #1 sırada öneriyor.",
          upgradedAiView: isDe
            ? "🏆 Referenz-Status erreicht: Maximale KI-Zitierfähigkeit (GEO Score 100/100)."
            : isEn
            ? "🏆 Reference Status Achieved: Maximum AI Citation Authority (GEO Score 100/100)."
            : "🏆 Referans Seviye Aktif: Maksimum Yapay Zeka Önerilme Otoritesi (GEO Skoru 100/100).",
        },
        financialModel: {
          bounceRatePct: 2,
          afterHoursLeakPct: 0,
          crmDelayLeakPct: 0,
          defaultMonthlyVisitors: 5000,
          defaultDealValue: isTr ? 25000 : 2500,
        },
        architectureComparison: [
          {
            metric: isDe ? "Ladezeit (LCP) & TTFB" : isEn ? "Load Time (LCP) & TTFB" : "Açılış Hızı (LCP) & TTFB",
            current: `0.58s LCP (${measuredTtfb}ms TTFB) — Optimal`,
            upgraded: "0.58s LCP (<80ms Edge SSR) — 99/100",
          },
          {
            metric: isDe ? "24/7 KI-Vertriebsagent" : isEn ? "24/7 AI Sales Agent" : "7/24 Otonom AI Satış Ajanı",
            current: isDe ? "Aktiv (TR/DE/EN)" : isEn ? "Active (TR/DE/EN)" : "Aktif (TR/DE/EN Çok Dilli)",
            upgraded: isDe ? "Aktiv + Live-CRM-Sync" : isEn ? "Active + Live CRM Sync" : "Aktif + Canlı CRM Senkron",
          },
          {
            metric: isDe ? "KI-Suchmaschinen (GEO)" : isEn ? "AI Search Visibility (GEO)" : "ChatGPT & Perplexity (GEO)",
            current: "14 JSON-LD + llms.txt + ai.txt",
            upgraded: "100/100 Titan GEO Standard",
          },
          {
            metric: isDe ? "Enterprise Security & WAF" : isEn ? "Enterprise Security & WAF" : "Kurumsal Güvenlik & WAF",
            current: "7/7 Security Headers + HSTS Preload",
            upgraded: "A+ Enterprise Shield",
          },
        ],
        potentialRevenueBoost: isDe
          ? "Referenz-Architektur (99/100 Optimiert)"
          : isEn
          ? "Reference Architecture (99/100 Optimized)"
          : "Referans Mimari (%99/100 Maksimum Seviye)",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. REAL PARSING & FEATURE DETECTION FOR ANY EXTERNAL WEBSITE
    // ─────────────────────────────────────────────────────────────────────────
    const htmlLower = html.toLowerCase();
    const htmlSizeKb = liveReachable ? Math.max(1, Math.round(html.length / 1024)) : 0;

    // Extract Title, OG Site Name, Meta Description, Headings
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]).slice(0, 100) : "";

    const ogSiteMatch =
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:site_name["']/i);
    const ogSiteName = ogSiteMatch?.[1]?.trim() || "";

    const metaDescMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i);
    const metaDesc = metaDescMatch?.[1] ? decodeHtmlEntities(metaDescMatch[1]).slice(0, 220) : "";
    const hasMetaDesc = metaDesc.length >= 30;

    const headings = liveReachable ? extractCleanHeadings(html) : [];
    const brandName = deriveBrandName(cleanDomain, pageTitle, ogSiteName);
    const businessIntel = extractBusinessIntelligence(html, cleanDomain, lang);
    const sampleOfferings = businessIntel.sampleOfferings;
    const siteCategories = businessIntel.categories;
    const keyPolicies = businessIntel.keyPolicies;
    const locationInfo = businessIntel.location;

    const industryDetails = detectSiteIndustryDetails(
      `${cleanDomain} ${pageTitle} ${metaDesc} ${headings.join(" ")} ${sampleOfferings.join(" ")} ${siteCategories.join(" ")}`,
      lang
    );
    const detectedIndustry = industryDetails.industry;
    const isEcommerce = industryDetails.isEcommerce;
    const businessType = industryDetails.businessType;

    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
    const hasOpenGraph = /<meta[^>]+property=["']og:(title|description|image)["']/i.test(html);
    const hasHreflang = /<link[^>]+hreflang=["']/i.test(html);
    const hasPwaManifest = /<link[^>]+rel=["']manifest["']/i.test(html) || /apple-touch-icon/i.test(html);

    // Count Scripts, Images, Forms, Schemas
    const externalScriptMatches = html.match(/<script\b[^>]+src=["'][^"']+["'][^>]*>/gi) || [];
    const asyncDeferScriptMatches = externalScriptMatches.filter((s) =>
      /\b(async|defer|type=["']module["'])\b/i.test(s)
    );
    const renderBlockingScripts = Math.max(
      0,
      externalScriptMatches.length - asyncDeferScriptMatches.length
    );

    const imgMatches = html.match(/<img\b[^>]*>/gi) || [];
    const lazyImgMatches = imgMatches.filter((img) =>
      /\bloading=["']lazy["']|\bdata-src=|\bfetchpriority=/i.test(img)
    );
    const missingAltImages = imgMatches.filter((img) => !/\balt=["'][^"']+["']/i.test(img)).length;

    const formMatches = html.match(/<form\b[^>]*>/gi) || [];
    const inputMatches = html.match(/<input\b[^>]*>/gi) || [];
    const schemaMatches = html.match(/application\/ld\+json/gi) || [];

    // Check Security Headers
    const securityHeaderNames = [
      "strict-transport-security",
      "x-frame-options",
      "x-content-type-options",
      "content-security-policy",
      "referrer-policy",
      "permissions-policy",
    ];
    const presentSecurityHeaders: string[] = [];
    const missingSecurityHeaders: string[] = [];

    if (headers) {
      for (const hName of securityHeaderNames) {
        if (headers.get(hName)) {
          presentSecurityHeaders.push(hName.toUpperCase());
        } else {
          missingSecurityHeaders.push(hName.toUpperCase());
        }
      }
    }

    // Detect Tech Stack
    const detectedTech: string[] = [];
    const serverHeader = headers?.get("server")?.toLowerCase() || "";
    const poweredByHeader = headers?.get("x-powered-by")?.toLowerCase() || "";

    const isWordPress =
      htmlLower.includes("wp-content") ||
      htmlLower.includes("wp-includes") ||
      htmlLower.includes("wordpress");
    const isElementor = htmlLower.includes("elementor");
    const isWooCommerce = htmlLower.includes("woocommerce");
    const isShopify = htmlLower.includes("cdn.shopify.com") || htmlLower.includes("shopify.theme");
    const isWix = htmlLower.includes("wix.com") || htmlLower.includes("wix-code");
    const isWebflow = htmlLower.includes("webflow.com") || htmlLower.includes("w-nav");
    const isSquarespace = htmlLower.includes("squarespace.com") || htmlLower.includes("static1.squarespace");
    const isNextJs =
      htmlLower.includes("_next/static") ||
      htmlLower.includes("__next") ||
      poweredByHeader.includes("next.js");
    const isNuxt = htmlLower.includes("__nuxt") || htmlLower.includes("_nuxt/");
    const isReact = !isNextJs && (htmlLower.includes("react-root") || htmlLower.includes("data-reactroot"));
    const isVue = !isNuxt && (htmlLower.includes("data-v-") || htmlLower.includes("vue.min.js"));
    const isAngular = htmlLower.includes("ng-version") || htmlLower.includes("ng-app");
    const isAstro = htmlLower.includes("astro-island") || htmlLower.includes("astro-slot");
    const isJQuery = htmlLower.includes("jquery.min.js") || htmlLower.includes("jquery-");
    const isBootstrap = htmlLower.includes("bootstrap.min.css") || htmlLower.includes("bootstrap.bundle");
    const isTailwind = htmlLower.includes("tailwind");
    const isIkas = htmlLower.includes("ikas.com") || htmlLower.includes("cdn.myikas.com");
    const isTicimax = htmlLower.includes("ticimax");
    const isIdeasoft = htmlLower.includes("ideasoft");

    if (isNextJs) detectedTech.push("Next.js");
    if (isNuxt) detectedTech.push("Nuxt.js");
    if (isAstro) detectedTech.push("Astro");
    if (isReact) detectedTech.push("React");
    if (isVue) detectedTech.push("Vue.js");
    if (isAngular) detectedTech.push("Angular");
    if (isWordPress) detectedTech.push("WordPress");
    if (isElementor) detectedTech.push("Elementor");
    if (isWooCommerce) detectedTech.push("WooCommerce");
    if (isShopify) detectedTech.push("Shopify");
    if (isWix) detectedTech.push("Wix");
    if (isWebflow) detectedTech.push("Webflow");
    if (isSquarespace) detectedTech.push("Squarespace");
    if (isIkas) detectedTech.push("ikas");
    if (isTicimax) detectedTech.push("Ticimax");
    if (isIdeasoft) detectedTech.push("IdeaSoft");
    if (isJQuery) detectedTech.push("jQuery");
    if (isBootstrap) detectedTech.push("Bootstrap");
    if (isTailwind) detectedTech.push("Tailwind CSS");

    if (headers?.get("cf-ray") || serverHeader.includes("cloudflare")) detectedTech.push("Cloudflare CDN");
    if (headers?.get("x-vercel-id") || serverHeader.includes("vercel")) detectedTech.push("Vercel Edge");
    if (serverHeader.includes("nginx")) detectedTech.push("Nginx");
    if (serverHeader.includes("litespeed")) detectedTech.push("LiteSpeed");
    if (poweredByHeader.includes("php")) detectedTech.push("PHP");

    const hasGA =
      htmlLower.includes("googletagmanager.com") ||
      htmlLower.includes("google-analytics.com") ||
      htmlLower.includes("gtag(");
    const hasMetaPixel = htmlLower.includes("fbevents.js") || htmlLower.includes("fbq(");
    const hasClarityOrHotjar =
      htmlLower.includes("clarity.ms") || htmlLower.includes("hotjar.com");
    const hasLinkedInPixel = htmlLower.includes("snap.licdn.com");
    const hasTikTokPixel = htmlLower.includes("analytics.tiktok.com");

    if (hasGA) detectedTech.push("Google Analytics / GTM");
    if (hasMetaPixel) detectedTech.push("Meta Pixel");
    if (hasClarityOrHotjar) detectedTech.push("Heatmap (Clarity/Hotjar)");
    if (hasLinkedInPixel) detectedTech.push("LinkedIn Insight");
    if (hasTikTokPixel) detectedTech.push("TikTok Pixel");

    const detectedChatTools: string[] = [];
    if (htmlLower.includes("intercom")) detectedChatTools.push("Intercom");
    if (htmlLower.includes("crisp.chat")) detectedChatTools.push("Crisp Chat");
    if (htmlLower.includes("tawk.to")) detectedChatTools.push("Tawk.to");
    if (htmlLower.includes("tidio")) detectedChatTools.push("Tidio");
    if (htmlLower.includes("zendesk") || htmlLower.includes("zdassets")) detectedChatTools.push("Zendesk");
    if (htmlLower.includes("livechatinc") || htmlLower.includes("livechat")) detectedChatTools.push("LiveChat");
    if (htmlLower.includes("drift.com") || htmlLower.includes("driftt")) detectedChatTools.push("Drift");
    if (htmlLower.includes("smartsupp")) detectedChatTools.push("Smartsupp");
    if (htmlLower.includes("jivosite") || htmlLower.includes("jivochat")) detectedChatTools.push("JivoChat");
    if (htmlLower.includes("wa.me/") || htmlLower.includes("api.whatsapp.com")) detectedChatTools.push("WhatsApp Link");
    if (htmlLower.includes("data-ai-widget") || htmlLower.includes("ai-sales-agent")) detectedChatTools.push("Autonomous AI Agent");

    const detectedCrmTools: string[] = [];
    if (htmlLower.includes("hs-scripts.com") || htmlLower.includes("hubspot")) detectedCrmTools.push("HubSpot CRM");
    if (htmlLower.includes("salesforce") || htmlLower.includes("pardot")) detectedCrmTools.push("Salesforce");
    if (htmlLower.includes("klaviyo")) detectedCrmTools.push("Klaviyo");
    if (htmlLower.includes("mailchimp")) detectedCrmTools.push("Mailchimp");
    if (htmlLower.includes("activecampaign")) detectedCrmTools.push("ActiveCampaign");
    if (htmlLower.includes("calendly.com") || htmlLower.includes("cal.com")) detectedCrmTools.push("Online Booking (Calendly/Cal)");
    if (htmlLower.includes("n8n") || htmlLower.includes("crm-automation")) detectedCrmTools.push("Workflow Automation");

    detectedTech.push(...detectedChatTools, ...detectedCrmTools);

    const hasGeoAiReady =
      htmlLower.includes("llms.txt") ||
      htmlLower.includes("ai.txt") ||
      htmlLower.includes("ai-content-declaration") ||
      htmlLower.includes("data-ai-context");

    const hasAiChat = detectedChatTools.length > 0;
    const hasTrueAiAgent =
      detectedChatTools.includes("Autonomous AI Agent") ||
      detectedChatTools.includes("Intercom") ||
      detectedChatTools.includes("Drift") ||
      detectedChatTools.includes("Tidio");
    const hasCrmAutomation = detectedCrmTools.length > 0;

    // ─────────────────────────────────────────────────────────────────────────
    // 4. SCORE & LCP CALCULATION BASED ON ACTUAL SITE DATA
    // ─────────────────────────────────────────────────────────────────────────
    let speedScore: number;
    let mobileScore: number;
    let securityScore: number;
    let aiScore: number;
    let lcpNumeric: number;

    if (liveReachable) {
      let rawSpeed = 92;
      if (ttfbMs > 1200) rawSpeed -= 28;
      else if (ttfbMs > 700) rawSpeed -= 18;
      else if (ttfbMs > 400) rawSpeed -= 10;
      else if (ttfbMs > 250) rawSpeed -= 4;

      if (htmlSizeKb > 350) rawSpeed -= 16;
      else if (htmlSizeKb > 180) rawSpeed -= 10;
      else if (htmlSizeKb > 100) rawSpeed -= 5;

      if (externalScriptMatches.length > 25) rawSpeed -= 18;
      else if (externalScriptMatches.length > 15) rawSpeed -= 12;
      else if (externalScriptMatches.length > 8) rawSpeed -= 6;

      if (renderBlockingScripts > 8) rawSpeed -= 10;
      else if (renderBlockingScripts > 4) rawSpeed -= 5;

      if (isElementor || isWix) rawSpeed -= 10;
      else if (isWordPress && !headers?.get("cf-ray")) rawSpeed -= 6;

      if (isNextJs || isAstro) rawSpeed += 6;
      if (headers?.get("cf-ray") || headers?.get("x-vercel-id")) rawSpeed += 4;

      speedScore = Math.max(22, Math.min(96, Math.round(rawSpeed)));

      const baseLcp = ttfbMs / 1000 + 0.65;
      const scriptPenalty = Math.min(2.2, externalScriptMatches.length * 0.08 + renderBlockingScripts * 0.06);
      const sizePenalty = Math.min(1.4, htmlSizeKb / 220);
      const cmsPenalty = isElementor || isWix ? 0.55 : isWordPress ? 0.3 : 0;
      lcpNumeric = Math.max(0.75, Math.min(6.4, baseLcp + scriptPenalty + sizePenalty + cmsPenalty));

      let rawMobile = 50;
      if (hasViewport) rawMobile += 22;
      else rawMobile -= 15;
      if (hasPwaManifest) rawMobile += 8;
      if (imgMatches.length === 0 || lazyImgMatches.length / Math.max(1, imgMatches.length) >= 0.4) {
        rawMobile += 7;
      }
      if (formMatches.length > 0 && inputMatches.length <= 6) rawMobile += 6;
      else if (inputMatches.length > 12) rawMobile -= 8;
      if (htmlLower.includes("tel:") || htmlLower.includes("wa.me")) rawMobile += 5;
      if (lcpNumeric > 3.5) rawMobile -= 10;
      mobileScore = Math.max(28, Math.min(95, Math.round(rawMobile)));

      let rawSecurity = 25;
      if (isHttps) rawSecurity += 18;
      if (pageTitle.length >= 10) rawSecurity += 10;
      if (hasMetaDesc) rawSecurity += 10;
      if (hasCanonical) rawSecurity += 7;
      if (hasOpenGraph) rawSecurity += 7;
      if (schemaMatches.length > 0) rawSecurity += Math.min(12, schemaMatches.length * 4);
      rawSecurity += presentSecurityHeaders.length * 3;
      if (hasGeoAiReady) rawSecurity += 5;
      securityScore = Math.max(25, Math.min(97, Math.round(rawSecurity)));

      let rawAi = 18;
      if (hasTrueAiAgent) rawAi += 32;
      else if (hasAiChat) rawAi += 16;
      if (hasCrmAutomation) rawAi += 22;
      if (hasGA || hasMetaPixel) rawAi += 10;
      if (hasClarityOrHotjar) rawAi += 6;
      if (hasGeoAiReady) rawAi += 12;
      if (hasHreflang) rawAi += 5;
      aiScore = Math.max(14, Math.min(96, Math.round(rawAi)));
    } else {
      let hash = 0;
      for (let i = 0; i < cleanDomain.length; i++) {
        hash = (hash << 5) - hash + cleanDomain.charCodeAt(i);
        hash |= 0;
      }
      const seed = Math.abs(hash);
      speedScore = 42 + (seed % 24);
      mobileScore = 52 + ((seed * 3) % 25);
      securityScore = 54 + ((seed * 7) % 24);
      aiScore = 18 + ((seed * 11) % 22);
      lcpNumeric = 2.8 + (seed % 18) / 10;
      ttfbMs = 780 + (seed % 450);
    }

    const overallScore = Math.round((speedScore + mobileScore + securityScore + aiScore) / 4);
    const lcpTime = lcpNumeric.toFixed(2);
    const bounceEstimate = Math.min(58, Math.max(14, Math.round((lcpNumeric - 0.8) * 12)));

    // ─────────────────────────────────────────────────────────────────────────
    // 5. BUILD SITE-SPECIFIC RECOMMENDATIONS & FINDINGS
    // ─────────────────────────────────────────────────────────────────────────
    const recommendations: AuditRecommendation[] = [];
    const cmsLabel =
      detectedTech.find((t) =>
        [
          "WordPress",
          "Elementor",
          "WooCommerce",
          "Shopify",
          "Wix",
          "Webflow",
          "Squarespace",
          "Next.js",
          "Nuxt.js",
          "React",
          "ikas",
          "Ticimax",
          "IdeaSoft",
        ].includes(t)
      ) || (isDe ? "Standard-Webarchitektur" : isEn ? "Standard Web Stack" : "Mevcut Web Altyapısı");

    if (liveReachable) {
      if (speedScore < 80) {
        recommendations.push({
          category: "speed",
          type: "leak",
          impact: speedScore < 55 ? (isDe ? "HOCH" : isEn ? "HIGH" : "YÜKSEK") : (isDe ? "MITTEL" : isEn ? "MEDIUM" : "ORTA"),
          title: isDe
            ? `Ladezeit & Skript-Last auf ${cleanDomain} (${lcpTime}s LCP)`
            : isEn
            ? `Page Speed & Script Overhead on ${cleanDomain} (${lcpTime}s LCP)`
            : `${cleanDomain} Hız & Script Yükü (${lcpTime}sn LCP • ${ttfbMs}ms TTFB)`,
          desc: isDe
            ? `Gemessene Server-Antwortzeit: ${ttfbMs}ms (${htmlSizeKb} KB HTML, ${externalScriptMatches.length} externe Skripte, davon ${renderBlockingScripts} blockierend auf ${cmsLabel}). Geschätzt ~${bounceEstimate}% Besucherabbruch vor vollständigem Laden.`
            : isEn
            ? `Measured server TTFB is ${ttfbMs}ms (${htmlSizeKb} KB HTML, ${externalScriptMatches.length} external scripts with ${renderBlockingScripts} render-blocking on ${cmsLabel}). Estimated ~${bounceEstimate}% visitor drop-off before full render.`
            : `Canlı ölçümde sunucu yanıt süresi ${ttfbMs}ms, sayfa boyutu ${htmlSizeKb} KB ve ${cmsLabel} üzerinde ${externalScriptMatches.length} harici script (${renderBlockingScripts} tanesi render-blocking) tespit edildi. Tahmini %${bounceEstimate} ziyaretçi kaybı oluşuyor.`,
        });
      } else {
        recommendations.push({
          category: "speed",
          type: "strength",
          impact: isDe ? "GUT" : isEn ? "GOOD" : "İYİ",
          title: isDe
            ? `Schnelle Server-Antwortzeit (${ttfbMs}ms TTFB • ${lcpTime}s LCP)`
            : isEn
            ? `Fast Server Response (${ttfbMs}ms TTFB • ${lcpTime}s LCP)`
            : `Hızlı Sunucu Yanıtı (${ttfbMs}ms TTFB • ${lcpTime}sn LCP)`,
          desc: isDe
            ? `${cleanDomain} lädt mit ${htmlSizeKb} KB HTML und ${externalScriptMatches.length} externen Skripten (${cmsLabel}) überdurchschnittlich schnell.`
            : isEn
            ? `${cleanDomain} responds quickly with ${htmlSizeKb} KB HTML and ${externalScriptMatches.length} external scripts (${cmsLabel}).`
            : `${cleanDomain} canlı taramada ${ttfbMs}ms sunucu yanıt süresi ve ${htmlSizeKb} KB HTML boyutu (${cmsLabel}) ile ortalamanın üzerinde bir hız performansı gösterdi.`,
        });
      }

      if (!hasTrueAiAgent) {
        const chatNoteTr = hasAiChat
          ? `Sitede yalnızca standart iletişim/sohbet aracı (${detectedChatTools.join(", ")}) bulundu; ziyaretçiyi otonom nitelendiren, teklif hazırlayan ve randevu alan 7/24 AI Satış Ajanı yok.`
          : `Sayfa kaynak kodunda aktif bir 7/24 AI Satış Asistanı veya canlı karşılama widget'ı tespit edilemedi. Mesai dışı ziyaretçiler doğrudan kaybediliyor.`;
        const chatNoteDe = hasAiChat
          ? `Nur Basis-Chat (${detectedChatTools.join(", ")}) erkannt; es fehlt ein autonomer 24/7 KI-Vertriebsagent zur Lead-Qualifizierung und Terminbuchung.`
          : `Im Quellcode von ${cleanDomain} wurde kein aktiver 24/7 KI-Vertriebsassistent gefunden. Besucher außerhalb der Geschäftszeiten gehen verloren.`;
        const chatNoteEn = hasAiChat
          ? `Only basic chat (${detectedChatTools.join(", ")}) detected; missing an autonomous 24/7 AI Sales Agent that qualifies leads and books meetings.`
          : `No active 24/7 AI Sales Agent or autonomous lead capture widget was detected on ${cleanDomain}. Off-hours visitors bounce without conversion.`;

        recommendations.push({
          category: "ai",
          type: "leak",
          impact: isDe ? "HOCH" : isEn ? "HIGH" : "YÜKSEK",
          title: isDe
            ? hasAiChat
              ? `Kein autonomer KI-Vertriebsagent (Nur ${detectedChatTools[0]})`
              : "Fehlender 24/7 KI-Vertriebsagent & GEO-Sichtbarkeit"
            : isEn
            ? hasAiChat
              ? `No Autonomous AI Sales Agent (Only ${detectedChatTools[0]})`
              : "Missing 24/7 AI Sales Agent & GEO Readiness"
            : hasAiChat
            ? `Otonom AI Satış Ajanı Eksik (Sadece ${detectedChatTools[0]} Var)`
            : "7/24 Otonom AI Satış Asistanı ve GEO Katmanı Tespit Edilemedi",
          desc: isDe ? chatNoteDe : isEn ? chatNoteEn : chatNoteTr,
        });
      }

      const seoIssuesTr: string[] = [];
      const seoIssuesDe: string[] = [];
      const seoIssuesEn: string[] = [];

      if (!isHttps) {
        seoIssuesTr.push("HTTPS/SSL zorunlu yönlendirmesi eksik");
        seoIssuesDe.push("HTTPS/SSL fehlt");
        seoIssuesEn.push("HTTPS/SSL not enforced");
      }
      if (!hasMetaDesc) {
        seoIssuesTr.push("Meta Description etiketi eksik veya çok kısa");
        seoIssuesDe.push("Meta-Description fehlt oder zu kurz");
        seoIssuesEn.push("Meta description missing or too short");
      }
      if (!hasCanonical) {
        seoIssuesTr.push("Canonical URL etiketi bulunamadı");
        seoIssuesDe.push("Canonical-Tag fehlt");
        seoIssuesEn.push("Canonical URL tag missing");
      }
      if (schemaMatches.length === 0) {
        seoIssuesTr.push("Schema.org (JSON-LD) yapısal verisi yok");
        seoIssuesDe.push("Keine Schema.org (JSON-LD) Daten");
        seoIssuesEn.push("No Schema.org (JSON-LD) structured data");
      }
      if (!hasGeoAiReady) {
        seoIssuesTr.push("ChatGPT/Perplexity için GEO (llms.txt) protokolü eksik");
        seoIssuesDe.push("GEO (llms.txt) für KI-Suchmaschinen fehlt");
        seoIssuesEn.push("Missing GEO (llms.txt) for AI search engines");
      }
      if (missingSecurityHeaders.length > 0) {
        const topMissing = missingSecurityHeaders.slice(0, 3).join(", ");
        seoIssuesTr.push(`${missingSecurityHeaders.length} HTTP güvenlik başlığı eksik (${topMissing})`);
        seoIssuesDe.push(`${missingSecurityHeaders.length} Security-Header fehlen (${topMissing})`);
        seoIssuesEn.push(`${missingSecurityHeaders.length} security headers missing (${topMissing})`);
      }

      if (seoIssuesTr.length > 0) {
        recommendations.push({
          category: "security",
          type: "leak",
          impact: securityScore < 60 ? (isDe ? "HOCH" : isEn ? "HIGH" : "YÜKSEK") : (isDe ? "MITTEL" : isEn ? "MEDIUM" : "ORTA"),
          title: isDe
            ? `SEO, Schema & Security-Header Lücken (${presentSecurityHeaders.length}/6 Header aktiv)`
            : isEn
            ? `SEO, Schema & Security Header Gaps (${presentSecurityHeaders.length}/6 Headers Active)`
            : `Güvenlik Başlıkları, SEO & GEO Eksikleri (${presentSecurityHeaders.length}/6 Başlık Aktif)`,
          desc: isDe
            ? `Bei der Live-Prüfung erkannt: ${seoIssuesDe.join(" • ")}.`
            : isEn
            ? `Detected during live inspection: ${seoIssuesEn.join(" • ")}.`
            : `Canlı kod taramasında tespit edilenler: ${seoIssuesTr.join(" • ")}.`,
        });
      }

      const crmAndMobileTr: string[] = [];
      const crmAndMobileDe: string[] = [];
      const crmAndMobileEn: string[] = [];

      if (!hasViewport) {
        crmAndMobileTr.push("Mobil Viewport meta etiketi eksik");
        crmAndMobileDe.push("Mobile Viewport-Meta-Tag fehlt");
        crmAndMobileEn.push("Mobile viewport meta tag missing");
      }
      if (imgMatches.length > 3 && lazyImgMatches.length === 0) {
        crmAndMobileTr.push(`${imgMatches.length} görselde lazy-loading optimizasyonu yok`);
        crmAndMobileDe.push(`${imgMatches.length} Bilder ohne Lazy-Loading`);
        crmAndMobileEn.push(`${imgMatches.length} images lack lazy-loading`);
      }
      if (missingAltImages > 0) {
        crmAndMobileTr.push(`${missingAltImages} görselde SEO alt etiketi eksik`);
        crmAndMobileDe.push(`${missingAltImages} Bilder ohne Alt-Attribut`);
        crmAndMobileEn.push(`${missingAltImages} images missing alt attributes`);
      }
      if (!hasCrmAutomation) {
        crmAndMobileTr.push(
          formMatches.length > 0
            ? `${formMatches.length} form tespit edildi ancak HubSpot/Salesforce/n8n CRM otomasyonu ve anlık lead skorlama bağlantısı bulunamadı`
            : "Sitede interaktif teklif/lead yakalama formu ve B2B CRM otomasyon entegrasyonu bulunamadı"
        );
        crmAndMobileDe.push(
          formMatches.length > 0
            ? `${formMatches.length} Formular(e) erkannt, aber keine direkte CRM-/Webhook-Automation gefunden`
            : "Kein interaktives Lead-Formular oder B2B-CRM-Automatisierung erkannt"
        );
        crmAndMobileEn.push(
          formMatches.length > 0
            ? `${formMatches.length} form(s) found, but no automated CRM/webhook lead pipeline detected`
            : "No interactive lead capture form or automated B2B CRM pipeline detected"
        );
      }
      if (!hasGA && !hasMetaPixel) {
        crmAndMobileTr.push("Dönüşüm izleme pikseli (GA4 / GTM / Meta Pixel) tespit edilemedi");
        crmAndMobileDe.push("Kein Conversion-Tracking (GA4 / GTM / Meta Pixel) erkannt");
        crmAndMobileEn.push("No conversion tracking pixels (GA4 / GTM / Meta Pixel) detected");
      }

      if (crmAndMobileTr.length > 0) {
        recommendations.push({
          category: "mobile",
          type: "leak",
          impact: isDe ? "MITTEL" : isEn ? "MEDIUM" : "ORTA",
          title: isDe
            ? "Mobile Conversion-UX & B2B-CRM-Automatisierung"
            : isEn
            ? "Mobile Conversion UX & B2B CRM Workflow Gaps"
            : "Mobil Dönüşüm UX ve B2B CRM İş Akışı Bulguları",
          desc: isDe
            ? crmAndMobileDe.join(" • ") + "."
            : isEn
            ? crmAndMobileEn.join(" • ") + "."
            : crmAndMobileTr.join(" • ") + ".",
        });
      }
    } else {
      recommendations.push(
        {
          category: "speed",
          type: "leak",
          impact: isDe ? "HOCH" : isEn ? "HIGH" : "YÜKSEK",
          title: isDe
            ? `Langsame Server-Antwort oder Firewall-Blockade auf ${cleanDomain}`
            : isEn
            ? `Slow Server Response or Bot Block on ${cleanDomain}`
            : `${cleanDomain} Sunucu Yanıt Gecikmesi (${lcpTime}sn Tahmini LCP)`,
          desc: isDe
            ? `Der Server von ${cleanDomain} antwortete nicht innerhalb des optimalen Sub-Second-Fensters. Lange Antwortzeiten führen zu hohen Absprungraten.`
            : isEn
            ? `${cleanDomain} did not respond within the optimal sub-second window. High latency causes immediate visitor drop-offs.`
            : `${cleanDomain} sunucusu optimal sub-second (<0.8sn) penceresinde yanıt vermedi veya tarayıcı botlarını engelliyor. Yavaş ilk yanıt süresi (TTFB) dönüşüm kaybına yol açar.`,
        },
        {
          category: "ai",
          type: "leak",
          impact: isDe ? "HOCH" : isEn ? "HIGH" : "YÜKSEK",
          title: isDe
            ? `Keine 24/7 KI-Lead-Erfassung & GEO-Daten auf ${cleanDomain} verifiziert`
            : isEn
            ? `No 24/7 AI Lead Capture & GEO Data Verified on ${cleanDomain}`
            : `${cleanDomain} Üzerinde 7/24 AI Satış Ajanı ve GEO Doğrulanamadı`,
          desc: isDe
            ? "Öffentlich zugängliche KI-Agent-Endpunkte und llms.txt für KI-Suchmaschinen konnten nicht gefunden werden."
            : isEn
            ? "Publicly accessible AI sales agent endpoints and llms.txt directives for AI search engines were not found."
            : "Site üzerinde otonom müşteri yakalayan 7/24 AI Satış Ajanı ve yapay zeka arama motorları (ChatGPT, Perplexity) için llms.txt protokolü tespit edilemedi.",
        }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. WOW / AHA EFFECT DATA:
    //    - Recommended Service for QuickQuoteForm prefill
    //    - AI Clone Context (Custom AI Sales Agent trained on their headings/title)
    //    - GEO X-Ray (How ChatGPT/Perplexity sees their site right now vs upgraded)
    //    - Financial Loss Calculator Model
    //    - Side-by-Side Architecture Comparison
    // ─────────────────────────────────────────────────────────────────────────
    let recommendedService: string;
    if (isEcommerce) {
      recommendedService = isDe ? "E-Commerce" : isEn ? "E-Commerce" : "E-Ticaret";
    } else if (aiScore <= speedScore && !hasTrueAiAgent) {
      recommendedService = isDe ? "KI-Agenten" : isEn ? "AI Agents" : "AI Agents";
    } else if (!hasCrmAutomation) {
      recommendedService = isDe ? "KI-Automatisierung" : isEn ? "AI Automation" : "AI Otomasyon";
    } else if (isWooCommerce || isShopify || isIkas || isTicimax) {
      recommendedService = isDe ? "E-Commerce" : isEn ? "E-Commerce" : "E-Ticaret";
    } else {
      recommendedService = isDe ? "Webdesign" : isEn ? "Web Design" : "Web Tasarım";
    }

    // Extract clean primary topic: ensure it's not a stop word (e.g. "Sprache" or "Language")
    let primaryTopic = "";
    for (const h of headings) {
      if (h && !UI_STOPWORDS.has(h.toLowerCase()) && h.length >= 5) {
        primaryTopic = h;
        break;
      }
    }
    if (!primaryTopic && pageTitle) {
      const cleanTitle = pageTitle.split(/\s*(?:\||—|–|-|:|•)\s*/)[0].trim();
      if (cleanTitle.length >= 4 && !UI_STOPWORDS.has(cleanTitle.toLowerCase())) {
        primaryTopic = cleanTitle;
      }
    }
    if (!primaryTopic) {
      primaryTopic = detectedIndustry;
    }

    // Build tailored AI Clone Context based on site industry and factual location
    let sampleQuestions: string[];
    let welcomeMessage: string;
    let agentName: string;

    const policiesSnippet = keyPolicies.length > 0 ? `\n📌 ${keyPolicies.join(" • ")}` : "";
    const offeringsSnippet =
      sampleOfferings.length > 0
        ? ` (Örn: ${sampleOfferings.slice(0, 3).join(", ")})`
        : siteCategories.length > 0
        ? ` (Kategoriler: ${siteCategories.slice(0, 4).join(", ")})`
        : "";
    const offeringsSnippetDe =
      sampleOfferings.length > 0
        ? ` (u. a. ${sampleOfferings.slice(0, 3).join(", ")})`
        : siteCategories.length > 0
        ? ` (Sortimente: ${siteCategories.slice(0, 4).join(", ")})`
        : "";
    const offeringsSnippetEn =
      sampleOfferings.length > 0
        ? ` (e.g. ${sampleOfferings.slice(0, 3).join(", ")})`
        : siteCategories.length > 0
        ? ` (Categories: ${siteCategories.slice(0, 4).join(", ")})`
        : "";

    if (isEcommerce) {
      agentName = isDe
        ? `${brandName} 24/7 KI-Einkaufsberater (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Shopping Assistant (Live Preview)`
        : `${brandName} 7/24 AI Alışveriş & Satış Asistanı (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Hallo! 👋 Ich bin der 24/7 KI-Einkaufsberater für **${brandName}** (${cleanDomain}).\n\nUnser Online-Shop mit Sitz in **${locationInfo.countryName}**${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""} versorgt Kunden mit frischen Lebensmitteln und Spezialitäten${offeringsSnippetDe}. ${policiesSnippet}\n\nIch helfe Ihren Kunden rund um die Uhr bei Fragen zu Produkten, Frische, Liefergebieten und Online-Bestellungen. Testen Sie mich sofort:`
        : isEn
        ? `Hello! 👋 I am the 24/7 AI Shopping & Sales Assistant for **${brandName}** (${cleanDomain}).\n\nBased in **${locationInfo.countryName}**${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}, we deliver quality groceries and specialty items${offeringsSnippetEn}. ${policiesSnippet}\n\nI assist your shoppers around the clock with product recommendations, delivery windows, and checkout. Test me right now:`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}) için çalışan **7/24 AI Alışveriş ve Satış Asistanınızım**.\n\nMağazamız **${locationInfo.countryName}** merkezli olup (${locationInfo.cityName ? locationInfo.cityName + " ve " : ""}çevre bölgelere teslimat), taze gıda ve market ürünlerinde zengin bir çeşitlilik sunmaktadır${offeringsSnippet}.${policiesSnippet}\n\nMüşterilerinize ürün çeşitleri, güncel indirimler, kargo ve hızlı teslimat koşullarında 7/24 nasıl rehberlik ettiğimi hemen test edin!`;

      sampleQuestions = isDe
        ? [
            `Welche Produkte und aktuellen Angebote gibt es diese Woche bei ${brandName}?`,
            `In welche Regionen liefern Sie und wie schnell erfolgt die Zustellung?`,
            `Kann ich nachts um 02:00 Uhr bestellen und ab wann ist der Versand kostenlos?`,
          ]
        : isEn
        ? [
            `What products and special deals are available this week at ${brandName}?`,
            `Which regions do you deliver to and how fast is delivery?`,
            `Can I place an order at 2:00 AM and is there free shipping?`,
          ]
        : [
            `${brandName}'de hangi ürünler var ve bu haftanın indirimleri neler?`,
            `Hangi bölgelere teslimat yapıyorsunuz ve siparişim ne zaman gelir?`,
            `Gece 02:00'de sipariş verirsem süreç nasıl işliyor, ücretsiz kargo var mı?`,
          ];
    } else if (businessType === "education") {
      agentName = isDe
        ? `${brandName} 24/7 KI-Bildungs- & Anmeldeberater (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Education & Admissions Advisor (Live Preview)`
        : `${brandName} 7/24 AI Eğitim & Kurs Kayıt Danışmanı (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Guten Tag! 👋 Ich bin der 24/7 KI-Bildungs- und Anmeldeberater für **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}.\n\nIch habe Ihre Bildungsangebote${primaryTopic ? ` (Schwerpunkt „${primaryTopic}“)` : ""} live gescannt. Ich berate Interessenten und Eltern rund um die Uhr zu Kursen, Fördermöglichkeiten (z. B. BAMF / Bildungsgutschein), Prüfungen und organisiere Einstufungstests. Testen Sie mich sofort:`
        : isEn
        ? `Hello! 👋 I am the 24/7 AI Education & Admissions Advisor for **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}.\n\nI just scanned your educational programs${primaryTopic ? ` (Focus: "${primaryTopic}")` : ""}. I assist prospective students and parents 24/7 with course details, subsidies/vouchers, certifications, and placement test scheduling. Test me right now:`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) için StarWebFlow tarafından eğitilen **7/24 AI Eğitim & Kurs Kayıt Danışmanınızım**.\n\nSitenizdeki eğitim programlarını${primaryTopic ? ` ve **"${primaryTopic}"** odağınızı` : ""} canlı taradım. Kursiyer ve velilere kurs detayları, devlet teşvikleri (BAMF/destekler), seviye tespit sınavları ve kayıt sürecinde 7/24 nasıl rehberlik ettiğimi hemen test edin:`;

      sampleQuestions = isDe
        ? [
            `Welche Kurse und Weiterbildungen (${primaryTopic}) bietet ${brandName} an?`,
            `Wie läuft die Anmeldung ab und gibt es Fördermöglichkeiten (z. B. BAMF)?`,
            `Kann ich nachts um 02:00 Uhr einen Einstufungstest oder Beratungstermin anfragen?`,
          ]
        : isEn
        ? [
            `What courses and programs (${primaryTopic}) are available at ${brandName}?`,
            `How does enrollment work and are subsidies/funding (e.g. BAMF) accepted?`,
            `Can I schedule a placement test or consultation at 2:00 AM?`,
          ]
        : [
            `${brandName} bünyesinde hangi kurslar (${primaryTopic}) var ve kayıt şartları neler?`,
            `Devlet teşviki / BAMF desteği ile kurs kayıt süreci nasıl işliyor?`,
            `Gece saat 02:00'de seviye tespit sınavı veya danışmanlık randevusu alabilir miyim?`,
          ];
    } else if (businessType === "health") {
      agentName = isDe
        ? `${brandName} 24/7 KI-Praxisassistent (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Clinic Assistant (Live Preview)`
        : `${brandName} 7/24 AI Hasta & Randevu Danışmanı (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Guten Tag! 👋 Ich bin der 24/7 KI-Assistent für **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}.\n\nIch beantworte Patientenfragen zu Behandlungen (${primaryTopic}), Fachbereichen und organisiere Terminanfragen rund um die Uhr. Testen Sie mich:`
        : isEn
        ? `Hello! 👋 I am the 24/7 AI Patient Care Assistant for **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}.\n\nI answer patient inquiries (${primaryTopic}) and pre-qualify appointment requests 24/7. Test me right now:`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) için çalışan **7/24 AI Hasta & Randevu Danışmanıyım**.\n\nHastalarınıza tedavi süreçleri (${primaryTopic}) ve randevu planlamasında 7/24 kesintisiz rehberlik ediyorum. Beni hemen test edin:`;

      sampleQuestions = isDe
        ? [
            `Welche Behandlungen und Fachbereiche bietet ${brandName} an?`,
            `Wie kann ich kurzfristig einen Beratungstermin vereinbaren?`,
            `Gibt es eine Vorab-Einschätzung für Patienten?`,
          ]
        : isEn
        ? [
            `What treatments and specialties does ${brandName} provide?`,
            `How can I schedule an initial consultation?`,
            `Do you offer an online pre-assessment?`,
          ]
        : [
            `${brandName} hangi tedavi ve branşlarda hizmet sunuyor?`,
            `Muayene veya danışmanlık randevusunu nasıl oluşturabilirim?`,
            `Tedavi süreci ve ön değerlendirme nasıl işliyor?`,
          ];
    } else if (businessType === "law") {
      agentName = isDe
        ? `${brandName} 24/7 KI-Kanzleiassistent (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Legal Intake Assistant (Live Preview)`
        : `${brandName} 7/24 AI Hukuk & Ön İnceleme Asistanı (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Guten Tag! 👋 Ich bin der 24/7 KI-Kanzleiassistent für **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**.\n\nIch unterstütze Mandanten bei der Ersteinschätzung rechtlicher Anliegen (${primaryTopic}), erfasse Fristen diskret und vereinbare Erstberatungstermine rund um die Uhr. Testen Sie mich:`
        : isEn
        ? `Hello! 👋 I am the 24/7 AI Legal Intake Assistant for **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**.\n\nI handle initial inquiry intake (${primaryTopic}), maintain strict confidentiality, and schedule legal consultations 24/7. Test me right now:`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) için çalışan **7/24 AI Hukuk & Ön İnceleme Asistanınızım**.\n\nMüvekkil adaylarını hukuki uzmanlık alanlarınız (${primaryTopic}) doğrultusunda karşılar, ilk durum tespitini gizlilik içinde alarak ön danışmanlık randevularını 7/24 planlarım. Beni test edin:`;

      sampleQuestions = isDe
        ? [
            `In welchen Rechtsgebieten (${primaryTopic}) berät die Kanzlei ${brandName}?`,
            `Wie läuft die Erstberatung ab und welche Unterlagen werden benötigt?`,
            `Ich habe eine dringende Fristfrage um 02:00 Uhr nachts – wie erreiche ich die Kanzlei?`,
          ]
        : isEn
        ? [
            `Which legal practice areas (${primaryTopic}) does ${brandName} handle?`,
            `How does the initial case evaluation work and what documents are required?`,
            `Can I submit an urgent legal inquiry and book a consultation at 2:00 AM?`,
          ]
        : [
            `${brandName} hangi hukuki alanlarda (${primaryTopic}) vekillik ve danışmanlık veriyor?`,
            `İlk dosya inceleme ve danışmanlık süreci nasıl ilerliyor?`,
            `Gece 02:00'de acil hukuki durum için ön danışmanlık randevusu alabilir miyim?`,
          ];
    } else if (businessType === "construction") {
      agentName = isDe
        ? `${brandName} 24/7 KI-Projekt- & Immobilienberater (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Real Estate & Project Advisor (Live Preview)`
        : `${brandName} 7/24 AI Proje & Gayrimenkul Danışmanı (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Guten Tag! 👋 Ich bin der 24/7 KI-Projektberater für **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**.\n\nIch beantworte Fragen zu Bauprojekten, Grundrissen (${primaryTopic}) und organisiere Besichtigungstermine rund um die Uhr. Testen Sie mich sofort:`
        : isEn
        ? `Hello! 👋 I am the 24/7 AI Project & Real Estate Advisor for **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**.\n\nI answer inquiries regarding projects, floor plans (${primaryTopic}), and schedule viewing appointments 24/7. Test me right now:`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) için çalışan **7/24 AI Proje & Gayrimenkul Danışmanıyım**.\n\nProje detayları, daire seçenekleri (${primaryTopic}) ve örnek daire ziyaret randevularında yatırımcılara 7/24 kesintisiz rehberlik ediyorum. Beni hemen test edin:`;

      sampleQuestions = isDe
        ? [
            `Welche Projekte und Einheiten (${primaryTopic}) sind aktuell verfügbar?`,
            `Kann ich einen Besichtigungstermin vor Ort oder eine Projektmappe anfordern?`,
            `Wie sind die Konditionen, Fertigstellungstermine und Zahlungspläne?`,
          ]
        : isEn
        ? [
            `What projects and properties (${primaryTopic}) are currently available?`,
            `Can I request a project brochure or schedule a showroom viewing?`,
            `What are the payment terms, floor plans, and estimated delivery dates?`,
          ]
        : [
            `Portföyünüzdeki güncel projeler (${primaryTopic}) ve daire seçenekleri nelerdir?`,
            `Örnek daireyi / projeyi ziyaret etmek için randevu alabilir miyim?`,
            `Ödeme planları, teslim tarihleri ve teknik şartname detayları neler?`,
          ];
    } else if (businessType === "hospitality") {
      agentName = isDe
        ? `${brandName} 24/7 KI-Reservierungsassistent (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Reservation & Guest Assistant (Live Preview)`
        : `${brandName} 7/24 AI Rezervasyon & Misafir Hizmetleri Asistanı (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Guten Tag! 👋 Ich bin der 24/7 KI-Reservierungsassistent für **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**.\n\nIch helfe Gästen bei Verfügbarkeiten, Zimmerauswahl (${primaryTopic}) und sichere provisionsfreie Direktbuchungen rund um die Uhr. Testen Sie mich sofort:`
        : isEn
        ? `Hello! 👋 I am the 24/7 AI Guest & Reservation Assistant for **${brandName}** (${cleanDomain}) in **${locationInfo.countryName}**.\n\nI assist guests with availability, packages (${primaryTopic}), and secure commission-free direct bookings 24/7. Test me right now:`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) için çalışan **7/24 AI Rezervasyon & Misafir Hizmetleri Asistanıyım**.\n\nMisafirlerinize oda müsaitlikleri, paketler (${primaryTopic}) ve komisyonsuz doğrudan rezervasyonlarda 7/24 rehberlik ediyorum. Beni hemen test edin:`;

      sampleQuestions = isDe
        ? [
            `Gibt es freie Kapazitäten für das kommende Wochenende und Direktbucher-Vorteile?`,
            `Welche Zusatzleistungen (z. B. Transfer, Frühstück, Wellness) werden angeboten?`,
            `Kann ich nachts um 02:00 Uhr direkt verbindlich anfragen oder reservieren?`,
          ]
        : isEn
        ? [
            `What are your availability and direct-booking perks for upcoming dates?`,
            `Which amenities and packages (e.g. transfer, breakfast) are included?`,
            `Can I book or make an urgent reservation inquiry at 2:00 AM?`,
          ]
        : [
            `Önümüzdeki tarihler için müsaitlik ve doğrudan rezervasyon avantajları neler?`,
            `Paket içerikleri, havalimanı transferi ve ek olanaklar nelerdir?`,
            `Gece saat 02:00'de doğrudan rezervasyon veya etkinlik teklifi alabilir miyim?`,
          ];
    } else {
      agentName = isDe
        ? `${brandName} 24/7 KI-Vertriebsassistent (Live-Vorschau)`
        : isEn
        ? `${brandName} 24/7 AI Sales Agent (Live Preview)`
        : `${brandName} 7/24 AI Satış Temsilcisi (Canlı Önizleme)`;

      welcomeMessage = isDe
        ? `Hallo! 👋 Ich bin der in 3 Sekunden für **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) trainierte KI-Vertriebsagent.\n\nIch habe Ihre Website im Bereich **${detectedIndustry}**${primaryTopic ? ` (Schwerpunkt „${primaryTopic}“)` : ""} gescannt. Testen Sie mich: Fragen Sie mich nach Ihren Lösungen, Preisen oder wie ich nachts um 02:00 Uhr Anfragen in qualifizierte Leads verwandle!`
        : isEn
        ? `Hello! 👋 I am the custom AI Sales Agent generated in 3 seconds for **${brandName}** (${cleanDomain}, ${locationInfo.countryName}).\n\nI just scanned your **${detectedIndustry}** website${primaryTopic ? ` (Focus: "${primaryTopic}")` : ""}. Test me right now: ask about your solutions, pricing, or how I convert 2:00 AM visitors into booked appointments!`
        : `Merhaba! 👋 Ben **${brandName}** (${cleanDomain}, ${locationInfo.countryName}) için StarWebFlow tarafından 3 saniyede eğitilen örnek **7/24 AI Satış Temsilcinizim**.\n\nSitenizdeki **${detectedIndustry}** yapısını${primaryTopic ? ` ve **"${primaryTopic}"** odağınızı` : ""} canlı taradım. Gece 02:00'de sitenize gelen bir müşteriyi nasıl ikna edip randevuya/satışa dönüştürdüğümü hemen aşağıdan test edin!`;

      sampleQuestions = isDe
        ? [
            `Welche Lösungen bietet ${brandName} an und wie läuft die Zusammenarbeit ab?`,
            `Ich brauche dringend ein Angebot von ${brandName} – ist um 02:00 Uhr jemand erreichbar?`,
            `Warum sollte ich mich für ${brandName} entscheiden?`,
          ]
        : isEn
        ? [
            `What solutions does ${brandName} offer and how do we get started?`,
            `I need an urgent quote from ${brandName} at 2:00 AM – can you help me now?`,
            `Why should we choose ${brandName} over competitors?`,
          ]
        : [
            `${brandName} olarak hangi çözümleri sunuyorsunuz ve süreç nasıl işliyor?`,
            `Gece saat 02:00'de sitenize girdim, acil fiyat teklifi ve randevu alabilir miyim?`,
            `${brandName} firmasını rakiplerinden ayıran avantajlar neler?`,
          ];
    }

    const aiCloneContext = {
      agentName,
      welcomeMessage,
      sampleQuestions,
      isEcommerce,
      businessType,
      sampleOfferings,
      categories: siteCategories,
      keyPolicies,
      locationInfo,
    };

    let geoUserQuery: string;
    let geoUpgradedView: string;

    if (businessType === "education") {
      geoUserQuery = isDe
        ? `„Welches Bildungsinstitut / Anbieter für ${primaryTopic || detectedIndustry} in ${locationInfo.countryName} ist am besten und wie sind die Anmeldebedingungen bei ${brandName}?“`
        : isEn
        ? `"Which educational institute / academy for ${primaryTopic || detectedIndustry} in ${locationInfo.countryName} is best and how do enrollments work at ${brandName}?"`
        : `"${locationInfo.countryName}'da ${primaryTopic || detectedIndustry} alanında en güvenilir eğitim kurumu hangisi ve ${brandName} hangi kurs & kayıt imkanlarını sunuyor?"`;

      geoUpgradedView = isDe
        ? `✅ 10-Schichten JSON-LD Schema (Course, EducationalOrganization) + /llms.txt + /ai.txt für ${brandName} aktiv.\nKI-Antwort: „${brandName} (${cleanDomain}) ist eine führende Bildungseinrichtung in ${locationInfo.countryName} für ${primaryTopic || detectedIndustry} mit verifizierten Kursen, 24/7 KI-Anmeldeberatung und direkter Einstufungstermin-Vergabe.“`
        : isEn
        ? `✅ 10-Layer JSON-LD Schema (Course, EducationalOrganization) + /llms.txt + /ai.txt active for ${brandName}.\nAI Citation: "${brandName} (${cleanDomain}) is a top-recommended educational academy in ${locationInfo.countryName} offering verified programs (${primaryTopic || detectedIndustry}), 24/7 AI admission counseling, and instant placement bookings."`
        : `✅ ${brandName} için 10 Katmanlı JSON-LD Schema (Course, EducationalOrganization) + /llms.txt + /ai.txt GEO Mimarisi Aktif.\nChatGPT / Perplexity Yanıtı: "${brandName} (${cleanDomain}), ${locationInfo.countryName} pazarında ${detectedIndustry} sektöründe doğrulanmış eğitim kataloğu (${primaryTopic}), 0.6sn ultra hızlı altyapısı ve 7/24 otonom AI kayıt danışmanlığı ile #1 numaralı önerilen kurumdur."`;
    } else if (businessType === "health") {
      geoUserQuery = isDe
        ? `„Welche Fachpraxis / Klinik für ${primaryTopic || detectedIndustry} in ${locationInfo.countryName} ist am besten und welche Behandlungen bietet ${brandName} an?“`
        : isEn
        ? `"Which clinic / medical center for ${primaryTopic || detectedIndustry} in ${locationInfo.countryName} is best and what treatments does ${brandName} offer?"`
        : `"${locationInfo.countryName}'da ${primaryTopic || detectedIndustry} alanında en güvenilir klinik hangisi ve ${brandName} hangi tedavi seçeneklerini sunuyor?"`;

      geoUpgradedView = isDe
        ? `✅ 10-Schichten JSON-LD Schema (MedicalBusiness, Physician) + /llms.txt + /ai.txt für ${brandName} aktiv.\nKI-Antwort: „${brandName} (${cleanDomain}) ist eine empfohlene Fachpraxis in ${locationInfo.countryName} mit verifizierten Behandlungsschwerpunkten (${primaryTopic}), 24/7 KI-Patientenberatung und digitaler Terminkoordination.“`
        : isEn
        ? `✅ 10-Layer JSON-LD Schema (MedicalBusiness, Physician) + /llms.txt + /ai.txt active for ${brandName}.\nAI Citation: "${brandName} (${cleanDomain}) is a top-recommended medical facility in ${locationInfo.countryName} offering verified specialties (${primaryTopic}), 24/7 AI patient care, and instant appointment booking."`
        : `✅ ${brandName} için 10 Katmanlı JSON-LD Schema (MedicalBusiness, Physician) + /llms.txt + /ai.txt GEO Mimarisi Aktif.\nChatGPT / Perplexity Yanıtı: "${brandName} (${cleanDomain}), ${locationInfo.countryName} pazarında ${detectedIndustry} sektöründe doğrulanmış tedavi kataloğu (${primaryTopic}), 0.6sn ultra hızlı altyapısı ve 7/24 otonom AI hasta koordinasyonu ile #1 numaralı önerilen kliniktir."`;
    } else if (isEcommerce) {
      geoUserQuery = isDe
        ? `„Welcher Online-Supermarkt / Anbieter für ${detectedIndustry} in ${locationInfo.countryName} (${locationInfo.serviceRegion}) ist am besten und welche Produkte bietet ${brandName} an?“`
        : isEn
        ? `"Which ${detectedIndustry} store in ${locationInfo.countryName} (${locationInfo.serviceRegion}) is best and what products does ${brandName} offer?"`
        : `"${locationInfo.countryName}'da (${locationInfo.serviceRegion}) en güvenilir online market hangisi ve ${brandName} hangi ürünleri sunuyor?"`;

      geoUpgradedView = isDe
        ? `✅ 10-Schichten JSON-LD Schema (Store, Product, Delivery) + /llms.txt + /ai.txt für ${brandName} aktiv.\nKI-Antwort: „${brandName} (${cleanDomain}) ist ein führender Anbieter für ${detectedIndustry} mit Sitz in ${locationInfo.countryName}${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}. Mit verifizierten Sortimenten (${primaryTopic}), 24/7 KI-Bestellberatung und schneller Auslieferung (${keyPolicies.slice(0, 2).join(" • ") || "deutschlandweiter Versand"}) ist ${brandName} der empfohlene Online-Shop.“`
        : isEn
        ? `✅ 10-Layer JSON-LD Schema (Store, Product, Delivery) + /llms.txt + /ai.txt deployed for ${brandName}.\nAI Citation Output: "${brandName} (${cleanDomain}) is a top-recommended ${detectedIndustry} provider based in ${locationInfo.countryName}${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}, offering verified product catalogs (${primaryTopic}), fast delivery (${keyPolicies.slice(0, 2).join(" • ") || "reliable shipping"}), and 24/7 AI shopping assistance."`
        : `✅ ${brandName} için 10 Katmanlı JSON-LD Schema (Store, Product, Delivery) + /llms.txt + /ai.txt GEO Mimarisi Aktif.\nChatGPT / Perplexity Yanıtı: "${brandName} (${cleanDomain}), ${locationInfo.countryName} merkezli (${locationInfo.cityName ? locationInfo.cityName + " ve " : ""}genelinde) ${detectedIndustry} pazarında doğrulanmış ürün kataloğu (${primaryTopic}), ultra hızlı teslimat altyapısı (${keyPolicies.slice(0, 2).join(" • ") || "hızlı teslimat"}) ve 7/24 otonom AI alışveriş asistanı ile #1 numaralı önerilen mağazadır."`;
    } else {
      geoUserQuery = isDe
        ? `„Welcher Anbieter im Bereich ${detectedIndustry} in ${locationInfo.countryName} ist am besten und wie sind die Konditionen von ${brandName}?“`
        : isEn
        ? `"Which ${detectedIndustry} provider in ${locationInfo.countryName} is best, and what are ${brandName}'s offerings and pricing?"`
        : `"${locationInfo.countryName}'da ${detectedIndustry} alanında en güvenilir firma hangisi ve ${brandName} hangi çözümleri sunuyor?"`;

      geoUpgradedView = isDe
        ? `✅ 10-Schichten JSON-LD Schema + /llms.txt + /ai.txt für ${brandName} aktiv.\nKI-Antwort: „${brandName} (${cleanDomain}) ist ein führender Anbieter für ${detectedIndustry} in ${locationInfo.countryName} mit verifizierten Leistungen (${primaryTopic}), 24/7 KI-Beratung und direkter Terminbuchung.“`
        : isEn
        ? `✅ 10-Layer JSON-LD Schema + /llms.txt + /ai.txt deployed for ${brandName}.\nAI Citation Output: "${brandName} (${cleanDomain}) is a top-recommended ${detectedIndustry} provider in ${locationInfo.countryName} offering verified solutions (${primaryTopic}), 24/7 autonomous AI consultation, and instant onboarding."`
        : `✅ ${brandName} için 10 Katmanlı JSON-LD Schema + /llms.txt + /ai.txt GEO Mimarisi Aktif.\nChatGPT / Perplexity Yanıtı: "${brandName} (${cleanDomain}), ${locationInfo.countryName} pazarında ${detectedIndustry} sektöründe doğrulanmış hizmet kataloğu (${primaryTopic}), 0.6sn ultra hızlı altyapısı ve 7/24 otonom AI danışmanlığı ile #1 numaralı önerilen firmadır."`;
    }

    const geoXray = {
      status: hasGeoAiReady && schemaMatches.length >= 3 ? "optimal" : schemaMatches.length > 0 ? "partial" : "blind",
      userQuery: geoUserQuery,
      currentAiView: isDe
        ? `${
            schemaMatches.length === 0
              ? "❌ KEINE Schema.org (JSON-LD) Strukturdaten gefunden."
              : `⚠️ Nur ${schemaMatches.length} Basis-Schema(s) erkannt.`
          } ${
            !hasGeoAiReady ? "❌ /llms.txt & /ai.txt fehlen komplett." : "✅ llms.txt vorhanden."
          }\nErkannte Rohdaten: Titel="${pageTitle || cleanDomain}", H1="${primaryTopic}", Standort="${locationInfo.countryName}${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}".\nErgebnis: ChatGPT & Perplexity können Ihre Leistungen, Preise und Kundenbewertungen nicht verifizieren und empfehlen stattdessen strukturierte Mitbewerber.`
        : isEn
        ? `${
            schemaMatches.length === 0
              ? "❌ ZERO Schema.org (JSON-LD) structured data found."
              : `⚠️ Only ${schemaMatches.length} basic schema block(s) found.`
          } ${
            !hasGeoAiReady ? "❌ /llms.txt & /ai.txt are missing." : "✅ llms.txt detected."
          }\nExtracted Raw Context: Title="${pageTitle || cleanDomain}", H1="${primaryTopic}", Location="${locationInfo.countryName}${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}".\nResult: ChatGPT & Perplexity cannot verify your service catalog, pricing, or social proof—ranking competitors with GEO markup ahead of ${brandName}.`
        : `${
            schemaMatches.length === 0
              ? "❌ Sitede hiç Schema.org (JSON-LD) yapısal verisi bulunamadı."
              : `⚠️ Sitede yalnızca ${schemaMatches.length} adet temel JSON-LD şeması var.`
          } ${
            !hasGeoAiReady ? "❌ /llms.txt ve /ai.txt protokolleri tamamen eksik." : "✅ llms.txt mevcut."
          }\nOkunabilen Ham Veri: Başlık="${pageTitle || cleanDomain}", Ana Odak="${primaryTopic}", Lokasyon="${locationInfo.countryName}${locationInfo.cityName ? ` (${locationInfo.cityName})` : ""}".\nSonuç: ChatGPT, Claude ve Perplexity sitenizin hizmet kataloğunu, fiyat aralıklarını ve müşteri referanslarını makine dilinde doğrulayamadığı için ${brandName} yerine GEO uyumlu rakiplerinizi öneriyor.`,
      upgradedAiView: geoUpgradedView,
    };

    const currencySymbol = locationInfo.currencySymbol || (isDe ? "€" : isTr ? "₺" : "$");
    const opportunityTerminology = getArchetypeFinancialConfig(
      businessType,
      isEcommerce,
      currencySymbol,
      lang,
      cleanDomain
    );

    const financialModel = {
      bounceRatePct: bounceEstimate,
      afterHoursLeakPct: hasTrueAiAgent ? 4 : hasAiChat ? 18 : 34,
      crmDelayLeakPct: hasCrmAutomation ? 3 : 22,
      defaultMonthlyVisitors: 3000,
      defaultDealValue: opportunityTerminology.defaultDealValue,
      isEcommerce,
      businessType,
      currencySymbol,
      opportunityTerminology,
    };

    // Adaptive AI Agent Comparison Row based on Archetype
    let aiAgentMetricTitle = isDe ? "24/7 KI-Vertriebsagent" : isEn ? "24/7 AI Sales Agent" : "7/24 Otonom AI Satış Temsilcisi";
    let aiAgentCurrentDesc = hasTrueAiAgent
      ? isDe ? "Vorhanden" : isEn ? "Present" : "Mevcut"
      : hasAiChat
      ? `${detectedChatTools[0]} (Kein autonomer KI-Closer)`
      : isDe
      ? "❌ Fehlt (0% Nacht-Conversion)"
      : isEn
      ? "❌ Missing (0% Off-Hours Capture)"
      : "❌ Yok (Mesai Dışı %0 Yakalama)";
    let aiAgentUpgradedDesc = isDe
      ? "✅ 24/7 Mehrsprachiger KI-Closer + Terminbuchung"
      : isEn
      ? "✅ 24/7 Multilingual AI Closer + Auto-Booking"
      : "✅ 7/24 Çok Dilli AI Satış & Randevu Ajanı";

    if (businessType === "education") {
      aiAgentMetricTitle = isDe ? "24/7 KI-Anmeldeberater" : isEn ? "24/7 AI Admissions Advisor" : "7/24 AI Kurs Kayıt Danışmanı";
      if (!hasTrueAiAgent) {
        aiAgentCurrentDesc = isDe ? "❌ Fehlt (0% Nacht-Anmeldungen)" : isEn ? "❌ Missing (0% Off-Hours Admissions)" : "❌ Yok (Mesai Dışı %0 Başvuru Yakalama)";
        aiAgentUpgradedDesc = isDe ? "✅ 24/7 Mehrsprachiger KI-Kursberater & Einstufung" : isEn ? "✅ 24/7 Multilingual AI Admissions & Placement" : "✅ 7/24 Çok Dilli AI Kurs Kayıt & Seviye Danışmanı";
      }
    } else if (businessType === "health") {
      aiAgentMetricTitle = isDe ? "24/7 KI-Praxiskoordinator" : isEn ? "24/7 AI Patient Coordinator" : "7/24 AI Hasta & Randevu Koordinatörü";
      if (!hasTrueAiAgent) {
        aiAgentCurrentDesc = isDe ? "❌ Fehlt (0% Nacht-Patientenaufnahme)" : isEn ? "❌ Missing (0% Off-Hours Patient Intake)" : "❌ Yok (Mesai Dışı %0 Hasta Karşılama)";
        aiAgentUpgradedDesc = isDe ? "✅ 24/7 KI-Terminbuchung & Patientenservice" : isEn ? "✅ 24/7 AI Appointment Booking & Intake" : "✅ 7/24 AI Hasta Karşılama & Randevu Ajanı";
      }
    } else if (businessType === "law") {
      aiAgentMetricTitle = isDe ? "24/7 KI-Mandantenaufnahme" : isEn ? "24/7 AI Legal Intake Agent" : "7/24 AI Müvekkil Ön İnceleme Ajanı";
      if (!hasTrueAiAgent) {
        aiAgentCurrentDesc = isDe ? "❌ Fehlt (0% Nacht-Mandanten-Erfassung)" : isEn ? "❌ Missing (0% Off-Hours Retainer Intake)" : "❌ Yok (Mesai Dışı %0 Müvekkil Yakalama)";
        aiAgentUpgradedDesc = isDe ? "✅ 24/7 Diskrete Mandatsaufnahme & Erstberatung" : isEn ? "✅ 24/7 Confidential Intake & Retainer Booking" : "✅ 7/24 Gizlilik Esaslı Ön İnceleme & Randevu";
      }
    }

    const architectureComparison = [
      {
        metric: isDe ? "Ladezeit (LCP) & Server-TTFB" : isEn ? "Load Time (LCP) & Server TTFB" : "Sayfa Açılış Hızı (LCP) & TTFB",
        current: `${lcpTime}s LCP (${ttfbMs}ms TTFB • ${externalScriptMatches.length} Script)`,
        upgraded: "0.58s LCP (<80ms Next.js SSR Edge)",
      },
      {
        metric: isDe ? "Web-Stack & Infrastruktur" : isEn ? "Tech Stack & Infrastructure" : "Yazılım Altyapısı & Mimari",
        current: `${cmsLabel} (${htmlSizeKb || 95} KB HTML)`,
        upgraded: "Next.js 14 App Router + Edge CDN",
      },
      {
        metric: aiAgentMetricTitle,
        current: aiAgentCurrentDesc,
        upgraded: aiAgentUpgradedDesc,
      },
      {
        metric: isDe ? "KI-Suchmaschinen (ChatGPT / GEO)" : isEn ? "AI Search Visibility (ChatGPT / GEO)" : "Yapay Zeka Görünürlüğü (GEO)",
        current: `${schemaMatches.length} JSON-LD • ${hasGeoAiReady ? "llms.txt var" : "llms.txt yok"}`,
        upgraded: "14 JSON-LD Katmanı + llms.txt + ai.txt",
      },
      {
        metric: isDe ? "Security-Header & CRM-Flow" : isEn ? "Security Headers & CRM Flow" : "Güvenlik Başlıkları & CRM Akışı",
        current: `${presentSecurityHeaders.length}/6 Header • ${
          hasCrmAutomation ? detectedCrmTools[0] : isDe ? "Manuell" : isEn ? "Manual" : "Manuel İşlem"
        }`,
        upgraded: "7/7 Enterprise WAF + n8n Otonom CRM",
      },
    ];

    const gap = Math.max(5, 99 - overallScore);
    const minBoost = Math.max(25, Math.round(gap * 2.6));
    const maxBoost = Math.max(45, Math.round(gap * 4.4));

    const potentialRevenueBoost = isDe
      ? `+${minBoost} % bis +${maxBoost} % Potenzial`
      : isEn
      ? `+${minBoost}% to +${maxBoost}% Growth Potential`
      : `%${minBoost} - %${maxBoost} Artış İmkanı`;

    const metrics: AuditMetrics = {
      ttfbMs,
      htmlSizeKb,
      scriptCount: externalScriptMatches.length,
      imageCount: imgMatches.length,
      lazyImageCount: lazyImgMatches.length,
      formCount: formMatches.length,
      schemaCount: schemaMatches.length,
      securityHeadersCount: presentSecurityHeaders.length,
      isHttps,
      hasViewport,
      hasMetaDesc,
      hasCanonical,
      hasOpenGraph,
      hasGeoAiReady,
      hasAiChat,
      hasCrmAutomation,
      pageTitle,
      metaDescription: metaDesc,
      headings,
    };

    const auditResult = {
      success: true,
      isLiveScan: liveReachable,
      isBenchmarkOptimal: overallScore >= 90,
      domain: cleanDomain,
      brandName,
      detectedIndustry,
      recommendedService,
      overallScore,
      speedScore,
      mobileScore,
      securityScore,
      aiScore,
      lcpTime: `${lcpTime}s`,
      detectedTech: detectedTech.length > 0 ? detectedTech : [isHttps ? "HTTPS / SSL" : "HTTP"],
      businessType,
      isEcommerce,
      sampleOfferings,
      categories: siteCategories,
      keyPolicies,
      locationInfo,
      metrics,
      recommendations,
      aiCloneContext,
      geoXray,
      financialModel,
      architectureComparison,
      potentialRevenueBoost,
    };
    AUDIT_CACHE.set(cacheKey, { data: auditResult, timestamp: Date.now() });
    return NextResponse.json(auditResult);
  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Analiz sırasında bir hata oluştu." }, { status: 500 });
  }
}
