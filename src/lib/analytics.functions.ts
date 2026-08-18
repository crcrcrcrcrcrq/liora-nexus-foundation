import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import { analyticsEventInput } from "./analytics/model/events";
import type { StatsPeriodSummary, BookingFunnelStats } from "./analytics/model/events";

/**
 * LIORA P0.30 — server functions analityki.
 *
 * `trackAnalyticsEvent` jest celowo publiczny (strona publiczna też zbiera
 * zdarzenia), ale przyjmuje wyłącznie ładunek nieosobowy zwalidowany Zodem.
 * Nie da się nim odczytać czegokolwiek — zwraca `{ ok }`, nic więcej.
 *
 * Odczyt agregatów wymaga sesji personelu.
 */

export const trackAnalyticsEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyticsEventInput.parse(input ?? {}))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { collectAnalyticsEvent } = await import("./analytics/collect.server");
    return { ok: await collectAnalyticsEvent(data) };
  });

type Period = "today" | "week" | "month";

const periodInput = (input: unknown): { period: Period } => {
  const raw = (input ?? {}) as Record<string, unknown>;
  const period = raw["period"];
  if (period === "week" || period === "month") return { period };
  return { period: "today" };
};

export const fetchAnalyticsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .inputValidator(periodInput)
  .handler(async ({ data, context }): Promise<StatsPeriodSummary> => {
    const { requireStaffRole } = await import("./admin.server");
    await requireStaffRole(context.supabase, context.userId);
    const { readPeriodStats } = await import("./analytics/stats.server");
    return readPeriodStats(context.supabase, data.period);
  });

export const fetchAnalyticsFunnel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .inputValidator(periodInput)
  .handler(async ({ data, context }): Promise<BookingFunnelStats> => {
    const { requireStaffRole } = await import("./admin.server");
    await requireStaffRole(context.supabase, context.userId);
    const { readBookingFunnel } = await import("./analytics/stats.server");
    return readBookingFunnel(context.supabase, data.period);
  });
