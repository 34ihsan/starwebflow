import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const bulkOutreach = await prisma.bulkOutreach.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!bulkOutreach) {
      return NextResponse.json({ success: false, error: 'Bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bulkOutreach });
  } catch (error: any) {
    console.error('Status Check Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
