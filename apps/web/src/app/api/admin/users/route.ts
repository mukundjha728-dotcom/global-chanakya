import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserService } from "@/modules/user/services/user.service";

// ✅ ADMIN EMAIL — only this email can ever be admin
const ADMIN_EMAIL = "mukundjha728@gmail.com";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, action, role } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const target = await UserService.getUserProfile(userId);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 🔒 Protect the single admin account — cannot touch it
  if (target.email === ADMIN_EMAIL) {
    return NextResponse.json({ error: "Admin account is protected" }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};

  // 🔒 Never allow setting role to admin via API
  if (action === "setRole") {
    if (!role || role === "admin") {
      return NextResponse.json({ error: "Cannot set admin role" }, { status: 403 });
    }
    updateData.role = role;
  } else if (action === "ban") {
    updateData.isBanned = true;
  } else if (action === "unban") {
    updateData.isBanned = false;
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await UserService.updateUserStatus(userId, updateData);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await UserService.getAllUsers();

  return NextResponse.json(users);
}
