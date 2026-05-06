import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { User } from "@/lib/models/User";

// ✅ ADMIN EMAIL — only this email can ever be admin
const ADMIN_EMAIL = "mukundjha728@gmail.com";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, action, role } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await dbConnect();
  const target = await User.findById(userId);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 🔒 Protect the single admin account — cannot touch it
  if (target.email === ADMIN_EMAIL) {
    return NextResponse.json({ error: "Admin account is protected" }, { status: 403 });
  }

  // 🔒 Never allow setting role to admin via API
  if (action === "setRole") {
    if (!role || role === "admin") {
      return NextResponse.json({ error: "Cannot set admin role" }, { status: 403 });
    }
    target.role = role;
  } else if (action === "ban") {
    target.isBanned = true;
  } else if (action === "unban") {
    target.isBanned = false;
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await target.save();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const users = await User.find(
    {},
    { name: 1, email: 1, role: 1, provider: 1, isBanned: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(users);
}
