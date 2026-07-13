export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/admin/appointments?error=google_auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/admin/appointments?error=no_code', request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${url.protocol}//${url.host}/api/v1/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error("Google Client ID/Secret eksik.");
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Code'u tokenlara çevir
    const { tokens } = await oauth2Client.getToken(code);
    
    // Geçerli tenant'ı bul (starwebflow)
    const cookieStore = cookies();
    const tenantSlug = cookieStore.get('tenant_slug')?.value ?? 'starwebflow';
    
    let tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) {
       tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
    }

    if (tenant) {
      // Refresh token'ı veya access token'ı veritabanına kaydet
      // Eğer refresh_token geldiyse her zaman sakla, gelmediyse sadece access_token sakla.
      const existingSettings = await prisma.tenantSettings.findUnique({ where: { tenantId: tenant.id } });
      const currentApiKeys = (existingSettings?.apiKeys as any) || {};

      const newGoogleCalendarKeys = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || currentApiKeys.google_calendar?.refresh_token,
        expiry_date: tokens.expiry_date
      };

      await prisma.tenantSettings.upsert({
        where: { tenantId: tenant.id },
        update: {
          apiKeys: {
            ...currentApiKeys,
            google_calendar: newGoogleCalendarKeys
          }
        },
        create: {
          tenantId: tenant.id,
          apiKeys: {
            google_calendar: newGoogleCalendarKeys
          }
        }
      });
    }

    // Başarıyla kaydettikten sonra randevular sayfasına yönlendir
    return NextResponse.redirect(new URL('/admin/appointments?success=google_connected', request.url));
  } catch (error: any) {
    console.error('Google Callback Error:', error);
    return NextResponse.redirect(new URL('/admin/appointments?error=google_callback_failed', request.url));
  }
}
