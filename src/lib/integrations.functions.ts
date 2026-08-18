import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { TelegramIntegrationStatus } from "./telegram/model/status";
import type { OperationsModuleStatus } from "./ops/model/status";

/**
 * LIORA P0.31 — status integracji dla panelu administracyjnego.
 *
 * Odczyt wymaga sesji personelu. Handler nie zwraca żadnej wartości sekretu —
 * tylko flagi wyliczone serwerowo z `process.env`.
 */
export const fetchTelegramIntegrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<TelegramIntegrationStatus[]> => {
    const { requireStaffRole } = await import("./admin.server");
    await requireStaffRole(context.supabase, context.userId);
    const { readTelegramIntegrationStatus } = await import("./telegram/status.server");
    return readTelegramIntegrationStatus();
  });

/**
 * LIORA P0.34 — status operacyjny wszystkich modułów Admina.
 *
 * Autorytet jest serwerowy: rola personelu z `user_roles`, odczyt pod RLS.
 * Do przeglądarki trafiają wyłącznie stany, liczniki i flagi boolowskie.
 */
export const fetchOperationsStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<OperationsModuleStatus[]> => {
    const { requireStaffRole } = await import("./admin.server");
    await requireStaffRole(context.supabase, context.userId);
    const { readOperationsStatus } = await import("./ops/status.server");
    return readOperationsStatus(context.supabase);
  });
