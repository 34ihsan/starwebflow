import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://starwebflow.com';

  return {
    rules: [
      // ── Default: Tüm tarayıcılar ──────────────────────────────────────
      {
        userAgent: '*',
        allow: [
          '/',
          '/hizmetler/',
          '/sektorler/',
          '/blog/',
          '/datenschutz',
          '/nutzungsbedingungen',
          '/kvkk',
          '/cookie-richtlinie',
          '/impressum',
          '/revizyon-politikasi',
          '/iptal-iade',
        ],
        disallow: [
          '/admin/',
          '/client/',
          '/api/',
          '/_next/',
          '/auth/',
          '/actions/',
        ],
      },

      // ── AI Arama Motorları: Tam Erişim (GEO Signal) ───────────────────
      {
        userAgent: [
          'GPTBot',           // OpenAI / ChatGPT
          'ChatGPT-User',     // OpenAI browsing
          'ClaudeBot',        // Anthropic / Claude
          'Claude-Web',       // Anthropic browsing
          'PerplexityBot',    // Perplexity AI
          'Google-Extended',  // Google Gemini
          'Gemini',           // Google Gemini AI
          'Applebot',         // Apple AI / Siri
          'cohere-ai',        // Cohere
          'Amazonbot',        // Amazon Alexa / Bedrock
          'Bytespider',       // ByteDance / TikTok AI
          'CCBot',            // Common Crawl (training data)
          'Diffbot',          // Diffbot AI
          'facebookexternalhit', // Meta AI
          'LinkedInBot',      // LinkedIn AI
          'anthropic-ai',     // Anthropic direct
          'YouBot',           // You.com AI
          'Brightbot',        // Bright Data AI
        ],
        allow: [
          '/',
          '/hizmetler/',
          '/sektorler/',
          '/blog/',
          '/datenschutz',
          '/kvkk',
          '/impressum',
        ],
        disallow: [
          '/admin/',
          '/client/',
          '/api/',
          '/_next/',
          '/auth/',
        ],
      },

      // ── Kötü niyetli / spam botlar: Engelle ───────────────────────────
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
