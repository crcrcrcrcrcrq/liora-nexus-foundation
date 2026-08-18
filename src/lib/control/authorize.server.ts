/**
 * LIORA P0.38 — autoryzacja Control Plane (SERVER-ONLY).
 *
 * Łańcuch tożsamości jest jednokierunkowy i zawsze kończy się w bazie:
 *
 *   Telegram User → Telegram ID → LIORA User → LIORA Role (`user_roles`) → Permission
 *
 * Nie powstaje drugi system uprawnień. Ponownie używamy `resolveStaffIdentity`
 * (allowlista Telegram Admin + realna rola z `user_roles`) oraz
 * `requireStaffRole` dla sesji panelu. Telegram NIGDY nie nadaje sobie roli:
 * allowlista jedynie MAPUJE identyfikator, autorytetem pozostaje baza.
 */
import type { LioraServerClient } from "@/integrations/supabase/session.server";
import type { StaffRole } from "@/features/admin/model/types";
import { controlPermissionsFor, hasControlPermission, type ControlPermission } from "./model";

export interface ControlIdentity {
  userId: string;
  role: StaffRole;
  permissions: readonly ControlPermission[];
  supabase: LioraServerClient;
}

/** Tożsamość Control Plane dla sesji panelu (staff). Rzuca przy braku roli. */
export async function requireControlIdentity(
  supabase: LioraServerClient,
  userId: string,
): Promise<ControlIdentity> {
  const { requireStaffRole } = await import("@/lib/admin.server");
  const role = await requireStaffRole(supabase, userId);
  return { userId, role, permissions: controlPermissionsFor(role), supabase };
}

/**
 * Tożsamość Control Plane dla Telegrama. `null` = brak dostępu; wywołujący
 * odpowiada zawsze tym samym komunikatem, żeby nie zdradzać allowlisty.
 */
export async function resolveControlIdentityFromTelegram(
  telegramUserId: string,
): Promise<ControlIdentity | null> {
  const { resolveStaffIdentity } = await import("@/lib/telegram-admin/auth.server");
  const identity = await resolveStaffIdentity(telegramUserId);
  if (!identity) return null;
  return {
    userId: identity.userId,
    role: identity.role,
    permissions: controlPermissionsFor(identity.role),
    supabase: identity.supabase,
  };
}

export class ControlForbiddenError extends Error {
  constructor(permission: ControlPermission) {
    super(`Forbidden: control permission required (${permission})`);
    this.name = "ControlForbiddenError";
  }
}

export function assertControlPermission(
  identity: ControlIdentity,
  permission: ControlPermission,
): void {
  if (!hasControlPermission(identity.role, permission)) {
    throw new ControlForbiddenError(permission);
  }
}
