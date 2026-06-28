'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { generateObject } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { z } from 'zod';

export async function getAutomations(tenantId: string) {
  try {
    const flows = await prisma.automationFlow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const logs = await prisma.automationLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, data: { flows, webhooks, logs } };
  } catch (error) {
    console.error('getAutomations error:', error);
    return { success: false, error: 'Failed to fetch automations' };
  }
}

export async function createAutomationFlow(data: {
  tenantId: string;
  name: string;
  nodes: any;
}) {
  try {
    const flow = await prisma.automationFlow.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        name: data.name,
        nodes: data.nodes,
        status: 'ACTIVE',
      }
    });
    safeRevalidatePath('/admin/automations');
    return { success: true, data: flow };
  } catch (error) {
    console.error('createAutomationFlow error:', error);
    return { success: false, error: 'Failed to create automation flow' };
  }
}

export async function createWebhookEndpoint(data: {
  tenantId: string;
  name?: string;
  url: string;
  method: string;
  flowId?: string;
}) {
  try {
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        name: data.name || `Webhook ${new Date().toLocaleDateString('tr-TR')}`,
        url: data.url,
        method: data.method,
        flowId: data.flowId,
      }
    });
    safeRevalidatePath('/admin/automations');
    return { success: true, data: webhook };
  } catch (error) {
    console.error('createWebhookEndpoint error:', error);
    return { success: false, error: 'Failed to create webhook' };
  }
}

export async function updateAutomationFlow(
  id: string,
  data: {
    name?: string;
    status?: string;
    nodes?: any;
  }
) {
  try {
    const flow = await prisma.automationFlow.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.nodes !== undefined && { nodes: data.nodes }),
      },
    });
    safeRevalidatePath('/admin/automations');
    return { success: true, data: flow };
  } catch (error) {
    console.error('updateAutomationFlow error:', error);
    return { success: false, error: 'Failed to update automation flow' };
  }
}

export async function deleteAutomationFlow(id: string) {
  try {
    await prisma.automationFlow.delete({
      where: { id },
    });
    safeRevalidatePath('/admin/automations');
    return { success: true };
  } catch (error) {
    console.error('deleteAutomationFlow error:', error);
    return { success: false, error: 'Failed to delete automation flow' };
  }
}

export async function generateFlowFromPrompt(prompt: string) {
  try {
    const { object } = await generateObject({
      model: getFlashModel(),
      system: `Sen StarWebflow platformunun Otomasyon Yöneticisisin. 
Kullanıcının verdiği metne göre bir otomasyon akışı (Node Array) oluşturmalısın.

Her node (düğüm) aşağıdaki yapıda bir obje olmalıdır:
- id: string (örn: "n1", "n2")
- type: "trigger" | "action" | "condition"
- app: "Typeform" | "Email" | "Slack" | "CRM" | "WhatsApp" | "Star AI" | "Webhook" | "Cron" | "Delay" | "Custom"
- label: string (Node'un görünen ismi)

Kurallar:
1. Akış HER ZAMAN bir "trigger" node ile başlamalıdır. (id: "n1")
2. Daha sonra "action" veya "condition" node'ları gelmelidir.
3. Node id'leri sırayla n1, n2, n3... olmalıdır.
4. "condition" node'ları branch içerebilir.
5. Sadece sana verdiğimiz uygulamaları (app) kullan.

Örnek çıktı JSON Array:
[
  { "id": "n1", "type": "trigger", "app": "Typeform", "label": "Yeni Form Yanıtı" },
  { "id": "n2", "type": "action", "app": "Email", "label": "Müşteriye Hoşgeldin Maili" },
  { "id": "n3", "type": "action", "app": "Slack", "label": "Ekibe Bildir" }
]`,
      prompt: `Kullanıcı İsteği: "${prompt}"\n\nBu isteği yerine getirecek otomasyon düğümlerini oluştur.`,
      schema: z.array(z.object({
        id: z.string(),
        type: z.string(),
        app: z.string(),
        label: z.string()
      }))
    });

    // Stil/ikon atamaları client'da resolveNodeColor / resolveNodeIcon fonksiyonlarıyla yapılıyor,
    // o yüzden burada sadece saf JSON döndürmek yeterli.
    return { success: true, nodes: object };
  } catch (e) {
    console.error('AI Flow Generation failed:', e);
    return { success: false, error: 'AI akış oluşturamadı' };
  }
}
