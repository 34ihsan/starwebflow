import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApifyClient } from "apify-client";

/**
 * Initiates an Apify Scraper Actor
 * Connects to Apify using APIFY_API_TOKEN to fetch real data
 */
export async function runApifyScraperAction(tenantId: string, payload: any, nodeData: any) {
  const { sector = "Dentist", location = "Berlin", country = "Germany" } = nodeData;
  console.log(`[Apify Node] Starting scraping for ${sector} in ${location}, ${country}...`);
  
  const token = process.env.APIFY_API_TOKEN;
  
  // Eğer token yoksa veya değiştirilmemişse (placeholder ise) hata fırlat (Örnek veri kaldırıldı)
  if (!token || token === "apify_api_tokeniniz_buraya_gelecek") {
    console.error("[Apify Node] API Token not found or invalid.");
    throw new Error("Apify API Token not configured. Please check your settings.");
  }

  const client = new ApifyClient({ token });
  
  // Apify Google Maps Scraper Input (Bütçe Dostu Ayarlar)
  const input = {
    searchStringsArray: [`${sector} in ${location}, ${country}`],
    maxCrawledPlacesPerSearch: 100, // Limit UI'dan alınabilir, şimdilik 100
    language: "en",
    maxReviews: 5,
    reviewsSort: "newest",
    maxImages: 0,
    exportPlaceUrls: false
  };

  try {
    // Webhook URL'si var mı kontrol et (Production'da asenkron çalışmak için)
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify` : null;

    if (webhookUrl) {
      // B Yöntemi: Asenkron Webhook Sistemi
      console.log(`[Apify Node] Starting async run with webhook: ${webhookUrl}`);
      const run = await client.actor("apify/google-maps-scraper").start(input, {
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
      // Localhost veya Webhook tanımsızsa Senkron (Bekleyerek) çalış
      console.log(`[Apify Node] Webhook URL not found. Running synchronously...`);
      const run = await client.actor("apify/google-maps-scraper").call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      
      const formattedData = items.map((item: any) => ({
        name: item.title,
        website: item.website,
        phone: item.phone,
        email: item.email || null
      }));

      return { rawScrapedData: formattedData, isAsync: false };
    }
  } catch (error: any) {
    console.error("[Apify Node] Failed:", error);
    return { rawScrapedData: [], isAsync: false };
  }
}

/**
 * AI Data Cleaner
 * Cleans the data using Google Gemini Pro AI (e.g. removing GmbH, inferring missing emails).
 */
export async function aiCleanDataAction(tenantId: string, payload: any, nodeData: any) {
  const rawData = payload.rawScrapedData || [];
  console.log(`[AI Cleaner Node] Cleaning ${rawData.length} records with Gemini Pro...`);

  if (rawData.length === 0) {
    return { cleanedData: [] };
  }

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not defined");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
You are an expert data cleaner, enrichment, and business analysis AI.
I have a raw dataset scraped from the web (Google Maps) containing business leads, including their recent reviews and digital footprint information.
Your task is to clean, standardize, extract hidden details, and deeply analyze their digital presence.

For each item:
1. Clean the company name (e.g. remove legal entities like "GmbH", "LLC", "Inc.", "Ltd").
2. Create a standardized 'company' field.
3. Extract 'decisionMakerName' and 'decisionMakerTitle', 'linkedinUrl', 'instagramUrl', 'instagramFollowers' if found.
4. Extract 'googleRating' (float), 'reviewCount' (integer), 'isClaimed' (boolean), and 'hasWebsite' (boolean) from the raw data. (If website URL exists, hasWebsite is true).
5. Deep Analysis (Pain Points): Analyze the provided 'reviews' (which are the newest reviews). Find what customers are complaining about recently. Extract these into a 'painPoints' string array (e.g. ["Yavaş Teslimat", "Kaba Personel"]). If no complaints, leave empty.
6. Digital Gaps: Look at their digital footprint. Do they lack a website? Is their profile unclaimed? Do they lack social media? Add these to a 'digitalGaps' string array.
7. Custom Pitch: Based on the 'painPoints' and 'digitalGaps', write a 2-sentence highly personalized cold email hook (customPitch) in Turkish. It MUST use a psychological formulation that highlights the business impact (lost time, lost revenue, customer churn). Example: "Merhaba Hans Bey, son yorumlarınızda müşterilerin randevu alamamaktan şikayet ettiğini gördüm. Bu konu muhtemelen sizin de en çok vaktinizi alan ve potansiyel hasta kaybına sebep olan bir problem; kuracağımız X sistemiyle bunu tamamen otomatize edebiliriz."
8. Predictive Scoring (winProbability): Calculate a float value between 0.0 and 1.0 representing the likelihood of closing a deal. High digital gaps + active business = high score (e.g. 0.85). Perfect digital footprint = low score (they don't need us, e.g. 0.20).

Return a JSON array where each object has exactly these keys (use null if not found):
- name (string)
- company (string)
- email (string | null)
- phone (string | null)
- website (string | null)
- decisionMakerName (string | null)
- decisionMakerTitle (string | null)
- linkedinUrl (string | null)
- instagramUrl (string | null)
- instagramFollowers (number | null)
- googleRating (number | null)
- reviewCount (number | null)
- isClaimed (boolean | null)
- hasWebsite (boolean | null)
- painPoints (string array | [])
- digitalGaps (string array | [])
- customPitch (string | null)
- winProbability (number | null)
- score (number | null)
- source (always "Apify Scraper")

Here is the raw data:
${JSON.stringify(rawData, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let cleanedData = [];
    try {
      cleanedData = JSON.parse(responseText);
      // In case the model returns an object like { "leads": [...] }
      if (!Array.isArray(cleanedData)) {
        if (cleanedData.leads && Array.isArray(cleanedData.leads)) {
          cleanedData = cleanedData.leads;
        } else {
          cleanedData = [cleanedData];
        }
      }
    } catch (parseError) {
      console.error("Error parsing Gemini JSON response:", parseError, responseText);
      throw new Error("Invalid JSON response from AI");
    }

    return { cleanedData };

  } catch (error) {
    console.error("[AI Cleaner Node] Error with Gemini API, falling back to basic parsing:", error);
    // Fallback to basic cleaning if API fails
    const cleanedData = rawData.map((item: any) => {
      let cleanName = item.name ? item.name.replace(" GmbH", "").replace(" LLC", "") : "Unknown";
      let email = item.email;
      if (!email && item.website) {
        try {
          email = `info@${new URL(item.website).hostname.replace("www.", "")}`;
        } catch(e) { email = null; }
      }
      return {
        name: cleanName,
        company: cleanName,
        email: email,
        phone: item.phone || null,
        source: "Apify Scraper"
      };
    });
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
