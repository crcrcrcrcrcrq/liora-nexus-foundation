import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useIdentity } from "@/features/identity/context/identity-context";
import { createRitual } from "@/lib/chronicle.functions";

/**
 * LIORA P0.6 — minimalny adapter zapisu rytuału do Kroniki.
 *
 * Nie tworzy nowej warstwy historii: korzysta z istniejącej funkcji serwerowej
 * `createRitual`, która ustala właściciela wyłącznie z sesji SSR (RLS).
 * Gość nie zapisuje niczego. Ten sam wynik (stabilny klucz) zapisuje się raz —
 * ponowny render lub powrót do widoku nie tworzy duplikatu.
 */
export interface RitualDraft {
  kind: "tarot" | "astrology";
  title: string;
  occurredAt: string;
  reflection: string;
  details: string;
}

export interface RitualRecordState {
  /** Zapisuje wynik raz na `key`; poza sesją nie robi nic. */
  record: (key: string, draft: RitualDraft) => void;
}

export function useRitualRecord(): RitualRecordState {
  const { isAuthenticated } = useIdentity();
  const queryClient = useQueryClient();
  const save = useServerFn(createRitual);
  const recorded = useRef<Set<string>>(new Set());

  const record = useCallback(
    (key: string, draft: RitualDraft) => {
      if (!isAuthenticated || !key || recorded.current.has(key)) return;
      recorded.current.add(key);

      void save({ data: draft })
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ["chronicle", "overview"] });
        })
        .catch((error: unknown) => {
          // Wynik rytuału pozostaje nienaruszony — zawodzi wyłącznie zapis.
          recorded.current.delete(key);
          console.error("Chronicle ritual was not saved", error);
        });
    },
    [isAuthenticated, queryClient, save],
  );

  return { record };
}
