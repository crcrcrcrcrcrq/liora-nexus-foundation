/**
 * LIORA — schemat bazy dla ZEWNĘTRZNEGO projektu Supabase.
 *
 * DLACZEGO TEN PLIK ISTNIEJE:
 * `src/integrations/supabase/types.ts` jest generowany automatycznie z projektu
 * podłączonego przez Lovable Cloud. Aplikacja korzysta z WŁASNEGO, zewnętrznego
 * projektu Supabase, którego Lovable nie może introspekcjonować — wygenerowany
 * plik jest więc pusty (`[_ in never]: never`), co unieważnia typowanie każdego
 * zapytania.
 *
 * Tabele i funkcje poniżej odwzorowują `supabase/migrations/`. Kolumny są
 * celowo opisane szeroko (`Record<string, unknown>`): NIE zgadujemy typów
 * kolumn bazy, do której nie mamy dostępu. Po podłączeniu realnego endpointu
 * schemat należy zawęzić na podstawie introspekcji.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Rola aplikacyjna — źródło prawdy: enum `app_role` w bazie. */
export type AppRole = "admin" | "moderator" | "client";

/* eslint-disable @typescript-eslint/no-explicit-any */
type LooseTable = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships: [];
};
/* eslint-enable @typescript-eslint/no-explicit-any */

type LioraTables =
  | "analytics_events"
  | "blog_posts"
  | "booking_schedule"
  | "bookings"
  | "chronicle_notes"
  | "chronicle_reflections"
  | "chronicle_rituals"
  | "profiles"
  | "services"
  | "site_content"
  | "site_settings"
  | "user_roles";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12.2.3" };
  public: {
    Tables: { [K in LioraTables]: LooseTable };
    Views: Record<never, never>;
    Functions: {
      /** Aktywne okna grafiku (bez argumentów) — `booking_schedule.is_active`. */
      active_schedule_windows: {
        Args: Record<never, never>;
        Returns: { weekday: number; from_time: string; to_time: string }[];
      };
      /** Dni już zajęte w zakresie — bez ujawniania danych osobowych. */
      booked_dates: {
        Args: { _from: string; _to: string };
        Returns: { booked_date: string }[];
      };
      /** Weryfikacja roli po stronie bazy (SECURITY DEFINER). */
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<never, never>;
  };
};
