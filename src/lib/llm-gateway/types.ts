/**
 * LLM Gateway — Tip Tanımları
 * Tüm Ollama model çağrıları bu tipler üzerinden yönetilir.
 */

export type ModelRole =
  | "chat"       // Müşteri sohbeti (qwen2.5:7b)
  | "embed"      // RAG vektör üretimi (nomic-embed-text)
  | "router"     // Hızlı JSON/spam sınıflandırma (qwen2.5-coder:1.5b)
  | "agent"      // Otonom Hermes ajanları (hermes3:8b)
  | "code"       // SQL / kod üretimi (qwen2.5-coder:7b)
  | "document"   // PDF / sözleşme özeti (mistral:7b)
  | "content";   // Blog / pazarlama içeriği (llama3.1:8b)

export type JobPriority = 1 | 2 | 3 | 4; // 1=VIP, 4=En Düşük

export interface ModelConfig {
  /** Ollama model etiketi — sürüm sabitlenmiş */
  name: string;
  /** İşlev grubu */
  role: ModelRole;
  /** Öncelik seviyesi (düşük sayı = daha öncelikli) */
  priority: JobPriority;
  /** Ölçülmüş tepe RAM tahmini (MB) */
  ramEstimateMb: number;
  /** Model başına bağlam penceresi (token) */
  maxContextTokens: number;
  /** Ollama keep_alive değeri: "-1" = daima yüklü, "5m", "0" */
  keepAlive: string;
  /** Aktif mi? */
  enabled: boolean;
}

export interface GatewayRequest {
  requestId: string;
  tenantId: string;
  model: string;
  messages: OllamaMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  /** true = streaming SSE, false = tek yanıt */
  stream?: boolean;
  /** İptal sinyali — HTTP bağlantısı kapanınca Ollama'ya iletilir */
  signal?: AbortSignal;
}

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GatewayResponse {
  text: string;
  model: string;
  ttfMs?: number;    // Time to First Token (ms)
  totalMs?: number;  // Toplam süre (ms)
  tokenCount?: number;
}

export interface EmbedRequest {
  requestId: string;
  tenantId: string;
  text: string;
  signal?: AbortSignal;
}

export interface EmbedResponse {
  embedding: number[];
  ttfMs?: number;
}

export interface SystemHealth {
  /** Yeni canlı istek başlatılabilir mi? */
  canStartLive: boolean;
  /** Yeni arka plan işi başlatılabilir mi? */
  canStartBackground: boolean;
  /** Fallback yanıt gerekli mi? */
  fallbackRequired: boolean;
  ramUsedPercent: number;
  ollamaQueueLength: number;
  p95LatencyMs?: number;
}

export type GatewayErrorCode =
  | "INSUFFICIENT_RAM"
  | "TENANT_QUOTA_EXCEEDED"
  | "MODEL_UNAVAILABLE"
  | "TIMEOUT"
  | "OLLAMA_UNREACHABLE"
  | "CIRCUIT_BREAKER_OPEN";

export class GatewayError extends Error {
  constructor(
    public code: GatewayErrorCode,
    message?: string
  ) {
    super(message ?? code);
    this.name = "GatewayError";
  }
}

export interface BackgroundJob {
  id: string;
  tenantId: string;
  type: "blog" | "pdf_summary" | "agent_task" | "sql_draft" | "embed_batch";
  payload: Record<string, unknown>;
  priority: JobPriority;
  /** Parçalı iş için son tamamlanan adım */
  lastCompletedStep?: number;
}
