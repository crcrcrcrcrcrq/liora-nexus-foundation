export interface Env {
  TELEGRAM_ADMIN_BOT_TOKEN: string;
  TELEGRAM_ADMIN_WEBHOOK_SECRET: string;
  TELEGRAM_ADMIN_ALLOWLIST: string;
  ADMIN_ID?: string;
}
function parseAllowlist(raw: string | undefined): Map<number, string> {
  const map = new Map<number, string>();
  if (!raw) return map;
  for (const entry of raw.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const [telegramId, supabaseUserId] = trimmed.split(":");
    if (telegramId) map.set(Number(telegramId), (supabaseUserId ?? "").trim());
  }
  return map;
}
function isAuthorized(fromId: number, env: Env): boolean {
  const allowlist = parseAllowlist(env.TELEGRAM_ADMIN_ALLOWLIST);
  if (allowlist.has(fromId)) return true;
  if (env.ADMIN_ID && Number(env.ADMIN_ID) === fromId) return true;
  return false;
}
async function sendMessage(token: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}
async function handleTelegramWebhook(request: Request, env: Env): Promise<Response> {
  const OK = () => new Response("OK", { status: 200 });
  const secretHeader = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!env.TELEGRAM_ADMIN_WEBHOOK_SECRET || secretHeader !== env.TELEGRAM_ADMIN_WEBHOOK_SECRET) return OK();
  let update: any;
  try { update = await request.json(); } catch { return OK(); }
  const message = update.message;
  if (!message?.from || !message.text) return OK();
  if (!isAuthorized(message.from.id, env)) return OK();
  const token = env.TELEGRAM_ADMIN_BOT_TOKEN;
  const chatId = message.chat.id;
  const txt = message.text.trim();
  if (txt === "/start" || txt === "/admin") {
    await sendMessage(token, chatId, "Panel administracyjny Liora Nexus.\n\nDostepne komendy:\n/admin - status panelu");
  }
  return OK();
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/telegram/webhook" && request.method === "POST") {
      return handleTelegramWebhook(request, env);
    }
    return new Response("Not found", { status: 404 });
  },
};
