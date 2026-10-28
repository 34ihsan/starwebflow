import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { cleanModelOutput, parseHybridToolCalls } from './providers/ollama';

// ─── API Key & Sağlayıcı Doğrulama ───────────────────────────────────────────
export function getGoogleApiKey(): string {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key || key === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
    return '';
  }
  return key;
}

export function getOllamaBaseUrl(): string {
  return (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
}

export function isOllamaPrimary(): boolean {
  const mode = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
  return mode === 'ollama' || mode === 'local' || !getGoogleApiKey();
}

export function isAiConfigured(): boolean {
  return process.env.OLLAMA_ENABLED !== 'false' || !!getGoogleApiKey();
}

// ─── Yerel Ollama Görev Odaklı Modeller ──────────────────────────────────────
export const OLLAMA_MODELS = {
  AGENT: process.env.OLLAMA_AGENT_MODEL || 'starwebflow-agent:latest',
  AUTOMATION: process.env.OLLAMA_AUTOMATION_MODEL || 'starwebflow-automation:latest',
  WEBDEV: process.env.OLLAMA_WEBDEV_MODEL || 'starwebflow-webdev:latest',
  GROWTH: process.env.OLLAMA_GROWTH_MODEL || 'starwebflow-growth:latest',
  ADMIN: process.env.OLLAMA_ADMIN_MODEL || 'starwebflow-admin:latest',
  FLASH: process.env.OLLAMA_FLASH_MODEL || 'starwebflow-agent:latest',
  PRO: process.env.OLLAMA_PRO_MODEL || 'starwebflow-growth:latest',
  CODER: process.env.OLLAMA_CODER_MODEL || 'starwebflow-webdev:latest',
  FAST_LIGHT: 'qwen2.5:1.5b',
  EMBED: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text:latest',
} as const;

export type StarWebflowAiDomain = 'agent' | 'automation' | 'webdev' | 'growth' | 'admin' | 'flash' | 'pro' | 'coder';

let cachedInstalledModels: string[] | null = null;
let lastModelCheckTime = 0;

/**
 * Sunucuda (Ollama) halihazırda yüklü olan tüm modelleri dinamik olarak listeler.
 */
export async function getInstalledOllamaModels(): Promise<string[]> {
  const now = Date.now();
  if (cachedInstalledModels && now - lastModelCheckTime < 60000) {
    return cachedInstalledModels;
  }
  try {
    const baseUrl = getOllamaBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    const models = (data.models || []).map((m: any) => m.name || m.model);
    cachedInstalledModels = models;
    lastModelCheckTime = now;
    return models;
  } catch {
    return cachedInstalledModels || [];
  }
}

/**
 * Sunucuda bulunan modeller arasından en uygun ve hızlı olanı akıllıca seçer.
 * Öncelik Sırası:
 * 1. starwebflow-agent
 * 2. starwebflow
 * 3. qwen2.5 (hızlı & Türkçe/Almanca/İngilizce kusursuz)
 * 4. llama3.2 / llama3
 * 5. mistral
 * 6. Sunucudaki ilk mevcut model
 */
export async function resolveBestAvailableModel(preferred = 'starwebflow-agent:latest'): Promise<string> {
  const installed = await getInstalledOllamaModels();
  if (!installed || installed.length === 0) {
    return preferred;
  }

  // 1. Tam veya kısmi eşleşme kontrolü
  const matchPreferred = installed.find((m) => m === preferred || m.startsWith(preferred.split(':')[0]));
  if (matchPreferred) return matchPreferred;

  // 2. starwebflow modelleri
  const starwebflowMatch = installed.find((m) => m.includes('starwebflow'));
  if (starwebflowMatch) return starwebflowMatch;

  // 3. Hafif ve zeki açık kaynak modeller
  const qwenMatch = installed.find((m) => m.includes('qwen'));
  if (qwenMatch) return qwenMatch;

  const llamaMatch = installed.find((m) => m.includes('llama3') || m.includes('llama'));
  if (llamaMatch) return llamaMatch;

  const mistralMatch = installed.find((m) => m.includes('mistral'));
  if (mistralMatch) return mistralMatch;

  // 4. Sunucudaki ilk model
  return installed[0] || preferred;
}

export function getOllamaProvider() {
  return createOpenAI({
    baseURL: `${getOllamaBaseUrl()}/v1`,
    apiKey: 'ollama',
    compatibility: 'compatible',
  });
}

export function getOllamaFlashModel() {
  return getOllamaProvider()(OLLAMA_MODELS.FLASH);
}

export function getOllamaProModel() {
  return getOllamaProvider()(OLLAMA_MODELS.PRO);
}

export function getOllamaCoderModel() {
  return getOllamaProvider()(OLLAMA_MODELS.CODER);
}

// ─── Vercel AI SDK Uyumlu Google Provider ───────────────────────────────────
export function getGoogleProvider() {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    console.warn('[Google AI] GOOGLE_AI_API_KEY eksik veya tanımlanmamış. Yerel Ollama / Fallback sağlayıcılar kullanılacak.');
  }
  return createGoogleGenerativeAI({ apiKey: apiKey || 'dummy-dev-key' });
}

