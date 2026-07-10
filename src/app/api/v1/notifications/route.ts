import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/modules/auth/auth.server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { tenantId: session.tenantId, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id, tenantId: session.tenantId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
