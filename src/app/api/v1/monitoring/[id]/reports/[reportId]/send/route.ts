import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string, reportId: string } }
) {
  try {
    const tenantId = "default-tenant-id"; 
    
    await MonitoringService.sendMaintenanceReport(params.reportId, params.id, tenantId);
    
    return NextResponse.json({ success: true, message: "Maintenance report sent successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send report" },
      { status: 500 }
    );
  }
}
