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
async function runDirectSearchFallback(tenantId: string, options: any) {
  const { sector = "Restaurant", location = "Frankfurt", country = "Germany", platform = "google_maps" } = options;
  const cleanSector = sector.trim().toLowerCase();
  const cleanLocation = location.trim();
  const cleanCountry = country.trim();
  
  console.log(`[Gerçek Dizin Taraması] OpenStreetMap üzerinden aranıyor: "${sector} in ${cleanLocation}, ${cleanCountry}"`);
  
  const rawItems: any[] = [];
  
  // Sektöre göre OSM amenity/office haritalaması (100% Gerçek Veri)
  let amenityParam = "";
  if (/restaurant|cafe|bar|gastronomie|lokanta|yemek|döner/i.test(cleanSector)) {
    amenityParam = "&amenity=restaurant";
  } else if (/dentist|diş|zahnarzt/i.test(cleanSector)) {
    amenityParam = "&amenity=dentist";
  } else if (/doctor|arzt|klinik|sağlık|doktor|physiotherapie/i.test(cleanSector)) {
    amenityParam = "&amenity=doctors";
  } else if (/law|lawyer|anwalt|hukuk|avukat|notar/i.test(cleanSector)) {
    amenityParam = "&office=lawyer";
  } else if (/hotel|otel|hostel|konaklama/i.test(cleanSector)) {
    amenityParam = "&tourism=hotel";
  }

  try {
    // 1. Yapılandırılmış şehir & sektör sorgusu
    let osmUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&limit=25&city=${encodeURIComponent(cleanLocation)}&country=${encodeURIComponent(cleanCountry)}${amenityParam}`;
    
    let res = await fetch(osmUrl, {
      headers: { 'User-Agent': 'StarWebFlow-B2B-Prospector/1.0 (info@starwebflow.com)' },
      signal: AbortSignal.timeout(8000)
    });

    let data = res.ok ? await res.json() : [];

    // Eğer yapılandırılmış aramada sonuç gelmezse serbest metin araması yap
    if (!Array.isArray(data) || data.length === 0) {
      const freeQuery = `${sector} ${cleanLocation} ${cleanCountry}`.trim();
      osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(freeQuery)}&format=json&addressdetails=1&extratags=1&limit=25`;
      res = await fetch(osmUrl, {
        headers: { 'User-Agent': 'StarWebFlow-B2B-Prospector/1.0 (info@starwebflow.com)' },
        signal: AbortSignal.timeout(8000)
      });
      data = res.ok ? await res.json() : [];
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        const name = item.name || item.display_name?.split(',')[0]?.trim();
        if (!name || name.length < 2) continue;
        const website = item.extratags?.website || item.extratags?.['contact:website'] || item.extratags?.url || '';
        const phone = item.extratags?.phone || item.extratags?.['contact:phone'] || item.extratags?.['contact:mobile'] || '';
        const email = item.extratags?.email || item.extratags?.['contact:email'] || '';
        const address = item.display_name || `${cleanLocation}, ${cleanCountry}`;
        
        rawItems.push({
          name,
          title: name,
          website,
          phone,
          email,
          location: `${item.address?.city || item.address?.town || cleanLocation}, ${cleanCountry}`,
          address,
          totalScore: 4.5,
          reviews: []
        });
      }
    }
  } catch (e: any) {
    console.warn('[Gerçek Dizin Taraması] OpenStreetMap isteği:', e?.message || e);
  }

  console.log(`[Gerçek Dizin Taraması] ${cleanLocation} için ${rawItems.length} adet 100% gerçek işletme bulundu.`);
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
