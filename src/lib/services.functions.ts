/**
 * LIORA P0.27 — funkcje serwerowe usług.
 *
 * Odczyt publiczny jest jawnie publiczny (oferta na stronie, tylko aktywne
 * usługi). Każdy zapis: sesja SSR → `requireStaffRole` (serwer) → operacja pod
 * RLS. Żadna funkcja nie przyjmuje `user_id` ani roli z żądania.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { ServiceRecord } from "@/features/services/model/types";

export const fetchPublicServices = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServiceRecord[]> => {
    const { readPublicServices } = await import("./services.server");
    return readPublicServices();
  },
);

export const fetchAdminServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<ServiceRecord[]> => {
    const { requireStaffRole } = await import("./admin.server");
    const { listServices } = await import("./services.server");
    await requireStaffRole(context.supabase, context.userId);
    return listServices(context.supabase);
  });

export const saveService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => input)
  .handler(async ({ data, context }): Promise<ServiceRecord> => {
    const { requireStaffRole } = await import("./admin.server");
    const { serviceInput, upsertService } = await import("./services.server");
    await requireStaffRole(context.supabase, context.userId);
    return upsertService(context.supabase, serviceInput.parse(data));
  });

export const toggleServiceActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const id = typeof raw["id"] === "string" ? raw["id"].trim() : "";
    if (!id) throw new Error("Invalid service: id is required");
    return { id, isActive: raw["isActive"] === true };
  })
  .handler(async ({ data, context }): Promise<ServiceRecord> => {
    const { requireStaffRole } = await import("./admin.server");
    const { setServiceActive } = await import("./services.server");
    await requireStaffRole(context.supabase, context.userId);
    return setServiceActive(context.supabase, data.id, data.isActive);
  });
