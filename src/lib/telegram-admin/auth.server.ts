/**
 * LIORA P0.30 — autoryzacja bota administracyjnego (server-only).
 *
 * Trzy niezależne bramki, każda musi przejść:
 *  1. sekret webhooka (nagłówek `X-Telegram-Bot-Api-Secret-Token`) — dowód, że
 *     żądanie pochodzi od Telegrama, a nie od przypadkowego klienta HTTP,
 *  2. allowlista `telegram_id → user_id` z konfiguracji serwera,
 *  3. REALNA rola personelu odczytana z `user_roles` przy KAŻDYM poleceniu.
 *
 * Punkt 3 jest kluczowy: sam identyfikator Telegrama nigdy nie nadaje
 * uprawnień. Odebranie roli w bazie natychmiast odcina bota, bez zmiany
 * konfiguracji. Bot nie ma własnego zbioru uprawnień ani własnej logiki ról.
 */
import { timingSafeEqual } from "crypto";
import { adminAllowlist, botWebhookSecret, type TelegramBot } from "@/lib/telegram/config.server";
import type { StaffRole } from "@/features/admin/model/types";
import type { LioraServerClient } from "@/integrations/supabase/session.server";

export function verifyWebhookSecret(bot: TelegramBot, provided: string | null): boolean {
  const expected = botWebhookSecret(bot);
  if (!expected || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export interface StaffIdentity {
  userId: string;
  role: StaffRole;
  supabase: LioraServerClient;
}

/**
 * Zwraca tożsamość personelu albo `null`. `null` = brak dostępu; wywołujący
 * odpowiada zawsze tym samym komunikatem, żeby bot nie zdradzał, czy dany
 * identyfikator w ogóle istnieje na allowliście.
 */
export async function resolveStaffIdentity(telegramUserId: string): Promise<StaffIdentity | null> {
  const userId = adminAllowlist().get(telegramUserId);
  if (!userId) return null;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const supabase = supabaseAdmin as unknown as LioraServerClient;
    const { requireStaffRole } = await import("@/lib/admin.server");
    const role = await requireStaffRole(supabase, userId);
    return { userId, role, supabase };
  } catch {
    return null;
  }
}
