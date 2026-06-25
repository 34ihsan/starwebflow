const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error("No tenant found");

    const flow = await prisma.automationFlow.create({
      data: {
        tenantId: tenant.id,
        name: "Berlin Diş Kliniği Avcısı (Test)",
        status: "ACTIVE",
        nodes: [
          { id: "start", type: "trigger", eventName: "cron.weekly", label: "Her Pazartesi 08:00", app: "Schedule" },
          { id: "n2", type: "action", label: "Kazı & Topla", app: "Apify Scraper", sector: "Diş Kliniği", location: "Berlin" },
          { id: "n3", type: "action", label: "Yapay Zeka Temizliği", app: "AI Clean Data" },
          { id: "n4", type: "action", label: "CRM'e Aktar (Onay Bekliyor)", app: "Bulk Create Leads" }
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
