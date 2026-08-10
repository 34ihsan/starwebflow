import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encryption';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Base64 encoded JSON

    if (!code || !state) {
      return NextResponse.redirect(new URL('/admin/social?error=missing_params', req.url));
    }

    // Decode state to get tenantId
    const statePayload = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    const tenantId = statePayload.tenantId;

    if (!tenantId) {
      return NextResponse.redirect(new URL('/admin/social?error=invalid_state', req.url));
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID || 'dummy_linkedin_client_id';
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'dummy_linkedin_client_secret';
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/platform/linkedin/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(`https://www.linkedin.com/oauth/v2/accessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[LinkedIn Auth] Token Exchange Error:', errorData);
      return NextResponse.redirect(new URL('/admin/social?error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Fetch user info to get account ID (simplified for MVP)
    let accountId = 'linked_in_default_account';
    
    // Save or Update Platform Connection
    await prisma.platformConnection.upsert({
      where: {
        tenantId_platform: {
          tenantId,
          platform: 'LINKEDIN'
        }
      },
      update: {
        accessToken: encrypt(accessToken),
        accountId: accountId,
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      create: {
        tenantId,
        platform: 'LINKEDIN',
        accessToken: encrypt(accessToken),
        accountId: accountId,
        status: 'ACTIVE'
      }
    });

    return NextResponse.redirect(new URL('/admin/social?success=linkedin_connected', req.url));
  } catch (error: any) {
    console.error('[LinkedIn Auth] Catch Error:', error);
    return NextResponse.redirect(new URL('/admin/social?error=internal_error', req.url));
  }
}
