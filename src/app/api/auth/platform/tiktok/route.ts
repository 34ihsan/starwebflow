import { NextResponse } from 'next/server';
import { getActiveTenantId } from '@/app/actions/social';

export async function GET() {
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appId = process.env.TIKTOK_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/platform/tiktok/callback`;
  
  if (!appId) {
    return NextResponse.json({ 
      error: 'TikTok App ID not configured',
      instructions: 'Please get App ID/Secret from TikTok Business Developer and add to .env'
    }, { status: 500 });
  }

  const state = encodeURIComponent(JSON.stringify({ tenantId }));

  const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${appId}&state=${state}&redirect_uri=${redirectUri}`;

  return NextResponse.redirect(authUrl);
}
