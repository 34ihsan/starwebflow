const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error("No tenant found");

    const flow = await prisma.automationFlow.create({
      data: {
        tenantId: tenant.id,
        name: "Sözleşmeden Üretime (Test Flow)",
        status: "ACTIVE",
        nodes: [
          { id: "n1", type: "trigger", eventName: "contract.signed", label: "Sözleşme İmzalandı", app: "Internal Event" },
          { id: "n2", type: "action", label: "Create Project", app: "Create Project" },
          { id: "n3", type: "action", label: "Create Task", app: "Create Task" },
          { id: "n4", type: "action", label: "Send Internal Chat", app: "Send Internal Chat", message: "Projeniz başarıyla başlatıldı." }
        ]
      }
    });

    console.log("Flow created:", flow.id);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
