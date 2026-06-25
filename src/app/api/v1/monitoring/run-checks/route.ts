import { NextResponse } from "next/server";
import { MonitoringService } from "@/modules/monitoring/monitoring.service";

// This endpoint should be protected by a cron secret in production
export async function GET(request: Request) {
  try {
    // Optional: check Authorization header against process.env.CRON_SECRET
    
    const result = await MonitoringService.runChecks();
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Cron check failed:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
