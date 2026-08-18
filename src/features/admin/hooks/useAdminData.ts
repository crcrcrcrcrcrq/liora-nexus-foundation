import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminBookings, fetchAdminPeople, fetchAdminSummary } from "@/lib/admin.functions";
import { updateAdminBookingStatus } from "@/lib/admin.functions";
import type { BookingStatus } from "@/features/booking/model/types";

/**
 * LIORA P0.9 — dostęp widoków Admina do realnych danych.
 *
 * Widoki nie znają Supabase ani ról zapisanych w bazie. Pytają o dane, a
 * autoryzacja rozstrzyga się po stronie serwera: brak roli personelu = błąd,
 * nie pusta lista udająca porządek.
 */

const STALE = 30_000;

export function useAdminSummary() {
  return useQuery({
    queryKey: ["admin", "summary"],
    queryFn: () => fetchAdminSummary(),
    staleTime: STALE,
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => fetchAdminBookings(),
    staleTime: STALE,
  });
}

export function useAdminPeople() {
  return useQuery({
    queryKey: ["admin", "people"],
    queryFn: () => fetchAdminPeople(),
    staleTime: STALE,
  });
}

/**
 * P0.27 — zmiana statusu rezerwacji klienta. Widok wysyła wyłącznie `id` i
 * docelowy status; rolę personelu rozstrzyga serwer przy każdym wywołaniu.
 */
export function useBookingStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: BookingStatus }) =>
      updateAdminBookingStatus({ data: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "summary"] });
    },
  });
}
