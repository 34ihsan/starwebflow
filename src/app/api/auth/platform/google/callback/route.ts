import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encryption';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    const { tenantId } = JSON.parse(decodeURIComponent(state));

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/platform/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google Ads API credentials not configured');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await response.json();

    if (!response.ok) throw new Error(tokenData.error_description || 'Failed to get token');

    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : undefined;

    await prisma.platformConnection.upsert({
      where: {
        tenantId_platform: {
          tenantId,
          platform: 'GOOGLE',
        }
      },
      update: {
        accessToken: encryptedAccessToken,
        ...(encryptedRefreshToken && { refreshToken: encryptedRefreshToken }),
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        platform: 'GOOGLE',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        status: 'ACTIVE',
      }
    });

    return NextResponse.redirect(new URL('/admin/social', request.url));
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
