import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { aiCleanDataAction, createLeadsAction } from '@/lib/automation/nodes/external-actions';
import { prisma } from '@/lib/prisma';

// Helper function to split array into batches
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[Apify Webhook] Received payload:", body);

    const { runId, datasetId, status } = body;

    // Sadece başarılı tamamlanan görevleri işle
    if (status !== 'SUCCEEDED' || !datasetId) {
      return NextResponse.json({ success: true, message: 'Ignoring incomplete or failed run' });
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new Error("APIFY_API_TOKEN is not defined");
    }

    const client = new ApifyClient({ token });

    // 1. Apify'dan tüm sonuçları çek
    const { items } = await client.dataset(datasetId).listItems();
    console.log(`[Apify Webhook] Fetched ${items.length} items from dataset ${datasetId}`);

    if (items.length === 0) {
      return NextResponse.json({ success: true, message: 'No items found' });
    }

    // Basit bir pre-filter: Sadece website, phone veya title/name içerenleri tut
    const filteredItems = items.filter((item: any) => 
      item.title || item.website || item.phone || item.email
    );

    const formattedData = filteredItems.map((item: any) => ({
      name: item.title,
      website: item.website,
      phone: item.phone,
      email: item.email || null,
      linkedinUrl: item.linkedinUrl || null,
      instagramUrl: item.instagramUrl || null
    }));

    // 2. Gemini 1.5 Pro ile Batching (50'şerli parçalar)
    // Eğer sonuç sayısı 1000 ise, Gemini'ye 1000 tane birden atmak context'i aşabilir veya timeout verebilir.
    const BATCH_SIZE = 50;
    const batches = chunkArray(formattedData, BATCH_SIZE);
    
    let totalImported = 0;

    // Asenkron olarak tüm batchleri sırayla veya paralel işleyebiliriz.
    // Timeout yememesi için Vercel veya sunucu ortamında arka planda çalışmaları gerekir.
    // Next.js Route Handler'da arka plana itmek için promise'i return etmeden çalıştırabiliriz (fire and forget) 
    // ama bu bazen serverless ortamlarda kesilebilir. 
    // En garantisi, olabildiğince hızlı process etmek veya upstash/qstash gibi kuyruk kullanmaktır.
    // Şimdilik sırayla işliyoruz (Vercel Hobby'de max 10-60 saniye limitine dikkat edilmeli)
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`[Apify Webhook] Processing batch ${i + 1}/${batches.length}...`);
      
      try {
        const cleanerResult = await aiCleanDataAction('default-tenant', { rawScrapedData: batches[i] }, {});
        
        const createResult = await createLeadsAction('default-tenant', { cleanedData: cleanerResult.cleanedData }, { location: null, country: null, industry: null }); // TODO: Pass location/industry if possible (need to save in DB when starting run)
        
        totalImported += createResult.importedCount;
      } catch (err) {
        console.error(`[Apify Webhook] Error processing batch ${i + 1}:`, err);
      }
    }

    console.log(`[Apify Webhook] Finished processing all batches. Total imported/updated: ${totalImported}`);

    return NextResponse.json({ success: true, message: 'Processing finished successfully', totalImported });
  } catch (error: any) {
    console.error("[Apify Webhook] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
