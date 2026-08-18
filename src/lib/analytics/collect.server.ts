/**
 * LIORA P0.30 — zbieranie zdarzeń analitycznych (server-only).
 *
 * Reguły:
 *  - surowe IP nie jest zapisywane, logowane ani przekazywane dalej; służy
 *    wyłącznie runtime'owi hostingu do wyliczenia zagregowanej lokalizacji,
 *  - kraj/region/miasto pochodzą z nagłówków dostarczanych przez runtime
 *    (Cloudflare). Brak nagłówków = brak lokalizacji; nie budujemy własnej
 *    geolokalizacji ani nie odpytujemy zewnętrznych serwisów,
 *  - `visitor_type` rozstrzyga serwer po pseudonimie sesji, nie klient,
 *  - zapis idzie kluczem serwisowym, bo tabela celowo NIE jest publicznie
 *    zapisywalna (RLS: odczyt tylko personel, brak polityki INSERT).
 */
import { getRequestHeader } from "@tanstack/react-start/server";
import type { AnalyticsEvent, ReferrerCategory, VisitorType } from "./model/events";

const SEARCH_HOSTS = ["google.", "bing.", "duckduckgo.", "yahoo.", "ecosia.", "yandex."];
const SOCIAL_HOSTS = [
  "facebook.",
  "instagram.",
  "tiktok.",
  "x.com",
  "twitter.",
  "linkedin.",
  "t.co",
  "pinterest.",
];

function header(name: string): string | null {
  try {
    const value = getRequestHeader(name);
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  } catch {
    return null;
  }
}

/** Zagregowana lokalizacja z metadanych runtime'u. Nigdy z IP w kodzie aplikacji. */
function coarseLocation(): { country: string | null; region: string | null; city: string | null } {
  return {
    country: header("cf-ipcountry") ?? header("x-vercel-ip-country"),
    region: header("cf-region") ?? header("x-vercel-ip-country-region"),
    city: header("cf-ipcity") ?? header("x-vercel-ip-city"),
  };
}

function referrerCategory(host: string | undefined, selfHost: string | null): ReferrerCategory {
  if (!host) return "direct";
  const lower = host.toLowerCase();
  if (selfHost && lower === selfHost.toLowerCase()) return "internal";
  if (SEARCH_HOSTS.some((item) => lower.includes(item))) return "search";
  if (SOCIAL_HOSTS.some((item) => lower.includes(item))) return "social";
  return "referral";
}

/** Ścieżka bez query i fragmentu — parametry mogą nieść dane osobowe. */
function safePath(path: string): string {
  const clean = path.split("?")[0]?.split("#")[0] ?? "/";
  return clean.startsWith("/") ? clean.slice(0, 256) : "/";
}

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

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as {
    from: (table: string) => QueryBuilder;
  };
}

async function resolveVisitorType(sessionId: string): Promise<VisitorType> {
  try {
    const client = await adminClient();
    const { count } = await client
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("anonymous_session_id", sessionId);
    return (count ?? 0) > 0 ? "returning" : "new";
  } catch {
    return "new";
  }
}

/**
 * Zapisuje zdarzenie. NIGDY nie rzuca — analityka nie może przewrócić strony.
 * Zwraca `false`, gdy zapis się nie powiódł (nie udajemy sukcesu).
 */
export async function collectAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
  try {
    const location = coarseLocation();
    const visitorType = await resolveVisitorType(event.anonymousSessionId);
    const client = await adminClient();

    const { error } = await client.from("analytics_events").insert({
      event_type: event.type,
      locale: event.locale,
      path: safePath(event.path),
      anonymous_session_id: event.anonymousSessionId,
      visitor_type: visitorType,
      country: location.country,
      region: location.region,
      city: location.city,
      device_type: event.deviceType,
      referrer_category: referrerCategory(event.referrerHost, header("host")),
      metadata: event.metadata,
    });

    return !error;
  } catch {
    return false;
  }
}
