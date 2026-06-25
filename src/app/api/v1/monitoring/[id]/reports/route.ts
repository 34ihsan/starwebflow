import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = "default-tenant-id"; 
    const reports = await MonitoringService.listMaintenanceReports(params.id, tenantId);
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = "default-tenant-id"; 
    const data = await req.json();
    const report = await MonitoringService.createMaintenanceReport(params.id, tenantId, data);
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create report" },
      { status: 500 }
    );
  }
}