// ─── 4 Ana Alan İçin Uzmanlaşmış Model Seçiciler ─────────────────────────────

/**
 * 1. AI Agents (7/24 Çok Dilli TR/DE/EN Satış & Müşteri Destek Ajanı, Tool Calling)
 */
export function getAgentModel(modelName?: string) {
  if (isOllamaPrimary()) {
    return getOllamaProvider()(modelName || OLLAMA_MODELS.AGENT);
  }
  return getGoogleProvider()('gemini-2.5-flash');
}

/**
 * 2. AI Automation (Titan Mode İş Akışı JSON, Lead Zenginleştirme, Skorlama, Webhook)
 */
export function getAutomationModel() {
  if (isOllamaPrimary()) {
    return getOllamaProvider()(OLLAMA_MODELS.AUTOMATION);
  }
  return getGoogleProvider()('gemini-2.5-flash');
}

/**
 * 3. Web App & Web Geliştirme (Next.js Mimari, Lastenheft/Pflichtenheft, Sözleşme & Kod)
 */
export function getWebDevModel() {
  if (isOllamaPrimary()) {
    return getOllamaProvider()(OLLAMA_MODELS.WEBDEV);
  }
  return getGoogleProvider()('gemini-2.5-pro');
}

/**
 * 4. Growth & Pazarlama (CRO Denetimi, SEO Blog, Cold Email, Sosyal Medya, ROAS Reklam)
 */
export function getGrowthModel() {
  if (isOllamaPrimary()) {
    return getOllamaProvider()(OLLAMA_MODELS.GROWTH);
  }
  return getGoogleProvider()('gemini-2.5-pro');
}

/**
 * 5. Admin Panel & Operasyonlar (CRM Teklif/E-posta, Deliverability & Spam Analizi, Warmup, Yorum Analizi, AI Studio)
 */
export function getAdminModel() {
  if (isOllamaPrimary()) {
    return getOllamaProvider()(OLLAMA_MODELS.ADMIN);
  }
  return getGoogleProvider()('gemini-2.5-flash');
}

// Hızlı işlemler için genel model seçici
export function getFlashModel() {
  if (isOllamaPrimary()) {
    return getOllamaFlashModel();
  }
  return getGoogleProvider()('gemini-2.5-flash');
}

// Kapsamlı işlemler için genel model seçici
export function getProModel() {
  if (isOllamaPrimary()) {
    return getOllamaProModel();
  }
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

export { cleanModelOutput, parseHybridToolCalls };

/**
 * Repairs slightly truncated JSON or trailing commas emitted by local 1.5B/3B models.
 */
function repairTruncatedJson(candidate: string): string {
  let str = candidate.trim().replace(/,\s*([\]}])/g, '$1');
  try {
    JSON.parse(str);
    return str;
  } catch {
    // Attempt to balance unclosed quotes, brackets, and braces
    let inString = false;
    let escape = false;
    const stack: string[] = [];

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if (ch === '}' || ch === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === ch) {
            stack.pop();
          }
        }
      }
    }

    if (inString) str += '"';
    str = str.replace(/,\s*$/, '');
    while (stack.length > 0) {
      str += stack.pop();
    }
    return str;
  }
}

/**
 * Metin içerisindeki JSON nesnesini veya dizisini (markdown ```json blokları dahil) güvenli şekilde ayıklar.
 */
export function extractJsonFromText(rawText: string): string {
  const cleaned = cleanModelOutput(rawText)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const lastBracket = cleaned.lastIndexOf(']');
    const slice = lastBracket > firstBracket ? cleaned.slice(firstBracket, lastBracket + 1) : cleaned.slice(firstBracket);
    return repairTruncatedJson(slice);
  }

  if (firstBrace !== -1) {
    const lastBrace = cleaned.lastIndexOf('}');
    const slice = lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned.slice(firstBrace);
    return repairTruncatedJson(slice);
  }

  return repairTruncatedJson(cleaned);
}

// ─── Çoklu Sağlayıcı Emniyet Zinciri (Multi-Provider Resilient Runner) ─────────
export interface ResilientAIOptions {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  preferredModel?: StarWebflowAiDomain;
}

export interface ResilientAIResult {
  text: string;
  providerUsed: 'ollama' | 'google' | 'openrouter' | 'openai' | 'fallback';
  modelUsed: string;
}

function resolveOllamaModelByDomain(domain: StarWebflowAiDomain = 'flash'): string {
  switch (domain) {
    case 'agent':
      return OLLAMA_MODELS.AGENT;
    case 'automation':
      return OLLAMA_MODELS.AUTOMATION;
    case 'webdev':
    case 'coder':
      return OLLAMA_MODELS.WEBDEV;
    case 'growth':
    case 'pro':
      return OLLAMA_MODELS.GROWTH;
    case 'admin':
      return OLLAMA_MODELS.ADMIN;
    default:
      return OLLAMA_MODELS.FLASH;
  }
}

