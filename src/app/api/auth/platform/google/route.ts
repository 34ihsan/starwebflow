import { NextResponse } from 'next/server';
import { getActiveTenantId } from '@/app/actions/social';

export async function GET() {
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/platform/google/callback`;
  
  if (!clientId) {
    return NextResponse.json({ 
      error: 'Google Ads Client ID not configured',
      instructions: 'Please get Client ID/Secret from Google Cloud Console and add to .env'
    }, { status: 500 });
  }

  const scope = 'https://www.googleapis.com/auth/adwords';
  const state = encodeURIComponent(JSON.stringify({ tenantId }));

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
