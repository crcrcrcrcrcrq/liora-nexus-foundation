/**
 * LIORA P0.16 — adapter transportu e-mail: Resend HTTP API.
 *
 * Cloudflare-compatible: wyłącznie globalny `fetch` + Web APIs.
 * Bez SDK, bez `node:net`, bez `node:tls`, bez SMTP socketów, bez polyfilli.
 *
 * Konfiguracja WYŁĄCZNIE server-side (nigdy `VITE_*`, nigdy z payloadu klienta):
 *   EMAIL_API_KEY         — klucz API providera (sekret runtime)
 *   EMAIL_SENDER_ADDRESS  — zweryfikowany adres nadawcy (np. no-reply@twojadomena)
 *   EMAIL_SENDER_NAME     — opcjonalna nazwa nadawcy
 *
 * Brak którejkolwiek z dwóch pierwszych zmiennych = `not_configured`.
 * Nigdy nie udajemy dostarczenia i nie podstawiamy zmyślonego nadawcy.
 */
import type { EmailDeliveryResult, EmailMessage, EmailTransport } from "./types";
import { textToHtml } from "./html";

const ENDPOINT = "https://api.resend.com/emails";

function apiKey(): string | undefined {
  return process.env["EMAIL_API_KEY"]?.trim() || undefined;
}

function senderAddress(): string | undefined {
  return process.env["EMAIL_SENDER_ADDRESS"]?.trim() || undefined;
}

function fromHeader(address: string): string {
  const name = process.env["EMAIL_SENDER_NAME"]?.trim();
  // Cudzysłowy w nazwie mogłyby rozbić nagłówek From — usuwamy je.
  return name ? `${name.replace(/["<>]/g, "")} <${address}>` : address;
}

export const resendTransport: EmailTransport = {
  id: "resend",

  isConfigured() {
    return Boolean(apiKey() && senderAddress());
  },

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    const key = apiKey();
    const from = senderAddress();
    if (!key || !from) return { delivered: false, reason: "not_configured" };

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: fromHeader(from),
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html ?? textToHtml(message.subject, message.text),
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });

      if (!response.ok) {
        // Świadomie NIE przekazujemy treści odpowiedzi providera ani nagłówków —
        // wyłącznie techniczny kod statusu, bez sekretów i bez requestu.
        console.warn(`[email-transport:resend] provider rejected request (${response.status})`);
        return {
          delivered: false,
          reason: "transport_error",
          code: `http_${response.status}`,
        };
      }

      const payload = (await response.json().catch(() => null)) as { id?: string } | null;
      return payload?.id ? { delivered: true, messageId: payload.id } : { delivered: true };
    } catch {
      // Błąd sieci / runtime — bez szczegółów, nigdy z nagłówkiem Authorization.
      return { delivered: false, reason: "transport_error", code: "network_error" };
    }
  },
};
