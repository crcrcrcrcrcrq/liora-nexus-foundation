/**
 * LIORA — wejście Telegram Mini App do panelu zarządzania.
 *
 * Mini App przesyła surowe `initData`; cała weryfikacja (podpis, allowlista,
 * rola z bazy) dzieje się na serwerze. Klient nigdy nie deklaruje roli.
 */
import { createServerFn } from "@tanstack/react-start";

export const authorizeTelegramMiniApp = createServerFn({ method: "POST" })
  .inputValidator((input: { initData: string }) => {
    const initData = typeof input?.initData === "string" ? input.initData : "";
    // Górny limit długości chroni przed nadmiarowym wejściem.
    if (!initData || initData.length > 4096) throw new Error("TMA_INVALID_INIT_DATA");
    return { initData };
  })
  .handler(async ({ data }): Promise<{ role: "admin" | "moderator" } | null> => {
    const { resolveTmaAdmin } = await import("./tma/admin.server");
    const session = await resolveTmaAdmin(data.initData);
    // Zwracamy wyłącznie rolę — bez identyfikatorów i danych osobowych.
    return session ? { role: session.role } : null;
  });
