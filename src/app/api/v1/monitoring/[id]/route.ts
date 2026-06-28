import { NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant";
    const monitor = await MonitoringService.getMonitor(params.id, tenantId);
    
    if (!monitor) {
      return NextResponse.json({ success: false, error: { message: "Not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: monitor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant";
    const body = await request.json();
    
    const monitor = await MonitoringService.updateMonitor(params.id, tenantId, body);

    return NextResponse.json({ success: true, data: monitor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findFirst();
    const tenantId = tenant?.id || "default-tenant";
    await MonitoringService.deleteMonitor(params.id, tenantId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}
