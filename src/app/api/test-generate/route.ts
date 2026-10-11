import { NextResponse } from 'next/server';
import { generateAIContent } from '@/app/actions/social';

export const dynamic = 'force-dynamic';

export async function GET() {
  const res = await generateAIContent({
    framework: 'PAS',
    platforms: ['linkedin'],
    topic: 'Nicin AI Agent Kullanmalisin',
    humanizerScore: 85,
    visualEngine: 'google_ai_pro'
  });
  return NextResponse.json(res);
}