async function tryOllamaGeneration(options: ResilientAIOptions): Promise<ResilientAIResult | null> {
  if (process.env.OLLAMA_ENABLED === 'false') return null;
  const { prompt, system, temperature = 0.3, maxTokens, preferredModel = 'flash' } = options;
  const modelName = resolveOllamaModelByDomain(preferredModel);

  try {
    const model = getOllamaProvider()(modelName);
    const res = await generateText({
      model,
      prompt,
      system,
      temperature,
      maxTokens,
    });
    const cleaned = cleanModelOutput(res.text || '');
    if (cleaned.length > 0) {
      return {
        text: cleaned,
        providerUsed: 'ollama',
        modelUsed: modelName,
      };
    }
  } catch (err: any) {
    console.warn(`[AI Resilient Chain] Yerel Ollama (${modelName}) hatası (${err.message}). Alternatif sağlayıcıya geçiliyor...`);
  }
  return null;
}

/**
 * AI_PROVIDER ayarına göre Yerel Ollama (E:\OllamaModels) <-> Google Gemini -> OpenRouter -> OpenAI
 * sırasıyla çalışır. Herhangi biri hata verirse kesintisiz bir sonrakine geçer.
 */
export async function generateTextResilient(options: ResilientAIOptions): Promise<ResilientAIResult> {
  const { prompt, system, temperature = 0.4, maxTokens, preferredModel = 'flash' } = options;

  // 0. ADIM: Eğer birincil sağlayıcı Yerel Ollama ise önce onu dene
  if (isOllamaPrimary()) {
    const ollamaRes = await tryOllamaGeneration(options);
    if (ollamaRes) return ollamaRes;
  }

  // 1. ADIM: Google Gemini
  const googleKey = getGoogleApiKey();
  if (googleKey) {
    try {
      const isPro = preferredModel === 'pro' || preferredModel === 'webdev' || preferredModel === 'growth';
      const model = isPro ? getGoogleProvider()('gemini-2.5-pro') : getGoogleProvider()('gemini-2.5-flash');
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
          modelUsed: isPro ? 'gemini-2.5-pro' : 'gemini-2.5-flash'
        };
      }
    } catch (err: any) {
      console.warn(`[AI Resilient Chain] Google Gemini hatası (${err.message}). Fallback sağlayıcıya geçiliyor...`);
    }
  }

  // 2. ADIM: Eğer birincil sağlayıcı bulut idiyse ve hata verdiyse Yerel Ollama'ya (E:\OllamaModels) düş
  if (!isOllamaPrimary()) {
    const ollamaFallback = await tryOllamaGeneration(options);
    if (ollamaFallback) return ollamaFallback;
  }

  // 3. ADIM: OpenRouter (DeepSeek V3 / R1)
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
        return {
          text: cleanModelOutput(res.text),
          providerUsed: 'openrouter',
          modelUsed: 'deepseek/deepseek-chat'
        };
      }
    } catch (err: any) {
      console.warn(`[AI Resilient Chain] OpenRouter hatası (${err.message}). Sonraki sağlayıcıya geçiliyor...`);
    }
  }

  // 4. ADIM: OpenAI (GPT-4o-mini)
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

  // 5. ADIM: Güvenli Fallback Metni
  console.error('[AI Resilient Chain] Tüm AI sağlayıcıları başarısız oldu.');
  return {
    text: 'Sistem şu anda yüksek talep nedeniyle yapay zeka isteğinizi işleyemedi. Lütfen biraz sonra tekrar deneyiniz.',
    providerUsed: 'fallback',
    modelUsed: 'static-fallback'
  };
}

/**
 * Hem yerel Ollama modellerinde hem de bulut modellerde %100 kararlı JSON / Zod şema üretimi sağlar.
 * generateObject başarısız olursa metin tabanlı JSON ayıklama (extractJsonFromText) ile otomatik kurtarır.
 */
export async function generateJsonResilient<T>({
  prompt,
  system,
  schema,
  domain = 'automation',
}: {
  prompt: string;
  system?: string;
  schema: z.ZodType<T>;
  domain?: StarWebflowAiDomain;
}): Promise<T> {
  const model =
    domain === 'webdev'
      ? getWebDevModel()
      : domain === 'growth'
      ? getGrowthModel()
      : domain === 'agent'
      ? getAgentModel()
      : getAutomationModel();

  if (!isOllamaPrimary()) {
    try {
      const { object } = await generateObject({
        model,
        system,
        prompt,
        schema,
      });
      return object;
    } catch (err: any) {
      console.warn(`[generateJsonResilient] Native generateObject uyarısı (${err.message}), metin tabanlı JSON ayrıştırıcıya geçiliyor...`);
    }
  }

  const jsonInstruction = `${system ? system + '\n\n' : ''}ÇOK ÖNEMLİ: Yanıtını SADECE geçerli bir JSON olarak ver. Açıklama veya markdown ekleme.`;
  const { text } = await generateTextResilient({
    prompt,
    system: jsonInstruction,
    temperature: 0.2,
    preferredModel: domain,
  });

  const extracted = extractJsonFromText(text);
  const parsed = JSON.parse(extracted);
  return schema.parse(parsed);
}
