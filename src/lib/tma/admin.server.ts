/**
 * LIORA — brama administracyjna Telegram Mini App (server-only).
 *
 * TRZY NIEZALEŻNE WARUNKI, wszystkie muszą przejść:
 *  1. podpis `initData` zgodny z tokenem bota (dowód pochodzenia od Telegrama),
 *  2. `telegram_id` obecny na allowliście `telegram_id → user_id`,
 *  3. REALNA rola personelu odczytana z `user_roles` przy KAŻDYM wywołaniu.
 *
 * Warunek 3 jest rozstrzygający: sam identyfikator Telegrama nigdy nie nadaje
 * uprawnień, a odebranie roli w bazie natychmiast odcina dostęp.
 *
 * FAIL-CLOSED: brak tokenu, brak klucza sekretnego lub brak wpisu w bazie
 * oznacza BRAK dostępu. Nigdy „ciche otwarcie” panelu.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/schema";
import { SUPABASE_ENDPOINT, secretKey, supabaseFetch } from "@/config/supabase";
import { adminAllowlist, botToken } from "@/lib/telegram/config.server";
import { verifyInitData } from "./verify.server";

/** Role uprawnione do panelu zarządzania. */
const STAFF_ROLES = new Set(["admin", "moderator"]);

export interface TmaAdminSession {
  userId: string;
  role: "admin" | "moderator";
  telegramId: string;
}

/**
 * Klient omijający RLS — wyłącznie do odczytu roli, gdy nie ma sesji
 * użytkownika (Mini App nie loguje się linkiem e-mail).
 */
function createRoleReader() {
  const key = secretKey();
  if (!key) return null;
  return createClient<Database>(SUPABASE_ENDPOINT, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: supabaseFetch(key) },
  });
}

export async function resolveTmaAdmin(initData: string): Promise<TmaAdminSession | null> {
  // 1. Podpis.
  const verified = await verifyInitData(initData, botToken("admin"));
  if (!verified) return null;

  // 2. Allowlista — mapuje tożsamość Telegrama na konto w bazie.
  const userId = adminAllowlist().get(verified.telegramId);
  if (!userId) return null;

  // 3. Rola z bazy. Brak klucza sekretnego = brak możliwości weryfikacji =
  //    brak dostępu (nie zakładamy uprawnień „w dobrej wierze”).
  const reader = createRoleReader();
  if (!reader) return null;

  const { data, error } = await reader.from("user_roles").select("role").eq("user_id", userId);
  if (error) return null;

  const roles = (data ?? []) as { role: string }[];
  const role = roles.map((row) => row.role).find((value) => STAFF_ROLES.has(value));
  if (!role) return null;

  return { userId, role: role as "admin" | "moderator", telegramId: verified.telegramId };
}
