import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useIdentity } from "@/features/identity/context/identity-context";
import { fetchChronicleOverview } from "@/lib/chronicle.functions";
import { getSampleChronicle } from "../model/sample";
import type { ChronicleOverview, ChronicleProfile } from "../model/types";

/**
 * Jedno źródło danych dla wszystkich sekcji Kroniki.
 *
 * P0.4: zalogowany użytkownik dostaje wyłącznie własne, rzeczywiste dane
 * z Supabase — brak wpisów oznacza pusty stan, nigdy zapis przykładowy.
 * Zapis przykładowy pokazujemy tylko poza sesją (podgląd kształtu Kroniki).
 */
export function useChronicle(): {
  chronicle: ChronicleOverview;
  isLoading: boolean;
  isSample: boolean;
} {
  const { session, isAuthenticated } = useIdentity();
  const load = useServerFn(fetchChronicleOverview);

  const query = useQuery({
    queryKey: ["chronicle", "overview", session?.user.id ?? "anonim"],
    queryFn: () => load(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });

  const profile: ChronicleProfile = {
    email: session?.user.email ?? "—",
    ...(session?.user.displayName ? { displayName: session.user.displayName } : {}),
    ...(session?.user.createdAt ? { joinedAt: session.user.createdAt } : {}),
  };

  if (!isAuthenticated) {
    const sample = getSampleChronicle();
    return { chronicle: { ...sample, profile }, isLoading: false, isSample: true };
  }

  const empty: ChronicleOverview = {
    profile,
    lastRitual: null,
    rituals: [],
    consultations: [],
    notes: [],
    reflection: null,
    reports: [],
  };

  const chronicle: ChronicleOverview = query.data
    ? { ...query.data, profile: { ...profile, ...query.data.profile } }
    : empty;

  return { chronicle, isLoading: query.isLoading, isSample: false };
}
