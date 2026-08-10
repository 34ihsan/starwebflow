import { AdPlatformAdapter, AdCampaignMetric } from './AdsAdapter';

export class TikTokAdsAdapter implements AdPlatformAdapter {
  platformName = 'TIKTOK';
  private apiVersion = 'v1.3';
  private baseUrl = `https://business-api.tiktok.com/open_api/${this.apiVersion}`;

  async getCampaigns(accessToken: string, accountId: string): Promise<AdCampaignMetric[]> {
    try {
      const url = `${this.baseUrl}/campaign/get/?advertiser_id=${accountId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('TikTok API Error:', err);
        throw new Error(`Failed to fetch TikTok campaigns: ${err.message}`);
      }

      const data = await response.json();
      
      if (data.code !== 0) {
        console.error('TikTok API Error code != 0:', data);
        throw new Error(`Failed to fetch TikTok campaigns: ${data.message}`);
      }

      const metrics: AdCampaignMetric[] = [];
      const campaigns = data.data?.list || [];

      // Note: TikTok /campaign/get/ does not return real-time metrics like spend in the same call.
      // You typically have to call /report/integrated/get/ for insights.
      // For this lightweight integration, we will fetch report data in bulk for the advertiser 
      // and match it to campaigns.
      
      const reportUrl = `${this.baseUrl}/report/integrated/get/`;
      const reportParams = new URLSearchParams({
        advertiser_id: accountId,
        report_type: 'BASIC',
        data_level: 'AUCTION_CAMPAIGN',
        dimensions: JSON.stringify(['campaign_id']),
        metrics: JSON.stringify(['spend', 'reach', 'clicks', 'impressions', 'conversion', 'total_purchase_value']),
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // last 30 days
        end_date: new Date().toISOString().split('T')[0],
      });

      const reportResponse = await fetch(`${reportUrl}?${reportParams.toString()}`, {
        headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' }
      });

      let insightsMap: Record<string, any> = {};
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        if (reportData.code === 0) {
          const list = reportData.data?.list || [];
          for (const item of list) {
            const cid = item.dimensions.campaign_id;
            insightsMap[cid] = item.metrics;
          }
        }
      }

      for (const campaign of campaigns) {
        let spend = 0;
        let reach = 0;
        let roas = 0;
        let cpa = 0;
        let ctr = 0;
        let hookRate = 0;

        const insight = insightsMap[campaign.campaign_id];
        
        if (insight) {
          spend = parseFloat(insight.spend || '0');
          reach = parseInt(insight.reach || '0');
          
          const clicks = parseInt(insight.clicks || '0');
          const impressions = parseInt(insight.impressions || '0');
          const conversions = parseInt(insight.conversion || '0');
          const purchaseValue = parseFloat(insight.total_purchase_value || '0');

          if (impressions > 0) {
            ctr = (clicks / impressions) * 100;
          }

          if (spend > 0) {
            if (conversions > 0) cpa = spend / conversions;
            if (purchaseValue > 0) roas = purchaseValue / spend;
          }

          hookRate = Math.min(100, ctr * 8); 
        }

        let status = 'PAUSED';
        if (campaign.operation_status === 'ENABLE') {
          status = 'ACTIVE';
        }

        metrics.push({
          externalId: campaign.campaign_id.toString(),
          status,
          spend,
          roas: parseFloat(roas.toFixed(2)),
          reach,
          cpa: parseFloat(cpa.toFixed(2)),
          ctr: parseFloat(ctr.toFixed(2)),
          hookRate: Math.round(hookRate),
        });
      }

      return metrics;
    } catch (error) {
      console.error('Error in TikTokAdsAdapter getCampaigns:', error);
      return [];
    }
  }

  async pauseCampaign(accessToken: string, externalCampaignId: string): Promise<boolean> {
    try {
      // In TikTok, accountId is required for mutations.
      // We assume externalCampaignId is formatted as "accountId:campaignId"
      const parts = externalCampaignId.split(':');
      if (parts.length !== 2) return false;
      const accountId = parts[0];
      const campaignId = parts[1];

      const url = `${this.baseUrl}/campaign/status/update/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          advertiser_id: accountId,
          campaign_ids: [campaignId],
          operation_status: 'DISABLE'
        })
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.code === 0;
    } catch (error) {
      console.error('Error pausing TikTok campaign:', error);
      return false;
    }
  }

  async resumeCampaign(accessToken: string, externalCampaignId: string): Promise<boolean> {
    try {
      const parts = externalCampaignId.split(':');
      if (parts.length !== 2) return false;
      const accountId = parts[0];
      const campaignId = parts[1];

      const url = `${this.baseUrl}/campaign/status/update/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          advertiser_id: accountId,
          campaign_ids: [campaignId],
          operation_status: 'ENABLE'
        })
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.code === 0;
    } catch (error) {
      console.error('Error resuming TikTok campaign:', error);
      return false;
    }
  }
}
