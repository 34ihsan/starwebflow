import { NextResponse } from 'next/server';
import { runApifyScraperAction, aiCleanDataAction, createLeadsAction } from '@/lib/automation/nodes/external-actions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sector, country, location, platform } = body;

    console.log("[Prospecting API] Received search request:", { sector, country, location, platform });

    // --- ÖNBELLEKLEME (CACHING) KONTROLÜ ---
    // Eğer veritabanında daha önce aynı arama yapılmış ve kaydedilmişse Apify'a gitmeyip direkt onları döndürüyoruz.
    const existingLeads = await prisma.lead.findMany({
      where: {
        tenantId: 'default-tenant',
        industry: sector,
        location: location,
        country: country,
        source: "Apify Scraper"
      },
      take: 20
    });

    if (existingLeads && existingLeads.length > 0) {
      console.log(`[Prospecting API] Found ${existingLeads.length} cached leads, returning directly.`);
      return NextResponse.json({
        success: true,
        message: `${existingLeads.length} müşteri önbellekten (ücretsiz) getirildi.`,
        results: existingLeads
      });
    }

    // 1. Apify Scraper'ı Webhook veya Senkron olarak tetikle
    const scraperResult = await runApifyScraperAction('default-tenant', {}, { sector, location, country, platform });
    
    if (scraperResult.isAsync) {
      return NextResponse.json({
        success: true,
        message: "Arama arka planda başlatıldı. Veriler geldikçe CRM'inize (Veri Havuzuna) otomatik eklenecektir.",
        results: []
      });
    }

    // Eğer senkron çalıştıysa (Localhost veya küçük veri) hemen AI ve CRM işlemlerini yap
    const cleanerResult = await aiCleanDataAction('default-tenant', { rawScrapedData: scraperResult.rawScrapedData }, {});
    
    const leadsWithScores = cleanerResult.cleanedData.map((lead: any) => ({
      ...lead,
      score: Math.floor(Math.random() * 30) + 70
    }));

    const createResult = await createLeadsAction('default-tenant', { cleanedData: leadsWithScores }, { location, country, industry: sector });

    return NextResponse.json({
      success: true,
      message: `${createResult.importedCount} potansiyel müşteri bulundu ve CRM'e aktarıldı.`,
      results: createResult.createdLeads
    });

  } catch (error: any) {
    console.error("[Prospecting API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
