export type Role = "super_admin" | "admin" | "editor" | "analyst" | "subscriber" | "free" | "guest";

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  analyst: 40,
  subscriber: 20,
  free: 10,
  guest: 0,
};

export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minimumRole] || 0);
}
