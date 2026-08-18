import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useIdentity } from "@/features/identity/context/identity-context";
import type { ReflectionAnswers, ReflectionContext, SoulReflection } from "../model/reflection";
import {
  createReflection,
  drainLocalReflections,
  sortReflections,
  type ReflectionGateway,
} from "../lib/reflections";
import {
  createReflectionEntry,
  deleteReflectionEntry,
  importLocalReflections,
  listReflections,
  updateReflectionEntry,
} from "@/lib/chronicle.functions";

export interface ReflectionsState {
  /** true dopiero po odczycie z serwera — wcześniej nie znamy zawartości Kroniki. */
  ready: boolean;
  entries: readonly SoulReflection[];
  save: (context: ReflectionContext, answers: ReflectionAnswers) => SoulReflection;
  update: (id: string, answers: ReflectionAnswers) => void;
  remove: (id: string) => void;
}

const QUERY_KEY = ["chronicle", "reflections"] as const;

/**
 * Jedno źródło refleksji dla Tarota, Kroniki i Sanktuarium.
 *
 * P0.4: źródłem prawdy jest Supabase. Widoki nie znają miejsca zapisu —
 * proszą wyłącznie o zapis i odczyt; własność egzekwuje serwer (RLS).
 * Pamięć przeglądarki służy już tylko jednorazowej migracji starych wpisów.
 */
export function useReflections(_gateway?: ReflectionGateway): ReflectionsState {
  const { isAuthenticated } = useIdentity();
  const queryClient = useQueryClient();

  const list = useServerFn(listReflections);
  const create = useServerFn(createReflectionEntry);
  const patch = useServerFn(updateReflectionEntry);
  const drop = useServerFn(deleteReflectionEntry);
  const importLocal = useServerFn(importLocalReflections);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => list(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });

  const migrated = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || migrated.current) return;
    const local = drainLocalReflections();
    if (local.length === 0) {
      migrated.current = true;
      return;
    }
    migrated.current = true;
    void importLocal({ data: { entries: local } })
      .then(() => queryClient.invalidateQueries({ queryKey: QUERY_KEY }))
      .catch(() => undefined);
  }, [isAuthenticated, importLocal, queryClient]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const createMutation = useMutation({ mutationFn: create, onSettled: invalidate });
  const updateMutation = useMutation({ mutationFn: patch, onSettled: invalidate });
  const deleteMutation = useMutation({ mutationFn: drop, onSettled: invalidate });

  const save = useCallback(
    (context: ReflectionContext, answers: ReflectionAnswers) => {
      const optimistic = createReflection(context, answers);
      createMutation.mutate({
        data: {
          readingAt: context.readingAt,
          language: context.language,
          spread: context.spread,
          interpretation: context.interpretation,
          cards: context.cards.map((card) => ({ ...card })),
          ...answers,
        },
      });
      return optimistic;
    },
    [createMutation],
  );

  const update = useCallback(
    (id: string, answers: ReflectionAnswers) => {
      updateMutation.mutate({ data: { id, ...answers } });
    },
    [updateMutation],
  );

  const remove = useCallback(
    (id: string) => {
      deleteMutation.mutate({ data: { id } });
    },
    [deleteMutation],
  );

  const entries = sortReflections(query.data ?? []);

  return {
    ready: isAuthenticated ? !query.isLoading : true,
    entries,
    save,
    update,
    remove,
  };
}
