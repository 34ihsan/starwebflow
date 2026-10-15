import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeFlow } from '@/lib/automation/engine';

export const dynamic = 'force-dynamic';

/**
 * Inbound Webhook Gateway for Starwebflow Automations
 * External services (Typeform, Stripe, Cal.com, Zapier, n8n, custom forms)
 * trigger real-time flows by POSTing to:
 * https://www.starwebflow.com/api/v1/automations/webhook/[id]
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const webhookId = params.id;

  try {
    let payload: any = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json().catch(() => ({}));
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      const text = await req.text();
      payload = { raw: text };
    }

    // 1. Webhook endpoint kaydını ara
    const webhook = await prisma.webhookEndpoint.findFirst({
      where: {
        OR: [
          { id: webhookId },
          { url: { contains: webhookId } }
        ]
      }
    });

    let targetFlow: any = null;

    if (webhook) {
      // Endpoint bulundu, son çalışma zamanını güncelle
      await prisma.webhookEndpoint.update({
        where: { id: webhook.id },
        data: { lastHitAt: new Date() }
      });

      if (webhook.flowId) {
        targetFlow = await prisma.automationFlow.findUnique({
          where: { id: webhook.flowId }
        });
      }
    }

    // 2. Eğer doğrudan flowId atanmamışsa, ilk düğümü Webhook olan aktif akışı ara
    if (!targetFlow) {
      const candidateFlows = await prisma.automationFlow.findMany({
        where: { status: 'ACTIVE' }
      });

      targetFlow = candidateFlows.find((f: any) => {
        const nodes = Array.isArray(f.nodes) ? f.nodes : [];
        if (nodes.length === 0) return false;
        const first = nodes[0];
        const app = (first.app || '').toLowerCase();
        const label = (first.label || '').toLowerCase();
        return app.includes('webhook') || label.includes('webhook') || f.id === webhookId;
      });
    }

    if (!targetFlow) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Webhook "${webhookId}" için aktif bir otomasyon akışı bulunamadı.` 
        }, 
        { status: 404 }
      );
    }

    // 3. Akışı arka planda güvenle tetikle
    const executionPayload = {
      ...payload,
      _webhookId: webhookId,
      _receivedAt: new Date().toISOString(),
      triggerType: 'INBOUND_WEBHOOK',
      ip: req.headers.get('x-forwarded-for') || req.ip || 'unknown',
    };

    // Non-blocking async execution
    executeFlow(targetFlow, executionPayload).catch((err: any) => {
      console.error(`[Webhook Gateway] Execution error in flow ${targetFlow.id}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `Webhook başarıyla alındı ve "${targetFlow.name}" akışı otonom başlatıldı.`,
      flowId: targetFlow.id,
      flowName: targetFlow.name
    });
  } catch (error: any) {
    console.error(`[Webhook Gateway] Error handling webhook ${webhookId}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook işlenemedi' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    status: 'online',
    endpoint: params.id,
    message: 'Starwebflow Inbound Webhook Gateway aktif. Veri göndermek için POST isteği yapın.'
  });
}
