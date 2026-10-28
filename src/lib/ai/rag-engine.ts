import { OllamaProvider } from './providers/ollama';
import { prisma } from '@/lib/prisma';

export interface RagDocumentChunk {
  id: string;
  title: string;
  category: 'ai_agents' | 'automation_erp' | 'edge_web' | 'b2b_saas' | 'growth_geo' | 'process_security' | 'blog';
  content: string;
  keywords: string[];
  embedding?: number[];
}

export interface RagRetrievalResult {
  chunks: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    score: number;
  }>;
  usedVectorEmbedding: boolean;
  formattedContext: string;
}

/**
 * StarWebFlow Resmi "Mühendislik & Verimlilik Mimarisi" RAG Bilgi Tabanı.
 * - Başka müşteri/şirket isimleri veya gizli veriler içermez.
 * - Doğrulanmamış telefon/adres veya bağlayıcı sabit fiyat içermez.
 * - Birebir sitedeki 5 ana mühendislik çözümünü ve mimari standartları temel alır.
 */
const CORE_KNOWLEDGE_CHUNKS: RagDocumentChunk[] = [
  {
    id: 'kb-model-agnostic-ai-agents',
    title: 'Model-Agnostik Hibrit AI & Sesli Ajanlar (/hizmetler/ai-agents)',
    category: 'ai_agents',
    keywords: [
      'ai', 'ajan', 'agent', 'sesli', 'telefon', 'santral', 'whatsapp', 'chat',
      'on-premise', 'yerel', 'claude', 'llama', 'deepseek', 'gpt', 'rag', 'randevu',
      'model-agnostik', 'vendor lock-in', 'voice',
    ],
    content: `Model-Agnostik Hibrit AI & Sesli Ajanlar (Sayfa: /hizmetler/ai-agents):
- Tek bir modele mahkum olmadan (Claude, Llama, DeepSeek, GPT — Sıfır Vendor Lock-in); bulutta veya kurum içi yerel sunucunuzda (On-Premise) çalışan otonom sesli ve yazılı temsilciler kuruyoruz.
- Kanallar: Sesli AI Santral (Telefon), Live Chat & WhatsApp, Gelen E-posta & Webhook.
- 7/24 Kesintisiz Çalışma: Gece 03:00'te bile müşterilere ~1.1 saniyede yanıt verir, kapasite/ihtiyaç analizi yapar, bilgi sunar ve onaylı randevuyu takvime/CRM'e işler.
- Avantajlar: Model-Agnostik Hibrit Zeka (RAG v4.2), Kurum İçi / On-Premise Seçeneği (KVKK, GDPR & Tam Veri Egemenliği) ve %60+ Operasyonel Tasarruf.`,
  },
  {
    id: 'kb-n8n-erp-mesh',
    title: 'Kognitif İş Akışı & ERP Entegrasyonu — n8n & API (/hizmetler/ai-otomasyon)',
    category: 'automation_erp',
    keywords: [
      'n8n', 'erp', 'crm', 'otomasyon', 'automation', 'webhook', 'api', 'fatura',
      'muhasebe', 'senkronizasyon', 'iş akışı', 'workflow', 'mesh', 'kognitif',
    ],
    content: `Kognitif İş Akışı & ERP Entegrasyonu — n8n & API (Sayfa: /hizmetler/ai-otomasyon):
- n8n, Webhook ve REST API ile kurumsal ERP, CRM ve muhasebe sistemlerinizi birbiriyle konuşturan otonom iş akışları (n8n Kognitif Mesh) kuruyoruz.
- Lead/Form verilerini kognitif olarak ayrıştırır, ERP/CRM sistemine işler ve otomatik fatura/belge süreçlerini tetikler (~140ms gecikme, sıfır insan hatası).
- Fatura kesme, lead kaydetme ve manuel veri senkronizasyonu angaryalarını sıfırlayarak ekibinize haftalık 15+ saat işgücü kazandırır.`,
  },
  {
    id: 'kb-sub-second-edge-web',
    title: 'Sub-Second Modern Edge Web & Headless Mimari (/hizmetler/web-gelistirme)',
    category: 'edge_web',
    keywords: [
      'web', 'site', 'nextjs', 'edge', 'headless', 'hız', 'lcp', 'ttfb',
      'lighthouse', 'dönüşüm', 'conversion', 'ux', 'ssr', 'tasarım',
    ],
    content: `Sub-Second Modern Edge Web & Headless Mimari (Sayfa: /hizmetler/web-gelistirme):
- Next.js 14/15, SSR Edge Cache, Global Edge CDN ve headless mimariyle ~0.38 saniye TTFB / ~0.4 saniye yüklenme hızında açılan ışık hızında dijital vitrinler inşa ediyoruz.
- Google Lighthouse 99-100/100 performans, SEO, erişilebilirlik ve en iyi uygulama standartlarını hedefler.
- Ziyaretçilerin sayfa yüklenmeden çıkmasını önler ve Conversion UX mimarisiyle reklamdan gelen trafiği 3.6 kat (3.6x) daha fazla satış dönüşümüne çevirir.`,
  },
  {
    id: 'kb-b2b-portal-saas',
    title: 'Özel B2B Müşteri Portalları & Cloud-Native SaaS (/hizmetler/web-uygulamasi)',
    category: 'b2b_saas',
    keywords: [
      'b2b', 'portal', 'saas', 'bayi', 'müşteri paneli', 'sipariş', 'postgresql',
      'docker', 'cloud', 'excel', 'uygulama', 'yazılım', 'dashboard',
    ],
    content: `Özel B2B Müşteri Portalları & Cloud-Native SaaS (Sayfa: /hizmetler/web-uygulamasi):
- PostgreSQL (~3.2ms düşük gecikme) ve izole Docker VPS tabanlı, %99.9 Uptime sunan, sınırsız ölçeklenebilir özel bulut yazılım altyapısı kuruyoruz.
- Müşterilerinize self-servis portal, bayilerinize özel sipariş ve takip paneli sunarak Excel dosyaları ve telefon trafiği karmaşasını tamamen sıfırlar.`,
  },
  {
    id: 'kb-sector-construction',
    title: 'İnşaat, Taahhüt ve Mimarlık Sektörü Otomasyonları',
    category: 'automation_erp',
    keywords: ['inşaat', 'insaat', 'şantiye', 'santiye', 'müteahhit', 'mimarlık', 'mimari', 'hakediş', 'keşif', 'taşeron', 'kat planı', 'daire satışı'],
    content: `İnşaat, Taahhüt ve Mimarlık Sektörü İçin Özel Çözümlerimiz:
- Şantiye Sesli WhatsApp Raporu: Şantiye şefleri ve ustabaşıları uzun formlar doldurmak yerine WhatsApp'tan ses kaydı, harcama fişi veya fotoğraf atar. Sistem bunu anında metne çevirip ERP/Excel hakediş tablosuna işler.
- 10 Saniyede Keşif & Teklif (PDF): Metrekare ve kaba/ince inşaat talebine göre güncel birim fiyat listenizle anında kurumsal antetli PDF teklif taslağı derler.
- 7/24 Proje Satış & Kat Planı Asistanı: Reklamdan gelen konut veya arsa alıcılarına WhatsApp'tan anında kat planı ve katalog PDF'i iletip satış ofisine randevu kilitler.
- Taşeron & Tedarikçi Koordinasyonu: Sipariş onayları ve sevkiyat saatleri otonom hatırlatılır, şantiye duraklamaları önlenir.`,
  },
  {
    id: 'kb-sector-agencies',
    title: 'Dijital Ajanslar ve Kreatif Ekipler İçin Süreç Otomasyonları',
    category: 'automation_erp',
    keywords: ['ajans', 'agency', 'dijital ajans', 'reklam ajansı', 'onboarding', 'brief', 'raporlama', 'revizyon', 'retainer'],
    content: `Dijital Ajanslar İçin Haftalık 25 Saat Kurtaran Otopilotlar:
- Otonom Müşteri Onboarding: Sözleşme imzalandığı an otomatik Slack/WhatsApp kanalı açılır, Drive klasörleri oluşturulur ve brief formu iletilip görev kartları açılır.
- Haftalık Otonom Meta & Google Ads Raporlama: Her pazartesi sabahı insan eli değmeden tüm müşteri hesaplarının harcamaları, ROAS ve tıklama verileri API ile çekilip markaya özel şık bir PDF rapora dönüştürülür.
- Tasarım & Metin Revizyon Onay Otopilotu: Müşteri revizyonları WhatsApp'tan toplanıp proje aracına işlenir; onay verilen kreatifler anında yayına alınır.
- Otomatik Hakediş & Retainer Faturalama: Ay sonlarında ajans hizmet bedelleri muhasebe entegrasyonuyla otomatik faturalandırılır.`,
  },
  {
    id: 'kb-sector-education-platforms',
    title: 'Eğitim, Kurs, Akademi ve Öğrenci Platformları (örn: lernzirkel-online.de)',
    category: 'ai_agents',
    keywords: ['lernzirkel', 'eğitim', 'egitim', 'kurs', 'akademi', 'öğrenci', 'ogrenci', 'veli', 'ders', 'schul', 'bildung', 'etüt'],
    content: `Eğitim Kurumları, Kurslar ve Online Platformlar İçin Otopilotlar:
- Veli & Öğrenci WhatsApp Kayıt Otopilotu: Siteden gelen öğrenci veya veliyi karşılar, sınıf ve ders ihtiyacını öğrenip deneme dersi randevusu kilitler.
- No-Show Önleyici Ders Hatırlatma: Derslerden 24 saat ve 2 saat önce velinin WhatsApp'ına otomatik hatırlatma ve online ders linki (Zoom/Meet) iletilir. Katılmama oranını %85 düşürür.
- Otomatik Aylık Aidat & Fatura Hatırlatma: Vadesi gelen eğitim ödemeleri için velilere muhasebe sistemiyle entegre nazik otomatik WhatsApp ödeme linki ve e-fatura iletilir.
- 0.8s Altı Hızlı Veli/Öğrenci Portalı: Next.js 14 altyapısıyla öğrencilerin ders programını ve gelişim raporlarını şifreli görebileceği güvenli panel.`,
  },
  {
    id: 'kb-sector-ecommerce-retail',
    title: 'E-Ticaret, Moda ve Perakende Satış Siteleri (örn: miressen.de)',
    category: 'growth_geo',
    keywords: ['miressen', 'e-ticaret', 'eticaret', 'shop', 'butik', 'store', 'mode', 'moda', 'giyim', 'sepet', 'kargo'],
    content: `E-Ticaret ve Moda Siteleri İçin Satış Artırma Mimarisi:
- 7/24 Çok Dilli AI Satış Temsilcisi: Sitede gezen ziyaretçinin beden, kumaş, teslimat sorularını anında yanıtlar, kombin önerir ve kararsız müşteriyi siparişe yönlendirir.
- Terk Edilen Sepetleri WhatsApp'tan Kurtarma: Sepete ürün ekleyip almadan çıkan kullanıcılara 15 dakika sonra kişiselleştirilmiş stok hatırlatması ve kupon ileterek terk edilen sepetlerin %35'ini kurtarır.
- Kargo & Sipariş Takip Otopilotu: "Siparişim nerede?" sorularını müşteri temsilcisini meşgul etmeden kargo API'sinden WhatsApp üzerinden 2 saniyede çözer.
- Sub-Second Hız (0.8s LCP): Mobil cihazlarda her 1 saniyelik gecikme satışların %20 düşmesine neden olur. Next.js 14 ile sayfaları anında açılır hale getiriyoruz.`,
  },
  {
    id: 'kb-growth-marketing-geo',
    title: 'Veri Odaklı Büyüme (Growth Marketing) & GEO (/hizmetler/reklam-sosyal-medya)',
    category: 'growth_geo',
    keywords: [
      'growth', 'reklam', 'geo', 'seo', 'meta', 'capi', 'google ads', 'roas',
      'cac', 'chatgpt', 'perplexity', 'claude', 'pazarlama', 'lead',
    ],
    content: `Veri Odaklı Büyüme & GEO — AI Arama Motoru Optimizasyonu (Sayfa: /hizmetler/reklam-sosyal-medya):
- Meta CAPI (Server-Side 1st-Party Veri), Google Ads Enhanced Conversions (Offline Sync) ve ChatGPT, Perplexity, Claude gibi yapay zeka arama motorlarında markanızı 1. sıraya taşıyan GEO optimizasyonu sunuyoruz.
- Boşa bütçe harcamadan nokta atışı yüksek bütçeli B2B müşterileri içeri çeker; müşteri edinme maliyetinde (CAC) -%45 tasarruf ve 5.4x ROAS (+%340 verimlilik) hedefler.`,
  },
  {
    id: 'kb-engagement-privacy-pricing',
    title: 'Çalışma Modeli, Gizlilik, KVKK/GDPR ve Özel Teklif Süreci',
    category: 'process_security',
    keywords: [
      'fiyat', 'ücret', 'teklif', 'maliyet', 'bütçe', 'analiz', 'kvkk', 'gdpr',
      'dsgvo', 'gizlilik', 'güvenlik', 'süreç', 'iletişim', 'randevu',
    ],
    content: `StarWebFlow Mühendislik Prensipleri, Gizlilik ve Fiyatlandırma Politikası:
- Geleneksel ajanslar standart paket satar; StarWebFlow operasyonel güç, mühendislik mimarisi ve yatırım getirisi (ROI) inşa eder.
- Müşteri Gizliliği: Hiçbir müşterimizin veya iş ortağımızın kurumsal verileri başka müşterilerle paylaşılmaz; tam veri izolasyonu ve gizlilik esastır.
- Fiyatlandırma: Her şirketin ekip büyüklüğü, ERP/CRM entegrasyon ihtiyacı ve mimari kapsamı farklı olduğu için sabit şablon fiyat verilmez. Ücretsiz teknik mimari analizi (taahhüt gerektirmez, 24 saat içinde yanıt) ile projeye özel teklif hazırlanır.`,
  },
];

