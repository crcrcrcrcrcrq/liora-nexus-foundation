/**
 * LIORA P0.11 — warstwa serwerowa grafiku dostępności.
 *
 * Moduł wyłącznie serwerowy. Grafik jest źródłem prawdy dla availability i
 * należy do personelu: każda operacja przechodzi przez sesyjnego klienta
 * Supabase (RLS) po wcześniejszym rozstrzygnięciu roli po stronie serwera.
 * Żadna wartość tożsamości ani roli nie pochodzi z żądania klienta.
 */
import { z } from "zod";
import type { LioraServerClient } from "@/integrations/supabase/session.server";
import type { ScheduleEntry, Weekday } from "@/features/booking/model/schedule";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleEntryInput = z
  .object({
    weekday: z.number().int().min(0).max(6),
    fromTime: z.string().regex(TIME, "Invalid time"),
    toTime: z.string().regex(TIME, "Invalid time"),
    isActive: z.boolean().default(true),
  })
  .refine((value) => value.toTime > value.fromTime, {
    message: "Invalid range: toTime must be later than fromTime",
    path: ["toTime"],
  });

export type ScheduleEntryInput = z.infer<typeof scheduleEntryInput>;

interface ScheduleRow {
  id: string;
  weekday: number;
  from_time: string;
  to_time: string;
  is_active: boolean;
}

/** `time` z Postgresa przychodzi jako HH:MM:SS — UI operuje na HH:MM. */
function toEntry(row: ScheduleRow): ScheduleEntry {
  return {
    id: row.id,
    weekday: row.weekday as Weekday,
    fromTime: row.from_time.slice(0, 5),
    toTime: row.to_time.slice(0, 5),
    isActive: row.is_active,
  };
}

const COLUMNS = "id, weekday, from_time, to_time, is_active";

export async function listSchedule(supabase: LioraServerClient): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase
    .from("booking_schedule")
    .select(COLUMNS)
    .order("weekday", { ascending: true })
    .order("from_time", { ascending: true });
  if (error) throw new Error("Schedule unavailable");
  return ((data ?? []) as ScheduleRow[]).map(toEntry);
}

/**
 * P0.34 — twarda, SERWEROWA gwarancja braku nakładających się przedziałów.
 *
 * Panel waliduje to samo po stronie UI, ale UI nie jest autorytetem: zapis może
 * pochodzić z innego klienta. Publiczna dostępność liczona z nakładek
 * pokazywałaby ten sam termin dwukrotnie, więc konflikt jest odrzucany tutaj.
 */
async function assertNoOverlap(
  supabase: LioraServerClient,
  input: ScheduleEntryInput,
  ignoreId?: string,
): Promise<void> {
  if (!input.isActive) return;
  const { data, error } = await supabase
    .from("booking_schedule")
    .select(COLUMNS)
    .eq("weekday", input.weekday)
    .eq("is_active", true);
  if (error) throw new Error("Schedule unavailable");

  const conflict = ((data ?? []) as ScheduleRow[])
    .filter((row) => row.id !== ignoreId)
    .some(
      (row) => input.fromTime < row.to_time.slice(0, 5) && row.from_time.slice(0, 5) < input.toTime,
    );
  if (conflict) throw new Error("SCHEDULE_OVERLAP");
}

export async function createScheduleEntry(
  supabase: LioraServerClient,
  input: ScheduleEntryInput,
): Promise<ScheduleEntry> {
  await assertNoOverlap(supabase, input);
  const { data, error } = await supabase
    .from("booking_schedule")
    .insert({
      weekday: input.weekday,
      from_time: input.fromTime,
      to_time: input.toTime,
      is_active: input.isActive,
    })
    .select(COLUMNS)
    .single();
  if (error || !data) throw new Error("Schedule entry was not saved");
  return toEntry(data as ScheduleRow);
}

export async function updateScheduleEntry(
  supabase: LioraServerClient,
  id: string,
  input: ScheduleEntryInput,
): Promise<ScheduleEntry> {
  await assertNoOverlap(supabase, input, id);
  const { data, error } = await supabase
    .from("booking_schedule")
    .update({
      weekday: input.weekday,
      from_time: input.fromTime,
      to_time: input.toTime,
      is_active: input.isActive,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error || !data) throw new Error("Schedule entry was not updated");
  return toEntry(data as ScheduleRow);
}

export async function deleteScheduleEntry(
  supabase: LioraServerClient,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("booking_schedule").delete().eq("id", id);
  if (error) throw new Error("Schedule entry was not removed");
  return { id };
}
