import { prisma } from "@/lib/prisma";
import { 
  createProjectAction, 
  createTaskAction, 
  sendInternalChatAction, 
  aiScoreLeadAction, 
  createContractAction, 
  convertLeadToClientAction, 
  requestAdminApprovalAction, 
  suspendProjectAction, 
  sendOverdueReminderAction, 
  aiCompanyResearchAction, 
  sendClientUpdateMessageAction, 
  addLeadFromSocialAction, 
  startEmailCampaignAction 
} from "./nodes/internal-actions";
import { 
  runApifyScraperAction, 
  aiCleanDataAction, 
  createLeadsAction 
} from "./nodes/external-actions";
import { 
  aiGenerateImageAction, 
  aiGenerateVideoAction, 
  aiGenerateContentAction 
} from "./nodes/ai-actions";
import { 
  sendWhatsAppAction, 
  sendSmartEmailAction, 
  aiDeepAnalysisAction, 
  generateMicroLandingAction, 
  triggerOutboundWebhookAction,
  resolveVariables
} from "./nodes/elite-actions";

/**
 * Maps app/type strings from Node JSON to executable functions.
 */
const ACTION_REGISTRY: Record<string, Function> = {
  // Starwebflow Elite Core Actions
  "WhatsApp": sendWhatsAppAction,
  "Voice AI": sendWhatsAppAction,
  "WhatsApp Mesajı": sendWhatsAppAction,
  "WhatsApp Bildirimi": sendWhatsAppAction,
  "Email": sendSmartEmailAction,
  "E-posta": sendSmartEmailAction,
  "Özel İkna Maili İlet": sendSmartEmailAction,
  "Landing Gen": generateMicroLandingAction,
  "AI Mikro Landing Page": generateMicroLandingAction,
  "Intent Spy": aiDeepAnalysisAction,
  "Star AI": aiDeepAnalysisAction,
  "Outbound Webhook": triggerOutboundWebhookAction,
  "Webhook": triggerOutboundWebhookAction,

  // CRM & Internal Actions
  "Create Project": createProjectAction,
  "CRM Projesi Başlat": createProjectAction,
  "CRM Proje Başlat": createProjectAction,
  "Create Task": createTaskAction,
  "Send Internal Chat": sendInternalChatAction,
  "Slack": sendInternalChatAction,
  "Slack Kanalına Bildir": sendInternalChatAction,
  "AI Score Lead": aiScoreLeadAction,
  "Create Contract": createContractAction,
  "Convert to Client": convertLeadToClientAction,
  "Admin Approval": requestAdminApprovalAction,
  "Suspend Project": suspendProjectAction,
  "Send Reminder": sendOverdueReminderAction,
  "AI Company Research": aiCompanyResearchAction,
  "Send Client Update": sendClientUpdateMessageAction,
  "Add Social Lead": addLeadFromSocialAction,
  "Start Campaign": startEmailCampaignAction,
  "Apify Scraper": runApifyScraperAction,
  "AI Clean Data": aiCleanDataAction,
  "Bulk Create Leads": createLeadsAction,

  // Generative AI
  "AI Generate Image": aiGenerateImageAction,
  "AI Generate Video": aiGenerateVideoAction,
  "AI Generate Content": aiGenerateContentAction,

  // Fallbacks
  "Database": createTaskAction,
  "CRM": createProjectAction,
  "Delay": async (_tenant: string, context: any) => ({ success: true, delayed: true, timestamp: new Date().toISOString() }),
};

function resolveActionFunction(app?: string, label?: string): Function | null {
  if (app && ACTION_REGISTRY[app]) return ACTION_REGISTRY[app];
  if (label && ACTION_REGISTRY[label]) return ACTION_REGISTRY[label];

  const lowerApp = (app || "").toLowerCase();
  const lowerLabel = (label || "").toLowerCase();

  for (const [key, fn] of Object.entries(ACTION_REGISTRY)) {
    const lowerKey = key.toLowerCase();
    if (lowerApp.includes(lowerKey) || lowerLabel.includes(lowerKey)) {
      return fn;
    }
  }

  // Heuristic fallbacks
  if (lowerApp.includes("whatsapp") || lowerApp.includes("voice") || lowerApp.includes("ses")) return sendWhatsAppAction;
  if (lowerApp.includes("email") || lowerApp.includes("mail") || lowerApp.includes("posta")) return sendSmartEmailAction;
  if (lowerApp.includes("landing") || lowerApp.includes("site") || lowerApp.includes("web")) return generateMicroLandingAction;
  if (lowerApp.includes("ai") || lowerApp.includes("analiz") || lowerApp.includes("spy")) return aiDeepAnalysisAction;
  if (lowerApp.includes("slack") || lowerApp.includes("chat") || lowerApp.includes("sohbet")) return sendInternalChatAction;
  if (lowerApp.includes("crm") || lowerApp.includes("proje") || lowerApp.includes("görev")) return createProjectAction;

  return null;
}

/**
 * Execute all active flows that listen to a specific event.
 */
