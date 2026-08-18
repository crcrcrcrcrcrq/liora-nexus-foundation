/**
 * LIORA P0.30 — parser aktualizacji Telegrama (server-only).
 *
 * Czyta wyłącznie to, co potrzebne do obsługi polecenia tekstowego. Nie
 * przechowuje treści, nie loguje wiadomości i nie interesuje się załącznikami.
 */

export interface TelegramCommand {
  chatId: string;
  fromId: string;
  command: string;
  args: string[];
}

export function parseTelegramUpdate(update: unknown): TelegramCommand | null {
  const message = (update as { message?: Record<string, unknown> } | null)?.message;
  if (!message) return null;

  const chat = message["chat"] as { id?: number | string } | undefined;
  const from = message["from"] as { id?: number | string } | undefined;
  const text = typeof message["text"] === "string" ? message["text"].trim() : "";

  if (!chat?.id || !from?.id || !text.startsWith("/")) return null;

  const [rawCommand, ...args] = text.split(/\s+/);
  const command = (rawCommand ?? "").split("@")[0]?.toLowerCase() ?? "";

  return { chatId: String(chat.id), fromId: String(from.id), command, args };
}
