/**
 * LIORA P0.15 — wybór transportu e-mail (server-side).
 *
 * Wybór dokonuje się WYŁĄCZNIE po stronie serwera, na podstawie zmiennej
 * środowiskowej `EMAIL_TRANSPORT`. Domyślnie: "lovable" (jedyny obecnie
 * zaimplementowany adapter).
 *
 * Dodanie przyszłego transportu (SMTP/Gmail, Resend, Brevo, Postmark,
 * dowolny Cloudflare-compatible provider) sprowadza się do:
 *   1. nowego pliku `<nazwa>.server.ts` implementującego `EmailTransport`,
 *   2. jednej gałęzi w `resolveEmailTransport()`.
 * Logika rezerwacji nie ulega zmianie.
 *
 * Cloudflare: nie zakładamy dostępności `node:net` / `node:tls`, więc adapter
 * SMTP NIE jest tu dodawany „na zapas”. Zostanie dopisany dopiero po
 * potwierdzeniu biblioteki działającej w środowisku Workers/Edge.
 */
import type { EmailTransport } from "./types";
import { lovableTransport } from "./lovable.server";
import { resendTransport } from "./resend.server";

/** Transport bezczynny — używany, gdy konfiguracja server-side nie istnieje. */
const notConfiguredTransport: EmailTransport = {
  id: "none",
  isConfigured: () => false,
  send: async () => ({ delivered: false, reason: "not_configured" }),
};

export function resolveEmailTransport(): EmailTransport {
  // P0.16: domyślnie docelowy transport HTTPS (Cloudflare-compatible).
  // Adapter Lovable pozostaje jako legacy/fallback dla obecnego preview.
  const selected = process.env["EMAIL_TRANSPORT"]?.trim().toLowerCase() || "resend";

  switch (selected) {
    case "none":
      return notConfiguredTransport;
    case "lovable":
      return lovableTransport;
    case "resend":
      return resendTransport;
    default:
      // Nieznana wartość nie może wywrócić aplikacji ani udawać sukcesu.
      console.warn(`[email-transport] unknown transport "${selected}" — falling back to none`);
      return notConfiguredTransport;
  }
}
