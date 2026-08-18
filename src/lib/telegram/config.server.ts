// config.server.ts - FIXED - no more "pl is not a function"
import { dev } from '$app/environment';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_BOT_WEBHOOK_SECRET: string;
  TELEGRAM_ADMIN_ID: string;
  BOT_TOKEN: string;
};

function getEnv(): Env {
  // @ts-ignore - Cloudflare bindings
  const cfEnv = (globalThis as any).__env__ || {};

  // @ts-ignore
  const platformEnv = (typeof process!== 'undefined'? process.env : {}) || {};

  const get = (key: string) => {
    return cfEnv[key] || platformEnv[key] || '';
  };

  return {
    SUPABASE_URL: get('SUPABASE_URL') || get('VITE_SUPABASE_URL'),
    SUPABASE_ANON_KEY: get('SUPABASE_ANON_KEY') || get('VITE_SUPABASE_ANON_KEY'),
    TELEGRAM_BOT_TOKEN: get('TELEGRAM_BOT_TOKEN') || get('BOT_TOKEN'),
    TELEGRAM_BOT_WEBHOOK_SECRET: get('TELEGRAM_BOT_WEBHOOK_SECRET'),
    TELEGRAM_ADMIN_ID: get('TELEGRAM_ADMIN_ID'),
    BOT_TOKEN: get('BOT_TOKEN') || get('TELEGRAM_BOT_TOKEN'),
  };
}

export const serverConfig = getEnv();

export const supabaseConfig = {
  url: serverConfig.SUPABASE_URL,
  anonKey: serverConfig.SUPABASE_ANON_KEY,
};

export const telegramConfig = {
  token: serverConfig.TELEGRAM_BOT_TOKEN || serverConfig.BOT_TOKEN,
  webhookSecret: serverConfig.TELEGRAM_BOT_WEBHOOK_SECRET,
