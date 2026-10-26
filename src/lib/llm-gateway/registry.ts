/**
 * Model Kayıt Defteri (Model Registry)
 * 
 * Tüm 7 model burada merkezi olarak tanımlanır.
 * RAM tahminleri CPU-only 4-bit quantized modeller içindir.
 * VPS kurulumundan sonra gerçek ölçüm yapılarak güncellenir.
 * 
 * Ollama etiketleri: sürüm numarasız "latest" KULLANILMAZ;
 * belirli bir tag veya q4_K_M gibi quantization etiketi zorunlu.
 */

import type { ModelConfig, ModelRole } from "./types";

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // ─── CANLI / VIP MODELLER ──────────────────────────────────────────────────
  
  "qwen2.5:7b-instruct": {
    name: "qwen2.5:7b-instruct",
    role: "chat",
    priority: 1,
    ramEstimateMb: 4700,
    maxContextTokens: 4096,
    keepAlive: "-1",   // 24/7 RAM'de kilitli
    enabled: true,
  },

  "nomic-embed-text": {
    name: "nomic-embed-text",
    role: "embed",
    priority: 1,
    ramEstimateMb: 300,
    maxContextTokens: 2048,  // Gerçek limit ~2K; chunk buna göre kesilir
    keepAlive: "-1",
    enabled: true,
  },

  "qwen2.5-coder:1.5b": {
    name: "qwen2.5-coder:1.5b",
    role: "router",
    priority: 2,
    ramEstimateMb: 1100,
    maxContextTokens: 2048,
    keepAlive: "5m",
    enabled: true,
  },

  // ─── ARKA PLAN MODELLERI ───────────────────────────────────────────────────

  "hermes3:8b": {
    name: "hermes3:8b",
    role: "agent",
    priority: 3,
    ramEstimateMb: 5100,
    maxContextTokens: 2048,   // Ajan adım başı; uzun zincirler parçalı
    keepAlive: "5m",
    enabled: true,
  },

  "qwen2.5-coder:7b": {
    name: "qwen2.5-coder:7b",
    role: "code",
    priority: 3,
    ramEstimateMb: 4900,
    maxContextTokens: 4096,
    keepAlive: "5m",
    enabled: true,
  },

  "mistral:7b-instruct-v0.3": {
    name: "mistral:7b-instruct-v0.3",
    role: "document",
    priority: 4,
    ramEstimateMb: 4500,
    maxContextTokens: 8192,   // Uzun PDF — parçalı chunk ile kullanılır
    keepAlive: "5m",
    enabled: true,
  },

  "llama3.1:8b-instruct": {
    name: "llama3.1:8b-instruct",
    role: "content",
    priority: 4,
    ramEstimateMb: 5000,
    maxContextTokens: 4096,
    keepAlive: "5m",
    enabled: true,
  },
} as const;

/** VPS'te sistemin kullanabileceği toplam RAM (MB) */
export const TOTAL_SYSTEM_RAM_MB = 16_000;

/** OS + Postgres + Next.js + Redis rezervi (MB) */
export const SYSTEM_RESERVE_MB = 5_000;

/** Ollama için kullanılabilir maksimum RAM (MB) */
export const OLLAMA_MAX_RAM_MB = TOTAL_SYSTEM_RAM_MB - SYSTEM_RESERVE_MB; // 11_000

/** Yeni iş başlatmadan önce bırakılacak güvenlik payı (MB) */
export const RAM_SAFETY_MARGIN_MB = 800;

/** Circuit breaker eşikleri */
export const CIRCUIT_BREAKER = {
  RAM_WARN_PERCENT: 75,        // Arka plan işleri yavaşlatılır
  RAM_STOP_BACKGROUND: 85,     // Yeni arka plan işi başlatılmaz
  RAM_EMERGENCY: 93,           // Fallback zorunlu, hiçbir LLM çağrısı yok
  QUEUE_MAX: 16,               // Ollama kuyruk üst sınırı
  P95_WARN_MS: 8_000,          // p95 latency uyarı eşiği
  P95_EMERGENCY_MS: 15_000,    // p95 latency — circuit breaker açılır
} as const;

/** Rol bazında hangi modelin varsayılan olarak seçileceği */
export const ROLE_DEFAULT_MODEL: Record<ModelRole, string> = {
  chat:     "qwen2.5:7b-instruct",
  embed:    "nomic-embed-text",
  router:   "qwen2.5-coder:1.5b",
  agent:    "hermes3:8b",
  code:     "qwen2.5-coder:7b",
  document: "mistral:7b-instruct-v0.3",
  content:  "llama3.1:8b-instruct",
};

/** Hermes ajanının kullanmasına izin verilen araç adları (allowlist) */
export const AGENT_TOOL_ALLOWLIST = [
  "getProducts",
  "getOrderStatus",
  "searchKnowledgeBase",
  "createLead",
  "getTenantSettings",
  "getBusinessHours",
  "searchDocumentChunks",
] as const;

export type AllowedAgentTool = (typeof AGENT_TOOL_ALLOWLIST)[number];

/** SQL üretiminde izin verilen ifadeler (AST doğrulama yardımcısı) */
export const SQL_ALLOWED_STATEMENTS = ["SELECT"] as const;
