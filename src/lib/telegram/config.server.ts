export const botLanguage="pl";
export const adminAllowlist=["1250521295"];
export const statsAllowlist=["1250521295"];

export function botToken(_bot?: any): string {
  try {
    // Cloudflare Workers
    // @ts-ignore
    const { env } = require("cloudflare:workers");
    return env.TELEGRAM_BOT_TOKEN || env.BOT_TOKEN || env.TELEGRAM_ADMIN_BOT_TOKEN || "";
  } catch {}
  // @ts-ignore
  if (typeof process !== "undefined" && process.env) {
    // @ts-ignore
    return process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "";
  }
  return "";
}

export function botWebhookSecret(_bot?: any): string {
  try {
    // @ts-ignore
    const { env } = require("cloudflare:workers");
    return env.TELEGRAM_BOT_WEBHOOK_SECRET || env.BOT_WEBHOOK_SECRET || env.TELEGRAM_BOT_WEBHC || "secret";
  } catch {}
  // @ts-ignore
  if (typeof process !== "undefined" && process.env) {
    // @ts-ignore
    return process.env.TELEGRAM_BOT_WEBHOOK_SECRET || process.env.BOT_WEBHOOK_SECRET || "secret";
  }
  return "secret";
}

export const telegramConfig={botToken,adminAllowlist};
export default telegramConfig;
