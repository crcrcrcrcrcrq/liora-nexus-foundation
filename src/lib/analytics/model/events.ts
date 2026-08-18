/**
 * LIORA P0.30 — model zdarzeń analitycznych.
 *
 * Plik jest client-safe (typy + walidacja Zod, bez importów serwerowych).
 *
 * PRYWATNOŚĆ — reguły niezmienne, egzekwowane przez ten schemat:
 *  - nie istnieje pole na adres IP; surowe IP nigdy nie trafia do bazy ani do
 *    logów, nie jest też identyfikatorem odwiedzającego,
 *  - identyfikator odwiedzającego jest pseudonimowy, losowy i rotowany po
 *    stronie przeglądarki (nie pochodzi z e-maila, telefonu ani `user_id`),
 *  - `metadata` przyjmuje wyłącznie krótkie wartości ze słownika bezpiecznych
 *    kluczy; dowolny JSON (a więc i PII) jest odrzucany,
 *  - lokalizacja jest wyłącznie zagregowana (kraj/region/miasto), bez GPS.
 */
import { z } from "zod";

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "session_start",
  "session_return",
  "language_selected",
  "cta_click",
  "booking_started",
  "booking_completed",
  "privacy_policy_view",
  "terms_view",
  "tarot_started",
  "tarot_completed",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const VISITOR_TYPES = ["new", "returning"] as const;
export type VisitorType = (typeof VISITOR_TYPES)[number];

export const DEVICE_TYPES = ["mobile", "tablet", "desktop", "unknown"] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number];

export const REFERRER_CATEGORIES = ["direct", "search", "social", "referral", "internal"] as const;
export type ReferrerCategory = (typeof REFERRER_CATEGORIES)[number];

/** Klucze dopuszczone w `metadata`. Wszystko poza listą jest odrzucane. */
export const SAFE_METADATA_KEYS = ["surface", "variant", "spread", "service"] as const;

const safeMetadataValue = z.string().trim().min(1).max(48);

export const analyticsMetadata = z
  .record(z.string(), safeMetadataValue)
  .transform((value) => {
    const safe: Record<string, string> = {};
    for (const key of SAFE_METADATA_KEYS) {
      const entry = value[key];
      if (entry) safe[key] = entry;
    }
    return safe;
  })
  .default({});

/**
 * Ładunek przyjmowany od przeglądarki. Zawiera WYŁĄCZNIE dane nieosobowe.
 * Kraj/region/miasto, typ odwiedzającego i kategoria referrera są ustalane po
 * stronie serwera — klient nie może ich podrobić.
 */
export const analyticsEventInput = z.object({
  type: z.enum(ANALYTICS_EVENT_TYPES),
  /** Ścieżka bez query stringa i bez fragmentu (obcinana serwerowo). */
  path: z.string().trim().max(256).default("/"),
  locale: z.enum(["pl", "en"]).default("pl"),
  /** Pseudonim losowany w przeglądarce; nie jest tożsamością. */
  anonymousSessionId: z.string().trim().min(8).max(64),
  visitorType: z.enum(VISITOR_TYPES).default("new"),
  deviceType: z.enum(DEVICE_TYPES).default("unknown"),
  /** Wyłącznie host referrera — pełny URL nie jest przyjmowany. */
  referrerHost: z.string().trim().max(128).optional(),
  metadata: analyticsMetadata,
});

export type AnalyticsEventInput = z.input<typeof analyticsEventInput>;
export type AnalyticsEvent = z.output<typeof analyticsEventInput>;

/* ------------------------------------------------------------------ */
/* Agregaty (kontrakt raportów — nigdy pojedynczy odwiedzający)         */
/* ------------------------------------------------------------------ */

export interface StatsShare {
  label: string;
  count: number;
  share: number;
}

export interface StatsPeriodSummary {
  period: "today" | "week" | "month";
  from: string;
  to: string;
  visits: number;
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
  languages: StatsShare[];
  devices: StatsShare[];
  countries: StatsShare[];
  topPages: StatsShare[];
}

export interface BookingFunnelStats {
  period: "today" | "week" | "month";
  started: number;
  completed: number;
  conversion: number;
}
