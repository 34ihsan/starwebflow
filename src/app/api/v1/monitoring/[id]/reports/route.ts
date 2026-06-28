import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant"; 
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant"; 
    const data = await request.json();
    const report = await MonitoringService.createMaintenanceReport(params.id, tenantId, data);
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create report" },
      { status: 500 }
    );
  }
}
