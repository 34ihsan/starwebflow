import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://starwebflow.com';

  const staticPages = [
    '',
    '/hizmetler/web-gelistirme',
    '/hizmetler/web-uygulamasi',
    '/hizmetler/ai-agents',
    '/hizmetler/ai-otomasyon',
    '/hizmetler/reklam-sosyal-medya',
    '/datenschutz',
    '/nutzungsbedingungen',
    '/kvkk',
    '/cookie-richtlinie',
    '/impressum',
  ];

  return staticPages.map((route) => {
    let priority = 0.5;
    let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';

    if (route === '') {
      priority = 1.0;
      changeFrequency = 'daily';
    } else if (route.startsWith('/hizmetler')) {
      priority = 0.8;
      changeFrequency = 'weekly';
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency,
      priority,
    };
  });
}
