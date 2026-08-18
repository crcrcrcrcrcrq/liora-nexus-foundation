import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import { BOOKING_COLUMNS, toBooking, type BookingRow } from "@/features/booking/lib/booking-row";
import type { BookingRecord } from "@/features/booking/model/types";
import type { AvailabilityPayload } from "@/lib/availability.server";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";

/**
 * LIORA P0.4.5 — minimalna, rzeczywista persystencja rezerwacji.
 *
 * Tożsamość pochodzi WYŁĄCZNIE z sesji SSR (ciasteczko HttpOnly →
 * `requireSupabaseSession` → `getUser()`). Payload klienta nigdy nie ustala
 * `user_id`; własność egzekwuje RLS (`auth.uid() = user_id`).
 */

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * P0.35 — twarda walidacja ładunku rezerwacji.
 *
 * Wcześniej serwer wymagał wyłącznie niepustych ciągów: dowolny tekst
 * przechodził jako e-mail, a `name`/`message`/`preferredDate` nie miały ani
 * limitów długości, ani formatu. Rezerwacja jest zapisem publicznym (sesja
 * klienta), więc format i długości muszą być egzekwowane po stronie serwera,
 * a nie tylko w formularzu. Reguły biznesowe (usługa, grafik, slot) pozostają
 * bez zmian niżej w handlerze.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

function parseBookingInput(input: unknown) {
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = text(raw["name"]);
  const email = text(raw["email"]);
  const serviceSlug = text(raw["serviceSlug"]);
  const preferredDate = text(raw["preferredDate"]);
  const preferredTime = text(raw["preferredTime"]);
  const message = text(raw["message"]);

  if (!name || name.length > 120) throw new Error("Invalid booking: name is required");
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new Error("Invalid booking: email is required");
  }
  if (!serviceSlug || !SLUG_PATTERN.test(serviceSlug)) {
    throw new Error("Invalid booking: serviceSlug is required");
  }
  if (preferredDate && !DATE_PATTERN.test(preferredDate)) {
    throw new Error("Invalid booking: preferredDate is malformed");
  }
  if (preferredTime && !TIME_PATTERN.test(preferredTime)) {
    throw new Error("Invalid booking: preferredTime is malformed");
  }
  if (message.length > 2000) throw new Error("Invalid booking: message is too long");

  const language = text(raw["language"]);
  return {
    name,
    email,
    serviceSlug,
    preferredDate,
    preferredTime,
    message,
    language: (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
      ? (language as Language)
      : null,
  };
}

/**
 * LIORA P0.10 — rzeczywista dostępność terminów.
 *
 * Publiczna (bez sesji), zgodnie z decyzją produktową. Zwraca wyłącznie listę
 * wolnych dat — żadnych danych osobowych. Zastępuje martwe wywołanie
 * zewnętrznego `/bookings/availability`.
 */
export const getAvailability = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ({
    serviceSlug: text((input as Record<string, unknown>)?.["serviceSlug"]),
  }))
  .handler(async (): Promise<AvailabilityPayload> => {
    const { readAvailability } = await import("@/lib/availability.server");
    return readAvailability();
  });

export const listOwnBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<BookingRecord[]> => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as BookingRow[]).map(toBooking);
  });

