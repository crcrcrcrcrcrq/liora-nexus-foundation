/**
 * LIORA P0.38 — kontrakt Control Plane (client-safe).
 *
 * Control Plane jest warstwą STERUJĄCĄ. Nie duplikuje backendu biznesowego:
 * bookings, users, roles, CMS, services, schedule, notifications, analytics
 * i oba kanały Telegrama pozostają w istniejącym backendzie LIORA.
 *
 * Do przeglądarki (i do Telegram Mini App) trafiają wyłącznie stany i flagi.
 */

export const CONTROL_MODULES = [
  "auth",
  "roles",
  "deployment",
  "backups",
  "releases",
  "storage",
  "checkpoints",
  "health",
] as const;

export type ControlModule = (typeof CONTROL_MODULES)[number];

/**
 * - `ready`          — moduł ma realne dane / realne źródło,
 * - `configured`     — fundament gotowy, brak danych albo brak weryfikacji,
 * - `not_configured` — brak wymaganej konfiguracji serwerowej,
 * - `unavailable`    — brak uprawnień lub źródło nieosiągalne,
 * - `error`          — odczyt zakończył się błędem.
 */
export type ControlState = "ready" | "configured" | "not_configured" | "unavailable" | "error";

export interface ControlModuleStatus {
  module: ControlModule;
  state: ControlState;
  count?: number;
  flags?: Record<string, boolean>;
  /** `true` tylko gdy realna operacja na module została wykonana i potwierdzona. */
  verified: boolean;
}

/**
 * Uprawnienia Control Plane. Mapowane z ról LIORA (`user_roles`) —
 * Control Plane nie ma własnego rejestru uprawnień i nie potrafi nadać roli.
 */
export const CONTROL_PERMISSIONS = [
  "control:read",
  "control:storage:read",
  "control:backup:write",
  "control:release:write",
  "control:deployment:write",
] as const;

export type ControlPermission = (typeof CONTROL_PERMISSIONS)[number];

/** Rola LIORA → uprawnienia Control Plane. `admin` steruje, `moderator` czyta. */
export const CONTROL_ROLE_PERMISSIONS: Record<"admin" | "moderator", readonly ControlPermission[]> =
  {
    admin: [
      "control:read",
      "control:storage:read",
      "control:backup:write",
      "control:release:write",
      "control:deployment:write",
    ],
    moderator: ["control:read", "control:storage:read"],
  };

export function controlPermissionsFor(role: "admin" | "moderator"): readonly ControlPermission[] {
  return CONTROL_ROLE_PERMISSIONS[role];
}

export function hasControlPermission(
  role: "admin" | "moderator",
  permission: ControlPermission,
): boolean {
  return CONTROL_ROLE_PERMISSIONS[role].includes(permission);
}
