/**
 * LIORA P0.30 — fasada statystyk dla interfejsów (Admin Web, bot Statistics).
 *
 * Jedno miejsce, w którym rozstrzyga się KTÓRY klient Supabase czyta agregaty:
 *  - Admin Web → klient sesyjny personelu (RLS `analytics_events_select_staff`),
 *  - bot Statistics → klient serwerowy webhooka; bot nie ma sesji, a tabela nie
 *    jest czytelna publicznie. Autoryzacja rozstrzyga się WCZEŚNIEJ (allowlista
 *    Telegrama) i jest READ-ONLY — ten moduł nie eksportuje żadnej mutacji.
 */
import { getBookingFunnelStats, getPeriodStats, type StatsPeriod } from "./aggregate.server";
import type { BookingFunnelStats, StatsPeriodSummary } from "./model/events";

export type { StatsPeriod } from "./aggregate.server";

/** Klient serwerowy dla kanałów bez sesji użytkownika (webhook Telegrama). */
export async function statisticsReader(): Promise<unknown> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function readPeriodStats(
  client: unknown,
  period: StatsPeriod,
): Promise<StatsPeriodSummary> {
  return getPeriodStats(client, period);
}

export async function readBookingFunnel(
  client: unknown,
  period: StatsPeriod,
): Promise<BookingFunnelStats> {
  return getBookingFunnelStats(client, period);
}
