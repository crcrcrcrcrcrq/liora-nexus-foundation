function get(key: string): string {
  try {
    // @ts-ignore
    if (typeof process!== 'undefined' && (process as any).env && (process as any).env[key]) {
      // @ts-ignore
      return (process as any).env[key];
    }
  } catch {}
  try {
    // @ts-ignore
    const g = globalThis as any;
    if (g && g.process && g.process.env && g.process.env[key]) return g.process.env[key];
    if (g && g[key]) return g[key];
  } catch {}
  return '';
}

export const botToken = get('TELEGRAM_BOT_TOKEN') || get('BOT_TOKEN') || '';
export const BOT_TOKEN = botToken;

export const botWebhookSecret = get('TELEGRAM_BOT_WEBHOOK_SECRET') || get('BOT_WEBHOOK_SECRET') || '';
export const BOT_WEBHOOK_SECRET = botWebhookSecret;

export const adminId = get('TELEGRAM_ADMIN_ID') || '';
export const TELEGRAM_ADMIN_ID = adminId;

export const adminAllowlist = (get('ADMIN_ALLOWLIST') || get('TELEGRAM_ADMIN_ID') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
export const statsAllowlist = (get('STATS_ALLOWLIST') || get('TELEGRAM_ADMIN_ID') || '').split(',').map((s: string) => s.trim()).filter(Boolean);

export const SUPABASE_URL = get('SUPABASE_URL') || '';
export const SUPABASE_ANON_KEY = get('SUPABASE_ANON_KEY') || '';

export const serverConfig = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TELEGRAM_BOT_TOKEN: botToken,
  TELEGRAM_BOT_WEBHOOK_SECRET: botWebhookSecret,
  TELEGRAM_ADMIN_ID: adminId,
  BOT_TOKEN: botToken,
};

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

export const telegramConfig = {
  token: botToken,
  webhookSecret: botWebhookSecret,
  adminId: adminId,
};

export function botLanguage(): string {
  return get('BOT_LANGUAGE') || 'pl';
}
