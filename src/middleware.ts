import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, signJWT } from './modules/auth/auth.jwt';
import { getJwtSecret } from './lib/config';

const ADMIN_PATHS = ['/admin'];
const CLIENT_PATHS = ['/client'];

// IP tabanlı istek hız sınırlayıcı (Rate Limiter)
const ipCache = new Map<string, { count: number; resetAt: number }>();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // DDoS / Brute Force Koruması (Hız Sınırlama - IP bazlı)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || '127.0.0.1';
  const currentTime = Date.now();
  const windowMs = 60 * 1000; // 1 Dakikalık pencere
  const limit = 120; // Dakikada maks 120 istek

  const state = ipCache.get(ip) || { count: 0, resetAt: currentTime + windowMs };
  if (currentTime > state.resetAt) {
    state.count = 1;
    state.resetAt = currentTime + windowMs;
  } else {
    state.count++;
  }
  ipCache.set(ip, state);

  if (state.count > limit) {
    return new NextResponse(
      JSON.stringify({ error: 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin. (Too Many Requests - 429)' }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': '60'
        } 
      }
    );
  }

  // Static files, public assets, landing page and API auth endpoints can pass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/v1/auth') ||
    pathname.startsWith('/api/v1/cron') ||
    pathname.startsWith('/api/v1/webhooks') ||
    pathname.startsWith('/api/v1/outreach') ||
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|json)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const tokenCookie = req.cookies.get('next-auth.session-token');
  const token = tokenCookie?.value;

  const isProtectedAdmin = ADMIN_PATHS.some(path => pathname.startsWith(path));
  const isProtectedClient = CLIENT_PATHS.some(path => pathname.startsWith(path));

  const secret = getJwtSecret();

  // If no token exists and path is protected, redirect to login
  if (!token) {
    if (isProtectedAdmin || isProtectedClient) {
      const loginUrl = new URL('/auth/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const payload = await verifyJWT(token, secret);

  // If token is invalid and path is protected, clear cookie and redirect
  if (!payload) {
    if (isProtectedAdmin || isProtectedClient) {
      const loginUrl = new URL('/auth/login', req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('next-auth.session-token');
      return response;
    }
    return NextResponse.next();
  }

  const role = payload.role;

  // RBAC check for Admin paths (/admin)
  if (isProtectedAdmin) {
    const hasAdminAccess = ['SUPER_ADMIN', 'AGENCY_OWNER', 'AGENCY_MEMBER'].includes(role);
    if (!hasAdminAccess) {
      // Redirect unauthorized clients to client dashboard
      const clientUrl = new URL('/client', req.url);
      return NextResponse.redirect(clientUrl);
    }
  }

  // RBAC check for Client paths (/client)
  if (isProtectedClient) {
    const hasClientAccess = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(role);
    if (!hasClientAccess) {
      // Redirect unauthorized admins to admin dashboard
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  // Silent Refresh: If token is valid but expires in less than 4 hours (14400s), extend it
  const now = Math.floor(Date.now() / 1000);
  const remainingTime = payload.exp - now;

  let response = NextResponse.next();

  if (remainingTime > 0 && remainingTime < 14400) {
    const newPayload = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      name: payload.name,
      email: payload.email
    };
    const newToken = await signJWT(newPayload, secret, 86400);

    response.cookies.set('next-auth.session-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // Extend 1 day
      path: '/'
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/v1/auth (auth routes)
     * - _next/static (static content)
     * - _next/image (images)
     * - favicon.ico (favicon)
     * - static files with common extensions
     */
    '/((?!api/v1/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|json)).*)',
  ],
};
