/**
 * LIORA P0.9 — warstwa serwerowa Admina.
 *
 * Moduł jest wyłącznie serwerowy (`.server.ts`). Nie tworzy nowego źródła
 * prawdy: czyta wyłącznie istniejące tabele domenowe (`profiles`, `bookings`)
 * przez sesyjnego klienta Supabase, więc RLS obowiązuje tak samo jak dla
 * każdego innego zapytania tego użytkownika.
 *
 * Autorytet roli jest serwerowy. Rola nigdy nie pochodzi z żądania — czytamy
 * ją z `user_roles` dla identyfikatora wyprowadzonego z sesji.
 */
import type { LioraServerClient } from "@/integrations/supabase/session.server";
import { toLioraId } from "@/features/experience/lib/liora-id";
import { canTransition, isBookingStatus } from "@/features/booking/model/status";
import type { BookingStatus } from "@/features/booking/model/types";
import type {
  AdminBookingRow,
  AdminPersonRow,
  AdminSummary,
  StaffRole,
} from "@/features/admin/model/types";

/**
 * Rozstrzyga rolę personelu po stronie serwera. Rzuca, gdy użytkownik nie ma
 * uprawnień — brak roli oznacza brak danych, niezależnie od stanu UI.
 */
export async function requireStaffRole(
  supabase: LioraServerClient,
  userId: string,
): Promise<StaffRole> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error("Forbidden: role lookup failed");
  const roles = (data ?? []).map((row) => row.role as string);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("moderator")) return "moderator";
  throw new Error("Forbidden: staff role required");
}

/** Rezerwacje widoczne dla personelu (polityka `bookings_select_staff`). */
export async function listBookings(
  supabase: LioraServerClient,
  role: StaffRole,
): Promise<AdminBookingRow[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, user_id, name, email, message, service_slug, status, language, preferred_date, preferred_time, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error("Bookings unavailable");

  return (data ?? []).map((row) => ({
    id: row.id,
    lioraId: toLioraId(row.user_id),
    serviceSlug: row.service_slug,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    language: row.language ?? "pl",
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    ...(role === "admin" && row.name ? { name: row.name } : {}),
    ...(role === "admin" && row.email ? { email: row.email } : {}),
    ...(role === "admin" && row.message ? { message: row.message } : {}),
  }));
}

/**
 * P0.27 — zmiana statusu cudzej rezerwacji przez personel.
 *
 * Autorytet roli rozstrzyga się PRZED wywołaniem (`requireStaffRole`), a zapis
 * idzie klientem sesyjnym, więc obowiązuje polityka `bookings_update_staff`.
 * Dozwolone są wyłącznie przejścia z modelu (`ALLOWED_TRANSITIONS`) — statusu
 * nie da się „przeskoczyć” ani cofnąć z rezerwacji zamkniętej.
 */
export async function updateBookingStatus(
  supabase: LioraServerClient,
  role: StaffRole,
  id: string,
  next: BookingStatus,
): Promise<AdminBookingRow> {
  const { data: current, error: readError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error("Booking was not updated");
  if (!current) throw new Error("Booking was not found");

  const from = current.status;
  if (!isBookingStatus(from)) throw new Error("Booking has an unknown status");
  if (from === next) throw new Error("BOOKING_STATUS_UNCHANGED");
  if (!canTransition(from, next)) throw new Error("BOOKING_STATUS_TRANSITION_INVALID");

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: next })
    .eq("id", id)
    .select(
      "id, user_id, name, email, message, service_slug, status, language, preferred_date, preferred_time, created_at, updated_at",
    )
    .single();
  if (error || !data) throw new Error("Booking was not updated");

  /**
   * P0.29 — zdarzenie po skutecznej zmianie statusu. Kanały powiadomień nie
   * mogą podważyć zapisu: dyspozytor nigdy nie rzuca.
   */
  const { EVENT_BY_STATUS } = await import("@/lib/notifications/model/events");
  const { notifyBookingEvent } = await import("@/lib/notifications/booking-notifications.server");
  await notifyBookingEvent(
    {
      id: data.id,
      name: data.name ?? "",
      email: data.email ?? "",
      serviceSlug: data.service_slug,
      preferredDate: data.preferred_date,
      preferredTime: data.preferred_time,
      status: next,
      language: data.language,
    },
    EVENT_BY_STATUS[next],
  );

  return {
    id: data.id,
    lioraId: toLioraId(data.user_id),
    serviceSlug: data.service_slug,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at ?? data.created_at,
    language: data.language ?? "pl",
    preferredDate: data.preferred_date,
    preferredTime: data.preferred_time,
    ...(role === "admin" && data.name ? { name: data.name } : {}),
    ...(role === "admin" && data.email ? { email: data.email } : {}),
    ...(role === "admin" && data.message ? { message: data.message } : {}),
  };
}

/**
 * Obecności — projekcja `profiles` + ostatni ślad z `bookings`.
 * Widok zna wyłącznie identyfikator LIORA; dane osobowe nie opuszczają serwera.
 */
export async function listPeople(supabase: LioraServerClient): Promise<AdminPersonRow[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error("People unavailable");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const lastByUser = new Map<string, string>();
  for (const row of bookings ?? []) {
    if (!lastByUser.has(row.user_id)) lastByUser.set(row.user_id, row.created_at);
  }

  return (profiles ?? []).map((profile) => ({
    lioraId: toLioraId(profile.id),
    lastSeenAt: lastByUser.get(profile.id) ?? profile.created_at,
  }));
}

/** Agregacja wyłącznie z realnych tabel. Żadna liczba nie jest zmyślona. */
export async function summarize(supabase: LioraServerClient): Promise<AdminSummary> {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("user_id, status, created_at")
    .limit(2000);

  if (error) throw new Error("Summary unavailable");

  const { count: peopleCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const byStatus: Record<string, number> = {};
  const todayUsers = new Set<string>();

  for (const row of bookings ?? []) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    if (new Date(row.created_at).getTime() >= startOfToday.getTime()) {
      todayUsers.add(row.user_id);
    }
  }

  return {
    todayPeople: todayUsers.size,
    awaiting: byStatus["new"] ?? 0,
    confirmed: byStatus["confirmed"] ?? 0,
    people: peopleCount ?? 0,
    bookingsTotal: (bookings ?? []).length,
    byStatus,
  };
}
