/**
 * LIORA P0.38 — Control Plane exposed to the Admin panel.
 *
 * Wyłącznie ODCZYT statusu. Każda operacja uprzywilejowana pozostaje serwerowa,
 * a rola jest re-weryfikowana z `user_roles` przy każdym wywołaniu. Handler nie
 * zwraca żadnej wartości sekretu — tylko stany, liczniki i flagi boolowskie.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { ControlModuleStatus } from "./control/model";

export const fetchControlPlaneStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<ControlModuleStatus[]> => {
    const { requireControlIdentity, assertControlPermission } =
      await import("./control/authorize.server");
    const identity = await requireControlIdentity(context.supabase, context.userId);
    assertControlPermission(identity, "control:read");
    const { readControlPlaneStatus } = await import("./control/status.server");
    return readControlPlaneStatus(identity);
  });
