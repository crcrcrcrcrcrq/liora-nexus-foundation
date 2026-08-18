/**
 * LIORA P0.30 — agregacja statystyk (server-only, READ-ONLY).
 *
 * Wynik jest ZAWSZE agregatem. Ten moduł nie zwraca listy odwiedzających,
 * pojedynczych pseudonimów sesji ani jakichkolwiek danych osobowych. Nie zna
 * rezerwacji, klientów ani CMS — czyta wyłącznie `analytics_events`.
 */
import type { BookingFunnelStats, StatsPeriodSummary, StatsShare } from "./model/events";

export type StatsPeriod = "today" | "week" | "month";

interface RawRow {
  event_type: string;
  locale: string;
  path: string;
  anonymous_session_id: string;
  visitor_type: string;
  country: string | null;
  device_type: string;
}

const MAX_ROWS = 20000;

export function periodRange(period: StatsPeriod, now = new Date()): { from: Date; to: Date } {
  const to = new Date(now);
  const from = new Date(now);
  if (period === "today") from.setHours(0, 0, 0, 0);
  if (period === "week") from.setDate(from.getDate() - 7);
  if (period === "month") from.setDate(from.getDate() - 30);
  return { from, to };
}

function share(counts: Map<string, number>, total: number, limit = 6): StatsShare[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      share: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));
}

function bump(map: Map<string, number>, key: string | null | undefined): void {
  const label = key && key.trim().length > 0 ? key.trim() : "unknown";
  map.set(label, (map.get(label) ?? 0) + 1);
}

/**
 * Odczyt surowych wierszy. `client` to gotowy klient Supabase dostarczony
 * przez wywołującego (sesja personelu pod RLS albo serwerowy klient webhooka).
 */
/**
 * Minimalny kontrakt buildera PostgREST-a używany w tym module. Pozwala pisać
 * łańcuchy `.select().gte()…` bez `any`, niezależnie od tego, który klient
 * (sesyjny czy serwerowy) został wstrzyknięty przez wywołującego.
 */
type QueryBuilder = PromiseLike<{ data: unknown; error: unknown; count?: number | null }> & {
  select(columns: string, options?: { count?: "exact"; head?: boolean }): QueryBuilder;
  insert(values: unknown): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  gte(column: string, value: unknown): QueryBuilder;
  lte(column: string, value: unknown): QueryBuilder;
  limit(count: number): QueryBuilder;
};

async function readRows(
  client: unknown,
  period: StatsPeriod,
): Promise<{ rows: RawRow[]; from: Date; to: Date }> {
  const { from, to } = periodRange(period);
  const query = (client as { from: (table: string) => QueryBuilder }).from("analytics_events");
  const { data, error } = await query
    .select("event_type, locale, path, anonymous_session_id, visitor_type, country, device_type")
    .gte("occurred_at", from.toISOString())
    .lte("occurred_at", to.toISOString())
    .limit(MAX_ROWS);
  if (error) throw new Error("Statistics unavailable");
  return { rows: (data ?? []) as RawRow[], from, to };
}

export async function getPeriodStats(
  client: unknown,
  period: StatsPeriod,
): Promise<StatsPeriodSummary> {
  const { rows, from, to } = await readRows(client, period);

  const views = rows.filter((row) => row.event_type === "page_view");
  const languages = new Map<string, number>();
  const devices = new Map<string, number>();
  const countries = new Map<string, number>();
  const pages = new Map<string, number>();
  const sessions = new Map<string, string>();

  for (const row of views) {
    bump(languages, row.locale.toUpperCase());
    bump(devices, row.device_type);
    bump(countries, row.country);
    bump(pages, row.path);
  }
  for (const row of rows) {
    if (!sessions.has(row.anonymous_session_id)) {
      sessions.set(row.anonymous_session_id, row.visitor_type);
    }
  }

  const visitorTypes = [...sessions.values()];
  const total = views.length;

  return {
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    visits: total,
    visitors: sessions.size,
    newVisitors: visitorTypes.filter((type) => type === "new").length,
    returningVisitors: visitorTypes.filter((type) => type === "returning").length,
    languages: share(languages, total, 4),
    devices: share(devices, total, 4),
    countries: share(countries, total, 5),
    topPages: share(pages, total, 5),
  };
}

export const getTodayStats = (client: unknown) => getPeriodStats(client, "today");
export const getWeeklyStats = (client: unknown) => getPeriodStats(client, "week");
export const getMonthlyStats = (client: unknown) => getPeriodStats(client, "month");

export async function getTopPages(client: unknown, period: StatsPeriod): Promise<StatsShare[]> {
  return (await getPeriodStats(client, period)).topPages;
}

export async function getTopCountries(client: unknown, period: StatsPeriod): Promise<StatsShare[]> {
  return (await getPeriodStats(client, period)).countries;
}

export async function getLanguageStats(
  client: unknown,
  period: StatsPeriod,
): Promise<StatsShare[]> {
  return (await getPeriodStats(client, period)).languages;
}

export async function getDeviceStats(client: unknown, period: StatsPeriod): Promise<StatsShare[]> {
  return (await getPeriodStats(client, period)).devices;
}

export async function getReturningVisitorStats(
  client: unknown,
  period: StatsPeriod,
): Promise<{ visitors: number; newVisitors: number; returningVisitors: number }> {
  const summary = await getPeriodStats(client, period);
  return {
    visitors: summary.visitors,
    newVisitors: summary.newVisitors,
    returningVisitors: summary.returningVisitors,
  };
}

/** Lejek rezerwacji liczony wyłącznie ze zdarzeń analitycznych, nie z tabeli `bookings`. */
export async function getBookingFunnelStats(
  client: unknown,
  period: StatsPeriod,
): Promise<BookingFunnelStats> {
  const { rows } = await readRows(client, period);
  const started = rows.filter((row) => row.event_type === "booking_started").length;
  const completed = rows.filter((row) => row.event_type === "booking_completed").length;
  return {
    period,
    started,
    completed,
    conversion: started > 0 ? Math.round((completed / started) * 1000) / 10 : 0,
  };
}
