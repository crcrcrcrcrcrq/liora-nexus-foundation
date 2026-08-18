import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBookingScheduleEntry,
  deleteBookingScheduleEntry,
  fetchBookingSchedule,
  updateBookingScheduleEntry,
} from "@/lib/schedule.functions";
import type { ScheduleEntry } from "@/features/booking/model/schedule";

/**
 * LIORA P0.11 — dostęp Admina do realnego grafiku dostępności.
 * Autoryzacja rozstrzyga się na serwerze; hook zna wyłącznie dane widoku.
 */

const KEY = ["admin", "schedule"] as const;

export function useBookingSchedule() {
  return useQuery<ScheduleEntry[]>({
    queryKey: KEY,
    queryFn: () => fetchBookingSchedule(),
    staleTime: 30_000,
  });
}

export interface ScheduleDraft {
  id?: string;
  weekday: number;
  fromTime: string;
  toTime: string;
  isActive: boolean;
}

export function useScheduleMutations() {
  const client = useQueryClient();
  const invalidate = () => void client.invalidateQueries({ queryKey: KEY });

  const save = useMutation({
    mutationFn: (draft: ScheduleDraft) =>
      draft.id
        ? updateBookingScheduleEntry({ data: { ...draft, id: draft.id } })
        : createBookingScheduleEntry({ data: draft }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBookingScheduleEntry({ data: { id } }),
    onSuccess: invalidate,
  });

  return { save, remove };
}
