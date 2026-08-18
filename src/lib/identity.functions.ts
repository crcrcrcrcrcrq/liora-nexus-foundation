import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { IdentityUser, Role } from "@/features/identity/model/types";

/**
 * Tożsamość rozstrzygana po stronie serwera.
 *
 * Rola NIGDY nie pochodzi od klienta — czytamy ją z tabeli `user_roles`
 * przez sesję użytkownika (RLS). Profil zakłada trigger `handle_new_user`;
 * tutaj jedynie idempotentnie uzupełniamy brak.
 */

const ROLE_RANK: Record<Role, number> = { guest: 0, client: 1, moderator: 2, admin: 3 };

export const fetchIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<IdentityUser> => {
    const { supabase, userId, email } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .eq("id", userId)
      .maybeSingle();

    let resolved = profile;
    if (!resolved) {
      const { data: created } = await supabase
        .from("profiles")
        .upsert({ id: userId, email }, { onConflict: "id" })
        .select("id, email, display_name, created_at")
        .maybeSingle();
      resolved = created;
    }

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);

    const roleRows = (roles ?? []) as { role: string }[];
    const role: Role = roleRows.reduce<Role>((best: Role, row: { role: string }) => {
      const candidate = row.role as Role;
      return (ROLE_RANK[candidate] ?? 0) > ROLE_RANK[best] ? candidate : best;
    }, "guest");

    return {
      id: userId,
      email: resolved?.email ?? email,
      role,
      ...(resolved?.display_name ? { displayName: resolved.display_name } : {}),
      ...(resolved?.created_at ? { createdAt: resolved.created_at } : {}),
    };
  });
