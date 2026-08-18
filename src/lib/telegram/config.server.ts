import { env } from '$env/dynamic/private';

function get(key: string): string {
  // @ts-ignore
  const e = (env as any) || {};
  // @ts-ignore
  const p = typeof process!== 'undefined'? (process as any).env || {} : {};
  return e[key] || p[key] || '';
}

export const serverConfig = {
  SUPABASE_URL: get('SUPABASE_URL'),
  SUPABASE_ANON_KEY: get('SUPABASE_ANON_KEY'),
  TELEGRAM_BOT_TOKEN: get('TELEGRAM_BOT_TOKEN') || get('BOT_TOKEN'),
  TELEGRAM_BOT_WEBHOOK_SECRET: get('TELEGRAM_BOT_WEBHOOK_SECRET'),
  TELEGRAM_ADMIN_ID: get('TELEGRAM_ADMIN_ID'),
  BOT_TOKEN: get('BOT_TOKEN') || get('TELEGRAM_BOT_TOKEN'),
};

export const supabaseConfig = {
  url: serverConfig.SUPABASE_URL,
  anonKey: serverConfig.SUPABASE_ANON_KEY,
};

export const telegramConfig = {
  token: serverConfig.TELEGRAM_BOT_TOKEN,
  webhookSecret: serverConfig.TELEGRAM_BOT_WEBHOOK_SECRET,
  adminId: serverConfig.TELEGRAM_ADMIN_ID,
};

// TO BYŁO USUNIĘTE - PRZYWRACAMY!
export function botLanguage(): string {
  return 'pl';
}