let cachedVectorChunks: RagDocumentChunk[] | null = null;
let isEmbeddingInProgress = false;
let lastDynamicSyncAt = 0;

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function computeLexicalScore(query: string, chunk: RagDocumentChunk): number {
  const qLower = query.toLowerCase();
  const words = qLower
    .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇäöüßÄÖÜ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (words.length === 0) return 0;

  const hayTitle = chunk.title.toLowerCase();
  const hayContent = chunk.content.toLowerCase();
  let score = 0;

  for (const kw of chunk.keywords) {
    if (qLower.includes(kw.toLowerCase())) {
      score += 0.28;
    }
  }

  for (const word of words) {
    if (hayTitle.includes(word)) score += 0.22;
    if (hayContent.includes(word)) score += 0.1;
  }

  return Math.min(1, score);
}

async function loadDynamicChunks(): Promise<RagDocumentChunk[]> {
  const chunks: RagDocumentChunk[] = [...CORE_KNOWLEDGE_CHUNKS];
  try {
    const recentBlogs = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: { slug: true, title: true, excerpt: true },
    });

    for (const post of recentBlogs) {
      if (post.title && post.excerpt) {
        chunks.push({
          id: `blog-${post.slug}`,
          title: `StarWebFlow Blog: ${post.title}`,
          category: 'blog',
          keywords: post.title
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3),
          content: `${post.title}: ${post.excerpt} (Sayfa: /blog/${post.slug})`,
        });
      }
    }
  } catch {
    // Core chunks are always available
  }
  return chunks;
}

