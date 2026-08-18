/**
 * LIORA P0.29 — dyspozytor powiadomień.
 *
 * Domena (rezerwacja, zmiana statusu) publikuje ZDARZENIE; ten moduł rozsyła
 * je do skonfigurowanych kanałów. Reguły niezmienne:
 *  - nigdy nie rzuca — nieudane powiadomienie nie cofa operacji w bazie,
 *  - nie zna Supabase ani sesji użytkownika,
 *  - kanał niezoonfigurowany jest pomijany, a nie udawany jako sukces.
 */
import type { BookingEvent, NotificationProvider, NotificationResult } from "./model/events";
import { emailProvider } from "./providers/email.server";
import { telegramProvider } from "./providers/telegram.server";

const PROVIDERS: NotificationProvider[] = [emailProvider, telegramProvider];

export interface DispatchOutcome {
  event: BookingEvent["type"];
  results: NotificationResult[];
}

export async function dispatchBookingEvent(event: BookingEvent): Promise<DispatchOutcome> {
  const results: NotificationResult[] = [];

  for (const provider of PROVIDERS) {
    if (!provider.isConfigured()) {
      results.push({ handled: false, provider: provider.id, reason: "not_configured" });
      continue;
    }
    try {
      results.push(await provider.notify(event));
    } catch {
      results.push({ handled: false, provider: provider.id, reason: "error" });
    }
  }

  return { event: event.type, results };
}
