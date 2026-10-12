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

      // ── AI Arama Motorları: Tam Erişim (GEO & AI Search Engines) ──────
      {
        userAgent: [
          'OAI-SearchBot',       // OpenAI SearchGPT / ChatGPT Search
          'GPTBot',              // OpenAI Model Training & Indexing
          'ChatGPT-User',        // OpenAI Interactive Browsing
          'ClaudeBot',           // Anthropic Claude
          'Claude-Web',          // Anthropic Browsing
          'anthropic-ai',        // Anthropic System Agent
          'PerplexityBot',       // Perplexity AI Search
          'Google-Extended',     // Google Gemini & Vertex AI
          'Gemini',              // Google Gemini Assistant
          'GoogleOther',         // Google AI & Specialized Crawlers
          'Applebot',            // Apple Siri & Spotlight
          'Applebot-Extended',   // Apple Intelligence Generative Search
          'cohere-ai',           // Cohere AI
          'Amazonbot',           // Amazon Alexa & Bedrock AI
          'Bytespider',          // ByteDance AI
          'CCBot',               // Common Crawl (Universal AI training dataset)
          'Diffbot',             // Diffbot Knowledge Graph AI
          'facebookexternalhit', // Meta AI
          'Meta-ExternalAgent',  // Meta AI Web Search
          'LinkedInBot',         // LinkedIn Graph AI
          'YouBot',              // You.com AI Search
          'DuckAssistBot',       // DuckDuckGo AI
          'Bingbot',             // Microsoft Copilot & Bing AI
        ],
        allow: [
          '/',
          '/hizmetler/',
          '/sektorler/',
          '/blog/',
          '/datenschutz',
          '/kvkk',
          '/impressum',
          '/nutzungsbedingungen',
          '/cookie-richtlinie',
          '/llms.txt',
          '/llms-full.txt',
          '/ai.txt',
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
