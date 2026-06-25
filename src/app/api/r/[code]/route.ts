import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    // 1. Find the link
    const link = await prisma.linkTracking.findUnique({
      where: { code }
    });

    if (!link) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. Setup/Read Visitor Cookie
    const cookieStore = cookies();
    let visitorId = cookieStore.get('swf_visitor_id')?.value;
    
    // If first time clicking a link, generate a visitor ID
    if (!visitorId) {
      visitorId = uuidv4();
    }

    // 3. Record the click
    // Fire and forget (don't block the redirect)
    prisma.$transaction([
      prisma.linkClick.create({
        data: {
          linkId: link.id,
          visitorId,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
        }
      }),
      prisma.linkTracking.update({
        where: { id: link.id },
        data: { clicksCount: { increment: 1 } }
      })
    ]).catch(err => console.error('Error recording link click:', err));

    // 4. Construct destination URL with UTMs
    const destUrl = new URL(link.originalUrl);
    if (link.utmSource && !destUrl.searchParams.has('utm_source')) destUrl.searchParams.set('utm_source', link.utmSource);
    if (link.utmMedium && !destUrl.searchParams.has('utm_medium')) destUrl.searchParams.set('utm_medium', link.utmMedium);
    if (link.utmCampaign && !destUrl.searchParams.has('utm_campaign')) destUrl.searchParams.set('utm_campaign', link.utmCampaign);

    // 5. Build response and set cookie
    const response = NextResponse.redirect(destUrl);
    
    // Set 1 year cookie
    response.cookies.set('swf_visitor_id', visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });

    return response;
  } catch (error) {
    console.error('Redirect Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
