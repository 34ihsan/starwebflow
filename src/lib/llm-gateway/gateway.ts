/**
 * Merkezi LLM Gateway
 * 
 * KURAL: Uygulamada hiçbir kod doğrudan Ollama'ya istek atmaz.
 * Her çağrı bu gateway üzerinden geçer.
 * 
 * Sağladıkları:
 * - RAM bütçesi kontrolü (yeterli RAM yoksa iş başlatılmaz)
 * - Tenant kota kontrolü
 * - AbortSignal → Ollama'ya iletimi (hayalet istek önleme)
 * - TTFT (Time to First Token) ölçümü
 * - Streaming SSE desteği
 * - Circuit breaker entegrasyonu
 */

import {
  GatewayError,
  type EmbedRequest,
  type EmbedResponse,
  type GatewayRequest,
  type GatewayResponse,
  type SystemHealth,
} from "./types";
import {
  CIRCUIT_BREAKER,
  MODEL_REGISTRY,
  OLLAMA_MAX_RAM_MB,
  RAM_SAFETY_MARGIN_MB,
  ROLE_DEFAULT_MODEL,
} from "./registry";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

// ─── AbortController Kayıt Defteri ─────────────────────────────────────────
// requestId → controller eşlemesi; iptal için kullanılır
const abortRegistry = new Map<string, AbortController>();

// ─── Basit İstek Sayacı (metriklere ek olarak) ─────────────────────────────
let activeRequests = 0;

// ─── p95 Latency Penceresi (son 100 istek) ─────────────────────────────────
const latencyWindow: number[] = [];
function recordLatency(ms: number) {
  latencyWindow.push(ms);
  if (latencyWindow.length > 100) latencyWindow.shift();
}
function getP95(): number {
  if (latencyWindow.length === 0) return 0;
  const sorted = [...latencyWindow].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.95)] ?? 0;
}

