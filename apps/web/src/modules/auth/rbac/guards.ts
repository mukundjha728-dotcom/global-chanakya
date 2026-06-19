import { auth } from "@/auth";
import { Permission, hasPermission } from "./permissions";
import { Role } from "./roles";
import { NextResponse } from "next/server";

export async function requirePermission(permission: Permission) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  const role = (session.user as unknown as { role: Role }).role;
  
  if (!hasPermission(role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return session.user;
}

export async function withPermissionApi(permission: Permission, handler: Function) {
  return async (req: Request, ...args: unknown[]) => {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as unknown as { role: Role }).role;
    
    if (!hasPermission(role, permission)) {
      return NextResponse.json({ error: "Forbidden: Insufficient Permissions" }, { status: 403 });
    }

    return handler(req, ...args);
  };
}
