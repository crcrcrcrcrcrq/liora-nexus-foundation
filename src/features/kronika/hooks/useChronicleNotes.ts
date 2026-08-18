import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useIdentity } from "@/features/identity/context/identity-context";
import {
  createChronicleNote,
  deleteChronicleNote,
  listChronicleNotes,
  updateChronicleNote,
} from "@/lib/chronicle.functions";
import type { ChronicleNote } from "../model/types";

const QUERY_KEY = ["chronicle", "notes"] as const;

/** Limit spójny z walidacją serwera i ograniczeniem w bazie. */
export const NOTE_MAX_LENGTH = 4000;

export interface NotesState {
  ready: boolean;
  notes: readonly ChronicleNote[];
  create: (body: string) => void;
  update: (id: string, body: string) => void;
  remove: (id: string) => void;
}

/**
 * P0.8 — prywatne notatki użytkownika. Źródłem prawdy jest Supabase;
 * tożsamość i własność rozstrzyga serwer (sesja SSR + RLS).
 */
export function useChronicleNotes(): NotesState {
  const { isAuthenticated } = useIdentity();
  const queryClient = useQueryClient();

  const list = useServerFn(listChronicleNotes);
  const add = useServerFn(createChronicleNote);
  const patch = useServerFn(updateChronicleNote);
  const drop = useServerFn(deleteChronicleNote);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => list(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["chronicle", "overview"] });
  }, [queryClient]);

  const createMutation = useMutation({ mutationFn: add, onSettled: invalidate });
  const updateMutation = useMutation({ mutationFn: patch, onSettled: invalidate });
  const deleteMutation = useMutation({ mutationFn: drop, onSettled: invalidate });

  const create = useCallback(
    (body: string) => {
      const value = body.trim();
      if (!value || value.length > NOTE_MAX_LENGTH) return;
      createMutation.mutate({ data: { body: value } });
    },
    [createMutation],
  );

  const update = useCallback(
    (id: string, body: string) => {
      const value = body.trim();
      if (!value || value.length > NOTE_MAX_LENGTH) return;
      updateMutation.mutate({ data: { id, body: value } });
    },
    [updateMutation],
  );

  const remove = useCallback(
    (id: string) => {
      deleteMutation.mutate({ data: { id } });
    },
    [deleteMutation],
  );

  return {
    ready: isAuthenticated ? !query.isLoading : true,
    notes: query.data ?? [],
    create,
    update,
    remove,
  };
}