export async function executeFlowsForEvent(eventName: string, payload: any) {
  const activeFlows = await prisma.automationFlow.findMany({
    where: { status: "ACTIVE" }
  });

  const matchingFlows = activeFlows.filter(flow => {
    const nodes = flow.nodes as any[];
    if (!Array.isArray(nodes) || nodes.length === 0) return false;
    
    const firstNode = nodes[0];
    if (firstNode.type !== "trigger") return false;

    // Resilient matching across eventName, trigger type, and labels
    const matchExplicit = firstNode.eventName === eventName || firstNode.trigger === eventName || firstNode.config?.event === eventName;
    if (matchExplicit) return true;

    const lowerEvent = eventName.toLowerCase();
    const nodeApp = (firstNode.app || "").toLowerCase();
    const nodeLabel = (firstNode.label || "").toLowerCase();

    if (lowerEvent.includes("lead") && (nodeApp.includes("typeform") || nodeApp.includes("form") || nodeApp.includes("intent"))) return true;
    if (lowerEvent.includes("form") && (nodeApp.includes("typeform") || nodeApp.includes("form"))) return true;
    if (lowerEvent.includes("cron") && (nodeApp.includes("cron") || nodeLabel.includes("zaman"))) return true;
    if (lowerEvent.includes("webhook") && (nodeApp.includes("webhook") || nodeLabel.includes("webhook"))) return true;
    if (lowerEvent.includes("proposal") && (nodeApp.includes("proposal") || nodeLabel.includes("teklif"))) return true;
    if (lowerEvent.includes("payment") && (nodeApp.includes("stripe") || nodeApp.includes("payment") || nodeLabel.includes("ödeme"))) return true;
    if (lowerEvent.includes("email") && (nodeApp.includes("email") || nodeLabel.includes("posta"))) return true;

    return false;
  });

  console.log(`[Engine] Found ${matchingFlows.length} flows matching event "${eventName}"`);

  for (const flow of matchingFlows) {
    executeFlow(flow, payload).catch(e => console.error(`[Engine] Flow ${flow.id} failed:`, e));
  }
}

/**
 * Execute a single flow instance with cumulative context and step logs.
 */
export async function executeFlow(flow: any, initialPayload: any) {
  const startTime = Date.now();
  console.log(`[Engine] Starting execution for flow: ${flow.id} - "${flow.name}"`);
  const nodes = flow.nodes as any[];
  if (!Array.isArray(nodes) || nodes.length < 2) {
    console.warn(`[Engine] Flow ${flow.id} has insufficient nodes to execute.`);
    return;
  }

  // Cumulative Context Pipeline
  let context: any = {
    trigger: { ...initialPayload },
    steps: {},
    ...initialPayload
  };

  let status = "SUCCESS";
  let errorMsg = null;
  const executionLogs: any[] = [];

  try {
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      const stepStart = Date.now();
      
      if (node.type === "action") {
        const actionFn = resolveActionFunction(node.app, node.label);
        if (actionFn) {
          console.log(`[Engine] Executing action node [${node.id}]: ${node.app || node.label}`);
          const result = await actionFn(flow.tenantId, context, node);
          
          context.steps[node.id] = result;
          context = { ...context, ...result };
          executionLogs.push({
            nodeId: node.id,
            label: node.label || node.app,
            durationMs: Date.now() - stepStart,
            result
          });
        } else {
          console.warn(`[Engine] Action ${node.app || node.label} not found in registry.`);
          executionLogs.push({
            nodeId: node.id,
            label: node.label,
            durationMs: Date.now() - stepStart,
            error: "Action not implemented in registry"
          });
        }
      } 
      else if (node.type === "condition") {
        console.log(`[Engine] Executing condition node [${node.id}]: ${node.label}`);
        const score = Number(context.score ?? context.steps?.n2?.score ?? 0);
        let chosenBranch = null;

        if (score >= 70) {
          chosenBranch = node.branches?.find((b: any) => b.path?.includes("Evet") || b.path?.includes("VIP") || b.path?.includes("Sıcak"));
        } else {
          chosenBranch = node.branches?.find((b: any) => b.path?.includes("Hayır") || b.path?.includes("Standart") || b.path?.includes("Soğuk"));
        }

        if (chosenBranch && Array.isArray(chosenBranch.nodes)) {
          console.log(`[Engine] Taking branch: ${chosenBranch.path}`);
          for (const bNode of chosenBranch.nodes) {
            const bStart = Date.now();
            const bActionFn = resolveActionFunction(bNode.app, bNode.label);
            if (bActionFn) {
              const bResult = await bActionFn(flow.tenantId, context, bNode);
              context.steps[bNode.id] = bResult;
              context = { ...context, ...bResult };
              executionLogs.push({
                nodeId: bNode.id,
                branch: chosenBranch.path,
                durationMs: Date.now() - bStart,
                result: bResult
              });
            }
          }
        }
      }
    }
    
    // Update flow stats in DB
    await prisma.automationFlow.update({
      where: { id: flow.id },
      data: {
        runsCount: { increment: 1 },
        lastRunAt: new Date()
      }
    });

  } catch (error: any) {
    status = "ERROR";
    errorMsg = error.message || 'Execution error';
    console.error(`[Engine] Execution error in flow ${flow.id}:`, error);
  } finally {
    const totalDurationMs = Date.now() - startTime;
    await prisma.automationLog.create({
      data: {
        tenantId: flow.tenantId,
        flowId: flow.id,
        status,
        errorMsg,
        payload: {
          initial: initialPayload,
          final: context,
          steps: executionLogs,
          totalDurationMs
        }
      }
    }).catch(err => console.error('[Engine] Failed to save automation log:', err));

    console.log(`[Engine] Finished flow ${flow.id} in ${totalDurationMs}ms with status: ${status}`);
  }
}

