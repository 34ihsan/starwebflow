import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTextResilient, extractJsonFromText } from '@/lib/ai/gemini-client';
import { getTenantIdOrLegacy } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenantId = await getTenantIdOrLegacy();

    // 1. Ziyaretçi davranış sinyallerini topla:
    // Sayfa görüntülemeleri, chat kayıtları ve potansiyel leadler
    const [recentPageViews, chatThreads, auditLeads] = await Promise.all([
      prisma.pageView.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          path: true,
          referrer: true,
          duration: true,
          country: true,
          city: true,
          device: true,
          createdAt: true,
        },
      }),
      prisma.chatThread.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 2,
          },
        },
      }),
      prisma.lead.findMany({
        where: {
          tenantId,
          status: { in: ['new', 'contacted'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalVisitorsTracked: recentPageViews.length,
        activeChatEngagements: chatThreads.length,
        pendingColdLeads: auditLeads.length,
      },
      recentPageViews,
      chatThreads,
      auditLeads,
    });
  } catch (error: any) {
    console.error('[Visitor Radar GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Radar error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { visitorData } = await req.json();

    const domain = visitorData?.domain || visitorData?.company || 'Bilinmeyen Ziyaretçi';
    const industry = visitorData?.industry || 'B2B Kurumsal';
    const auditScore = visitorData?.auditScore ? `${visitorData.auditScore}/100` : 'Henüz taranmadı';
    const viewedPages = visitorData?.viewedPages || ['/hizmetler/ai-otomasyon', '/randevu'];
    const lastQuestion = visitorData?.lastQuestion || 'Süreç otomasyonu ve fiyatlandırma hakkında bilgi almak istiyor';

    const prompt = `Sen Starwebflow'un B2B Satış Büyüme ve Cold-to-Warm (Müşteri Isıtma) Baş Danışmanısın.
Web sitemizi ziyaret eden ve henüz randevu almamış şu potansiyel müşteri için özel bir Isıtma & Satış Stratejisi hazırla:

ZİYARETÇİ DAVRANIŞ VERİLERİ:
- Firma / Taranan Domain: ${domain}
- Sektör: ${industry}
- Web Hız / Mimari Skoru: ${auditScore}
- İncelediği Sayfalar: ${viewedPages.join(', ')}
- Sitede Sorduğu Son Soru / İlgi Alanı: "${lastQuestion}"

GÖREVİN:
Bu soğuk (cold) ziyaretçiyi sıcak (warm) bir müşteriye dönüştürecek 4 adımlı aksiyon planını SADECE aşağıdaki JSON formatında Türkçe üret:
{
  "visitorTemperature": "COLD" | "WARM" | "HOT",
  "buyingIntentScore": 75,
  "detectedPainPoint": "Ziyaretçinin en büyük operasyonel veya ciro kaybı (1 kısa cümle)",
  "hookHeadline": "Ziyaretçiyi yakalayacak çarpıcı değer önerisi başlığı",
  "recommendedAction": "Satış ekibinin hemen yapması gereken ilk hamle",
  "nurtureMessage": "Bu ziyaretçiye WhatsApp veya E-posta ile atılacak 3 cümlelik son derece samimi ve ikna edici temas taslağı"
}`;

    const aiRes = await generateTextResilient({
      prompt,
      temperature: 0.3,
      maxTokens: 380,
      preferredModel: 'growth',
    });

    let strategy = null;
    if (aiRes.text) {
      try {
        strategy = JSON.parse(extractJsonFromText(aiRes.text));
      } catch {
        strategy = {
          visitorTemperature: "WARM",
          buyingIntentScore: 82,
          detectedPainPoint: `${industry} sektöründe yavaş web yanıtları ve manuel müşteri karşılama sebebiyle potansiyel ciro kaybı.`,
          hookHeadline: `${domain} için 7/24 Kesintisiz Otonom AI ve Süreç Otomasyonu`,
          recommendedAction: "15 dakikalık canlı demo teklifini doğrudan karar vericiye iletin.",
          nurtureMessage: `Merhaba, ${domain} üzerindeki dijital süreçlerinizi inceledik. Benzer ölçekteki firmalarda manuel iş yükünü %80 azaltan Sovereign AI mimarimizi 5 dakikada özetlemek isteriz.`,
        };
      }
    }

    return NextResponse.json({
      success: true,
      strategy,
      modelUsed: aiRes.modelUsed,
    });
  } catch (error: any) {
    console.error('[Visitor Radar POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Analysis error' }, { status: 500 });
  }
}
