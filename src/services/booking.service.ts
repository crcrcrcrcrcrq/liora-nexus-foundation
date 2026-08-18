import { api, API_ROUTES, type SubmissionAck } from "./api";
import { getAvailability } from "@/lib/booking.functions";
import type { ApiResult } from "@/types";
import type { BookingRecord, BookingRequest } from "@/features/booking/model/types";
import type { ScheduleWindow } from "@/features/booking/model/schedule";

/** P0.28 — dostępność to wolne dni + okna godzinowe grafiku. */
export interface AvailabilityView {
  dates: string[];
  windows: ScheduleWindow[];
}

/** Zgłoszenie rezerwacji. Backend zapisuje wpis i wysyła powiadomienia. */
export function submitBooking(payload: BookingRequest): Promise<ApiResult<SubmissionAck>> {
  return api.post<SubmissionAck>(API_ROUTES.booking, payload);
}

/**
 * LIORA P0.10 — wolne terminy liczone po stronie serwera z harmonogramu
 * i rzeczywistych rezerwacji. Kontrakt (`string[]` dat) pozostaje bez zmian.
 */
export async function fetchAvailability(serviceSlug: string): Promise<ApiResult<AvailabilityView>> {
  try {
    const availability = await getAvailability({ data: { serviceSlug } });
    return { ok: true, data: availability };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Availability failed" };
  }
}

/** Lista rezerwacji dla panelu administratora (wymaga sesji). */
export function listBookings(): Promise<ApiResult<BookingRecord[]>> {
  return api.get<BookingRecord[]>(API_ROUTES.booking);
}

export function updateBookingStatus(
  id: string,
  status: BookingRecord["status"],
): Promise<ApiResult<BookingRecord>> {
  return api.patch<BookingRecord>(`${API_ROUTES.booking}/${id}`, { status });
}
