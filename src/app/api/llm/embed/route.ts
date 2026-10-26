/**
 * POST /api/llm/embed
 *
 * Tek metin için vektör embedding üretir (nomic-embed-text).
 * RAG pipeline'ında doküman indexleme ve sorgu vektörleri için kullanılır.
 *
 * Body:  { text: string }
 * Response: { embedding: number[], ttfMs: number }
 */

import { NextRequest, NextResponse } from "next/server";
import { gatewayEmbed, GatewayError } from "@/lib/llm-gateway";
import { getServerSession } from "@/modules/auth/auth.server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const session = await getServerSession();
  if (!session?.tenantId) {
    return NextResponse.json({ error: "Yetkisiz veya Tenant bulunamadı" }, { status: 401 });
  }

  const tenantId = session.tenantId as string;

  // ─── Body ─────────────────────────────────────────────────────────────────
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "text alanı boş olamaz" }, { status: 400 });
  }

  if (text.length > 10_000) {
    return NextResponse.json(
      { error: "Metin çok uzun (max 10.000 karakter)" },
      { status: 400 }
    );
  }

  try {
    const result = await gatewayEmbed({
      requestId: randomUUID(),
      tenantId,
      text,
      signal: req.signal,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GatewayError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 503 }
      );
    }
    console.error("[/api/llm/embed]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
