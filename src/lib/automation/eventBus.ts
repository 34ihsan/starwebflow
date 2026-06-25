import { executeFlowsForEvent } from "./engine";

/**
 * A lightweight serverless-friendly Event Bus.
 * Instead of keeping listeners in memory (which fails in serverless),
 * this immediately queries the DB for active flows that match the event
 * and routes the payload to the Automation Engine.
 */
export const EventBus = {
  /**
   * Emit an internal system event.
   * @param eventName e.g., 'contract.signed', 'invoice.overdue'
   * @param payload The event payload containing relevant IDs
   */
  emit: async (eventName: string, payload: any) => {
    try {
      console.log(`[EventBus] Emitting event: ${eventName}`);
      // Send directly to the engine to handle processing
      await executeFlowsForEvent(eventName, payload);
    } catch (error) {
      console.error(`[EventBus] Error processing event ${eventName}:`, error);
    }
  }
};
