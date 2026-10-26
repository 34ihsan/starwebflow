/**
 * POST /api/llm/chat
 *
 * Tek yanıt (non-streaming) sohbet endpoint'i.
 * Middleware'den gelen tenantId ve auth kontrolü zorunludur.
 *
 * Body:
 *   { model?: string, messages: OllamaMessage[], systemPrompt?: string,
 *     temperature?: number, maxTokens?: number }
 *
 * Response:
 *   { text: string, model: string, totalMs: number, tokenCount?: number }
 */

import { NextRequest, NextResponse } from "next/server";
import { gatewayChat, GatewayError, ROLE_DEFAULT_MODEL } from "@/lib/llm-gateway";
import { getServerSession } from "@/modules/auth/auth.server";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; // BullMQ ve crypto — Edge'de çalışmaz

export async function POST(req: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const session = await getServerSession();
  if (!session?.tenantId) {
    return NextResponse.json({ error: "Yetkisiz veya Tenant bulunamadı" }, { status: 401 });
  }

  const tenantId = session.tenantId as string;

  // ─── Body Ayrıştırma ──────────────────────────────────────────────────────
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
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { model, messages, systemPrompt, temperature, maxTokens } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages dizisi boş olamaz" }, { status: 400 });
  }

  const selectedModel = model ?? ROLE_DEFAULT_MODEL.chat;
  const requestId = randomUUID();

  // ─── HTTP kapatılınca abort et ────────────────────────────────────────────
  const signal = req.signal;

  try {
    const result = await gatewayChat({
      requestId,
      tenantId,
      model: selectedModel,
      messages: messages as Array<{ role: "user" | "assistant" | "system"; content: string }>,
      systemPrompt,
      temperature,
      maxTokens,
      signal,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GatewayError) {
      const statusMap: Record<string, number> = {
        INSUFFICIENT_RAM: 503,
        TENANT_QUOTA_EXCEEDED: 429,
        MODEL_UNAVAILABLE: 503,
        TIMEOUT: 504,
        OLLAMA_UNREACHABLE: 503,
        CIRCUIT_BREAKER_OPEN: 503,
      };
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: statusMap[err.code] ?? 500 }
      );
    }
    console.error("[/api/llm/chat]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
