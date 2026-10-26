import { NextResponse } from 'next/server';
import { runApifyScraperAction, aiCleanDataAction, createLeadsAction } from '@/lib/automation/nodes/external-actions';
import { prisma } from '@/lib/prisma';
import { getStaffTenantId, getTenantIdOrLegacy } from '@/lib/tenant';

export async function GET(req: Request) {
  try {
    const tenantId = (await getStaffTenantId()) || (await getTenantIdOrLegacy());
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const sector = searchParams.get('sector');

    const where: any = { tenantId };
    if (sector && sector.trim().length > 0) {
      where.industry = { contains: sector.trim(), mode: 'insensitive' };
    }

    const leads = await prisma.lead.findMany({
      where,
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

    // 1. Scraper'ı tetikle (Apify veya Direct Fallback)
    const scraperResult = await runApifyScraperAction(tenantId, {}, { sector, location, country, platform, targetRoles, personName, personRole });
    
    const rawData = scraperResult?.rawScrapedData || [];
    
    // 2. AI Temizleme ve CRM Kaydını Asenkron Arka Planda Başlat (HTTP bağlantısını 504'e düşürmemek için)
    if (rawData.length > 0) {
      (async () => {
        try {
          console.log(`[Prospecting Background] ${rawData.length} kayıt için AI temizleme ve CRM aktarımı başladı...`);
          const cleanerResult = await aiCleanDataAction(tenantId, { rawScrapedData: rawData, platform: platform }, {});
          const createResult = await createLeadsAction(tenantId, { cleanedData: cleanerResult.cleanedData }, { location, country, industry: sector });
          console.log(`[Prospecting Background] Tamamlandı: ${createResult.importedCount} müşteri CRM'e kaydedildi.`);
        } catch (bgErr: any) {
          console.error("[Prospecting Background Error]:", bgErr?.message || bgErr);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: "Arama ve AI analizi arka planda başlatıldı. Veriler işlendikçe otomatik listelenecektir...",
      results: []
    });

  } catch (error: any) {
    console.error("[Prospecting API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
