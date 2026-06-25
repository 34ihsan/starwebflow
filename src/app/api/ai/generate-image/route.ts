import { NextResponse } from 'next/server';
import { getGoogleApiKey, GEMINI_MODELS } from '@/lib/ai/gemini-client';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio = '1:1', numberOfImages = 1 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 });
    }

    const apiKey = getGoogleApiKey();

    // Imagen 4 — Google REST API (v1beta)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS.IMAGEN}:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: numberOfImages,
            aspectRatio, // "1:1", "16:9", "9:16", "4:3", "3:4"
            outputOptions: { mimeType: 'image/jpeg' },
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('[Imagen 4] API Hatası:', err);
      return NextResponse.json(
        { error: `Imagen 4 hatası: ${err.error?.message || 'Bilinmeyen hata'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const images = data.predictions?.map((pred: any) => ({
      base64: pred.bytesBase64Encoded,
      mimeType: pred.mimeType || 'image/jpeg',
    }));

    return NextResponse.json({ images, model: GEMINI_MODELS.IMAGEN });
  } catch (error: any) {
    console.error('[Imagen 4] Hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
