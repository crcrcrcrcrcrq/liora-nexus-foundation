import { composeTelegramMessage } from "./messages";
import type {
  TelegramDelivery,
  TelegramMessage,
  TelegramSignal,
  TelegramSignalPayload,
  TelegramTransport,
} from "../model/types";

/**
 * Telegram Adapter — Sprint E.
 *
 * Adapter zna trzy rzeczy: jakie sygnały istnieją, jak brzmi ich treść i przez
 * jaki transport mają wyjść. Nie zna Telegrama. Dzięki temu podłączenie API
 * w Sprincie F to wymiana jednego obiektu `TelegramTransport`.
 *
 * Bezpieczeństwo: adapter odmawia wysyłki ładunku, który zawiera cokolwiek
 * poza dozwolonymi polami (patrz `sanitizePayload`) — dane osobowe nie mogą
 * opuścić systemu przez kanał powiadomień.
 */

const ALLOWED_FIELDS = ["lioraId", "subject", "at", "detail"] as const;

function sanitizePayload(payload: TelegramSignalPayload): TelegramSignalPayload {
  const safe: TelegramSignalPayload = {};
  for (const field of ALLOWED_FIELDS) {
    const value = payload[field];
    if (typeof value === "string" && value.length > 0) safe[field] = value;
  }
  return safe;
}

/**
 * Transport domyślny: kolejkuje komunikat i nic nie wysyła.
 * Świadomy brak implementacji — zewnętrzne API podłączamy dopiero w Sprincie F.
 */
export function createPendingTransport(): TelegramTransport {
  const queue: TelegramMessage[] = [];
  return {
    name: "pending",
    ready: false,
    async deliver(message) {
      queue.push(message);
      return { message, state: "queued", reason: "transport-not-connected" };
    },
  };
}

export interface TelegramAdapter {
  readonly transport: TelegramTransport;
  /** Buduje komunikat bez wysyłki — do podglądu i testów tonu. */
  compose(signal: TelegramSignal, payload?: TelegramSignalPayload): TelegramMessage;
  /** Buduje i przekazuje komunikat do transportu. */
  notify(signal: TelegramSignal, payload?: TelegramSignalPayload): Promise<TelegramDelivery>;
  /** Historia sesji — pomaga administratorowi zobaczyć, co poszłoby w świat. */
  history(): readonly TelegramDelivery[];
}

export function createTelegramAdapter(
  transport: TelegramTransport = createPendingTransport(),
): TelegramAdapter {
  const log: TelegramDelivery[] = [];

  return {
    transport,
    compose(signal, payload = {}) {
      return composeTelegramMessage(signal, sanitizePayload(payload));
    },
    async notify(signal, payload = {}) {
      const message = composeTelegramMessage(signal, sanitizePayload(payload));
      const delivery = await transport.deliver(message);
      log.unshift(delivery);
      return delivery;
    },
    history() {
      return log;
    },
  };
}

/** Jedna instancja dla aplikacji. Podmiana transportu = jedna linia w Sprincie F. */
export const telegramAdapter = createTelegramAdapter();
