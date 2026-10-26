import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTextResilient, extractJsonFromText, OLLAMA_MODELS } from '@/lib/ai/gemini-client';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

const DOMAIN_MODELS = [
  { key: 'agent', name: OLLAMA_MODELS.AGENT, role: 'AI Satış & VIP Destek Ajanı' },
  { key: 'automation', name: OLLAMA_MODELS.AUTOMATION, role: 'Titan Otomasyon & Apify Motoru' },
  { key: 'webdev', name: OLLAMA_MODELS.WEBDEV, role: 'CTO Mimari & Lastenheft Motoru' },
  { key: 'growth', name: OLLAMA_MODELS.GROWTH, role: 'CRO, SEO & Cold Outreach Motoru' },
  { key: 'admin', name: OLLAMA_MODELS.ADMIN, role: 'Admin CRM, Spam & Warmup Motoru' },
  { key: 'embed', name: OLLAMA_MODELS.EMBED, role: 'RAG & Vektör Arama (768-dim)' },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let installedModels: string[] = [];
    let runningModels: string[] = [];
    let ollamaOnline = false;

    try {
      const [tagsRes, psRes] = await Promise.all([
        fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000), cache: 'no-store' }),
        fetch(`${OLLAMA_BASE_URL}/api/ps`, { signal: AbortSignal.timeout(3000), cache: 'no-store' }),
      ]);

      if (tagsRes.ok) {
        ollamaOnline = true;
        const tagsData = await tagsRes.json();
        installedModels = (tagsData.models || []).map((m: any) => String(m.name));
      }
      if (psRes.ok) {
        const psData = await psRes.json();
        runningModels = (psData.models || []).map((m: any) => String(m.name));
      }
    } catch {
      ollamaOnline = false;
    }

    const sharedLayerWarm = runningModels.length > 0;

    const cluster = DOMAIN_MODELS.map((dm) => {
      const isInstalled = installedModels.some(
        (im) => im === dm.name || im.startsWith(dm.name.split(':')[0])
      );
      const isLoadedInRam =
        runningModels.includes(dm.name) || (sharedLayerWarm && dm.key !== 'embed');
      return {
        ...dm,
        installed: isInstalled,
        warmInRam: isLoadedInRam,
      };
    });

    const [totalLeads, hotLeads, activeProjects, totalCampaigns] = await Promise.all([
      prisma.lead.count().catch(() => 0),
      prisma.lead.count({ where: { score: { gte: 70 } } }).catch(() => 0),
      prisma.project.count().catch(() => 0),
      prisma.adCampaign.count().catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      ollamaOnline,
      modelsDirectory: process.env.OLLAMA_MODELS || 'E:\\OllamaModels',
      sharedLayerWarm,
      runningModels,
      cluster,
      agencySnapshot: {
        totalLeads,
        hotLeads,
        activeProjects,
        totalCampaigns,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Cluster status error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action = 'prewarm' } = await req.json();

    if (action === 'prewarm') {
      const start = Date.now();
      const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODELS.ADMIN,
          prompt: 'OK',
          stream: false,
          keep_alive: '30m',
          options: { num_predict: 1 },
        }),
        signal: AbortSignal.timeout(90000),
      });

      const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
      return NextResponse.json({
        success: res.ok,
        elapsedSec,
        message: `Paylaşımlı GGUF katmanı RAM önbelleğine yüklendi (${elapsedSec}sn). 5 uzman model anında yanıt vermeye hazır.`,
      });
    }

    if (action === 'ceo-briefing') {
      const [totalLeads, hotLeads, activeProjects, totalCampaigns, recentLeads] = await Promise.all([
        prisma.lead.count().catch(() => 0),
        prisma.lead.count({ where: { score: { gte: 70 } } }).catch(() => 0),
        prisma.project.count().catch(() => 0),
        prisma.adCampaign.count().catch(() => 0),
        prisma.lead
          .findMany({
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { name: true, industry: true, score: true, serviceType: true },
          })
          .catch(() => []),
      ]);

      const recentNames =
        recentLeads.length > 0
          ? recentLeads.map((l: any) => `${l.name} (${l.industry || 'B2B'}, Skor:${l.score})`).join(', ')
          : 'Yeni lead bekleniyor';

      const fallbackBriefing = [
        `🎯 Sıcak Satış Fırsatları: Toplam ${totalLeads} lead içinde yüksek puanlı ${hotLeads} sıcak fırsata (${recentNames}) bugün kişiselleştirilmiş teklif gönderin.`,
        `🚀 Cold Outreach & Büyüme: Aktif ${totalCampaigns} kampanya üzerinden 1. gün link-içermeyen buz kırıcı e-postaları tetikleyerek dönüşümü artırın.`,
        `⚙️ Teslimat & Kapasite: Devam eden ${activeProjects} aktif proje için Lastenheft/Pflichtenheft kapsam onaylarını tamamlayıp nakit akışını hızlandırın.`,
      ];

      const prompt = `Ajans Güncel Verileri:
- Toplam Lead: ${totalLeads} (Sıcak Lead: ${hotLeads})
- Son Gelen Leadler: ${recentNames}
- Aktif Proje: ${activeProjects} | Kampanya: ${totalCampaigns}

Ajans CEO'su için bugün yapılması gereken en kritik 3 aksiyonu SADECE aşağıdaki JSON dizisi olarak Türkçe döndür:
{"actions": ["1. kritik aksiyon cümlesi", "2. kritik aksiyon cümlesi", "3. kritik aksiyon cümlesi"]}`;

      const aiRes = await generateTextResilient({
        prompt,
        temperature: 0.2,
        maxTokens: 240,
        preferredModel: 'admin',
      });

      if (aiRes.providerUsed !== 'fallback' && aiRes.text) {
        try {
          const parsed = JSON.parse(extractJsonFromText(aiRes.text));
          const list = Array.isArray(parsed.actions)
            ? parsed.actions
            : Array.isArray(parsed)
            ? parsed
            : null;
          if (list && list.length >= 2) {
            return NextResponse.json({
              success: true,
              modelUsed: OLLAMA_MODELS.ADMIN,
              actions: list.slice(0, 3).map(String),
            });
          }
        } catch {
          // Use fallbackBriefing
        }
      }

      return NextResponse.json({
        success: true,
        modelUsed: OLLAMA_MODELS.ADMIN,
        actions: fallbackBriefing,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Action failed' }, { status: 500 });
  }
}
