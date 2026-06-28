import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";
import { prisma } from "@/lib/prisma";

// Temporarily handle auth/tenantId for the MVP
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant";
    
    await MonitoringService.sendUpdateNotification(params.id, tenantId);
    
    return NextResponse.json({ success: true, message: "Update notification sent successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
