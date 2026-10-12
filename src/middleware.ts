import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, signJWT } from './modules/auth/auth.jwt';
import { getJwtSecret } from './lib/config';
import { isMaliciousBot, isMaliciousPath, hasInjectionPayload } from './lib/security';

const ADMIN_PATHS = ['/admin'];
const CLIENT_PATHS = ['/client'];

// IP tabanlı kademeli istek hız sınırlayıcı (Multi-tier Rate Limiter)
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Yanıtlara kurumsal düzeyde HTTP Güvenlik Başlıklarını (Enterprise Security Headers) enjekte eder.
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  // =========================================================================
  // 1. KATMAN: SİSTEM AÇIĞI TARAMA & PATH TRAVERSAL KALKANI (WAF Probe Shield)
  // =========================================================================
  if (isMaliciousPath(pathname)) {
    console.warn(`[WAF PROBE BLOCKED] IP: ${ip} | Path: ${pathname} | UA: ${userAgent}`);
    return applySecurityHeaders(
      new NextResponse(
        JSON.stringify({
          error: 'Erişim Engellendi: Güvenlik politikası ihlali tespit edildi. (403 Forbidden)',
          status: 403,
          code: 'PROBE_ATTEMPT_BLOCKED'
        }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          } 
        }
      )
    );
  }

  // =========================================================================
  // 2. KATMAN: ZARARLI BOT & OTOMATİK AÇIK TARAYICI ENGELLEYİCİ (WAF Bot Shield)
  // =========================================================================
  if (isMaliciousBot(userAgent)) {
    console.warn(`[WAF BOT BLOCKED] IP: ${ip} | UA: ${userAgent} | Path: ${pathname}`);
    return applySecurityHeaders(
      new NextResponse(
        JSON.stringify({
          error: 'Erişim Engellendi: Otomatik güvenlik açığı tarayıcısı veya yetkisiz bot tespit edildi. (403 Forbidden)',
          status: 403,
          code: 'MALICIOUS_BOT_BLOCKED'
        }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          } 
        }
      )
    );
  }

  // =========================================================================
  // 3. KATMAN: URL & QUERY INJECTION KALKANI (SQLi, RCE, XSS Tespiti)
  // =========================================================================
  if (search && hasInjectionPayload(search)) {
    console.warn(`[WAF INJECTION BLOCKED] IP: ${ip} | Query: ${search} | Path: ${pathname}`);
    return applySecurityHeaders(
      new NextResponse(
        JSON.stringify({
          error: 'Erişim Engellendi: Geçersiz veya zararlı sorgu parametresi. (403 Forbidden)',
          status: 403,
          code: 'INJECTION_PAYLOAD_DETECTED'
        }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          } 
        }
      )
    );
  }

  // =========================================================================
  // 4. KATMAN: KADEMELİ HIZ SINIRLAMASI (Multi-Tier Rate Limiting & Anti-Brute-Force)
  // =========================================================================
  const isRscRequest = req.headers.has('RSC') || req.nextUrl.searchParams.has('_rsc');

  if (!isRscRequest) {
    const currentTime = Date.now();
    const windowMs = 60 * 1000; // 1 Dakikalık pencere

    // İstek tipine göre kademeli eşik değerleri
    let tierKey = 'gen:';
    let tierLimit = 800; // Standart gezinme (Next.js link prefetchleri için esnek)

    const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/api/v1/auth');
    const isFormRoute = pathname.startsWith('/api/email/contact') || 
                        pathname.startsWith('/api/audit') || 
                        pathname.startsWith('/api/client/ai-support') ||
                        pathname.startsWith('/api/chat');

    if (isAuthRoute) {
      tierKey = 'auth:';
      tierLimit = 12; // Dakikada maks 12 oturum açma / şifre denemesi (Brute-Force kilidi)
    } else if (isFormRoute) {
      tierKey = 'form:';
      tierLimit = 25; // Dakikada maks 25 form / AI chat isteği (Spam kilidi)
    }

    const rateKey = `${tierKey}${ip}`;
    const state = rateLimitCache.get(rateKey) || { count: 0, resetAt: currentTime + windowMs };

    if (currentTime > state.resetAt) {
      state.count = 1;
      state.resetAt = currentTime + windowMs;
    } else {
      state.count++;
    }
    rateLimitCache.set(rateKey, state);

    // Bellek temizliği (Garbage collection) - 3000 anahtarı geçerse süresi dolanları temizle
    if (rateLimitCache.size > 3000) {
      for (const [key, val] of rateLimitCache.entries()) {
        if (currentTime > val.resetAt) {
          rateLimitCache.delete(key);
        }
      }
    }

    if (state.count > tierLimit) {
      const waitSeconds = Math.max(1, Math.ceil((state.resetAt - currentTime) / 1000));
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({ 
            error: isAuthRoute 
              ? 'Güvenlik Uyarısı: Çok fazla ardışık oturum açma denemesi. Lütfen bir süre bekleyin.' 
              : 'Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin. (Too Many Requests - 429)',
            retryAfterSeconds: waitSeconds 
          }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json; charset=utf-8',
              'Retry-After': String(waitSeconds)
            } 
          }
        )
      );
    }
  }

  // =========================================================================
  // 5. KATMAN: STATİK DOSYALAR & GENEL ERİŞİMLİ YOLLAR
  // =========================================================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/v1/auth') ||
    pathname.startsWith('/api/v1/cron') ||
    pathname.startsWith('/api/v1/webhooks') ||
    pathname.startsWith('/api/v1/outreach') ||
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|json|txt|xml|webmanifest)$/i.test(pathname)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // =========================================================================
  // 6. KATMAN: RBAC VE OTURUM KORUMASI (Protected Routes: /admin, /client)
  // =========================================================================
  const tokenCookie = req.cookies.get('next-auth.session-token');
  const token = tokenCookie?.value;

  const isProtectedAdmin = ADMIN_PATHS.some(path => pathname.startsWith(path));
  const isProtectedClient = CLIENT_PATHS.some(path => pathname.startsWith(path));

  const secret = getJwtSecret();

  // Token yoksa ve korumalı alansa -> Giriş sayfasına yönlendir
  if (!token) {
    if (isProtectedAdmin || isProtectedClient) {
      const loginUrl = new URL('/auth/login', req.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  const payload = await verifyJWT(token, secret);

  // Token geçersizse çerezi temizle ve yönlendir
  if (!payload) {
    if (isProtectedAdmin || isProtectedClient) {
      const loginUrl = new URL('/auth/login', req.url);
      const response = applySecurityHeaders(NextResponse.redirect(loginUrl));
      response.cookies.delete('next-auth.session-token');
      return response;
    }
    return applySecurityHeaders(NextResponse.next());
  }

  const role = payload.role;

  // Admin rotaları için RBAC kontrolü (/admin)
  if (isProtectedAdmin) {
    const hasAdminAccess = ['SUPER_ADMIN', 'AGENCY_OWNER', 'AGENCY_MEMBER'].includes(role);
    if (!hasAdminAccess) {
      const clientUrl = new URL('/client', req.url);
      return applySecurityHeaders(NextResponse.redirect(clientUrl));
    }
  }

  // Client rotaları için RBAC kontrolü (/client)
  if (isProtectedClient) {
    const hasClientAccess = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(role);
    if (!hasClientAccess) {
      const adminUrl = new URL('/admin', req.url);
      return applySecurityHeaders(NextResponse.redirect(adminUrl));
    }
  }

  // Silent Refresh: Token geçerli ancak süresi 4 saatten az kaldıysa (14400s), 1 gün uzat
  const now = Math.floor(Date.now() / 1000);
  const remainingTime = payload.exp - now;

  let response = applySecurityHeaders(NextResponse.next());

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
     * - _next/static (static content)
     * - _next/image (images)
     * - favicon.ico (favicon)
     * - static files with common image/font extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|webmanifest)).*)',
  ],
};
