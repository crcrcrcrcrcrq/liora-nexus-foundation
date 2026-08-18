/**
 * LIORA P0.15 — kontrakt transportu e-mail.
 *
 * Warstwa domenowa (rezerwacje) zna WYŁĄCZNIE ten kontrakt. Nie wie, czy
 * wiadomość opuszcza system przez Lovable, SMTP (np. smtp.gmail.com), Resend,
 * Brevo, Postmark czy dowolny przyszły transport zgodny z Cloudflare.
 *
 * Kierunek zależności:
 *   Booking → notification use-case → EmailTransport (ten plik) → adapter
 *
 * Plik jest czystym typem (bez importów runtime), więc może być bezpiecznie
 * importowany przez moduły serwerowe bez wciągania zależności providera.
 */

/** Minimalny, wewnętrzny kontrakt wiadomości. */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  /** Opcjonalny wariant HTML. Gdy brak — adapter może zbudować go z `text`. */
  html?: string;
  /** Opcjonalny adres do odpowiedzi. */
  replyTo?: string;
  /**
   * Techniczny klucz idempotencji (best-effort deduplikacja po stronie
   * transportu). Nie jest treścią wiadomości ani danymi osobowymi.
   */
  idempotencyKey?: string;
}

/**
 * Wynik transportu. Świadomie rozdzielony od wyniku operacji domenowej:
 *  - `delivered: true`          — transport przyjął wiadomość (nie równa się inbox delivery),
 *  - `not_configured`           — brak konfiguracji server-side; NIE jest to sukces ani błąd aplikacji,
 *  - `recipient_suppressed`     — odbiorca zablokowany po stronie transportu,
 *  - `transport_error`          — transport odmówił / zawiódł.
 */
export type EmailDeliveryResult =
  | { delivered: true; messageId?: string }
  | {
      delivered: false;
      reason: "not_configured" | "recipient_suppressed" | "transport_error";
      /** Wyłącznie techniczny kod transportu — nigdy treść odpowiedzi providera. */
      code?: string;
    };

/** Adapter konkretnego transportu. Implementacja NIGDY nie rzuca. */
export interface EmailTransport {
  /** Stabilny identyfikator transportu, np. "lovable", "smtp", "resend". */
  readonly id: string;
  /** Czy konfiguracja server-side jest kompletna. */
  isConfigured(): boolean;
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}
