import type { Language } from "@/config/i18n";
import type { BookingStatus } from "@/features/booking/model/types";

/**
 * LIORA P0.29 — znormalizowane zdarzenia domeny rezerwacji.
 *
 * Plik jest czystym typem (bez runtime'u), więc może być importowany zarówno
 * przez moduły serwerowe, jak i przez testy. Zdarzenie nie jest kopią rekordu
 * rezerwacji — to minimalny, świadomie ograniczony wycinek danych potrzebny
 * do powiadomienia. Bez `user_id`, bez roli, bez tokenów, bez treści
 * administracyjnych.
 */

export const BOOKING_EVENT_TYPES = [
  "booking.created",
  "booking.confirmed",
  "booking.cancelled",
  "booking.completed",
] as const;

export type BookingEventType = (typeof BOOKING_EVENT_TYPES)[number];

/** Migawka usługi w chwili zdarzenia — wartości pochodzą z bazy, nie z klienta. */
export interface BookingEventService {
  slug: string;
  title: string;
  price: number | null;
  currency: string;
  duration: string;
}

export interface BookingEvent {
  type: BookingEventType;
  /** Techniczny identyfikator rezerwacji — nigdy nie trafia do UI klienta. */
  bookingId: string;
  /** Publiczny znak rezerwacji (LIO-XXXX-XXXX) używany w komunikacji. */
  reference: string;
  locale: Language;
  service: BookingEventService;
  /** YYYY-MM-DD albo null, gdy termin nie został wybrany. */
  date: string | null;
  /** HH:MM albo null. */
  time: string | null;
  customerName: string;
  customerEmail: string;
  status: BookingStatus;
}

/** Wynik pojedynczego dostawcy powiadomień. */
export type NotificationResult =
  | { handled: true; provider: string; detail?: string }
  | { handled: false; provider: string; reason: "not_configured" | "unsupported_event" | "error" };

/** Adapter kanału powiadomień (e-mail, Telegram, przyszłe kanały). */
export interface NotificationProvider {
  readonly id: string;
  isConfigured(): boolean;
  /** NIGDY nie rzuca — powiadomienie nie może podważyć operacji domenowej. */
  notify(event: BookingEvent): Promise<NotificationResult>;
}

/** Statusy mapowane na typ zdarzenia (jedno miejsce prawdy). */
export const EVENT_BY_STATUS: Record<BookingStatus, BookingEventType> = {
  new: "booking.created",
  confirmed: "booking.confirmed",
  cancelled: "booking.cancelled",
  done: "booking.completed",
};
