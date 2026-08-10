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

    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/platform/meta/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Meta API credentials not configured');
    }

    // 1. Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) throw new Error(tokenData.error?.message || 'Failed to get token');

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange short-lived token for long-lived token
    const longTokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
    const longTokenRes = await fetch(longTokenUrl);
    const longTokenData = await longTokenRes.json();

    if (!longTokenRes.ok) throw new Error(longTokenData.error?.message || 'Failed to get long-lived token');

    const longLivedToken = longTokenData.access_token;

    // 3. Encrypt and store in DB
    const encryptedToken = encrypt(longLivedToken);

    await prisma.platformConnection.upsert({
      where: {
        tenantId_platform: {
          tenantId,
          platform: 'META',
        }
      },
      update: {
        accessToken: encryptedToken,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        platform: 'META',
        accessToken: encryptedToken,
        status: 'ACTIVE',
      }
    });

    // 4. Redirect back to dashboard
    return NextResponse.redirect(new URL('/admin/social', request.url));
  } catch (error: any) {
    console.error('Meta OAuth callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
