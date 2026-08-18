/**
 * LIORA — ZEWNĘTRZNY, BEZPOŚREDNI endpoint Supabase.
 *
 * ARCHITEKTURA (uproszczona maksymalnie):
 * Jedyny i bezpośredni punkt autoryzacji oraz operacji na danych. Aplikacja
 * NIE korzysta z projektu zarządzanego przez Lovable Cloud.
 *
 * DLACZEGO WARTOŚCI SĄ W KODZIE, A NIE W ZMIENNYCH ŚRODOWISKOWYCH:
 * Prefiksy `SUPABASE_` i `VITE_` są zarezerwowane dla integracji zarządzanej —
 * nie da się ich ustawić na zewnętrzny projekt. Adres URL oraz klucz
 * publishable są danymi publicznymi (klucz `sb_publishable_` jest projektowany
 * do wysyłki do przeglądarki), więc ich obecność w kodzie jest bezpieczna.
 *
 * ZAKAZ: nigdy nie umieszczaj tutaj klucza `sb_secret_` ani service-role.
 * Sekrety serwerowe czytamy wyłącznie z `process.env` (patrz `secretKey()`).
 */

export const SUPABASE_ENDPOINT = "https://htyvrbeyzcpoktltdzsx.supabase.co";

/** Klucz publishable — bezpieczny w przeglądarce, chroniony przez RLS. */
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_X3infeU_IJqsDTjBwBcH9w_FkvQcppi";

/**
 * Klucz sekretny (server-only, opcjonalny). Używany wyłącznie tam, gdzie
 * operacja musi ominąć RLS (bot administracyjny, agregaty). Brak klucza =
 * ścieżka administracyjna jest nieczynna, a nie „cicho otwarta”.
 */
export function secretKey(): string {
  return process.env["LIORA_SUPABASE_SECRET_KEY"]?.trim() ?? "";
}

/** Nowe klucze Supabase są nieprzezroczyste — nie wolno wysyłać ich jako Bearer. */
export function isOpaqueKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

/**
 * Wspólny `fetch` dla wszystkich klientów: wymusza nagłówek `apikey` i usuwa
 * błędny `Authorization: Bearer <klucz nieprzezroczysty>`, który PostgREST
 * odrzuca komunikatem „Expected 3 parts in JWT; got 1”.
 */
export function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }
    if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}
