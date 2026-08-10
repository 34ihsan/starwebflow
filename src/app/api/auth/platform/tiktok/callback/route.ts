import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encryption';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authCode = searchParams.get('auth_code');
  const state = searchParams.get('state');

  if (!authCode || !state) {
    return NextResponse.json({ error: 'Missing auth_code or state' }, { status: 400 });
  }

  try {
    const { tenantId } = JSON.parse(decodeURIComponent(state));

    const appId = process.env.TIKTOK_APP_ID;
    const secret = process.env.TIKTOK_APP_SECRET;

    if (!appId || !secret) {
      throw new Error('TikTok API credentials not configured');
    }

    const tokenUrl = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        secret: secret,
        auth_code: authCode,
      })
    });

    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || 'Failed to get token');
    }

    const encryptedAccessToken = encrypt(data.data.access_token);
    // TikTok returns refresh_token as well
    const encryptedRefreshToken = data.data.refresh_token ? encrypt(data.data.refresh_token) : undefined;

    await prisma.platformConnection.upsert({
      where: {
        tenantId_platform: {
          tenantId,
          platform: 'TIKTOK',
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
        platform: 'TIKTOK',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        status: 'ACTIVE',
      }
    });

    return NextResponse.redirect(new URL('/admin/social', request.url));
  } catch (error: any) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
