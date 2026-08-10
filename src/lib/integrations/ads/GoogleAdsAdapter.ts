import { AdPlatformAdapter, AdCampaignMetric } from './AdsAdapter';

export class GoogleAdsAdapter implements AdPlatformAdapter {
  platformName = 'GOOGLE';
  private apiVersion = 'v17';
  private baseUrl = `https://googleads.googleapis.com/${this.apiVersion}`;

  // Google Ads requires a developer token in headers for REST API requests
  private getHeaders(accessToken: string) {
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN is not configured');
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };
  }

  async getCampaigns(accessToken: string, accountId: string): Promise<AdCampaignMetric[]> {
    try {
      // Remove any hyphens from the customer ID if present
      const customerId = accountId.replace(/-/g, '');
      const url = `${this.baseUrl}/customers/${customerId}/googleAds:search`;
      
      // GAQL to fetch campaign metrics
      const query = `
        SELECT 
          campaign.id, 
          campaign.name, 
          campaign.status, 
          metrics.cost_micros, 
          metrics.impressions, 
          metrics.clicks, 
          metrics.conversions, 
          metrics.conversions_value 
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
      `;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Google Ads API Error:', err);
        throw new Error(`Failed to fetch Google Ads campaigns: ${JSON.stringify(err)}`);
      }

      const data = await response.json();
      const metrics: AdCampaignMetric[] = [];

      const rows = data.results || [];

      for (const row of rows) {
        const campaign = row.campaign;
        const metric = row.metrics;

        const spendMicros = parseInt(metric.cost_micros || '0');
        const spend = spendMicros / 1000000; // Convert micros to standard currency
        
        const impressions = parseInt(metric.impressions || '0');
        const clicks = parseInt(metric.clicks || '0');
        const conversions = parseFloat(metric.conversions || '0');
        const conversionsValue = parseFloat(metric.conversions_value || '0');

        let roas = 0;
        let cpa = 0;
        let ctr = 0;
        let hookRate = 0;

        if (impressions > 0) {
          ctr = (clicks / impressions) * 100;
        }

        if (spend > 0) {
          if (conversions > 0) cpa = spend / conversions;
          if (conversionsValue > 0) roas = conversionsValue / spend;
        }

        // Google doesn't have a direct "reach" metric in this report easily, using impressions as a proxy or 0
        hookRate = Math.min(100, ctr * 8);

        let status = 'PAUSED';
        if (campaign.status === 'ENABLED') {
          status = 'ACTIVE';
        }

        metrics.push({
          externalId: campaign.id,
          status,
          spend,
          roas: parseFloat(roas.toFixed(2)),
          reach: impressions, 
          cpa: parseFloat(cpa.toFixed(2)),
          ctr: parseFloat(ctr.toFixed(2)),
          hookRate: Math.round(hookRate),
        });
      }

      return metrics;
    } catch (error) {
      console.error('Error in GoogleAdsAdapter getCampaigns:', error);
      return [];
    }
  }

  async pauseCampaign(accessToken: string, externalCampaignId: string): Promise<boolean> {
    try {
      // Note: externalCampaignId needs to include customerId for mutations, 
      // or we must pass customerId to the adapter methods. 
      // Assuming externalCampaignId is formatted as "customerId:campaignId" for Google
      const parts = externalCampaignId.split(':');
      if (parts.length !== 2) {
        console.error('Google Ads externalCampaignId must be in format "customerId:campaignId"');
        return false;
      }
      const customerId = parts[0].replace(/-/g, '');
      const campaignId = parts[1];

      const url = `${this.baseUrl}/customers/${customerId}/campaigns:mutate`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify({
          operations: [
            {
              updateMask: 'status',
              update: {
                resourceName: `customers/${customerId}/campaigns/${campaignId}`,
                status: 'PAUSED'
              }
            }
          ]
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Google Ads API Error pausing:', err);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error pausing Google Ads campaign:', error);
      return false;
    }
  }

  async resumeCampaign(accessToken: string, externalCampaignId: string): Promise<boolean> {
    try {
      const parts = externalCampaignId.split(':');
      if (parts.length !== 2) {
        return false;
      }
      const customerId = parts[0].replace(/-/g, '');
      const campaignId = parts[1];

      const url = `${this.baseUrl}/customers/${customerId}/campaigns:mutate`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify({
          operations: [
            {
              updateMask: 'status',
              update: {
                resourceName: `customers/${customerId}/campaigns/${campaignId}`,
                status: 'ENABLED'
              }
            }
          ]
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Google Ads API Error resuming:', err);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error resuming Google Ads campaign:', error);
      return false;
    }
  }
}
