export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Uygulamanın çalışacağı adresi dinamik olarak almak için
    const url = new URL(request.url);
    const redirectUri = `${url.protocol}//${url.host}/api/v1/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google Client ID veya Secret bulunamadı (.env kontrol edin)' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Google Calendar API kapsamları
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // refresh token almak için offline şart
      prompt: 'consent', // Her seferinde refresh token vermesi için consent zorunlu
      scope: scopes,
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error: any) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
