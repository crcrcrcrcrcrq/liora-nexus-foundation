import type { Permission, Role } from "./types";
import { translate as t } from "@/lib/i18n";

/** Hierarchia ról — wyższa wartość obejmuje zakres niższej w miejscach, gdzie to naturalne. */
export const ROLE_RANK: Record<Role, number> = {
  guest: 0,
  client: 1,
  moderator: 2,
  admin: 3,
};

export function roleLabel(role: Role): string {
  return t(`admin.roles.${role}`);
}

/**
 * Macierz uprawnień. Jedno źródło prawdy dla nawigacji, tras i widoków.
 * Backend powtórzy tę weryfikację — po stronie frontu służy wyłącznie UX.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  guest: [],
  client: ["chronicle:read", "chronicle:write"],
  /**
   * Moderator opiekuje się przebiegiem, nie ludźmi: widzi obecność wyłącznie
   * pod identyfikatorem LIORA (`clients:read:masked`) i nigdy nie otrzymuje
   * `clients:read:full`. Backend powtarza to ograniczenie na poziomie zapytania.
   */
  moderator: [
    "requests:read",
    "requests:manage",
    "content:publish",
    "blog:manage",
    "experience:read",
    "consultations:manage",
    "activity:read",
    "clients:read:masked",
  ],
  admin: [
    "chronicle:read",
    "chronicle:write",
    "requests:read",
    "requests:manage",
    "content:publish",
    "blog:manage",
    "experience:read",
    "consultations:manage",
    "activity:read",
    "clients:read:masked",
    "clients:read:full",
    "roles:manage",
    "security:manage",
    "integrations:manage",
    "settings:manage",
    "stats:read",
  ],
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function roleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/** Trasa startowa po powrocie do Kroniki — zależna od roli. */
export function homePathForRole(role: Role): string {
  if (role === "admin" || role === "moderator") return "/admin";
  if (role === "client") return "/kronika";
  return "/";
}
