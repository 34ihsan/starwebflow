import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJWT } from '@/modules/auth/auth.jwt';
import { getJwtSecret } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=Geçersiz bağlantı', req.url));
    }

    const magicLinkToken = await prisma.magicLinkToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!magicLinkToken) {
      return NextResponse.redirect(new URL('/auth/login?error=Geçersiz veya süresi dolmuş bağlantı', req.url));
    }

    if (magicLinkToken.used) {
      return NextResponse.redirect(new URL('/auth/login?error=Bu bağlantı daha önce kullanılmış', req.url));
    }

    if (magicLinkToken.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/auth/login?error=Bu bağlantının süresi dolmuş', req.url));
    }

    // Mark as used
    await prisma.magicLinkToken.update({
      where: { id: magicLinkToken.id },
      data: { used: true },
    });

    const user = magicLinkToken.user;

    // Create JWT Session
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    
    const jwtToken = await signJWT(payload, getJwtSecret(), 86400);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Müşteriler portalına, adminler dashbaord'a yönlendirilebilir
    const redirectUrl = user.role === 'CLIENT_MEMBER' || user.role === 'CLIENT_OWNER' 
      ? `${appUrl}/client` 
      : `${appUrl}/admin/dashboard`;

    const response = NextResponse.redirect(redirectUrl);

    // Set Session Token httpOnly Cookie
    response.cookies.set('next-auth.session-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 Day
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Magic Link Verify Error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=Bir hata oluştu', req.url));
  }
}
