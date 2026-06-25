import { NextResponse } from "next/server";
import { EventBus } from "@/lib/automation/eventBus";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { eventName, payload } = await request.json();
    
    // Asynchronous call to the EventBus
    EventBus.emit(eventName, payload);
    
    return NextResponse.json({ success: true, message: `Event ${eventName} triggered.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // A quick way to scaffold a mock "Hero Flow" in the DB
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) return NextResponse.json({ error: "No tenant" });

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

  return NextResponse.json({ success: true, flow });
}
