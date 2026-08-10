import { NextResponse } from 'next/server';
import { getActiveTenantId } from '@/app/actions/social';

export async function GET() {
  try {
    const tenantId = await getActiveTenantId();
    const clientId = process.env.LINKEDIN_CLIENT_ID || 'dummy_linkedin_client_id';
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/platform/linkedin/callback`;
    
    // In a real scenario, state should be a securely generated token or JWT mapped to tenantId in Redis/DB
    const state = Buffer.from(JSON.stringify({ tenantId })).toString('base64');
    const scope = 'r_ads r_ads_reporting w_organization_social rw_ads'; // Required scopes for ads API

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
