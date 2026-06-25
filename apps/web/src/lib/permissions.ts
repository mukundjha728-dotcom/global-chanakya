export type AdminRole = "super_admin" | "editor" | "analyst" | "researcher" | "writer";

export interface PermissionMatrix {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canSchedule: boolean;
  canManageSEO: boolean;
  canManageHomepage: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canManageNavigation: boolean;
  canManageMedia: boolean;
}

export const ROLE_PERMISSIONS: Record<AdminRole, PermissionMatrix> = {
  super_admin: {
    canCreate: true, canEdit: true, canDelete: true, canPublish: true, canSchedule: true,
    canManageSEO: true, canManageHomepage: true, canManageUsers: true,
    canViewAuditLogs: true, canManageNavigation: true, canManageMedia: true,
  },
  editor: {
    canCreate: true, canEdit: true, canDelete: false, canPublish: true, canSchedule: true,
    canManageSEO: true, canManageHomepage: true, canManageUsers: false,
    canViewAuditLogs: false, canManageNavigation: true, canManageMedia: true,
  },
  analyst: {
    canCreate: true, canEdit: true, canDelete: false, canPublish: false, canSchedule: false,
    canManageSEO: false, canManageHomepage: false, canManageUsers: false,
    canViewAuditLogs: false, canManageNavigation: false, canManageMedia: true,
  },
  researcher: {
    canCreate: true, canEdit: true, canDelete: false, canPublish: false, canSchedule: false,
    canManageSEO: false, canManageHomepage: false, canManageUsers: false,
    canViewAuditLogs: false, canManageNavigation: false, canManageMedia: false,
  },
  writer: {
    canCreate: true, canEdit: true, canDelete: false, canPublish: false, canSchedule: false,
    canManageSEO: false, canManageHomepage: false, canManageUsers: false,
    canViewAuditLogs: false, canManageNavigation: false, canManageMedia: true,
  }
};

export function hasPermission(role: string, permission: keyof PermissionMatrix): boolean {
  if (!(role in ROLE_PERMISSIONS)) return false;
  return ROLE_PERMISSIONS[role as AdminRole][permission] === true;
}
