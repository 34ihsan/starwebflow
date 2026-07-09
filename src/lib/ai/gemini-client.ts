import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── API Key Doğrulama ───────────────────────────────────────────────────────
export function getGoogleApiKey(): string {

  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key || key === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
    throw new Error(
      '[Google AI] API anahtarı eksik. .env dosyasına GOOGLE_AI_API_KEY ekleyin. ' +
      'Anahtar almak için: https://aistudio.google.com → Get API Key'
    );
  }
  return key;
}

// ─── Vercel AI SDK Uyumlu Google Provider ───────────────────────────────────
// Chat, lead scoring, içerik üretimi için kullanılır (streamText, generateText)
export function getGoogleProvider() {
  return createGoogleGenerativeAI({ apiKey: getGoogleApiKey() });
}

// Hızlı işlemler için: Chat botu, scoring
export function getFlashModel() {
  return getGoogleProvider()('gemini-1.5-flash');
}

// Karmaşık görevler için: Şirket araştırması, uzun içerik üretimi
export function getProModel() {
  return getGoogleProvider()('gemini-1.5-pro');
}

// ─── Google Generative AI SDK ────────────────────────────────────────────────
// Imagen 4 ve Veo 3.1 için kullanılır (görsel/video üretimi)
export function getGoogleGenAIClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getGoogleApiKey());
}

// ─── Model Sabitleri ─────────────────────────────────────────────────────────
export const GEMINI_MODELS = {
  FLASH: 'gemini-1.5-flash',
  PRO: 'gemini-1.5-pro',
  IMAGEN: 'imagen-4.0-generate-001',
  VEO: 'veo-3.1-generate-preview',
  VEO_FAST: 'veo-3.1-fast-generate-preview',
} as const;
