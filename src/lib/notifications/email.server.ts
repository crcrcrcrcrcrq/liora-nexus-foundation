/**
 * LIORA P0.15 — serwerowa granica wysyłki e-mail (use-case → transport).
 *
 * Ten moduł jest jedynym punktem wyjścia wiadomości z aplikacji. Nie zna
 * żadnego konkretnego dostawcy — deleguje do adaptera wybranego server-side
 * (`transport/resolve.server.ts`).
 *
 * Konfiguracja wyłącznie ze zmiennych środowiska serwera. Zero sekretów w
 * kodzie, zero `VITE_*`, zero credentials z payloadu klienta.
 *
 *   EMAIL_TRANSPORT            — wybór adaptera (domyślnie "lovable")
 *   STAFF_NOTIFICATION_EMAIL   — adres personelu (server-side, nigdy z requestu)
 *   (+ zmienne wymagane przez wybrany adapter)
 */
import { resolveEmailTransport } from "./transport/resolve.server";
import type { EmailDeliveryResult, EmailMessage } from "./transport/types";

export type { EmailDeliveryResult, EmailMessage } from "./transport/types";

/**
 * Adres personelu pochodzi WYŁĄCZNIE z konfiguracji serwera. Brak zmiennej =
 * brak wysyłki; nie zgadujemy adresu i nie udajemy sukcesu.
 */
export function staffRecipient(): string | null {
  const value = process.env["STAFF_NOTIFICATION_EMAIL"]?.trim();
  return value && value.includes("@") ? value : null;
}

export function isEmailTransportConfigured(): boolean {
  return resolveEmailTransport().isConfigured();
}

/** Prosta walidacja kształtu adresu — nie zastępuje źródła tożsamości. */
function isPlausibleAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Wysyła wiadomość przez aktualnie skonfigurowany transport.
 * NIGDY nie rzuca — wynik e-maila jest niezależny od wyniku operacji domenowej.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailDeliveryResult> {
  if (!isPlausibleAddress(message.to)) {
    return { delivered: false, reason: "transport_error", code: "invalid_recipient" };
  }

  const transport = resolveEmailTransport();
  if (!transport.isConfigured()) return { delivered: false, reason: "not_configured" };

  try {
    return await transport.send(message);
  } catch {
    // Adapter nie powinien rzucać; gdyby jednak — nie wypuszczamy szczegółów.
    return { delivered: false, reason: "transport_error" };
  }
}
