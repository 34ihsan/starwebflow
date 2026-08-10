import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://starwebflow.com';

  // ── 1. Static Pages ──────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },

    // Hizmetler
    { url: `${baseUrl}/hizmetler/web-gelistirme`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/hizmetler/web-uygulamasi`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/hizmetler/ai-agents`,         lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/hizmetler/ai-otomasyon`,      lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/hizmetler/reklam-sosyal-medya`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },

    // Sektörler — GEO için kritik "long-tail" sayfaları
    { url: `${baseUrl}/sektorler/saglik`,   lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sektorler/hukuk`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sektorler/lojistik`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sektorler/uretim`,   lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sektorler/e-ticaret`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

    // Blog listesi
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },

    // Legal
    { url: `${baseUrl}/datenschutz`,         lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/nutzungsbedingungen`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/kvkk`,                lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cookie-richtlinie`,   lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/impressum`,           lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/iptal-iade`,          lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/revizyon-politikasi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // ── 2. Dynamic Blog Pages ─────────────────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const publishedPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    blogPages = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable during static build — silently skip
  }

  return [...staticPages, ...blogPages];
}
