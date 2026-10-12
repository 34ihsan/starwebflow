import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText } from 'ai';

// ─── API Key Doğrulama ───────────────────────────────────────────────────────
export function getGoogleApiKey(): string {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key || key === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
    return '';
  }
  return key;
}

// ─── Vercel AI SDK Uyumlu Google Provider ───────────────────────────────────
export function getGoogleProvider() {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    console.warn('[Google AI] GOOGLE_AI_API_KEY eksik veya tanımlanmamış. Fallback sağlayıcılar denenecek.');
  }
  return createGoogleGenerativeAI({ apiKey: apiKey || 'dummy-dev-key' });
}

// Hızlı işlemler için: Chat botu, scoring, DM Funnel, AIDA (En Bütçe Dostu)
export function getFlashModel() {
  return getGoogleProvider()('gemini-2.5-flash');
}

// Karmaşık görevler için: Derin SEO Blog, Şirket Araştırması, Titan Mode Reklam Aklı
export function getProModel() {
  return getGoogleProvider()('gemini-2.5-pro');
}

// ─── Google Generative AI SDK ────────────────────────────────────────────────
export function getGoogleGenAIClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getGoogleApiKey() || 'dummy-dev-key');
}

// ─── Model Sabitleri (Bütçe Dostu Hibrit Mimari) ──────────────────────────────
export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
  IMAGEN: 'imagen-4.0-generate-001',
  VEO: 'veo-3.1-generate-preview',
  VEO_FAST: 'veo-3.1-fast-generate-preview',
} as const;

// ─── Çoklu Sağlayıcı Emniyet Zinciri (Multi-Provider Resilient Runner) ─────────
export interface ResilientAIOptions {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  preferredModel?: 'flash' | 'pro';
}

export interface ResilientAIResult {
  text: string;
  providerUsed: 'google' | 'openrouter' | 'openai' | 'fallback';
  modelUsed: string;
}

/**
 * Sırasıyla Google Gemini -> OpenRouter (DeepSeek) -> OpenAI (GPT-4o-mini) dener.
 * Herhangi biri kota, timeout veya API hatası verirse kesintisiz bir sonrakine geçer.
 */
export async function generateTextResilient(options: ResilientAIOptions): Promise<ResilientAIResult> {
  const { prompt, system, temperature = 0.7, maxTokens, preferredModel = 'flash' } = options;

  // 1. ADIM: Google Gemini (Birincil Sağlayıcı)
  const googleKey = getGoogleApiKey();
  if (googleKey) {
    try {
      const model = preferredModel === 'pro' ? getProModel() : getFlashModel();
      const res = await generateText({
        model,
        prompt,
        system,
        temperature,
        maxTokens,
      });
      if (res.text && res.text.trim().length > 0) {
        return {
          text: res.text,
          providerUsed: 'google',
          modelUsed: preferredModel === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'
        };
      }
    } catch (err: any) {
      console.warn(`[AI Resilient Chain] Google Gemini hatası (${err.message}). 1. Fallback sağlayıcıya geçiliyor...`);
    }
  }

  // 2. ADIM: OpenRouter (DeepSeek V3 / R1) (İkincil Sağlayıcı)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey.trim().length > 0) {
    try {
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openRouterKey,
      });
      const deepseekModel = openrouter('deepseek/deepseek-chat');
      const res = await generateText({
        model: deepseekModel,
        prompt,
        system,
        temperature,
        maxTokens,
      });
      if (res.text && res.text.trim().length > 0) {
        console.log('[AI Resilient Chain] Başarıyla OpenRouter (DeepSeek) üzerinden üretildi.');
        return {
          text: res.text,
          providerUsed: 'openrouter',
          modelUsed: 'deepseek/deepseek-chat'
        };
      }
    } catch (err: any) {
      console.warn(`[AI Resilient Chain] OpenRouter hatası (${err.message}). 2. Fallback sağlayıcıya geçiliyor...`);
    }
  }

  // 3. ADIM: OpenAI (GPT-4o-mini) (Üçüncül Sağlayıcı)
  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey && openAIKey.trim().length > 0) {
    try {
      const openai = createOpenAI({
        apiKey: openAIKey,
      });
      const gptModel = openai('gpt-4o-mini');
      const res = await generateText({
        model: gptModel,
        prompt,
        system,
        temperature,
        maxTokens,
      });
      if (res.text && res.text.trim().length > 0) {
        console.log('[AI Resilient Chain] Başarıyla OpenAI (GPT-4o-mini) üzerinden üretildi.');
        return {
          text: res.text,
          providerUsed: 'openai',
          modelUsed: 'gpt-4o-mini'
        };
      }
    } catch (err: any) {
      console.warn(`[AI Resilient Chain] OpenAI hatası (${err.message}).`);
    }
  }

  // 4. ADIM: Güvenli Fallback Metni (Tüm harici servisler kapalıysa sistemin çökmesini engeller)
  console.error('[AI Resilient Chain] Tüm AI sağlayıcıları başarısız oldu veya API anahtarları tanımlanmamış.');
  return {
    text: 'Sistem şu anda yüksek talep nedeniyle yapay zeka isteğinizi işleyemedi. Lütfen biraz sonra tekrar deneyiniz.',
    providerUsed: 'fallback',
    modelUsed: 'static-fallback'
  };
}
