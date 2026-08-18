export const botLanguage = "pl";
export const adminAllowlist = ["1250521295"];
export const statsAllowlist = ["1250521295"];

export function botToken(_bot?: any): string {
  // @ts-ignore
  const p = typeof process!== "undefined"? (process as any).env : {};
  return p.TELEGRAM_BOT_TOKEN || p.BOT_TOKEN || p.TELEGRAM_ADMIN_BOT_TOKEN || "";
}

export function botWebhookSecret(_bot?: any): string {
  // @ts-ignore
  const p = typeof process!== "undefined"? (process as any).env : {};
  return p.TELEGRAM_BOT_WEBHOOK_SECRET || p.BOT_WEBHOOK_SECRET || "secret";
}

export const telegramConfig = { botToken, adminAllowlist };
export default telegramConfig;
