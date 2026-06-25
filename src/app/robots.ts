import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://starwebflow.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/client/',
          '/api/',
          '/_next/',
          '/auth/'
        ],
      },
      // Zırh İçinde Zırh: AI botları için özel izinler ve sınırlamalar
      {
        userAgent: [
          'GPTBot',            // OpenAI
          'Claude-Web',        // Anthropic
          'PerplexityBot',     // Perplexity
          'Google-Extended',   // Google Gemini
          'Applebot',          // Apple AI
          'cohere-ai',         // Cohere
          'facebookexternalhit' // Meta AI
        ],
        allow: '/',
        disallow: [
          '/admin/',
          '/client/',
          '/api/',
          '/_next/',
          '/auth/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
