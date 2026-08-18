/**
 * LIORA — klient przeglądarkowy wskazujący BEZPOŚREDNIO na zewnętrzny projekt.
 *
 * Zastępuje wygenerowany `@/integrations/supabase/client`, który czyta
 * zarezerwowane zmienne Cloud i wskazywałby na obcy projekt.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/schema";
import { SUPABASE_ENDPOINT, SUPABASE_PUBLISHABLE_KEY, supabaseFetch } from "@/config/supabase";

function createBrowserClient() {
  return createClient<Database>(SUPABASE_ENDPOINT, SUPABASE_PUBLISHABLE_KEY, {
    global: { fetch: supabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
    auth: {
      // Sesję prowadzi serwer (ciasteczko HttpOnly). Klient trzyma wyłącznie
      // stan ulotny potrzebny do wysłania linku jednorazowego.
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let cached: ReturnType<typeof createBrowserClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop, receiver) {
    if (!cached) cached = createBrowserClient();
    return Reflect.get(cached, prop, receiver);
  },
});
