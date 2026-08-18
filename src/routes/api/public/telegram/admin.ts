/**
 * LIORA P0.30 — webhook bota administracyjnego.
 *
 * Trasa jest publiczna z konieczności (Telegram nie ma sesji), więc każde
 * żądanie musi przejść przez sekret webhooka, a następnie przez allowlistę
 * i realną rolę personelu w bazie. Odpowiedź HTTP jest zawsze 200 dla żądań
 * podpisanych — Telegram nie ma czego ponawiać, a kod odpowiedzi nie może
 * zdradzać, kto jest na allowliście.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram/admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyWebhookSecret } = await import("@/lib/telegram-admin/auth.server");
        const provided = request.headers.get("x-telegram-bot-api-secret-token");
        if (!verifyWebhookSecret("admin", provided)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { parseTelegramUpdate } = await import("@/lib/telegram/update.server");
        const command = parseTelegramUpdate(await request.json().catch(() => null));
        if (!command) return Response.json({ ok: true, ignored: true });

        const { routeAdminCommand } = await import("@/lib/telegram-admin/router.server");
        const { sendTelegramMessage } = await import("@/lib/telegram/transport.server");
        const reply = await routeAdminCommand(command);
        await sendTelegramMessage("admin", command.chatId, reply);

        return Response.json({ ok: true });
      },
    },
  },
});
