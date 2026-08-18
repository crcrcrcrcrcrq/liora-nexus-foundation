import { useCallback, useMemo, useState } from "react";
import { fetchAvailability, type AvailabilityView } from "@/services/booking.service";
import { createBooking } from "@/lib/booking.functions";
import { useLanguage } from "@/hooks/useLanguage";
import { useBookableOffers } from "@/features/services/hooks/useServices";
import { slotsForDate } from "../lib/slots";

import type { BookingRequest, ServiceOffer } from "../model/types";
import type { ApiResult } from "@/types";
import type { SubmissionAck } from "@/services/api";

const EMPTY: AvailabilityView = { dates: [], windows: [] };

interface BookingState {
  /** Usługi rezerwowalne — wyłącznie z bazy (`services`, is_bookable). */
  bookableServices: ServiceOffer[];
  isLoadingServices: boolean;
  isServicesError: boolean;
  availability: AvailabilityView;
  isLoadingAvailability: boolean;
  isAvailabilityError: boolean;
  loadAvailability: (serviceSlug: string) => Promise<void>;
  slotsFor: (date: string) => string[];
  getService: (slug: string) => ServiceOffer | undefined;
  submit: (payload: BookingRequest) => Promise<ApiResult<SubmissionAck>>;
}

/** Logika domenowa rezerwacji — komponenty formularza tylko renderują widok. */
export function useBooking(): BookingState {
  const { t, language } = useLanguage();
  const [availability, setAvailability] = useState<AvailabilityView>(EMPTY);
  const [isLoadingAvailability, setLoading] = useState(false);
  const [isAvailabilityError, setAvailabilityError] = useState(false);

  const { offers, isLoading: isLoadingServices, isError: isServicesError } = useBookableOffers();
  const getService = useMemo(() => {
    const bySlug = new Map(offers.map((offer) => [offer.slug, offer]));
    return (slug: string) => bySlug.get(slug);
  }, [offers]);

  const loadAvailability = useCallback(async (serviceSlug: string) => {
    setLoading(true);
    const result = await fetchAvailability(serviceSlug);
    setAvailability(result.ok && result.data ? result.data : EMPTY);
    setAvailabilityError(!result.ok);
    setLoading(false);
  }, []);

  const slotsFor = useCallback(
    (date: string) => (date ? slotsForDate(availability.windows, date) : []),
    [availability.windows],
  );

  /**
   * Zapis rezerwacji w bazie. Tożsamość ustala serwer (sesja SSR), dlatego
   * payload zawiera wyłącznie dane domenowe formularza oraz język adresu.
   *
   * P0.28: serwer ponownie waliduje usługę, dzień i godzinę. Kody błędów
   * tłumaczymy na komunikaty; surowy błąd bazy nigdy nie trafia do widoku.
   */
  const submit = useCallback(
    async (payload: BookingRequest): Promise<ApiResult<SubmissionAck>> => {
      try {
        const record = await createBooking({ data: { ...payload, language } });
        return { ok: true, data: { id: record.id, receivedAt: record.createdAt } };
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("BOOKING_DATE_TAKEN")) {
          return { ok: false, error: t("booking.form.dateTaken") };
        }
        if (message.includes("BOOKING_SLOT_UNAVAILABLE")) {
          return { ok: false, error: t("booking.form.slotUnavailable") };
        }
        if (message.includes("BOOKING_SERVICE_UNAVAILABLE")) {
          return { ok: false, error: t("booking.form.serviceUnavailable") };
        }
        return { ok: false, error: t("booking.form.errorMessage") };
      }
    },
    [t, language],
  );

  return {
    bookableServices: offers,
    isLoadingServices,
    isServicesError,
    availability,
    isLoadingAvailability,
    isAvailabilityError,
    loadAvailability,
    slotsFor,
    getService,
    submit,
  };
}
