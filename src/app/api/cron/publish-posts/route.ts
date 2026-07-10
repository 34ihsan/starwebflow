import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publishSocialPost } from '@/app/actions/social';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Cron Yetkilendirmesi (Opsiyonel ama önerilir, örn Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Zamanı gelmiş, onaylanmış (SCHEDULED) postları bul
    const now = new Date();
    
    const postsToPublish = await prisma.socialPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now
        }
      },
      take: 10 // Her cron çalışmasında max 10 post (Timeout önlemi)
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Yayınlanacak gönderi bulunamadı.' 
      });
    }

    const results = [];

    // 3. Postları yayınla
    for (const post of postsToPublish) {
      // publishSocialPost metodu postu 'published' veya 'FAILED' olarak güncelliyor.
      const res = await publishSocialPost(post.id);
      results.push({ id: post.id, platform: post.platform, success: res.success, error: res.error });
    }

    return NextResponse.json({
      success: true,
      publishedCount: postsToPublish.length,
      results
    });

  } catch (error: any) {
    console.error('Publish Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
