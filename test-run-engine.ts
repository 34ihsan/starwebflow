import { executeFlowsForEvent } from "./src/lib/automation/engine";
import { prisma } from "./src/lib/prisma";

async function run() {
  console.log("Triggering event: cron.weekly");
  const tenant = await prisma.tenant.findFirst();
  await executeFlowsForEvent("cron.weekly", { tenantId: tenant?.id });
  
  // Wait a second for async execution
  await new Promise(r => setTimeout(r, 2000));
  
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 2
  });
  console.log("Latest leads:");
  console.log(leads.map(l => ({ name: l.name, email: l.email, status: l.status, source: l.source })));
}

run().catch(console.error).finally(() => process.exit(0));
