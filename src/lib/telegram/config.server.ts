import { env } from "cloudflare:workers";

export const botLanguage = "pl";
export const adminAllowlist = ["1250521295"];
export const statsAllowlist = ["1250521295"];

export function botToken(_bot?: any): string {
  const e = env as any;
  return e.TELEGRAM_BOT_TOKEN || e.BOT_TOKEN || e.TELEGRAM_ADMIN_BOT_TOKEN || "";
}

export function botWebhookSecret(_bot?: any): string {
  const e = env as any;
  return e.TELEGRAM_BOT_WEBHOOK_SECRET || e.BOT_WEBHOOK_SECRET || e.TELEGRAM_BOT_WEBHC || e.TELEGRAM_BOT_WEBHOOK || "secret";
}

export const telegramConfig = { botToken, adminAllowlist };
export default telegramConfig;
