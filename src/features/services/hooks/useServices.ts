import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminServices,
  fetchPublicServices,
  saveService,
  toggleServiceActive,
} from "@/lib/services.functions";
import type { ServiceRecord } from "@/features/services/model/types";
import type { ServiceOffer } from "@/features/booking/model/types";
import { toPublicOffers, type PublicOffer } from "@/features/services/lib/offer";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * LIORA P0.27 — dostęp widoków do oferty.
 *
 * Baza (`services`, tylko aktywne) jest JEDYNYM źródłem prawdy oferty — nie ma
 * fallbacku do danych wbudowanych. Brak treści w danym języku oznacza brak
 * usługi w tym języku, nigdy podmiany na drugi język.
 */
export function usePublicServices(): {
  offers: PublicOffer[];
  isLoading: boolean;
  isError: boolean;
} {
  const { language } = useLanguage();
  const query = useQuery({
    queryKey: ["services", "public"],
    queryFn: () => fetchPublicServices(),
    staleTime: 60_000,
  });

  const offers = useMemo(() => toPublicOffers(query.data ?? [], language), [query.data, language]);

  return { offers, isLoading: query.isPending, isError: query.isError };
}

/** Usługi, które można zarezerwować w formularzu. */
export function useBookableOffers(): {
  offers: ServiceOffer[];
  isLoading: boolean;
  isError: boolean;
} {
  const { offers, isLoading, isError } = usePublicServices();
  const bookable = useMemo(
    () => offers.filter((item) => item.isBookable).map((item) => item.offer),
    [offers],
  );
  return { offers: bookable, isLoading, isError };
}

export function useAdminServices() {
  return useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => fetchAdminServices(),
    staleTime: 30_000,
  });
}

export function useServiceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
    void queryClient.invalidateQueries({ queryKey: ["services", "public"] });
  };

  const save = useMutation({
    mutationFn: (input: unknown) => saveService({ data: input }),
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: (input: { id: string; isActive: boolean }) => toggleServiceActive({ data: input }),
    onSuccess: invalidate,
  });

  return { save, toggle };
}

export type { ServiceRecord };
