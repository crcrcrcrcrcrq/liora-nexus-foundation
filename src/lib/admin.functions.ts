import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { AdminBookingRow, AdminPersonRow, AdminSummary } from "@/features/admin/model/types";
import { isBookingStatus } from "@/features/booking/model/status";
import type { BookingStatus } from "@/features/booking/model/types";

/**
 * LIORA P0.9 — funkcje serwerowe Admina.
 *
 * Każda z nich: sesja SSR → rola z `user_roles` → zapytanie pod RLS.
 * Żadna nie przyjmuje identyfikatora użytkownika ani roli z żądania.
 */

export const fetchAdminSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<AdminSummary> => {
    const { requireStaffRole, summarize } = await import("./admin.server");
    await requireStaffRole(context.supabase, context.userId);
    return summarize(context.supabase);
  });

export const fetchAdminBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<AdminBookingRow[]> => {
    const { requireStaffRole, listBookings } = await import("./admin.server");
    const role = await requireStaffRole(context.supabase, context.userId);
    return listBookings(context.supabase, role);
  });

export const fetchAdminPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<AdminPersonRow[]> => {
    const { requireStaffRole, listPeople } = await import("./admin.server");
    await requireStaffRole(context.supabase, context.userId);
    return listPeople(context.supabase);
  });

/**
 * P0.27 — jedna bezpieczna mutacja statusu dla personelu.
 *
 * Potwierdzenie, odwołanie i zamknięcie rezerwacji to TO SAMO przejście
 * statusu, więc nie mnożymy czterech mechanizmów. Payload zawiera wyłącznie
 * `id` i docelowy status; rola i tożsamość pochodzą z sesji serwera.
 */
export const updateAdminBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const id = typeof raw["id"] === "string" ? raw["id"].trim() : "";
    if (!id) throw new Error("Invalid booking: id is required");
    if (!isBookingStatus(raw["status"])) throw new Error("Invalid booking: unknown status");
    return { id, status: raw["status"] as BookingStatus };
  })
  .handler(async ({ data, context }): Promise<AdminBookingRow> => {
    const { requireStaffRole, updateBookingStatus } = await import("./admin.server");
    const role = await requireStaffRole(context.supabase, context.userId);
    return updateBookingStatus(context.supabase, role, data.id, data.status);
  });
