import { botToken as rawToken } from "./config.server";

function getToken(bot?: any): string {
  const t: any = rawToken as any;
  // 1. jako funkcja
  if (typeof t === 'function') {
    try { const v = t(bot); if (v && typeof v === 'string' && v.length > 5) return v; } catch {}
    try { const v = t(); if (v && typeof v === 'string' && v.length > 5) return v; } catch {}
  }
  // 2. jako string / proxy toString
  try {
    const s = (typeof t === 'string') ? t : t?.toString?.();
    if (s && typeof s === 'string' && s.length > 10 && !s.includes('function') && !s.includes('Proxy') && !s.includes('[object')) {
      return s;
    }
  } catch {}
  return "";
}

export async function sendTelegramMessage(bot: any, chatId: string | number, text: string, extra?: any) {
  const token = getToken(bot);
  if (!token) throw new Error("BOT_TOKEN missing");
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram send failed ${res.status}: ${body}`);
  }
  return res.json();
}

// alias dla starych importów - żeby nic nie wywalało
export const send = sendTelegramMessage;
export const sendMessage = sendTelegramMessage;
export const transport = { send: sendTelegramMessage };