async function getOrBuildKnowledgeIndex(): Promise<{
  chunks: RagDocumentChunk[];
  hasEmbeddings: boolean;
}> {
  const now = Date.now();
  if (cachedVectorChunks && now - lastDynamicSyncAt < 10 * 60 * 1000) {
    const hasEmb = cachedVectorChunks.some((c) => Array.isArray(c.embedding) && c.embedding.length > 0);
    return { chunks: cachedVectorChunks, hasEmbeddings: hasEmb };
  }

  const allChunks = await loadDynamicChunks();
  lastDynamicSyncAt = now;

  if (isEmbeddingInProgress) {
    return { chunks: cachedVectorChunks || allChunks, hasEmbeddings: false };
  }

  const ollama = new OllamaProvider();
  if (!ollama.isConfigured()) {
    cachedVectorChunks = allChunks;
    return { chunks: allChunks, hasEmbeddings: false };
  }

  // Fast check if Ollama is actually reachable before attempting heavy embeddings (prevents hanging when offline)
  const isHealthy = await Promise.race([
    ollama.checkHealth().then((h) => h.online),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 600)),
  ]);

  if (!isHealthy) {
    cachedVectorChunks = allChunks;
    return { chunks: allChunks, hasEmbeddings: false };
  }

  isEmbeddingInProgress = true;
  try {
    const inputs = allChunks.map((c) => `${c.title}\n${c.content}`);
    const embeddings = await Promise.race([
      ollama.generateEmbedding(inputs),
      new Promise<number[][]>((_, reject) =>
        setTimeout(() => reject(new Error('Embedding timeout')), 4500)
      ),
    ]);

    if (Array.isArray(embeddings) && embeddings.length === allChunks.length) {
      for (let i = 0; i < allChunks.length; i++) {
        allChunks[i].embedding = embeddings[i];
      }
      cachedVectorChunks = allChunks;
      return { chunks: allChunks, hasEmbeddings: true };
    }
  } catch {
    // Fallback to lexical scoring if Ollama embedding is busy
  } finally {
    isEmbeddingInProgress = false;
  }

  cachedVectorChunks = allChunks;
  return { chunks: allChunks, hasEmbeddings: false };
}

