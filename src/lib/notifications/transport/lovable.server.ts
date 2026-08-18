/**
 * LIORA P0.15 — adapter transportu: wbudowana infrastruktura e-mail Lovable.
 *
 * JEDYNE miejsce w projekcie, które importuje bibliotekę konkretnego dostawcy.
 * Wymiana transportu = dodanie rodzeństwa tego pliku i zmiana wyboru w
 * `resolve.server.ts`. Logika rezerwacji pozostaje nietknięta.
 *
 * Konfiguracja wyłącznie server-side (żadnych `VITE_*`, żadnych sekretów w kodzie):
 *   EMAIL_SENDER_DOMAIN   — zweryfikowana subdomena nadawcy
 *   EMAIL_SENDER_ADDRESS  — opcjonalny pełny adres nadawcy (domyślnie no-reply@<domena>)
 *   LOVABLE_API_KEY       — klucz platformy
 *
 * UWAGA: adapter jest przygotowany, ale NIE zweryfikowany runtime — brak
 * domeny nadawcy i realnej dostawy do skrzynki (patrz docs/supabase.md).
 */
import { EmailAPIError, sendLovableEmail } from "@lovable.dev/email-js";
import type { EmailDeliveryResult, EmailMessage, EmailTransport } from "./types";
import { textToHtml } from "./html";

function senderDomain(): string | undefined {
  return process.env["EMAIL_SENDER_DOMAIN"]?.trim() || undefined;
}

export const lovableTransport: EmailTransport = {
  id: "lovable",

  isConfigured() {
    return Boolean(senderDomain() && process.env["LOVABLE_API_KEY"]);
  },

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    const domain = senderDomain();
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!domain || !apiKey) return { delivered: false, reason: "not_configured" };

    const from = process.env["EMAIL_SENDER_ADDRESS"]?.trim() || `no-reply@${domain}`;
    const idempotencyKey = message.idempotencyKey;

    try {
      const response = await sendLovableEmail(
        {
          to: message.to,
          from,
          sender_domain: domain,
          subject: message.subject,
          text: message.text,
          html: message.html ?? textToHtml(message.subject, message.text),
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
          ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
        },
        { apiKey, ...(idempotencyKey ? { idempotencyKey } : {}) },
      );
      if (!response.success) return { delivered: false, reason: "transport_error" };
      return response.message_id
        ? { delivered: true, messageId: response.message_id }
        : { delivered: true };
    } catch (error) {
      if (error instanceof EmailAPIError) {
        if (error.code === "recipient_suppressed") {
          return { delivered: false, reason: "recipient_suppressed" };
        }
        // Świadomie wypuszczamy wyłącznie kod — nigdy treści odpowiedzi providera.
        return {
          delivered: false,
          reason: "transport_error",
          ...(error.code ? { code: error.code } : {}),
        };
      }
      return { delivered: false, reason: "transport_error" };
    }
  },
};
