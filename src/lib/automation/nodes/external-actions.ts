import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ApifyClient } from "apify-client";
import { verifyEmailLive } from "../utils/email-verifier";
import { fetchWebsiteTech } from "../utils/technographics";

/**
 * Initiates an Apify Scraper Actor dynamically based on the platform requested.
 * Connects to Apify using APIFY_API_TOKEN to fetch real data
 */
export async function runApifyScraperAction(tenantId: string, payload: any, nodeData: any) {
  const { sector = "Dentist", location = "Berlin", country = "Germany", platform = "google_maps" } = nodeData;
  console.log(`[Apify Node] Starting scraping for ${sector} in ${location}, ${country} via ${platform}...`);
  
  const token = process.env.APIFY_API_TOKEN;
  
  if (!token || token === "apify_api_tokeniniz_buraya_gelecek") {
    console.error("[Apify Node] API Token not found or invalid.");
    throw new Error("Apify API Token not configured. Please check your settings.");
  }

  const client = new ApifyClient({ token });
  
  let actorId = "apify/google-maps-scraper";
  let input: any = {};

  // Dinamik Platform Seçimi (Pro/Elite Seviye)
  switch (platform) {
    case "linkedin":
      actorId = "apify/google-search-scraper"; 
      input = { 
        queries: [`site:linkedin.com/in/ "${sector}" "${location}" "${country}" ("@gmail.com" OR "@yahoo.com" OR "@hotmail.com")`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "apollo":
      actorId = "apify/google-search-scraper";
      input = { 
        queries: [`site:apollo.io/company "${sector}" "${location}"`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "instagram":
      actorId = "apify/google-search-scraper";
      input = { 
        queries: [`site:instagram.com "${sector}" "${location}" "${country}" ("@gmail.com" OR "@yahoo.com" OR "@hotmail.com")`], 
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
        queries: [`site:crunchbase.com/organization "${sector}" "${location}"`], 
        maxPagesPerQuery: 2 
      };
      break;
    case "clutch":
      // Gelecekte eklenecek özel scraper'lar için hazır altyapı
      console.log(`[Apify Node] Platform ${platform} is in development. Falling back to generic web search.`);
      actorId = "apify/google-search-scraper";
      input = { queries: [`${sector} ${location} ${country}`], maxPagesPerQuery: 2 };
      break;
    case "google_maps":
    default:
      actorId = "apify/google-maps-scraper";
      input = {
        searchStringsArray: [`${sector} in ${location}, ${country}`],
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
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify` : null;

    if (webhookUrl) {
      console.log(`[Apify Node] Starting async run on ${actorId} with webhook: ${webhookUrl}`);
      const run = await client.actor(actorId).start(input, {
        webhooks: [
          {
            eventTypes: ["ACTOR.RUN.SUCCEEDED"],
            requestUrl: webhookUrl,
            payloadTemplate: `{"runId": {{runId}}, "datasetId": {{defaultDatasetId}}, "status": {{status}} }`
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
    console.error("[Apify Node] Failed:", error);
    return { rawScrapedData: [], isAsync: false, platform };
  }
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
 * Zero-Cost Elite Waterfall Email Enrichment via Live SMTP Verification
 */
async function enrichLeadEmail(website: string, name: string): Promise<string | null> {
  if (!website && !name) return null;
  try {
    let domain = "";
    
    // Geçerli bir şirket web sitesi varsa onu kullan
    if (website && !website.includes("linkedin.com") && !website.includes("apollo.io") && !website.includes("crunchbase.com") && !website.includes("instagram.com")) {
      domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
      domain = domain.replace(/^www\./, "");
    } 
    // Şirket web sitesi yoksa ama ismi varsa (Apollo/Crunchbase X-Ray'den geliyorsa), isminden domain tahmin et (Domain Guesser)
    else if (name) {
      // "Star Webflow" -> "starwebflow.com"
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanName.length > 2) {
        domain = `${cleanName}.com`;
      }
    }

    if (!domain) return null;
    
    const candidates = [
      `info@${domain}`,
      `contact@${domain}`,
      `hello@${domain}`,
      `iletisim@${domain}`,
      `sales@${domain}`
    ];

    for (const email of candidates) {
      const isValid = await verifyEmailLive(email);
      if (isValid) {
        console.log(`[Waterfall Verification] Found valid email via SMTP Ping: ${email}`);
        return email;
      }
    }
    
    // .com başarısız olursa ve name'den tahmin edildiyse, yerel uzantıları da deneyebiliriz ama şimdilik performansı çok yormamak için bırakıyoruz
    return null;
  } catch (e) {
    return null;
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
  const prunedData = pruneScrapedData(rawData, platform);
  console.log(`[AI Cleaner Node] Pruned ${rawData.length} records. Fetching Technographics...`);

  // ZERO-COST TECHNOGRAPHICS & INTENT:
  const enrichedPrunedData = await Promise.all(prunedData.map(async (item) => {
    if (item.website) {
      const techData = await fetchWebsiteTech(item.website);
      return {
        ...item,
        detectedTech: techData.technologies,
        detectedIntent: techData.intentSignals
      };
    }
    return item;
  }));

  console.log(`[AI Cleaner Node] Sending ${enrichedPrunedData.length} records to Gemini...`);

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not defined");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // STRUCTURED OUTPUTS (Elite Pro Level Stability)
    const responseSchema = {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          company: { type: SchemaType.STRING },
          decisionMakerName: { type: SchemaType.STRING, nullable: true },
          decisionMakerTitle: { type: SchemaType.STRING, nullable: true },
          painPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          digitalGaps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          customPitch: { type: SchemaType.STRING, nullable: true },
          winProbability: { type: SchemaType.NUMBER, nullable: true }
        },
        required: ["name", "company", "painPoints", "digitalGaps"]
      }
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      }
    });

    const prompt = `
You are an expert data cleaner, enrichment, and business analysis AI.
The dataset includes 'detectedTech' (technologies they use, e.g. Shopify, WordPress) and 'detectedIntent' (e.g. Hiring, Expanding).
For each item:
1. Clean the company name (remove GmbH, LLC, etc).
2. Extract decisionMakerName and decisionMakerTitle if inferable from description.
3. Analyze 'reviews' to find customer complaints. Extract these into 'painPoints' string array.
4. Digital Gaps: Look at the data (missing website? outdated tech? lack of booking systems?). Add to 'digitalGaps'.
5. Custom Pitch: Write a 1-sentence highly personalized cold email hook in Turkish highlighting their painPoints OR referencing their 'detectedTech' / 'detectedIntent' to show we did our research.
6. winProbability: Score (0.0 to 1.0) on how likely they need our digital agency services.

Dataset: ${JSON.stringify(enrichedPrunedData)}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let aiEnhancedData = JSON.parse(responseText);
    
    // AI Verisi ile Orijinal Pruned veriyi birleştir ve Email Enrichment ekle
    const finalCleanedData = await Promise.all(aiEnhancedData.map(async (aiItem: any, index: number) => {
      const original = enrichedPrunedData[index] || {};
      
      let finalEmail = original.email;
      if (!finalEmail) {
         finalEmail = await enrichLeadEmail(original.website, original.name);
      }

      return {
        ...aiItem,
        email: finalEmail,
        phone: original.phone || null,
        website: original.website || null,
        score: aiItem.winProbability ? Math.round(aiItem.winProbability * 100) : Math.floor(Math.random() * 30) + 70,
        source: platform
      };
    }));

    return { cleanedData: finalCleanedData };

  } catch (error) {
    console.error("[AI Cleaner Node] Error with Gemini API, falling back:", error);
    const cleanedData = prunedData.map((item: any) => ({
      name: item.name,
      company: item.name.replace(" GmbH", ""),
      email: item.email || null,
      phone: item.phone || null,
      website: item.website || null,
      source: platform
    }));
    return { cleanedData };
  }
}

/**
 * Saves the cleaned leads to the CRM database with status "NEW".
 * This allows the admin to review them before adding to an Outreach Campaign.
 */
export async function createLeadsAction(tenantId: string, payload: any, nodeData: any) {
  const cleanedData = payload.cleanedData || [];
  const { location, country, industry } = nodeData || {};
  console.log(`[CRM Node] Importing ${cleanedData.length} leads into database...`);

  let importedCount = 0;
  const createdLeads = [];

  for (const item of cleanedData) {
    // Sektörel Veri Havuzu (Master Data Pool): E-postası olmasa da kaydet!
    if (!item.name && !item.company && !item.website && !item.phone) continue; // Bomboşsa geç
    
    try {
      // Mükerrer Kontrolü (Anti-Duplicate) ve Master Data Pool Güncellemesi
      // Aramayı telefon numarasına (veya websiteye) göre yapıyoruz
      const existingLead = await prisma.lead.findFirst({
        where: {
          tenantId,
          OR: [
            item.phone ? { phone: item.phone } : undefined,
            item.website ? { website: item.website } : undefined,
            item.email ? { email: item.email } : undefined
          ].filter(Boolean) as any[]
        }
      });

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
            name: item.name,
            company: item.company,
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
