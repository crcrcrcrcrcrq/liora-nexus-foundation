/**
 * LIORA P0.3.1 — middleware autoryzacyjne oparte o trwałą sesję SSR.
 *
 * Zastępuje weryfikację nagłówka `Authorization` odczytem sesji z ciasteczka
 * HttpOnly. Serwer pozostaje jedynym autorytetem tożsamości; frontend nie
 * przekazuje ani nie posiada surowego tokenu.
 */
import { createMiddleware } from "@tanstack/react-start";

export const requireSupabaseSession = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { createSupabaseSessionClient, getSessionUser } = await import("./session.server");

    const supabase = createSupabaseSessionClient();
    const user = await getSessionUser(supabase);

    if (!user) {
      throw new Error("Unauthorized: no active session");
    }

    return next({
      context: {
        supabase,
        userId: user.id,
        email: typeof user.email === "string" ? user.email : "",
      },
    });
  },
);
