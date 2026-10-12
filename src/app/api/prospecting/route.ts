import { NextResponse } from 'next/server';
import { runApifyScraperAction, aiCleanDataAction, createLeadsAction } from '@/lib/automation/nodes/external-actions';
import { prisma } from '@/lib/prisma';
import { getStaffTenantId, getTenantIdOrLegacy } from '@/lib/tenant';

export async function GET(req: Request) {
  try {
    const tenantId = (await getStaffTenantId()) || (await getTenantIdOrLegacy());
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      results: leads
    });
  } catch (error: any) {
    console.error("[Prospecting API GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = (await getStaffTenantId()) || (await getTenantIdOrLegacy());
    const body = await req.json();
    const { sector, country, location, platform, targetRoles, personName, personRole } = body;

    console.log(`[Prospecting API] Received search request for tenant ${tenantId}:`, { sector, country, location, platform, targetRoles, personName, personRole });

    // --- ÖNBELLEKLEME (CACHING) KONTROLÜ ---
    // Eğer veritabanında daha önce aynı arama yapılmış ve kaydedilmişse Apify'a gitmeyip direkt onları döndürüyoruz.
    const existingLeads = await prisma.lead.findMany({
      where: {
        tenantId,
        industry: sector,
        location: location,
        country: country,
        source: platform
      },
      take: 20
    });

    if (existingLeads && existingLeads.length > 0) {
      console.log(`[Prospecting API] Found ${existingLeads.length} cached leads for tenant ${tenantId}, returning directly.`);
      return NextResponse.json({
        success: true,
        message: `${existingLeads.length} müşteri önbellekten (ücretsiz) getirildi.`,
        results: existingLeads
      });
    }

    // 1. Apify Scraper'ı Webhook veya Senkron olarak tetikle
    const scraperResult = await runApifyScraperAction(tenantId, {}, { sector, location, country, platform, targetRoles, personName, personRole });
    
    if (scraperResult.isAsync) {
      return NextResponse.json({
        success: true,
        message: "Arama arka planda başlatıldı. Veriler geldikçe CRM'inize (Veri Havuzuna) otomatik eklenecektir.",
        results: []
      });
    }

    // Eğer senkron çalıştıysa (Localhost veya küçük veri) hemen AI ve CRM işlemlerini yap
    const cleanerResult = await aiCleanDataAction(tenantId, { rawScrapedData: scraperResult.rawScrapedData, platform: platform }, {});
    
    // Skorlar aiCleanDataAction içinde deterministik olarak hesaplanır (rastgele skor kaldırıldı)
    const createResult = await createLeadsAction(tenantId, { cleanedData: cleanerResult.cleanedData }, { location, country, industry: sector });

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
