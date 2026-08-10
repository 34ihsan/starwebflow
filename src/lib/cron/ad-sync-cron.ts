import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/utils/encryption';
import { MetaAdapter } from '@/lib/integrations/ads/MetaAdapter';
import { GoogleAdsAdapter } from '@/lib/integrations/ads/GoogleAdsAdapter';
import { TikTokAdsAdapter } from '@/lib/integrations/ads/TikTokAdsAdapter';
import { LinkedInAdsAdapter } from '@/lib/integrations/ads/LinkedInAdsAdapter';
import { AdCampaignMetric } from '@/lib/integrations/ads/AdsAdapter';

/**
 * Runs periodically to sync Ad Campaign data from external platforms (Meta, etc.)
 * into our local database.
 */
export async function syncAllAdCampaigns() {
  console.log('[AdSync] Starting synchronization...');

  // 1. Fetch all ACTIVE platform connections
  const connections = await prisma.platformConnection.findMany({
    where: { status: 'ACTIVE' },
  });

  console.log(`[AdSync] Found ${connections.length} active connections.`);

  const metaAdapter = new MetaAdapter();
  const googleAdapter = new GoogleAdsAdapter();
  const tiktokAdapter = new TikTokAdsAdapter();
  const linkedinAdapter = new LinkedInAdsAdapter();

  for (const connection of connections) {
    let metrics: AdCampaignMetric[] = [];
    let platformName = '';

    try {
      const accessToken = decrypt(connection.accessToken);
      const accountId = connection.accountId || "1234567890"; // Fallback to dummy ID if missing for demo

      if (connection.platform === 'META') {
        platformName = 'Meta (Instagram/FB)';
        metrics = await metaAdapter.getCampaigns(accessToken, accountId);
      } else if (connection.platform === 'GOOGLE') {
        platformName = 'Google Ads';
        metrics = await googleAdapter.getCampaigns(accessToken, accountId);
      } else if (connection.platform === 'TIKTOK') {
        platformName = 'TikTok Ads';
        metrics = await tiktokAdapter.getCampaigns(accessToken, accountId);
      } else if (connection.platform === 'LINKEDIN') {
        platformName = 'LinkedIn Ads';
        metrics = await linkedinAdapter.getCampaigns(accessToken, accountId);
      } else {
        continue;
      }

      // Update local database with external metrics
      for (const metric of metrics) {
        const existingCampaign = await prisma.adCampaign.findFirst({
          where: {
            tenantId: connection.tenantId,
            platform: platformName,
            externalId: metric.externalId,
          }
        });

        if (existingCampaign) {
          await prisma.adCampaign.update({
            where: { id: existingCampaign.id },
            data: {
              status: metric.status,
              spend: metric.spend,
              roas: metric.roas,
              reach: metric.reach,
              cpa: metric.cpa,
              ctr: metric.ctr,
              hookRate: metric.hookRate,
              updatedAt: new Date(),
            }
          });
        } else {
          // New campaign discovered on platform, optionally import it
          await prisma.adCampaign.create({
            data: {
              tenantId: connection.tenantId,
              name: `${platformName.split(' ')[0]} Campaign ${metric.externalId}`, 
              platform: platformName,
              externalId: metric.externalId,
              platformAccountId: accountId,
              status: metric.status,
              spend: metric.spend,
              roas: metric.roas,
              reach: metric.reach,
              cpa: metric.cpa,
              ctr: metric.ctr,
              hookRate: metric.hookRate,
              isAiManaged: false, 
            }
          });
        }
      }
      
      console.log(`[AdSync] Synced ${metrics.length} campaigns for Tenant ${connection.tenantId} via ${connection.platform}`);
    } catch (error) {
      console.error(`[AdSync] Failed to sync ${connection.platform} for Tenant ${connection.tenantId}:`, error);
    }
  }

  console.log('[AdSync] Synchronization complete.');
}
