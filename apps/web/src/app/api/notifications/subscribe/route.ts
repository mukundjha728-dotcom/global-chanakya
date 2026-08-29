import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { PushSubscription } from "@/lib/models/PushSubscription";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // Limit request body size
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 2048) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();

    if (!body || !body.endpoint || !body.keys || !body.keys.p256dh || !body.keys.auth) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    // Basic URL validation for endpoint
    try {
      new URL(body.endpoint);
    } catch {
      return NextResponse.json({ error: "Invalid endpoint URL" }, { status: 400 });
    }

    await dbConnect();
    
    // Optional auth
    const session = await auth();
    const userId = session?.user?.id;

    // Use upsert to handle duplicates cleanly and update keys if changed
    await PushSubscription.findOneAndUpdate(
      { endpoint: body.endpoint },
      {
        $set: {
          endpoint: body.endpoint,
          keys: {
            p256dh: body.keys.p256dh,
            auth: body.keys.auth,
          },
          active: true,
          userId: userId || undefined,
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/notifications/subscribe] Error:", err.message);
    // Handle JSON parsing error specifically
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.endpoint) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    await dbConnect();

    await PushSubscription.findOneAndUpdate(
      { endpoint: body.endpoint },
      { $set: { active: false } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/notifications/subscribe] Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
