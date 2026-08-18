import { botToken as rawToken, type TelegramBot } from "./config.server";
import { allowTelegramCall } from "./rate-limit.server";

const API = "https://api.telegram.org";
const MAX_LENGTH = 3900;

function getToken(bot?: any): string {
  const t: any = rawToken as any;
  if (typeof t === 'function') {
    try { const v = t(bot); if (v && typeof v === 'string') return v; } catch {}
    try { const v = t(); if (v && typeof v === 'string') return v; } catch {}
  }
  try {
    const s = typeof t === 'string' ? t : t?.toString?.();
    if (s && s.length > 10 && !s.includes('function') && !s.includes('Proxy') && !s.includes('[object')) return s;
  } catch {}
  return "";
}

export interface TelegramSendResult {
  sent: boolean;
  reason?: "not_configured" | "rate_limited" | "transport_error";
}

async function call(
  bot: TelegramBot,
  method: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> {
  const token = getToken(bot);
  if (!token) return { ok: false, status: 0 };
  try {
    const response = await fetch(`${API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export async function sendTelegramMessage(
  bot: TelegramBot,
  chatId: string | number,
  text: string,
): Promise<TelegramSendResult> {
  if (!getToken(bot)) return { sent: false, reason: "not_configured" };
  if (!allowTelegramCall(`${bot}:${chatId}`)) return { sent: false, reason: "rate_limited" };
  const result = await call(bot, "sendMessage", {
    chat_id: chatId,
    text: text.slice(0, MAX_LENGTH),
    disable_web_page_preview: true,
  });
  if (!result.ok) {
    console.warn(`[telegram] ${bot} sendMessage failed status=${result.status}`);
    return { sent: false, reason: "transport_error" };
  }
  return { sent: true };
}

export async function checkTelegramBot(bot: TelegramBot): Promise<boolean> {
  if (!getToken(bot)) return false;
  return (await call(bot, "getMe", {})).ok;
}

export async function setTelegramWebhook(
  bot: TelegramBot,
  url: string,
  secret: string,
): Promise<boolean> {
  const result = await call(bot, "setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message"],
  });
  return result.ok;
}