// ─── RAM Bütçe Kontrolü ─────────────────────────────────────────────────────
async function checkRamBudget(modelName: string): Promise<void> {
  const config = MODEL_REGISTRY[modelName];
  if (!config) throw new GatewayError("MODEL_UNAVAILABLE", `Model bulunamadı: ${modelName}`);

  // Ollama'dan çalışan modelleri sorgula
  let usedRamMb = 0;
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/ps`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = (await res.json()) as { models?: Array<{ size_vram?: number; size?: number }> };
      usedRamMb = (data.models ?? []).reduce((sum, m) => {
        const bytes = m.size_vram ?? m.size ?? 0;
        return sum + bytes / (1024 * 1024);
      }, 0);
    }
  } catch {
    // Ollama erişilemezse RAM kontrolünü geç; circuit breaker yakalar
  }

  const available = OLLAMA_MAX_RAM_MB - usedRamMb;
  const needed = config.ramEstimateMb + RAM_SAFETY_MARGIN_MB;

  if (available < needed) {
    throw new GatewayError(
      "INSUFFICIENT_RAM",
      `Yetersiz RAM: Mevcut ~${Math.round(available)} MB, Gerekli ~${needed} MB (${modelName})`
    );
  }
}

// ─── Tenant Kota Kontrolü ───────────────────────────────────────────────────
// TODO: Prisma'dan TenantUsage tablosu çekilerek gerçek kota uygulanacak
async function checkTenantQuota(_tenantId: string): Promise<void> {
  // Şimdilik açık — ileride token limiti eklenecek
}

// ─── Sistem Sağlık Durumu ───────────────────────────────────────────────────
export async function getSystemHealth(): Promise<SystemHealth> {
  let ramUsedPercent = 0;
  let ollamaQueueLength = 0;

  try {
    // Ollama çalışan model ve kuyruk bilgisi
    const [psRes, queueRes] = await Promise.allSettled([
      fetch(`${OLLAMA_BASE_URL}/api/ps`, { signal: AbortSignal.timeout(1500) }),
      fetch(`${OLLAMA_BASE_URL}/api/version`, { signal: AbortSignal.timeout(1500) }),
    ]);

    if (psRes.status === "fulfilled" && psRes.value.ok) {
      const data = (await psRes.value.json()) as { models?: Array<{ size?: number }> };
      const usedMb = (data.models ?? []).reduce(
        (s, m) => s + (m.size ?? 0) / (1024 * 1024),
        0
      );
      ramUsedPercent = Math.round((usedMb / OLLAMA_MAX_RAM_MB) * 100);
    }

    ollamaQueueLength = activeRequests;
  } catch {
    ramUsedPercent = 0;
  }

  const p95 = getP95();

  return {
    canStartLive: ramUsedPercent < CIRCUIT_BREAKER.RAM_EMERGENCY,
    canStartBackground:
      ramUsedPercent < CIRCUIT_BREAKER.RAM_STOP_BACKGROUND &&
      ollamaQueueLength < CIRCUIT_BREAKER.QUEUE_MAX &&
      p95 < CIRCUIT_BREAKER.P95_WARN_MS,
    fallbackRequired:
      ramUsedPercent >= CIRCUIT_BREAKER.RAM_EMERGENCY ||
      p95 >= CIRCUIT_BREAKER.P95_EMERGENCY_MS,
    ramUsedPercent,
    ollamaQueueLength,
    p95LatencyMs: p95,
  };
}

// ─── Aktif İsteği İptal Et ─────────────────────────────────────────────────
export function abortRequest(requestId: string): boolean {
  const controller = abortRegistry.get(requestId);
  if (controller) {
    controller.abort();
    abortRegistry.delete(requestId);
    return true;
  }
  return false;
}

// ─── Rollü Modele Çevir ────────────────────────────────────────────────────
export function getModelForRole(role: keyof typeof ROLE_DEFAULT_MODEL): string {
  return ROLE_DEFAULT_MODEL[role];
}

// ─── ANA SOHBET FONKSİYONU ─────────────────────────────────────────────────
export async function gatewayChat(req: GatewayRequest): Promise<GatewayResponse> {
  const config = MODEL_REGISTRY[req.model];
  if (!config || !config.enabled) {
    throw new GatewayError("MODEL_UNAVAILABLE", `Model devre dışı: ${req.model}`);
  }

  await checkTenantQuota(req.tenantId);
  await checkRamBudget(req.model);

  // AbortController: hem isteğin kendi sinyali hem de registry'den iptal
  const controller = new AbortController();
  abortRegistry.set(req.requestId, controller);

  // Eğer dışarıdan AbortSignal geldiyse (HTTP kapandı) onu da dinle
  if (req.signal) {
    req.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  // Zaman aşımı — model önceliğine göre
  const timeoutMs = config.priority === 1 ? 20_000 : 45_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startMs = Date.now();
  activeRequests++;

  try {
    const messages = req.systemPrompt
      ? [{ role: "system" as const, content: req.systemPrompt }, ...req.messages]
      : req.messages;

    const body = {
      model: req.model,
      messages,
      stream: false,
      options: {
        num_ctx: config.maxContextTokens,
        temperature: req.temperature ?? 0.3,
        num_predict: req.maxTokens ?? 300,
      },
      keep_alive: config.keepAlive,
    };

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new GatewayError("OLLAMA_UNREACHABLE", `Ollama HTTP ${res.status}: ${err}`);
    }

    const data = (await res.json()) as {
      message?: { content?: string };
      eval_count?: number;
    };

    const totalMs = Date.now() - startMs;
    recordLatency(totalMs);

    return {
      text: data.message?.content ?? "",
      model: req.model,
      totalMs,
      tokenCount: data.eval_count,
    };
  } finally {
    clearTimeout(timeoutId);
    activeRequests--;
    abortRegistry.delete(req.requestId);
  }
}

// ─── STREAMING SOHBET (SSE) ─────────────────────────────────────────────────
export async function gatewayChatStream(
  req: GatewayRequest,
  onToken: (token: string) => void,
  onEnd: (fullText: string) => void
): Promise<void> {
  const config = MODEL_REGISTRY[req.model];
  if (!config || !config.enabled) {
    throw new GatewayError("MODEL_UNAVAILABLE");
  }

  await checkTenantQuota(req.tenantId);
  await checkRamBudget(req.model);

  const controller = new AbortController();
  abortRegistry.set(req.requestId, controller);
  if (req.signal) {
    req.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const timeoutMs = config.priority === 1 ? 20_000 : 60_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startMs = Date.now();
  activeRequests++;
  let ttfCaptured = false;
  let fullText = "";

  try {
    const messages = req.systemPrompt
      ? [{ role: "system" as const, content: req.systemPrompt }, ...req.messages]
      : req.messages;

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: req.model,
        messages,
        stream: true,
        options: {
          num_ctx: config.maxContextTokens,
          temperature: req.temperature ?? 0.3,
          num_predict: req.maxTokens ?? 300,
        },
        keep_alive: config.keepAlive,
      }),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) throw new GatewayError("OLLAMA_UNREACHABLE");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n").filter(Boolean)) {
        try {
          const json = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
          const token = json.message?.content ?? "";
          if (token) {
            if (!ttfCaptured) {
              ttfCaptured = true;
              recordLatency(Date.now() - startMs);
            }
            fullText += token;
            onToken(token);
          }
          if (json.done) break;
        } catch {
          // JSON parse hatası — satırı atla
        }
      }
    }

    onEnd(fullText);
  } finally {
    clearTimeout(timeoutId);
    activeRequests--;
    abortRegistry.delete(req.requestId);
  }
}

// ─── EMBEDDİNG ──────────────────────────────────────────────────────────────
export async function gatewayEmbed(req: EmbedRequest): Promise<EmbedResponse> {
  const embedModel = "nomic-embed-text";
  const config = MODEL_REGISTRY[embedModel];

  await checkTenantQuota(req.tenantId);

  // nomic-embed-text ~2K token; metni kırp
  const text = req.text.slice(0, 3200); // ~800 token güvenli üst sınır

  const controller = new AbortController();
  abortRegistry.set(req.requestId, controller);
  if (req.signal) {
    req.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const startMs = Date.now();
  activeRequests++;

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: embedModel,
        prompt: text,
        keep_alive: config.keepAlive,
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new GatewayError("OLLAMA_UNREACHABLE");
    const data = (await res.json()) as { embedding?: number[] };

    return {
      embedding: data.embedding ?? [],
      ttfMs: Date.now() - startMs,
    };
  } finally {
    activeRequests--;
    abortRegistry.delete(req.requestId);
  }
}
