/**
 * LIORA P0.14 / P0.29 — powiadomienia o rezerwacji.
 *
 * Źródłem prawdy pozostaje `public.bookings`. Ten moduł nie tworzy ani nie
 * kopiuje rekordu rezerwacji — czyta zapisany już rekord, dopina migawkę
 * usługi Z BAZY (`public.services`, nigdy z danych wbudowanych) i publikuje
 * znormalizowane zdarzenie. Kanały (e-mail, w przyszłości Telegram) są
 * podpięte w `dispatch.server.ts`; domena ich nie zna.
 *
 * Nigdy nie rzuca: nieudane powiadomienie nie może cofnąć ani podważyć
 * operacji zapisanej w bazie.
 */
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import { toLioraId } from "@/features/experience/lib/liora-id";
import type { BookingStatus } from "@/features/booking/model/types";
import { dispatchBookingEvent, type DispatchOutcome } from "./dispatch.server";
import type { BookingEvent, BookingEventType } from "./model/events";

/** Minimalny wycinek rezerwacji potrzebny do powiadomienia. */
export interface NotifiableBooking {
  id: string;
  name: string;
  email: string;
  serviceSlug: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  status: BookingStatus;
  language?: string | null;
}

function toLanguage(value: string | null | undefined): Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value ?? "")
    ? (value as Language)
    : DEFAULT_LANGUAGE;
}

/** Migawka usługi pochodzi z bazy; brak rekordu = pokazujemy slug, nie zmyślamy. */
async function serviceSnapshot(slug: string, language: Language) {
  try {
    const { readPublicServices } = await import("@/lib/services.server");
    const service = (await readPublicServices()).find((item) => item.slug === slug);
    if (!service) return { slug, title: slug, price: null, currency: "PLN", duration: "" };
    const content = service.content[language];
    return {
      slug,
      title: content.title || slug,
      price: service.price,
      currency: service.currency,
      duration: content.duration,
    };
  } catch {
    return { slug, title: slug, price: null, currency: "PLN", duration: "" };
  }
}

export async function buildBookingEvent(
  booking: NotifiableBooking,
  type: BookingEventType,
): Promise<BookingEvent> {
  const locale = toLanguage(booking.language);
  return {
    type,
    bookingId: booking.id,
    reference: toLioraId(booking.id),
    locale,
    service: await serviceSnapshot(booking.serviceSlug, locale),
    date: booking.preferredDate ?? null,
    time: booking.preferredTime ? booking.preferredTime.slice(0, 5) : null,
    customerName: booking.name,
    customerEmail: booking.email,
    status: booking.status,
  };
}

/** Publikuje zdarzenie domeny rezerwacji. NIGDY nie rzuca. */
export async function notifyBookingEvent(
  booking: NotifiableBooking,
  type: BookingEventType,
): Promise<DispatchOutcome | null> {
  try {
    return await dispatchBookingEvent(await buildBookingEvent(booking, type));
  } catch {
    console.warn(`[notifications] dispatch failed for ${type}`);
    return null;
  }
}
