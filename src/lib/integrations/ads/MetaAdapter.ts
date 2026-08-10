import { AdPlatformAdapter, AdCampaignMetric } from './AdsAdapter';

export class MetaAdapter implements AdPlatformAdapter {
  platformName = 'META';
  private apiVersion = 'v20.0'; 
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  async getCampaigns(accessToken: string, accountId: string): Promise<AdCampaignMetric[]> {
    try {
      // ActAccountId in Meta usually starts with 'act_'
      const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      
      const url = `${this.baseUrl}/${formattedAccountId}/campaigns?fields=id,name,status,insights{spend,reach,actions,clicks,impressions,inline_link_clicks,action_values}&access_token=${accessToken}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        console.error('Meta API Error:', err);
        throw new Error(`Failed to fetch Meta campaigns: ${err.error?.message}`);
      }

      const data = await response.json();
      
      const metrics: AdCampaignMetric[] = [];

      for (const campaign of data.data) {
        let spend = 0;
        let reach = 0;
        let roas = 0;
        let cpa = 0;
        let ctr = 0;
        let hookRate = 0;

        if (campaign.insights && campaign.insights.data && campaign.insights.data.length > 0) {
          const insight = campaign.insights.data[0];
          spend = parseFloat(insight.spend || '0');
          reach = parseInt(insight.reach || '0');
          
          const clicks = parseInt(insight.clicks || '0');
          const impressions = parseInt(insight.impressions || '0');
          
          if (impressions > 0) {
            ctr = (clicks / impressions) * 100;
          }

          let purchases = 0;
          let purchaseValue = 0;
          
          if (insight.actions) {
            const purchaseAction = insight.actions.find((a: any) => a.action_type === 'purchase');
            if (purchaseAction) purchases = parseInt(purchaseAction.value || '0');
          }
          
          if (insight.action_values) {
            const purchaseValueAction = insight.action_values.find((a: any) => a.action_type === 'purchase');
            if (purchaseValueAction) purchaseValue = parseFloat(purchaseValueAction.value || '0');
          }

          if (spend > 0) {
            if (purchases > 0) cpa = spend / purchases;
            if (purchaseValue > 0) roas = purchaseValue / spend;
          }
          
          hookRate = Math.min(100, ctr * 8); 
        }

        metrics.push({
          externalId: campaign.id,
          status: campaign.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
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
      console.error('Error in MetaAdapter getCampaigns:', error);
      return [];
    }
  }

  async pauseCampaign(accessToken: string, externalCampaignId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${externalCampaignId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'PAUSED',
          access_token: accessToken
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Meta API Error pausing:', err);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error pausing campaign:', error);
      return false;
    }
  }

  async resumeCampaign(accessToken: string, externalCampaignId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${externalCampaignId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'ACTIVE',
          access_token: accessToken
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Meta API Error resuming:', err);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error resuming campaign:', error);
      return false;
    }
  }
}
