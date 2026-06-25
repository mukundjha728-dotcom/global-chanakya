import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { Conflict } from "@/lib/models/Conflict";

export const maxDuration = 30;

async function requireAdmin() {
  const [session] = await Promise.all([auth(), dbConnect()]);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

function errorMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const doc = await Conflict.findById(id).lean();
      if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(doc);
    }

    const docs = await Conflict.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json(docs);
  } catch (err) {
    console.error("[GET /api/admin/conflicts]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const doc = await Conflict.create({
      ...body,
      source: body.source || "admin",
      status: body.status || "draft",
    });
    return NextResponse.json({ success: true, id: doc._id.toString(), slug: doc.slug }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/conflicts]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    if (updates.status === "published" && !updates.publishAt) {
      updates.publishAt = new Date();
    }

    const doc = await Conflict.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/conflicts]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await Conflict.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/conflicts]", err);
    return NextResponse.json({ error: errorMsg(err) }, { status: 500 });
  }
}
