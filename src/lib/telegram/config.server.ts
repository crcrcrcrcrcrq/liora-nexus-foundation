// LIORA P0.30 - Konfiguracja Telegram Admin - SERVER ONLY
// Admin ID: 1250521295

export type TelegramBot = "admin" | "main";

const ADMIN_IDS = new Map<string, string>([
  ["1250521295", "1250521295"],
  ["1250521295", "admin"],
]);

export function adminAllowlist(): Map<string, string> {
  // Dodatkowo z env jeśli podasz
  const extra = process.env.ADMIN_TELEGRAM_ID || process.env.VITE_ADMIN_TELEGRAM_ID;
  if (extra &&!ADMIN_IDS.has(extra)) {
    ADMIN_IDS.set(extra, extra);
  }
  return ADMIN_IDS;
}

export function botWebhookSecret(_bot?: TelegramBot): string {
  return (
    process.env.TELEGRAM_BOT_SECRET ||
    process.env.TELEGRAM_WEBHOOK_SECRET ||
    process.env.BOT_WEBHOOK_SECRET ||
    "liora-webhook-secret-2025"
  );
}

export function getTelegramBotToken(_bot?: TelegramBot): string {
  return (
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_ADMIN_BOT_TOKEN ||
    process.env.VITE_TELEGRAM_BOT_TOKEN ||
    ""
  );
}

export function isAdminTelegramId(telegramId: string | number): boolean {
  return adminAllowlist().has(String(telegramId));
}
