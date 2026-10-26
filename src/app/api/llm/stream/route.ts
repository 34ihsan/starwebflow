/**
 * POST /api/llm/stream
 *
 * Server-Sent Events (SSE) streaming endpoint.
 * İstek geldiğinde Ollama'ya stream=true ile bağlanır;
 * her token anında istemciye iletilir.
 *
 * Body: { model?: string, messages: OllamaMessage[], systemPrompt?: string,
 *         temperature?: number, maxTokens?: number }
 *
 * Response: text/event-stream
 *   data: {"token":"..."}\n\n
 *   data: {"done":true,"fullText":"..."}\n\n
 */

import { NextRequest } from "next/server";
import { gatewayChatStream, GatewayError, ROLE_DEFAULT_MODEL } from "@/lib/llm-gateway";
import { getServerSession } from "@/modules/auth/auth.server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const session = await getServerSession();
  if (!session?.tenantId) {
    return new Response(JSON.stringify({ error: "Yetkisiz veya Tenant bulunamadı" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const tenantId = session.tenantId as string;

  // ─── Body ─────────────────────────────────────────────────────────────────
  let body: {
    model?: string;
    messages?: Array<{ role: string; content: string }>;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Geçersiz JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { model, messages, systemPrompt, temperature, maxTokens } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages dizisi boş olamaz" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const selectedModel = model ?? ROLE_DEFAULT_MODEL.chat;
  const requestId = randomUUID();

  // ─── SSE Akışı ────────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        await gatewayChatStream(
          {
            requestId,
            tenantId,
            model: selectedModel,
            messages: messages as Array<{ role: "user" | "assistant" | "system"; content: string }>,
            systemPrompt,
            temperature,
            maxTokens,
            signal: req.signal,
          },
          (token) => enqueue({ token }),
          (fullText) => enqueue({ done: true, fullText })
        );
      } catch (err) {
        if (err instanceof GatewayError) {
          enqueue({ error: err.message, code: err.code });
        } else {
          enqueue({ error: "Akış hatası" });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Request-Id": requestId,
    },
  });
}
