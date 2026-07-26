import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id'); // EmailLog ID
  const targetUrl = searchParams.get('url'); // Where to redirect
  
  if (!targetUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  if (id) {
    try {
      // 1. Try to find and update EmailLog
      const emailLog = await prisma.emailLog.findUnique({
        where: { id }
      });
      
      if (emailLog) {
        // Update clickedAt if not already set, or just log the event
        if (!emailLog.clickedAt) {
          await prisma.emailLog.update({
            where: { id },
            data: { 
              clickedAt: new Date(),
              openedAt: emailLog.openedAt || new Date(), // If they clicked, they definitely opened it
              status: 'DELIVERED'
            }
          });
          
          // Also update OutreachItem if linked
          if (emailLog.outreachItemId) {
            await prisma.outreachItem.update({
              where: { id: emailLog.outreachItemId },
              data: { 
                clickedAt: new Date(),
                openedAt: emailLog.openedAt || new Date(),
                status: 'DELIVERED'
              }
            });
          }
        }
        
        // Always create a Tracking Log for every click event
        await prisma.emailTrackingLog.create({
          data: {
            emailLogId: id,
            action: 'CLICK',
            url: targetUrl,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
          }
        });
      }
    } catch (error) {
      console.error('[Email Tracking] Error recording click:', error);
    }
  }

  // Redirect to the actual URL
  return NextResponse.redirect(targetUrl, 302);
}