/**
 * Hybrid RAG Retriever powered by Ollama nomic-embed-text:latest + lexical matching.
 */
export async function retrieveStarWebFlowRagContext(
  query: string,
  topK = 3
): Promise<RagRetrievalResult> {
  const { chunks, hasEmbeddings } = await getOrBuildKnowledgeIndex();
  const ollama = new OllamaProvider();

  let queryEmbedding: number[] | null = null;
  if (hasEmbeddings && query.trim().length > 2) {
    try {
      const embRes = await Promise.race([
        ollama.generateEmbedding(query),
        new Promise<number[][]>((_, reject) =>
          setTimeout(() => reject(new Error('Query embed timeout')), 2500)
        ),
      ]);
      if (Array.isArray(embRes) && embRes[0]?.length) {
        queryEmbedding = embRes[0];
      }
    } catch {
      queryEmbedding = null;
    }
  }

  const scored = chunks.map((chunk) => {
    const lexicalScore = computeLexicalScore(query, chunk);
    const vectorScore =
      queryEmbedding && chunk.embedding
        ? Math.max(0, cosineSimilarity(queryEmbedding, chunk.embedding))
        : 0;

    const finalScore = queryEmbedding
      ? vectorScore * 0.6 + lexicalScore * 0.4
      : lexicalScore;

    return {
      id: chunk.id,
      title: chunk.title,
      category: chunk.category,
      content: chunk.content,
      score: Number(finalScore.toFixed(3)),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, topK);

  const formattedContext = selected
    .map((item, idx) => `[Mimari Modül #${idx + 1} — ${item.title}]:\n${item.content}`)
    .join('\n\n');

  return {
    chunks: selected,
    usedVectorEmbedding: !!queryEmbedding,
    formattedContext,
  };
}
