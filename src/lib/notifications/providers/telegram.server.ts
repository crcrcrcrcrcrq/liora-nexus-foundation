import type { BookingEvent, NotificationProvider, NotificationResult } from "../model/events";

/**
 * LIORA P0.29 — miejsce na kanał Telegram, bez udawania wysyłki.
 *
 * Adapter celowo NIE wykonuje żadnego żądania HTTP i nie zna treści
 * wiadomości. Dopóki konfiguracja serwera nie zawiera bota i czatu personelu,
 * zwraca `not_configured` — system nigdy nie raportuje sukcesu, którego nie
 * było. Token żyje wyłącznie w zmiennych serwera (nigdy `VITE_*`).
 *
 *   TELEGRAM_BOT_TOKEN   — token bota (server-side)
 *   TELEGRAM_STAFF_CHAT  — identyfikator czatu personelu
 */
export const telegramProvider: NotificationProvider = {
  id: "telegram",

  isConfigured() {
    return Boolean(
      process.env["TELEGRAM_BOT_TOKEN"]?.trim() && process.env["TELEGRAM_STAFF_CHAT"]?.trim(),
    );
  },

  async notify(_event: BookingEvent): Promise<NotificationResult> {
    // Implementacja wysyłki zostanie dopisana dopiero po konfiguracji bota.
    return { handled: false, provider: "telegram", reason: "not_configured" };
  },
};
