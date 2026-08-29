import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PushService } from "@/lib/notifications/push.service";

export const maxDuration = 30; // 30s limit to prevent timeout on hobby

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, body: notificationBody, url, notificationType } = body;

    if (!title || !notificationBody || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Default notificationType to PLATFORM if not provided
    const type = notificationType || "PLATFORM";

    // Call PushService.notifyPlatform
    // Pass a safe deadline (Vercel hobby is 10s, we use 3s by default in PushService, here we explicitly pass 5000ms)
    await PushService.notifyPlatform(
      { title, message: notificationBody, url },
      Date.now() + 5000 
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/notifications/platform] Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
