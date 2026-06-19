import { Role } from "./roles";

export type Permission =
  | "create_content"
  | "edit_content"
  | "delete_content"
  | "publish_content"
  | "manage_users"
  | "manage_roles"
  | "manage_system"
  | "view_analytics"
  | "manage_notifications";

export const PERMISSIONS_MATRIX: Record<Role, Permission[]> = {
  super_admin: [
    "create_content", "edit_content", "delete_content", "publish_content",
    "manage_users", "manage_roles", "manage_system", "view_analytics", "manage_notifications"
  ],
  admin: [
    "create_content", "edit_content", "delete_content", "publish_content",
    "manage_users", "view_analytics", "manage_notifications"
  ],
  editor: [
    "create_content", "edit_content", "publish_content", "view_analytics"
  ],
  analyst: [
    "create_content", "edit_content", "view_analytics"
  ],
  subscriber: [],
  free: [],
  guest: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS_MATRIX[role]?.includes(permission) ?? false;
}
