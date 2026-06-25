/**
 * StarWebFlow - Meta Ads Graph API Simulator & Integration Layer
 * 
 * This file is prepared for the real Graph API integration.
 * Currently, it acts as a Simulation layer since the keys in .env are placeholders.
 */

const META_GRAPH_API_KEY = process.env.META_GRAPH_API_KEY || null;
const GOOGLE_ADS_DEV_TOKEN = process.env.GOOGLE_ADS_DEV_TOKEN || null;

export interface AdMetrics {
  id: string;
  name: string;
  platform: 'META' | 'GOOGLE';
  status: 'active' | 'paused' | 'pending';
  spent: number;
  roas: number;
  hookRate: number; // Percentage of users who watched the first 3 seconds
  ctr: number;
}

/**
 * Fetches current active campaigns from Meta Graph API.
 * Currently runs in SIMULATION MODE.
 */
export async function fetchMetaCampaigns(tenantId: string): Promise<AdMetrics[]> {
  if (!META_GRAPH_API_KEY) {
    console.log(`[SIMULATION] Fetching Mock Meta Campaigns for tenant: ${tenantId}`);
    return [
      {
        id: "mock_meta_1",
        name: "Yaz İndirimi 2026 (Retargeting)",
        platform: "META",
        status: "active",
        spent: 1200,
        roas: 4.5,
        hookRate: 34.2,
        ctr: 2.1
      },
      {
        id: "mock_meta_2",
        name: "Genel Kitle Deneme 1",
        platform: "META",
        status: "paused",
        spent: 65,
        roas: 0.8,
        hookRate: 8.1, // Very low hook rate, caused the pause
        ctr: 0.5
      }
    ];
  }

  // TODO: Implement actual `fetch('https://graph.facebook.com/v19.0/act_<ID>/campaigns')`
  return [];
}

/**
 * Sends a server-side event to Meta Conversions API (CAPI)
 * This is used to train the Lookalike audiences based on StarWebFlow Leads.
 */
export async function sendLeadToConversionsAPI(leadData: { email: string; value: number }) {
  if (!META_GRAPH_API_KEY) {
    console.log(`[SIMULATION] Sent Lead to Meta CAPI: ${leadData.email} with Value: $${leadData.value}`);
    return { success: true, simulated: true };
  }

  // TODO: Actual implementation for Meta CAPI
  // Requires hashing the email (SHA256) before sending
  return { success: true };
}

/**
 * AI Budget Optimizer Logic (Thresholds Engine)
 */
export function evaluateAdOptimization(ad: AdMetrics) {
  const recommendations: string[] = [];
  let action: 'none' | 'pause' | 'scale_request' = 'none';

  // Rule 1: Stop Loss
  if (ad.roas < 1.5 && ad.spent > 50) {
    recommendations.push("Düşük ROAS. Kampanya otomatik durduruldu.");
    action = 'pause';
  }
  
  // Rule 2: Scale Winner
  else if (ad.roas > 3.0 && ad.hookRate > 30) {
    recommendations.push("Yüksek Performans. %20 Bütçe artırımı öneriliyor.");
    action = 'scale_request';
  }
  
  // Rule 3: Creative Fatigue
  else if (ad.hookRate < 15) {
    recommendations.push("Hook Rate çok düşük (< %15). Görsel Yorgunluğu (Creative Fatigue). Yeni Flux.1 görseli üretilecek.");
    // Action remains 'none' regarding budget, but triggers creative workflow
  }

  return { action, recommendations };
}
