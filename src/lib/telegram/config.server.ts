import { env } from '$env/dynamic/private';

function get(key: string): string {
  // @ts-ignore
  const e = (env as any) || {};
  // @ts-ignore
  const p = typeof process !== 'undefined' ? (process as any).env || {} : {};
  return e[key] || p[key] || '';
}

// --- PODSTAWOWE TOKENY ---
export const botToken = get('TELEGRAM_BOT_TOKEN') || get('BOT_TOKEN') || '';
export const BOT_TOKEN = botToken;

export const botWebhookSecret = get('TELEGRAM_BOT_WEBHOOK_SECRET') || get('BOT_WEBHOOK_SECRET') || '';
export const BOT_WEBHOOK_SECRET = botWebhookSecret;

// --- ADMIN ---
export const adminId = get('TELEGRAM_ADMIN_ID') || '';
export const TELEGRAM_ADMIN_ID = adminId;

export const adminAllowlist = (get('ADMIN_ALLOWLIST') || get('TELEGRAM_ADMIN_ID') || '').split(',').map((s: string) => s.trim()).filter(Boolean);

export const statsAllowlist = (get('STATS_ALLOWLIST') || get('TELEGRAM_ADMIN_ID') || '').split(',').map((s: string) => s.trim()).filter(Boolean);

// --- SUPABASE ---
export const SUPABASE_URL = get('SUPABASE_URL') || '';
export const SUPABASE_ANON_KEY = get('SUPABASE_ANON_KEY') || '';

// --- OBIEKTY DLA KOMPATYBILNOSCI ---
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

// --- JEZYK BOTA - TEGO BRAKOWALO! ---
export function botLanguage(): string {
  return get('BOT_LANGUAGE') || 'pl';
}
