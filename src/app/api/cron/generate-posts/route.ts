import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIContent } from '@/app/actions/social';


export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Check authorization if needed, Vercel cron uses a bearer token
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      // In local dev we can bypass this or just check if it matches
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const now = new Date();
    // 1 to 5 hours from now
    const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const fiveHoursFromNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    // Find all IDEA posts scheduled between 1 and 5 hours from now
    const upcomingIdeas = await prisma.socialPost.findMany({
      where: {
        status: 'IDEA',
        scheduledFor: {
          gte: oneHourFromNow,
          lte: fiveHoursFromNow,
        },
      },
    });

    if (upcomingIdeas.length === 0) {
      return NextResponse.json({ message: 'No upcoming IDEA posts to generate at this time.' });
    }

    let generatedCount = 0;
    let failedCount = 0;

    for (const post of upcomingIdeas) {
      // The topic is currently stored in `content` for IDEA posts.
      const topic = post.content;
      const platformKey = post.platform.toLowerCase();
      
      const res = await generateAIContent({
        framework: 'AIDA',
        platforms: [platformKey],
        topic: topic,
        humanizerScore: 90,
      });

      const generatedContent = res.omnichannel?.[platformKey]?.content;

      if (res.success && generatedContent) {
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            content: generatedContent,
            status: 'PENDING_APPROVAL',
            aiGenerationStyle: res.model || 'gemini-cron',
            mediaUrl: res.mediaUrl || undefined,
            mediaPrompt: res.mediaPrompt || undefined,
          },
        });
        generatedCount++;
      } else {
        failedCount++;
      }
    }

    return NextResponse.json({
      message: 'JIT Generation completed.',
      generatedCount,
      failedCount,
    });
  } catch (error: any) {
    console.error('generate-posts cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
