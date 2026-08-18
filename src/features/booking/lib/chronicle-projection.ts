import { SERVICE_BY_SLUG } from "../model/services";
import type { BookingRecord, BookingStatus } from "../model/types";
import type { ChronicleConsultation, ConsultationStatus } from "@/features/kronika/model/types";

/**
 * LIORA P0.5 — projekcja Booking → Kronika.
 *
 * `bookings` pozostaje jedynym źródłem prawdy. Kronika nie przechowuje kopii
 * rezerwacji; poniższa funkcja jest czysta i deterministyczna — nie zapisuje
 * niczego i nie generuje danych, których nie ma w rezerwacji.
 *
 * Mapowanie statusów (jawne, bez domysłów):
 *   new       → upcoming   (spotkanie dopiero przed nami)
 *   confirmed → upcoming   (termin potwierdzony, wciąż przed nami)
 *   done      → completed  (spotkanie się odbyło)
 *   cancelled → cancelled
 */
const STATUS_MAP: Record<BookingStatus, ConsultationStatus> = {
  new: "upcoming",
  confirmed: "upcoming",
  done: "completed",
  cancelled: "cancelled",
};

export function bookingToChronicleConsultation(booking: BookingRecord): ChronicleConsultation {
  const service = SERVICE_BY_SLUG(booking.serviceSlug);
  return {
    id: booking.id,
    type: service?.title ?? booking.serviceSlug,
    // Kronika pokazuje termin spotkania; gdy klient go nie wskazał,
    // najbliższą prawdą pozostaje moment złożenia prośby o termin.
    scheduledAt: booking.preferredDate ?? booking.createdAt,
    status: STATUS_MAP[booking.status],
    ...(booking.message ? { summary: booking.message } : {}),
  };
}
