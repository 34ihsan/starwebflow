export interface AdCampaignMetric {
  externalId: string;
  spend: number;
  roas: number;
  reach: number;
  cpa: number;
  ctr: number;
  hookRate?: number;
  status: string; // 'ACTIVE', 'PAUSED', etc.
}

export interface AdPlatformAdapter {
  platformName: string;
  
  /**
   * Fetch all campaigns and their metrics for a given account
   */
  getCampaigns(accessToken: string, accountId: string): Promise<AdCampaignMetric[]>;

  /**
   * Pause a campaign on the platform
   */
  pauseCampaign(accessToken: string, externalCampaignId: string, platformSpecificId?: string): Promise<boolean>;

  /**
   * Resume/start a campaign on the platform
   */
  resumeCampaign(accessToken: string, externalCampaignId: string, platformSpecificId?: string): Promise<boolean>;
}
