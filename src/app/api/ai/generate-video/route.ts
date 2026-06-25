import { NextResponse } from 'next/server';
import { getGoogleApiKey, GEMINI_MODELS } from '@/lib/ai/gemini-client';

export const maxDuration = 60;

// POST: Video üretimini başlat → operation name döner
export async function POST(req: Request) {
  try {
    const {
      prompt,
      aspectRatio = '16:9',    // "16:9" | "9:16"
      duration = 8,             // saniye: 5-8
      fast = false,             // true = hızlı ama düşük kalite
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 });
    }

    const apiKey = getGoogleApiKey();
    const model = fast ? GEMINI_MODELS.VEO_FAST : GEMINI_MODELS.VEO;

    // Veo 3.1 — Asenkron başlatma (2-3 dakika sürer)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            aspectRatio,
            durationSeconds: duration,
            includeRaiReason: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('[Veo 3.1] Başlatma Hatası:', err);
      return NextResponse.json(
        { error: `Veo 3.1 hatası: ${err.error?.message || 'Bilinmeyen hata'}` },
        { status: response.status }
      );
    }

    const operation = await response.json();
    // Dönen: { name: "operations/xxx", done: false }
    return NextResponse.json({
      operationId: operation.name,
      status: 'PROCESSING',
      model,
      message: 'Video üretimi başlatıldı. Tamamlanması 2-3 dakika sürebilir.',
    });
  } catch (error: any) {
    console.error('[Veo 3.1] Hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: ?operationId=... → Durum sorgulama
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const operationId = searchParams.get('operationId');

    if (!operationId) {
      return NextResponse.json({ error: 'operationId gerekli' }, { status: 400 });
    }

    const apiKey = getGoogleApiKey();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationId}`,
      {
        headers: { 'x-goog-api-key': apiKey },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: `Durum sorgulama hatası: ${err.error?.message}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (!result.done) {
      return NextResponse.json({ status: 'PROCESSING', operationId });
    }

    // Tamamlandı — video URL'si
    const videoUri = result.response?.predictions?.[0]?.videoUri;
    return NextResponse.json({
      status: 'COMPLETED',
      videoUrl: videoUri,
      operationId,
    });
  } catch (error: any) {
    console.error('[Veo 3.1] Durum Hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
