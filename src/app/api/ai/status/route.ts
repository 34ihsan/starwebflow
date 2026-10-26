import { NextResponse } from 'next/server';
import { OllamaProvider } from '@/lib/ai/providers/ollama';
import { OLLAMA_MODELS, isOllamaPrimary, getGoogleApiKey } from '@/lib/ai/gemini-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const ollama = new OllamaProvider();
  const health = await ollama.checkHealth();

  return NextResponse.json({
    primaryProvider: isOllamaPrimary() ? 'ollama' : 'google',
    ollama: {
      ...health,
      modelsDirectory: 'E:\\OllamaModels',
      configuredModels: OLLAMA_MODELS,
    },
    cloudProviders: {
      googleConfigured: !!getGoogleApiKey(),
      openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
      openAIConfigured: !!process.env.OPENAI_API_KEY,
    },
  });
}
