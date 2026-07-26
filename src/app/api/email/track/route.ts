import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1x1 transparent PNG pixel
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id'); // EmailLog ID
  
  if (id) {
    try {
      // 1. Try to find and update EmailLog
      const emailLog = await prisma.emailLog.findUnique({
        where: { id }
      });
      
      if (emailLog) {
        // Update openedAt if not already set
        if (!emailLog.openedAt) {
          await prisma.emailLog.update({
            where: { id },
            data: { openedAt: new Date(), status: 'DELIVERED' } // If opened, it was definitely delivered
          });
          
          // Also update OutreachItem if linked
          if (emailLog.outreachItemId) {
            await prisma.outreachItem.update({
              where: { id: emailLog.outreachItemId },
              data: { openedAt: new Date(), status: 'DELIVERED' }
            });
          }
        }
        
        // Always create a Tracking Log for every open event (to see multiple opens)
        await prisma.emailTrackingLog.create({
          data: {
            emailLogId: id,
            action: 'OPEN',
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
          }
        });
      }
    } catch (error) {
      console.error('[Email Tracking] Error recording open:', error);
    }
  }

  // Always return the transparent pixel quickly
  return new NextResponse(TRANSPARENT_PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': TRANSPARENT_PIXEL.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
