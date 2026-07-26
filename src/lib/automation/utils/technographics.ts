/**
 * Technographics & Intent extraction via HTTP fetch
 * This is a zero-cost replacement for tools like BuiltWith.
 */

export interface ExtractedSiteData {
  url: string;
  title: string;
  technologies: string[];
  intentSignals: string[];
}

export async function fetchWebsiteTech(url: string): Promise<ExtractedSiteData> {
  const data: ExtractedSiteData = {
    url,
    title: '',
    technologies: [],
    intentSignals: []
  };

  if (!url || url === '') return data;

  // Add http if missing
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 saniye zaman aşımı

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return data;

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      data.title = titleMatch[1].trim();
    }

    const htmlLower = html.toLowerCase();

    // 1. Detect Technologies (Regex / String search)
    if (htmlLower.includes('wp-content') || htmlLower.includes('wp-includes')) {
      data.technologies.push('WordPress');
      if (htmlLower.includes('woocommerce')) data.technologies.push('WooCommerce');
      if (htmlLower.includes('elementor')) data.technologies.push('Elementor');
    }
    
    if (htmlLower.includes('cdn.shopify.com') || htmlLower.includes('shopify.com')) {
      data.technologies.push('Shopify');
    }

    if (htmlLower.includes('wix.com') || htmlLower.includes('wix-')) {
      data.technologies.push('Wix');
    }

    if (htmlLower.includes('react-root') || htmlLower.includes('_next/static')) {
      data.technologies.push('React/Next.js');
    }

    if (htmlLower.includes('google-analytics.com') || htmlLower.includes('gtag')) {
      data.technologies.push('Google Analytics');
    }

    if (htmlLower.includes('fbevents.js') || htmlLower.includes('fbq(')) {
      data.technologies.push('Facebook Pixel');
    }

    // 2. Detect Intent Signals
    if (htmlLower.includes('we are hiring') || htmlLower.includes('career') || htmlLower.includes('join our team')) {
      data.intentSignals.push('Hiring/Expanding');
    }

    if (htmlLower.includes('book a demo') || htmlLower.includes('schedule a call')) {
      data.intentSignals.push('High-touch Sales Motion');
    }
    
    if (htmlLower.includes('under construction') || htmlLower.includes('coming soon')) {
      data.intentSignals.push('Website Under Construction');
    }

    return data;
  } catch (error) {
    // Timeout or fetch error, fail silently to not break the pipeline
    console.log(`[Technographics] Could not fetch ${url}:`, (error as Error).message);
    return data;
  }
}
