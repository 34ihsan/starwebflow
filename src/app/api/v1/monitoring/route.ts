import { NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant";
    
    const monitors = await MonitoringService.listMonitors(tenantId);
    
    return NextResponse.json({
      success: true,
      data: monitors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant";
    const body = await request.json();

    const monitor = await MonitoringService.createMonitor(tenantId, body);

    return NextResponse.json({
      success: true,
      data: monitor,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 400 }
    );
  }
}
