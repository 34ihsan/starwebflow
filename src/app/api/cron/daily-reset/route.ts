import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // CRON endpoint authentication
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Reset sentToday to 0 and increment warmupDay by 1 for all mailboxes in WARMUP or ACTIVE status
    const result = await prisma.emailMailbox.updateMany({
      where: {
        status: {
          in: ['WARMUP', 'ACTIVE']
        }
      },
      data: {
        sentToday: 0,
        warmupDay: { increment: 1 }
      }
    });

    console.log(`[DAILY RESET] Reset successful. ${result.count} mailboxes updated.`);

    return NextResponse.json({
      success: true,
      message: `Daily reset completed. ${result.count} mailboxes updated.`
    });

  } catch (error: any) {
    console.error('Daily Reset Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
