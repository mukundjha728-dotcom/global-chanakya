import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await IntelligenceEvent.findByIdAndUpdate(id, { status });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await IntelligenceEvent.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
