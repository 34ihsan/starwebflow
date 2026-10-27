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
    const location = searchParams.get('location');
    const after = searchParams.get('after');

    const where: any = { 
      tenantId,
      NOT: [
        { email: { contains: 'stadtverwaltung' } },
        { email: { contains: 'rathaus' } },
        { company: 'Mannheim' }
      ]
    };
    if (sector && sector.trim().length > 0) {
      where.industry = { contains: sector.trim(), mode: 'insensitive' };
    }
    if (location && location.trim().length > 0) {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }
    if (after) {
      const afterDate = new Date(after);
      if (!isNaN(afterDate.getTime())) {
        // 5 saniye tolerans ile yeni aramadan sonra oluşturulan kayıtları getir
        where.createdAt = { gte: new Date(afterDate.getTime() - 5000) };
      }
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

export async function DELETE(req: Request) {
  try {
    const tenantId = (await getStaffTenantId()) || (await getTenantIdOrLegacy());
    const body = await req.json();
    const { leadIds, clearAll, sector, location } = body;

    if (clearAll) {
      const where: any = {};
      if (tenantId && tenantId !== 'default-tenant') {
        where.OR = [{ tenantId }, { tenantId: 'default-tenant' }];
      }
      if (sector && sector.trim()) where.industry = { contains: sector.trim(), mode: 'insensitive' };
      if (location && location.trim()) where.location = { contains: location.trim(), mode: 'insensitive' };

      const res = await prisma.lead.deleteMany({ where });
      return NextResponse.json({ success: true, count: res.count, message: `${res.count} potansiyel müşteri silindi.` });
    }

    if (Array.isArray(leadIds) && leadIds.length > 0) {
      const res = await prisma.lead.deleteMany({
        where: {
          id: { in: leadIds }
        }
      });
      return NextResponse.json({ success: true, count: res.count, message: `${res.count} müşteri silindi.` });
    }

    return NextResponse.json({ success: false, error: "Silinecek müşteri belirtilmedi." }, { status: 400 });
  } catch (error: any) {
    console.error("[Prospecting API DELETE] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = (await getStaffTenantId()) || (await getTenantIdOrLegacy());
    const body = await req.json();
    const { sector, country, location, platform, targetRoles, personName, personRole } = body;

    console.log(`[Prospecting API] Received search request for tenant ${tenantId}:`, { sector, country, location, platform, targetRoles, personName, personRole });

    // Varsa eski belediye ve geçersiz çöpleri temizle
    await prisma.lead.deleteMany({
      where: {
        tenantId,
        OR: [
          { email: { contains: 'stadtverwaltung' } },
          { email: { contains: 'rathaus' } },
          { company: 'Mannheim' }
        ]
      }
    }).catch(() => {});

    // --- ÖNBELLEKLEME (CACHING) KONTROLÜ ---
    if (!body.fresh) {
      const existingLeads = await prisma.lead.findMany({
        where: {
          tenantId,
          industry: sector,
          location: location,
          country: country,
          NOT: [
            { email: { contains: 'stadtverwaltung' } },
            { email: { contains: 'rathaus' } },
            { company: location }
          ]
        },
        take: 20
      });

      const validLeads = (existingLeads || []).filter(l => l.email || l.phone || l.website);
      if (validLeads.length >= 3) {
        console.log(`[Prospecting API] Found ${validLeads.length} valid cached leads for tenant ${tenantId}, returning directly.`);
        return NextResponse.json({
          success: true,
          message: `${validLeads.length} müşteri önbellekten (ücretsiz) getirildi.`,
          results: validLeads
        });
      }
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
