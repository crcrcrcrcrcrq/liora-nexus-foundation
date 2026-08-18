/**
 * LIORA P0.30 — konfiguracja botów Telegrama (server-only).
 *
 * Dwa boty, dwa całkowicie rozdzielne zestawy sekretów i dwie rozdzielne
 * allowlisty. Bot statystyk NIE MOŻE dostać się do danych operacyjnych, a bot
 * administracyjny nie potrzebuje bazy analitycznej — separacja zaczyna się tutaj.
 *
 * Zmienne środowiskowe (wyłącznie serwerowe, nigdy `VITE_*`):
 *   TELEGRAM_ADMIN_BOT_TOKEN        — token bota administracyjnego
 *   TELEGRAM_ADMIN_WEBHOOK_SECRET   — sekret nagłówka webhooka
 *   TELEGRAM_ADMIN_ALLOWLIST        — "<telegram_id>:<supabase_user_id>,..."
 *   TELEGRAM_STATS_BOT_TOKEN        — token bota statystyk
 *   TELEGRAM_STATS_WEBHOOK_SECRET   — sekret nagłówka webhooka
 *   TELEGRAM_STATS_ALLOWLIST        — "<telegram_id>,<telegram_id>"
 *   TELEGRAM_BOT_LANGUAGE           — "pl" | "en" (domyślnie "pl")
 */
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";

export type TelegramBot = "admin" | "stats";

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function botToken(bot: TelegramBot): string {
  return env(bot === "admin" ? "TELEGRAM_ADMIN_BOT_TOKEN" : "TELEGRAM_STATS_BOT_TOKEN");
}

export function botWebhookSecret(bot: TelegramBot): string {
  return env(bot === "admin" ? "TELEGRAM_ADMIN_WEBHOOK_SECRET" : "TELEGRAM_STATS_WEBHOOK_SECRET");
}

/** Bot działa dopiero, gdy ma token, sekret webhooka i choć jedną osobę na allowliście. */
export function isBotConfigured(bot: TelegramBot): boolean {
  const list = env(bot === "admin" ? "TELEGRAM_ADMIN_ALLOWLIST" : "TELEGRAM_STATS_ALLOWLIST");
  return Boolean(botToken(bot) && botWebhookSecret(bot) && list);
}

/** Język komunikatów bota — bot nie ma przeglądarki, więc bierze go z konfiguracji. */
export function botLanguage(): Language {
  const value = env("TELEGRAM_BOT_LANGUAGE");
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
    ? (value as Language)
    : DEFAULT_LANGUAGE;
}

/** Allowlista bota administracyjnego: telegram_id → user_id w bazie. */
export function adminAllowlist(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of env("TELEGRAM_ADMIN_ALLOWLIST").split(",")) {
    const [telegramId, userId] = entry.split(":").map((part) => part.trim());
    if (telegramId && userId) map.set(telegramId, userId);
  }
  return map;
}

/** Allowlista bota statystyk: same identyfikatory Telegrama (kanał read-only). */
export function statsAllowlist(): Set<string> {
  return new Set(
    env("TELEGRAM_STATS_ALLOWLIST")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
}
