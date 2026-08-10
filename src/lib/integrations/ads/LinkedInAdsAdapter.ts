import { AdPlatformAdapter, AdCampaignMetric } from './AdsAdapter';

export class LinkedInAdsAdapter implements AdPlatformAdapter {
  platformName = 'LinkedIn Ads';

  async pauseCampaign(accessToken: string, campaignId: string, accountId?: string): Promise<boolean> {
    try {
      // API call to LinkedIn Marketing API to pause the campaign
      const response = await fetch(`https://api.linkedin.com/v2/adCampaigns/${campaignId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patch: {
            $set: {
              status: "PAUSED"
            }
          }
        }),
      });

      if (!response.ok) {
        console.error(`[LinkedInAdsAdapter] Failed to pause campaign ${campaignId}: ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[LinkedInAdsAdapter] Error pausing campaign:`, error);
      return false;
    }
  }

  async resumeCampaign(accessToken: string, campaignId: string, accountId?: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.linkedin.com/v2/adCampaigns/${campaignId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patch: {
            $set: {
              status: "ACTIVE"
            }
          }
        }),
      });

      if (!response.ok) {
        console.error(`[LinkedInAdsAdapter] Failed to resume campaign ${campaignId}: ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[LinkedInAdsAdapter] Error resuming campaign:`, error);
      return false;
    }
  }

  async getCampaigns(accessToken: string, accountId: string): Promise<AdCampaignMetric[]> {
    try {
      // 1. Fetch Campaigns
      const campaignsResponse = await fetch(`https://api.linkedin.com/v2/adCampaigns?q=search&search=(account:(values:List(urn:li:sponsoredAccount:${accountId})))`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        },
      });

      if (!campaignsResponse.ok) {
        throw new Error(`LinkedIn API returned ${campaignsResponse.status}`);
      }

      const campaignsData = await campaignsResponse.json();
      const campaigns = campaignsData.elements || [];

      // 2. Fetch Analytics (simplified for MVP)
      // In a real scenario, you'd call adAnalytics endpoint, e.g. /v2/adAnalyticsV2
      // For this lightweight MVP, we'll map campaign data and use fallback metrics
      const mappedMetrics: AdCampaignMetric[] = campaigns.map((campaign: any) => ({
        externalId: campaign.id.toString(),
        name: campaign.name,
        status: campaign.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
        spend: Math.floor(Math.random() * 5000) + 500, // Dummy data for MVP
        roas: Number((Math.random() * 4 + 1).toFixed(1)),
        reach: Math.floor(Math.random() * 50000) + 10000,
        cpa: Math.floor(Math.random() * 100) + 10,
        ctr: Number((Math.random() * 5).toFixed(2)),
        hookRate: Math.floor(Math.random() * 40) + 10,
      }));

      return mappedMetrics;
    } catch (error) {
      console.error(`[LinkedInAdsAdapter] Error fetching campaigns:`, error);
      return [];
    }
  }
}
