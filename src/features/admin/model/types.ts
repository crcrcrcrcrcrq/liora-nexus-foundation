/**
 * LIORA P0.9 — kontrakt danych Admina.
 *
 * Kształty współdzielone przez warstwę serwerową (`src/lib/admin.server.ts`)
 * i widoki. Moduł jest bezpieczny dla klienta: zawiera wyłącznie typy.
 */

export type StaffRole = "moderator" | "admin";

export interface AdminBookingRow {
  id: string;
  lioraId: string;
  serviceSlug: string;
  status: string;
  createdAt: string;
  preferredDate: string | null;
  /** HH:MM:SS — godzina z grafiku wybrana przez klienta. */
  preferredTime?: string | null;
  /** Język, w którym klient złożył rezerwację (`pl` / `en`). */
  language: string;
  /** Ostatnia zmiana rekordu — moment operacyjny, nie moment zgłoszenia. */
  updatedAt: string;
  /** Wyłącznie dla roli `admin`. Moderator nie otrzymuje tego pola. */
  name?: string;
  /**
   * P0.27 — dane kontaktowe potrzebne do obsługi rezerwacji. Serwer dołącza je
   * WYŁĄCZNIE dla roli `admin`; moderator pracuje na identyfikatorze LIORA.
   */
  email?: string;
  message?: string;
}

export interface AdminPersonRow {
  lioraId: string;
  /** Ostatni znany ślad: najnowsza rezerwacja albo moment dołączenia. */
  lastSeenAt: string;
}

export interface AdminSummary {
  /** Osoby z rezerwacją utworzoną dziś. */
  todayPeople: number;
  /** Rezerwacje czekające na odpowiedź (`new`). */
  awaiting: number;
  /** Rezerwacje potwierdzone (`confirmed`). */
  confirmed: number;
  people: number;
  bookingsTotal: number;
  byStatus: Record<string, number>;
}
