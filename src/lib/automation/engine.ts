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


/**
 * Maps app/type strings from Node JSON to actual executable functions.
 */
const ACTION_REGISTRY: Record<string, Function> = {
  "Create Project": createProjectAction,
  "Create Task": createTaskAction,
  "Send Internal Chat": sendInternalChatAction,
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
  // Google AI — Gemini tabanlı node'lar
  "AI Generate Image": aiGenerateImageAction,
  "AI Generate Video": aiGenerateVideoAction,
  "AI Generate Content": aiGenerateContentAction,
  // Fallbacks for generic mapping
  "Database": createTaskAction, 
  "Star AI": aiScoreLeadAction,
  "Slack": sendInternalChatAction,
  "Email": sendInternalChatAction
};


/**
 * Execute all active flows that listen to a specific event.
 */
export async function executeFlowsForEvent(eventName: string, payload: any) {
  // We need to find flows that are ACTIVE and have a trigger node matching eventName.
  // Since nodes are stored as JSON, we'll fetch all ACTIVE flows and filter them in memory.
  // In a large production environment, a dedicated trigger/event mapping table is better.
  
  const activeFlows = await prisma.automationFlow.findMany({
    where: { status: "ACTIVE" }
  });

  const matchingFlows = activeFlows.filter(flow => {
    const nodes = flow.nodes as any[];
    if (!Array.isArray(nodes) || nodes.length === 0) return false;
    
    // Check if the first node is a trigger that matches the eventName
    const firstNode = nodes[0];
    return firstNode.type === "trigger" && firstNode.eventName === eventName;
  });

  console.log(`[Engine] Found ${matchingFlows.length} flows for event ${eventName}`);

  for (const flow of matchingFlows) {
    // Run asynchronously to not block the main process
    executeFlow(flow, payload).catch(e => console.error(`[Engine] Flow ${flow.id} failed:`, e));
  }
}

/**
 * Execute a single flow instance.
 */
export async function executeFlow(flow: any, initialPayload: any) {
  console.log(`[Engine] Starting execution for flow: ${flow.id} - ${flow.name}`);
  const nodes = flow.nodes as any[];
  if (!Array.isArray(nodes) || nodes.length < 2) {
    console.warn(`[Engine] Flow ${flow.id} has insufficient nodes.`);
    return;
  }

  let currentPayload = { ...initialPayload };
  let status = "SUCCESS";
  let errorMsg = null;
  const executionLogs: any[] = [];

  try {
    // Start from node 1 (node 0 is the trigger which already fired)
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      
      if (node.type === "action") {
        const actionFn = ACTION_REGISTRY[node.app] || ACTION_REGISTRY[node.label];
        if (actionFn) {
          console.log(`[Engine] Executing action node: ${node.app || node.label}`);
          const result = await actionFn(flow.tenantId, currentPayload, node);
          currentPayload = { ...currentPayload, ...result };
          executionLogs.push({ node: node.id, result });
        } else {
          console.warn(`[Engine] Action ${node.app || node.label} not found in registry.`);
          executionLogs.push({ node: node.id, error: "Action not implemented" });
        }
      } 
      else if (node.type === "condition") {
        console.log(`[Engine] Executing condition node: ${node.label}`);
        // Simple condition evaluator (e.g. "score > 80")
        // We will do a basic mock check for this demo
        const score = currentPayload.score || 0;
        let chosenBranch = null;

        if (score > 80) {
          chosenBranch = node.branches?.find((b: any) => b.path.includes("Evet") || b.path.includes("VIP"));
        } else {
          chosenBranch = node.branches?.find((b: any) => b.path.includes("Hayır") || b.path.includes("Standart"));
        }

        if (chosenBranch && Array.isArray(chosenBranch.nodes)) {
          console.log(`[Engine] Taking branch: ${chosenBranch.path}`);
          for (const bNode of chosenBranch.nodes) {
            const bActionFn = ACTION_REGISTRY[bNode.app] || ACTION_REGISTRY[bNode.label];
            if (bActionFn) {
              const bResult = await bActionFn(flow.tenantId, currentPayload, bNode);
              currentPayload = { ...currentPayload, ...bResult };
              executionLogs.push({ node: bNode.id, branch: chosenBranch.path, result: bResult });
            }
          }
        }
      }
    }
    
    // Update flow stats
    await prisma.automationFlow.update({
      where: { id: flow.id },
      data: {
        runsCount: { increment: 1 },
        lastRunAt: new Date()
      }
    });

  } catch (error: any) {
    status = "ERROR";
    errorMsg = error.message;
    console.error(`[Engine] Execution error in flow ${flow.id}:`, error);
  } finally {
    // Save log
    await prisma.automationLog.create({
      data: {
        tenantId: flow.tenantId,
        flowId: flow.id,
        status,
        errorMsg,
        payload: {
          initial: initialPayload,
          final: currentPayload,
          steps: executionLogs
        }
      }
    });
    console.log(`[Engine] Finished execution for flow: ${flow.id}. Status: ${status}`);
  }
}
