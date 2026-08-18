import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { ScheduleEntry } from "@/features/booking/model/schedule";

/**
 * LIORA P0.11 — funkcje serwerowe grafiku dostępności.
 *
 * Sesja SSR → rola personelu z `user_roles` → operacja pod RLS.
 * Żadna z funkcji nie przyjmuje `user_id` ani roli z żądania.
 */

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseEntry(input: unknown) {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    id: text(raw["id"]),
    weekday: Number(raw["weekday"]),
    fromTime: text(raw["fromTime"]),
    toTime: text(raw["toTime"]),
    isActive: raw["isActive"] !== false,
  };
}

export const fetchBookingSchedule = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<ScheduleEntry[]> => {
    const { requireStaffRole } = await import("./admin.server");
    const { listSchedule } = await import("./schedule.server");
    await requireStaffRole(context.supabase, context.userId);
    return listSchedule(context.supabase);
  });

export const createBookingScheduleEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator(parseEntry)
  .handler(async ({ data, context }): Promise<ScheduleEntry> => {
    const { requireStaffRole } = await import("./admin.server");
    const { createScheduleEntry, scheduleEntryInput } = await import("./schedule.server");
    await requireStaffRole(context.supabase, context.userId);
    return createScheduleEntry(context.supabase, scheduleEntryInput.parse(data));
  });

export const updateBookingScheduleEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator(parseEntry)
  .handler(async ({ data, context }): Promise<ScheduleEntry> => {
    const { requireStaffRole } = await import("./admin.server");
    const { updateScheduleEntry, scheduleEntryInput } = await import("./schedule.server");
    if (!data.id) throw new Error("Invalid schedule entry: id is required");
    await requireStaffRole(context.supabase, context.userId);
    return updateScheduleEntry(context.supabase, data.id, scheduleEntryInput.parse(data));
  });

export const deleteBookingScheduleEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const id = text((input as Record<string, unknown>)?.["id"]);
    if (!id) throw new Error("Invalid schedule entry: id is required");
    return { id };
  })
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { requireStaffRole } = await import("./admin.server");
    const { deleteScheduleEntry } = await import("./schedule.server");
    await requireStaffRole(context.supabase, context.userId);
    return deleteScheduleEntry(context.supabase, data.id);
  });
