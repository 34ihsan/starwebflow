import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, path, title, referrer, pageViewId, duration } = body;

    const cookieStore = await cookies();
    let visitorId = cookieStore.get("swf_visitor_id")?.value;
    let isNewVisitor = false;

    if (!visitorId) {
      visitorId = uuidv4();
      isNewVisitor = true;
    }

    const userAgent = req.headers.get("user-agent") || undefined;

    if (action === "pageview") {
      if (!path) {
        return NextResponse.json({ error: "Path is required" }, { status: 400 });
      }

      // Ignore admin pages from visitor tracking if desired, or track everything
      // Let's filter out /admin pages from public visitor tracking
      if (path.startsWith("/admin")) {
        return NextResponse.json({ success: true, ignored: true });
      }

      const pageView = await prisma.pageView.create({
        data: {
          visitorId,
          path,
          title: title || null,
          referrer: referrer || null,
          userAgent: userAgent || null,
          duration: 0,
        },
      });

      const response = NextResponse.json({
        success: true,
        pageViewId: pageView.id,
        visitorId,
      });

      if (isNewVisitor) {
        response.cookies.set("swf_visitor_id", visitorId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }

      return response;
    }

    if (action === "heartbeat" && pageViewId) {
      if (typeof duration === "number" && duration > 0) {
        await prisma.pageView.update({
          where: { id: pageViewId },
          data: {
            duration: Math.min(duration, 3600), // Cap at 1 hour for pings
          },
        }).catch(() => {
          // Ignore error if pageView was deleted or invalid
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
