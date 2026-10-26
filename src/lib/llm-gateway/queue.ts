/**
 * LLM Arka Plan İş Kuyruğu (BullMQ)
 *
 * Arka plan işleri (blog üretimi, PDF özeti, embed batch, ajan görevleri)
 * BullMQ üzerinden sıralanır; gateway'in RAM ve eşzamanlılık kurallarına
 * uygun biçimde işlenir.
 *
 * Kuyruk mimarisi:
 *   - "llm:live"       → Öncelik 1–2, timeout 20s (müşteri sohbeti)
 *   - "llm:background" → Öncelik 3–4, timeout 60s (arka plan işleri)
 *
 * Worker'lar yalnızca Node.js ortamında (Route Handler veya BullMQ worker
 * process) başlatılır; Edge Runtime'da ÇALIŞMAZ.
 */

import { Queue, Worker, type Job } from "bullmq";
import type { BackgroundJob } from "./types";
import { MODEL_REGISTRY, ROLE_DEFAULT_MODEL } from "./registry";
import { gatewayChat } from "./gateway";

// ─── Redis Bağlantısı ───────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

function makeRedisOpts() {
  try {
    const url = new URL(REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || "6379", 10),
      password: url.password || undefined,
      tls: url.protocol === "rediss:" ? {} : undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    };
  } catch {
    return {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    };
  }
}

// ─── Tembel (Lazy) Kuyruk Başlatıcıları ───────────────────────────────────────
let _liveQueue: Queue<BackgroundJob> | null = null;
let _backgroundQueue: Queue<BackgroundJob> | null = null;

export function getLiveQueue(): Queue<BackgroundJob> {
  if (!_liveQueue) {
    _liveQueue = new Queue<BackgroundJob>("llm-live", {
      connection: makeRedisOpts(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }
  return _liveQueue;
}

export function getBackgroundQueue(): Queue<BackgroundJob> {
  if (!_backgroundQueue) {
    _backgroundQueue = new Queue<BackgroundJob>("llm-background", {
      connection: makeRedisOpts(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });
  }
  return _backgroundQueue;
}

// ─── İş Ekleme Yardımcıları ──────────────────────────────────────────────────

/**
 * Arka plan işi ekle.
 * priority 1–2 → live kuyruğu, 3–4 → background kuyruğu.
 */
export async function enqueueJob(job: BackgroundJob): Promise<string> {
  const queue = job.priority <= 2 ? getLiveQueue() : getBackgroundQueue();
  const added = await queue.add(job.type, job, {
    priority: job.priority,
    jobId: job.id,
  });
  return added.id ?? job.id;
}

/** Bir işin mevcut durumunu sorgula */
export async function getJobState(
  jobId: string,
  priority: 1 | 2 | 3 | 4 = 3
): Promise<{
  state: string;
  progress: number | object;
  result?: unknown;
  failReason?: string;
}> {
  const queue = priority <= 2 ? getLiveQueue() : getBackgroundQueue();
  const job = await queue.getJob(jobId);
  if (!job) return { state: "not_found", progress: 0 };

  const state = await job.getState();
  return {
    state,
    progress: job.progress,
    result: job.returnvalue,
    failReason: job.failedReason,
  };
}

// ─── Worker İşleyicisi ───────────────────────────────────────────────────────

/**
 * Worker'ı başlat (yalnızca server-side).
 * next.config.ts'de `serverComponentsExternalPackages: ["bullmq"]` olmalı.
 *
 * Kullanım: scripts/start-workers.ts veya api/workers/route.ts'den çağrılır.
 */
export function startBackgroundWorker(): Worker<BackgroundJob> {
  const worker = new Worker<BackgroundJob>(
    "llm-background",
    async (job: Job<BackgroundJob>) => {
      const { type, payload, tenantId, id } = job.data;

      switch (type) {
        case "blog": {
          const model = ROLE_DEFAULT_MODEL.content;
          await gatewayChat({
            requestId: id,
            tenantId,
            model,
            messages: [
              {
                role: "user",
                content:
                  typeof payload.prompt === "string"
                    ? payload.prompt
                    : "Blog içeriği üret.",
              },
            ],
            maxTokens: 800,
          });
          break;
        }

        case "pdf_summary": {
          const model = ROLE_DEFAULT_MODEL.document;
          const chunks = Array.isArray(payload.chunks) ? payload.chunks : [];
          let summary = "";

          for (let i = 0; i < chunks.length; i++) {
            await job.updateProgress(Math.round(((i + 1) / chunks.length) * 100));
            const res = await gatewayChat({
              requestId: `${id}-chunk-${i}`,
              tenantId,
              model,
              messages: [
                {
                  role: "user",
                  content: `Bu metni 3 cümleyle özetle:\n\n${chunks[i]}`,
                },
              ],
              maxTokens: 200,
            });
            summary += res.text + "\n";
          }

          return { summary };
        }

        case "embed_batch": {
          // gatewayEmbed toplu işlem — her chunk ayrı çağrı
          const { gatewayEmbed } = await import("./gateway");
          const texts = Array.isArray(payload.texts) ? payload.texts : [];
          const embeddings: number[][] = [];

          for (let i = 0; i < texts.length; i++) {
            await job.updateProgress(Math.round(((i + 1) / texts.length) * 100));
            const res = await gatewayEmbed({
              requestId: `${id}-embed-${i}`,
              tenantId,
              text: String(texts[i]),
            });
            embeddings.push(res.embedding);
          }

          return { embeddings };
        }

        case "agent_task": {
          const model = ROLE_DEFAULT_MODEL.agent;
          const res = await gatewayChat({
            requestId: id,
            tenantId,
            model,
            messages: [
              {
                role: "user",
                content:
                  typeof payload.task === "string"
                    ? payload.task
                    : "Görevi tamamla.",
              },
            ],
            maxTokens: 600,
          });
          return { result: res.text };
        }

        case "sql_draft": {
          const model = ROLE_DEFAULT_MODEL.code;
          const res = await gatewayChat({
            requestId: id,
            tenantId,
            model,
            systemPrompt:
              "Yalnızca SELECT ifadesi içeren güvenli PostgreSQL sorgusu yaz. Açıklama ekleme.",
            messages: [
              {
                role: "user",
                content:
                  typeof payload.description === "string"
                    ? payload.description
                    : "SQL sorgusu yaz.",
              },
            ],
            maxTokens: 300,
          });
          return { sql: res.text };
        }

        default:
          throw new Error(`Bilinmeyen iş türü: ${type}`);
      }
    },
    {
      connection: makeRedisOpts(),
      concurrency: 2, // Aynı anda max 2 arka plan LLM işi
      limiter: {
        max: 10,
        duration: 60_000, // 1 dk'da max 10 iş
      },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[BullMQ] İş başarısız: ${job?.id} — ${err.message}`);
  });

  worker.on("completed", (job) => {
    console.info(`[BullMQ] İş tamamlandı: ${job.id} (${job.data.type})`);
  });

  return worker;
}

// ─── Model Kullanılabilirliği ─────────────────────────────────────────────────
/** Kayıt defterindeki tüm aktif modellerin listesi */
export function getEnabledModels() {
  return Object.values(MODEL_REGISTRY).filter((m) => m.enabled);
}
