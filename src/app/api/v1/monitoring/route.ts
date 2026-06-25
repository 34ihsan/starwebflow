import { NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

export async function GET(request: Request) {
  try {
    // In a real implementation, you would get the tenantId from Auth Session
    // For MVP/Demonstration, we'll assume a dummy or extract from headers/auth.
    const tenantId = "default-tenant"; 
    
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
    const tenantId = "default-tenant"; // Should come from session
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
