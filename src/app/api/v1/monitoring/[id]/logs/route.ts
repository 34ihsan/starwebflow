import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = "default-tenant"; // from auth session
    
    // Check if monitor belongs to tenant
    const monitor = await prisma.serviceMonitor.findUnique({
      where: { id: params.id, tenantId }
    });
    
    if (!monitor) {
      return NextResponse.json({ success: false, error: { message: "Monitor not found" } }, { status: 404 });
    }

    const logs = await prisma.monitorLog.findMany({
      where: { monitorId: params.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
