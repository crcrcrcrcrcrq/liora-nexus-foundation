import { createServerFn } from "@tanstack/react-start";

/**
 * LIORA P0.3.1 — ustanowienie i zamknięcie trwałej sesji SSR.
 *
 * Klucz z linku powrotnego wymienia na sesję WYŁĄCZNIE serwer. Tokeny
 * zapisywane są w ciasteczkach HttpOnly; przeglądarka ich nie odczytuje.
 */
export const establishSession = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => {
    if (!input || typeof input.token !== "string" || input.token.length === 0) {
      throw new Error("Invalid token");
    }
    return { token: input.token };
  })
  .handler(async ({ data }): Promise<{ expiresAt: string }> => {
    const { createSupabaseSessionClient } = await import("@/integrations/supabase/session.server");
    const supabase = createSupabaseSessionClient();

    const { data: result, error } = await supabase.auth.verifyOtp({
      token_hash: data.token,
      type: "email",
    });

    if (error || !result.session) {
      throw new Error("Unauthorized: magic link verification failed");
    }

    return { expiresAt: new Date((result.session.expires_at ?? 0) * 1000).toISOString() };
  });

/** Zamyka sesję po stronie Supabase i czyści ciasteczka sesyjne. */
export const destroySession = createServerFn({ method: "POST" }).handler(async () => {
  const { createSupabaseSessionClient } = await import("@/integrations/supabase/session.server");
  const supabase = createSupabaseSessionClient();
  await supabase.auth.signOut();
  return { ok: true as const };
});

/** Czas wygaśnięcia bieżącej sesji — bez ujawniania tokenu. */
export const currentSessionExpiry = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ expiresAt: string } | null> => {
    const { createSupabaseSessionClient, getSessionUser } =
      await import("@/integrations/supabase/session.server");
    const supabase = createSupabaseSessionClient();
    const user = await getSessionUser(supabase);
    if (!user) return null;
    const { data } = await supabase.auth.getSession();
    return {
      expiresAt: new Date((data.session?.expires_at ?? 0) * 1000).toISOString(),
    };
  },
);
