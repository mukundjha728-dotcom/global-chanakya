export const ROLES = {
  GUEST: "guest",
  FREE: "free",
  PREMIUM: "premium",
  ADMIN: "admin",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export function hasAccess(userRole: Role, requiredRole: Role): boolean {
  const roleWeights: Record<Role, number> = {
    [ROLES.GUEST]: 0,
    [ROLES.FREE]: 1,
    [ROLES.PREMIUM]: 2,
    [ROLES.ADMIN]: 3,
  };
  return roleWeights[userRole] >= roleWeights[requiredRole];
}
