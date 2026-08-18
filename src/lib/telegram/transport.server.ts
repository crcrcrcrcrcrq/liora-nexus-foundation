/**
 * LIORA P0.30 — transport Telegram Bot API (server-only).
 *
 * Warstwa zna wyłącznie HTTP Telegrama: wysyłkę wiadomości i rejestrację
 * webhooka. Nie zna rezerwacji, statystyk ani ról. NIGDY nie rzuca i nigdy nie
 * loguje treści wiadomości ani tokenu — w logu zostaje tylko kod błędu.
 */
import { botToken, type TelegramBot } from "./config.server";
import { allowTelegramCall } from "./rate-limit.server";

const API = "https://api.telegram.org";
const MAX_LENGTH = 3900;

export interface TelegramSendResult {
  sent: boolean;
  reason?: "not_configured" | "rate_limited" | "transport_error";
}

async function call(
  bot: TelegramBot,
  method: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number }> {
  const token = (botToken as any)(bot) ?? (botToken as any)() ?? (botToken as any);
  const realToken = typeof token === 'string' ? token : (token?.toString?.() ?? "");
  if (!realToken) return { ok: false, status: 0 };
  try {
    const response = await fetch(`${API}/bot${realToken}/${method}`, {
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
  const t: any = botToken as any;
  const tok = (typeof t === 'function' ? t(bot) ?? t() : t) as any;
  const real = typeof tok === 'string' ? tok : tok?.toString?.() ?? "";
  if (!real) return { sent: false, reason: "not_configured" };
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
  const t: any = botToken as any;
  const tok = (typeof t === 'function' ? t(bot) ?? t() : t) as any;
  const real = typeof tok === 'string' ? tok : tok?.toString?.() ?? "";
  if (!real) return false;
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
