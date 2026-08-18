/**
 * LIORA P0.3.1 — trwała sesja SSR oparta o ciasteczka HttpOnly.
 *
 * Moduł jest wyłącznie serwerowy (rozszerzenie `.server.ts` blokuje import
 * z bundla klienta). Tokeny Supabase nigdy nie trafiają do przeglądarki w
 * formie odczytywalnej przez JavaScript — nośnikiem jest ciasteczko
 * HttpOnly ustawiane i odświeżane przez serwer TanStack Start.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getRequest, getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { Database } from "./schema";
import { SUPABASE_ENDPOINT, SUPABASE_PUBLISHABLE_KEY, supabaseFetch } from "@/config/supabase";

export type LioraServerClient = SupabaseClient<Database>;

/** HTTPS wymuszamy wszędzie poza lokalnym środowiskiem deweloperskim. */
function isSecureRequest(): boolean {
  try {
    const url = new URL(getRequest().url);
    if (url.protocol === "https:") return true;
    return !(url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return true;
  }
}

/**
 * Atrybuty bezpieczeństwa ciasteczka sesji.
 * HttpOnly — niedostępne dla `document.cookie`.
 * SameSite=Lax — chroni przed CSRF przy nawigacjach cross-site.
 */
function sessionCookieOptions(options: CookieOptions): CookieOptions {
  return {
    ...options,
    httpOnly: true,
    secure: isSecureRequest(),
    sameSite: "lax",
    path: "/",
  };
}

/**
 * Klient Supabase powiązany z bieżącym żądaniem. Czyta sesję z ciasteczek
 * HttpOnly i zapisuje odświeżone tokeny z powrotem w odpowiedzi.
 */
export function createSupabaseSessionClient(): LioraServerClient {
  const written: string[] = [];

  // Bezpośrednio na zewnętrzny endpoint — jedyne źródło autoryzacji.
  return createServerClient<Database>(SUPABASE_ENDPOINT, SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: supabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
    cookies: {
      getAll() {
        const header = getRequestHeader("cookie") ?? "";
        return parseCookieHeader(header)
          .filter((cookie): cookie is { name: string; value: string } => cookie.value != null)
          .map((cookie) => ({ name: cookie.name, value: cookie.value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          written.push(serializeCookieHeader(name, value, sessionCookieOptions(options ?? {})));
        }
        if (written.length > 0) {
          setResponseHeader("set-cookie", written);
        }
      },
    },
  });
}

/**
 * Zwraca użytkownika zweryfikowanego przez serwer Supabase Auth.
 * `getUser()` (w przeciwieństwie do `getSession()`) rewaliduje token.
 */
export async function getSessionUser(client: LioraServerClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
