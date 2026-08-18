import type { BookingRecord, BookingStatus } from "../model/types";

/**
 * Wspólny kształt wiersza tabeli `bookings` oraz jego mapowanie na model
 * domenowy. Jedno miejsce prawdy dla wszystkich odczytów po stronie serwera
 * (Booking i projekcja Kroniki) — bez duplikowania nazw kolumn.
 */

export const BOOKING_COLUMNS =
  "id, name, email, service_slug, preferred_date, preferred_time, message, status, language, created_at";

export interface BookingRow {
  id: string;
  name: string;
  email: string;
  service_slug: string;
  preferred_date: string | null;
  preferred_time?: string | null;
  message: string | null;
  status: string;
  language?: string | null;
  created_at: string;
}

const STATUSES: readonly BookingStatus[] = ["new", "confirmed", "done", "cancelled"];

export function toBookingStatus(value: string): BookingStatus {
  return (STATUSES as readonly string[]).includes(value) ? (value as BookingStatus) : "new";
}

export function toBooking(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    serviceSlug: row.service_slug,
    ...(row.preferred_date ? { preferredDate: row.preferred_date } : {}),
    ...(row.preferred_time ? { preferredTime: row.preferred_time.slice(0, 5) } : {}),
    ...(row.message ? { message: row.message } : {}),
    ...(row.language ? { language: row.language } : {}),
    status: toBookingStatus(row.status),
    createdAt: row.created_at,
  };
}
