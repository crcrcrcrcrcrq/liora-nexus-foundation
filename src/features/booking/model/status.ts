/**
 * LIORA P0.27 — jedno miejsce prawdy dla statusu rezerwacji.
 *
 * Wartości w bazie NIE zmieniają się: `new`, `confirmed`, `done`, `cancelled`
 * (kontrakt z P0.4.5, używany przez klienta, e-maile, Kronikę i statystyki).
 * Warstwa biznesowa mówi „pending / confirmed / completed / cancelled”, więc
 * mapujemy etykiety, zamiast migrować dane i rozjeżdżać istniejący system:
 *   pending ≡ new, completed ≡ done.
 */
import type { BookingStatus } from "./types";

export const BOOKING_STATUSES: readonly BookingStatus[] = ["new", "confirmed", "done", "cancelled"];

/** Klucz etykiety w słownikach (`admin.bookings.filters.*`). */
export type BookingStatusKey = "new" | "confirmed" | "completed" | "cancelled";

export const STATUS_KEY: Record<BookingStatus, BookingStatusKey> = {
  new: "new",
  confirmed: "confirmed",
  done: "completed",
  cancelled: "cancelled",
};

export const STATUS_BY_KEY: Record<BookingStatusKey, BookingStatus> = {
  new: "new",
  confirmed: "confirmed",
  completed: "done",
  cancelled: "cancelled",
};

/** pending → confirmed → completed oraz pending/confirmed → cancelled. */
export const ALLOWED_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["done", "cancelled"],
  done: [],
  cancelled: [],
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Czy przejście kasuje rezerwację — UI wymaga wtedy potwierdzenia. */
export function isDestructive(to: BookingStatus): boolean {
  return to === "cancelled";
}
