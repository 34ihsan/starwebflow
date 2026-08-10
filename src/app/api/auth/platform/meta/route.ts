import { NextResponse } from 'next/server';
import { getActiveTenantId } from '@/app/actions/social';

export async function GET() {
  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.META_CLIENT_ID;
  // Fallback url for local dev if NEXT_PUBLIC_APP_URL is missing
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/platform/meta/callback`;
  
  if (!clientId) {
    // Return a descriptive error if dev hasn't set up the Meta App yet
    return NextResponse.json({ 
      error: 'Meta Client ID not configured',
      instructions: 'Please create a Meta App, get Client ID/Secret, and add to .env'
    }, { status: 500 });
  }

  const scope = 'ads_management,ads_read,read_insights';
  const state = encodeURIComponent(JSON.stringify({ tenantId }));

  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
