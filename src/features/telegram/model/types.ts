/**
 * Architektura powiadomień Telegram — warstwa kontraktu.
 *
 * Sprint E przygotowuje wyłącznie adapter. Zewnętrzne API (api.telegram.org)
 * NIE jest tu wołane i nigdy nie będzie wołane z przeglądarki: token bota
 * i identyfikator czatu żyją po stronie serwera. Frontend zna tylko własny
 * endpoint (`/telegram/notify`), a ten kontrakt opisuje kształt komunikatu.
 */

export type TelegramSignal =
  "consultation.new" | "interpretation.ordered" | "member.premium" | "system.issue";

/**
 * Ładunek sygnału. Zasada prywatności: identyfikuje wyłącznie `lioraId`.
 * Do wiadomości nie trafia imię, e-mail ani żadna treść rytuału.
 */
export interface TelegramSignalPayload {
  lioraId?: string;
  subject?: string;
  at?: string;
  detail?: string;
}

/** Gotowa, krótka wiadomość — jedno zdanie w tonie marki. */
export interface TelegramMessage {
  signal: TelegramSignal;
  text: string;
  createdAt: string;
}

export type TelegramDeliveryState = "queued" | "sent" | "skipped" | "failed";

export interface TelegramDelivery {
  message: TelegramMessage;
  state: TelegramDeliveryState;
  reason?: string;
}

/**
 * Transport. Jedyne miejsce, które w Sprincie F zostanie podmienione na
 * wywołanie backendu — reszta aplikacji nie zauważy zmiany.
 */
export interface TelegramTransport {
  readonly name: string;
  readonly ready: boolean;
  deliver(message: TelegramMessage): Promise<TelegramDelivery>;
}
