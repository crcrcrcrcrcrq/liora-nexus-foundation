/**
 * LIORA P0.30 — webhook bota statystyk.
 *
 * Kanał całkowicie odrębny od bota administracyjnego: inny sekret, inna
 * allowlista, wyłącznie odczyt agregatów. Nawet przy poprawnym sekrecie bot
 * nie ma dostępu do rezerwacji ani danych osobowych.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram/stats")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyWebhookSecret } = await import("@/lib/telegram-admin/auth.server");
        const provided = request.headers.get("x-telegram-bot-api-secret-token");
        if (!verifyWebhookSecret("stats", provided)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { parseTelegramUpdate } = await import("@/lib/telegram/update.server");
        const command = parseTelegramUpdate(await request.json().catch(() => null));
        if (!command) return Response.json({ ok: true, ignored: true });

        const { routeStatsCommand } = await import("@/lib/telegram-stats/router.server");
        const { sendTelegramMessage } = await import("@/lib/telegram/transport.server");
        const reply = await routeStatsCommand(command);
        await sendTelegramMessage("stats", command.chatId, reply);

        return Response.json({ ok: true });
      },
    },
  },
});