export const getOwnBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const id = text((input as Record<string, unknown>)?.["id"]);
    if (!id) throw new Error("Invalid booking: id is required");
    return { id };
  })
  .handler(async ({ data, context }): Promise<BookingRecord> => {
    const { data: row, error } = await context.supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Booking was not found");
    return toBooking(row as BookingRow);
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator(parseBookingInput)
  .handler(async ({ data, context }): Promise<BookingRecord> => {
    /**
     * P0.28 — pełna rewalidacja serwerowa. Nic z payloadu nie jest zaufane:
     * usługa musi istnieć, być aktywna, rezerwowalna i mieć treść w języku,
     * w którym klient ją widział; dzień musi być wolny, a godzina mieścić się
     * w grafiku. Ostatnią linią obrony pozostaje unikalny indeks bazy
     * (`bookings_one_active_per_date`) — tylko on jest odporny na wyścig.
     */
    const { readPublicServices } = await import("./services.server");
    const { isPublishableIn } = await import("@/features/services/model/types");
    const services = await readPublicServices();
    const service = services.find((item) => item.slug === data.serviceSlug);
    if (!service || !service.isActive || !service.isBookable) {
      throw new Error("BOOKING_SERVICE_UNAVAILABLE");
    }
    if (data.language && !isPublishableIn(service, data.language)) {
      throw new Error("BOOKING_SERVICE_UNAVAILABLE");
    }

    if (data.preferredDate) {
      const { readAvailability } = await import("@/lib/availability.server");
      const { isSlotInSchedule, slotsForDate } = await import("@/features/booking/lib/slots");
      const availability = await readAvailability();
      if (!availability.dates.includes(data.preferredDate)) throw new Error("BOOKING_DATE_TAKEN");
      const slots = slotsForDate(availability.windows, data.preferredDate);
      if (data.preferredTime) {
        if (!isSlotInSchedule(availability.windows, data.preferredDate, data.preferredTime)) {
          throw new Error("BOOKING_SLOT_UNAVAILABLE");
        }
      } else if (slots.length > 0) {
        throw new Error("BOOKING_SLOT_UNAVAILABLE");
      }
    } else if (data.preferredTime) {
      throw new Error("BOOKING_SLOT_UNAVAILABLE");
    }

    const { data: row, error } = await context.supabase
      .from("bookings")
      .insert({
        // Ownership pochodzi z sesji serwera, nigdy z payloadu klienta.
        user_id: context.userId,
        name: data.name,
        email: data.email,
        service_slug: data.serviceSlug,
        preferred_date: data.preferredDate || null,
        preferred_time: data.preferredTime || null,
        language: data.language ?? DEFAULT_LANGUAGE,
        message: data.message || null,
      })
      .select(BOOKING_COLUMNS)
      .single();
    if (error) {
      // 23505 = naruszenie unikalności terminu. Nie ujawniamy szczegółów bazy.
      if (error.code === "23505") throw new Error("BOOKING_DATE_TAKEN");
      throw new Error("Booking was not saved");
    }
    if (!row) throw new Error("Booking was not saved");

    const record = toBooking(row as BookingRow);

    /**
     * P0.14 — powiadomienie wyłącznie po skutecznym INSERT-cie. Nieudana
     * wysyłka nigdy nie cofa rezerwacji ani nie zmienia odpowiedzi klienta.
     */
    try {
      const { notifyBookingEvent } =
        await import("@/lib/notifications/booking-notifications.server");
      await notifyBookingEvent(record, "booking.created");
    } catch {
      console.warn("[booking-notification] dispatch failed after successful insert");
    }

    return record;
  });

export const cancelOwnBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const id = text((input as Record<string, unknown>)?.["id"]);
    if (!id) throw new Error("Invalid booking: id is required");
    return { id };
  })
  .handler(async ({ data, context }): Promise<BookingRecord> => {
    /**
     * P0.30 — anulowanie jest idempotentne: `neq('cancelled')` sprawia, że
     * powtórzone wywołanie nie aktualizuje wiersza, a więc NIE wysyła drugi
     * raz `booking.cancelled`.
     */
    const { data: row, error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .neq("status", "cancelled")
      .select(BOOKING_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!row) {
      const { data: existing, error: readError } = await context.supabase
        .from("bookings")
        .select(BOOKING_COLUMNS)
        .eq("id", data.id)
        .single();
      if (readError || !existing) throw new Error("Booking was not updated");
      return toBooking(existing as BookingRow);
    }

    const record = toBooking(row as BookingRow);

    /** Zdarzenie WYŁĄCZNIE po skutecznym UPDATE; wysyłka nie cofa anulowania. */
    try {
      const { notifyBookingEvent } =
        await import("@/lib/notifications/booking-notifications.server");
      await notifyBookingEvent(record, "booking.cancelled");
    } catch {
      console.warn("[booking-notification] dispatch failed after successful cancellation");
    }

    return record;
  });
