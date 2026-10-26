/**
 * LLM Gateway — Public API
 *
 * Uygulamanın her yerinden bu index üzerinden erişilir.
 * Doğrudan ./gateway, ./registry, ./queue importları YAPILMAZ.
 */

// ─── Ana Gateway Fonksiyonları ──────────────────────────────────────────────
export {
  gatewayChat,
  gatewayChatStream,
  gatewayEmbed,
  getSystemHealth,
  abortRequest,
  getModelForRole,
} from "./gateway";

// ─── Kuyruk ─────────────────────────────────────────────────────────────────
export {
  enqueueJob,
  getJobState,
  startBackgroundWorker,
  getEnabledModels,
  getLiveQueue,
  getBackgroundQueue,
} from "./queue";

// ─── Tipler ─────────────────────────────────────────────────────────────────
export type {
  ModelConfig,
  ModelRole,
  GatewayRequest,
  GatewayResponse,
  EmbedRequest,
  EmbedResponse,
  SystemHealth,
  BackgroundJob,
  JobPriority,
  OllamaMessage,
  GatewayErrorCode,
} from "./types";

export { GatewayError } from "./types";

// ─── Registry Sabitleri ──────────────────────────────────────────────────────
export {
  MODEL_REGISTRY,
  ROLE_DEFAULT_MODEL,
  CIRCUIT_BREAKER,
  OLLAMA_MAX_RAM_MB,
  AGENT_TOOL_ALLOWLIST,
  SQL_ALLOWED_STATEMENTS,
} from "./registry";
