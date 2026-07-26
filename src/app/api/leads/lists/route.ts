import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/modules/auth/auth.helpers';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized or no tenant' }, { status: 401 });
    }

    const lists = await prisma.leadList.findMany({
      where: { tenantId: session.tenantId },
      include: {
        _count: {
          select: { leads: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Fetch lead lists error:', error);
    return NextResponse.json({ error: 'Failed to fetch lead lists' }, { status: 500 });
  }
}
