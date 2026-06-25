import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

// Temporarily handle auth/tenantId for the MVP
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real app with next-auth:
    // const session = await getServerSession();
    // const tenantId = session?.user?.tenantId;
    const tenantId = "default-tenant-id"; 
    
    await MonitoringService.sendUpdateNotification(params.id, tenantId);
    
    return NextResponse.json({ success: true, message: "Update notification sent successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
