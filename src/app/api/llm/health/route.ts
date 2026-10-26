/**
 * GET /api/llm/health
 *
 * Gateway sağlık durumu: RAM kullanımı, kuyruk uzunluğu, p95 gecikme,
 * canlı/arka plan iş başlatılabilirliği. Yalnızca giriş yapmış kullanıcılar.
 */

import { NextResponse } from "next/server";
import { getSystemHealth } from "@/lib/llm-gateway";
import { getServerSession } from "@/modules/auth/auth.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  if (!session?.tenantId) {
    return NextResponse.json({ error: "Yetkisiz veya Tenant bulunamadı" }, { status: 401 });
  }

  try {
    const health = await getSystemHealth();
    return NextResponse.json(health);
  } catch (err) {
    console.error("[/api/llm/health]", err);
    return NextResponse.json({ error: "Sağlık bilgisi alınamadı" }, { status: 500 });
  }
}
