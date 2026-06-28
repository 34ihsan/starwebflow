import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string, reportId: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant"; 
    
    await MonitoringService.sendMaintenanceReport(params.reportId, params.id, tenantId);
    
    return NextResponse.json({ success: true, message: "Maintenance report sent successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send report" },
      { status: 500 }
    );
  }
}
