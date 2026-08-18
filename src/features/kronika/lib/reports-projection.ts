import { translate, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";
import type { ChronicleConsultation, ChronicleReport, ChronicleRitual } from "../model/types";

/**
 * LIORA P0.7 — projekcja Reports → Kronika.
 *
 * Raport NIE jest osobnym bytem w bazie. Jest deterministycznym, kwartalnym
 * odczytem istniejących danych: `chronicle_rituals` (rytuały) oraz `bookings`
 * (konsultacje, już zrzutowane w P0.5 na `ChronicleConsultation`).
 *
 * Funkcje poniżej są czyste: nic nie zapisują, nic nie losują, nie sięgają po
 * zegar. Ten sam zestaw wejściowy zawsze daje identyczny wynik.
 */

/** Cyfry kwartałów — niezależne od języka, używane w tłumaczeniach tytułu. */
const ROMAN: readonly string[] = ["I", "II", "III", "IV"];

export interface QuarterActivity {
  /** `YYYY-QN`, np. `2026-Q3`. */
  period: string;
  year: number;
  /** 1–4, kalendarzowo: Q1 = styczeń–marzec. */
  quarter: number;
  ritualCount: number;
  consultationCount: number;
  /** Najpóźniejszy uwzględniony timestamp — brak `Date.now()`. */
  lastActivityAt: string;
}

/** Kwartał kalendarzowy timestampu (UTC — ten sam wynik na serwerze i w kliencie). */
export function quarterOf(iso: string): { period: string; year: number; quarter: number } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return { period: `${year}-Q${quarter}`, year, quarter };
}

/**
 * Zlicza aktywność w kwartałach. Kwartał bez żadnej aktywności nie powstaje —
 * pusty okres nie jest raportem.
 */
export function buildQuarterActivity(
  rituals: readonly ChronicleRitual[],
  consultations: readonly ChronicleConsultation[],
): QuarterActivity[] {
  const byPeriod = new Map<string, QuarterActivity>();

  const touch = (iso: string, field: "ritualCount" | "consultationCount") => {
    const at = quarterOf(iso);
    if (!at) return;
    const current = byPeriod.get(at.period) ?? {
      period: at.period,
      year: at.year,
      quarter: at.quarter,
      ritualCount: 0,
      consultationCount: 0,
      lastActivityAt: iso,
    };
    current[field] += 1;
    if (iso > current.lastActivityAt) current.lastActivityAt = iso;
    byPeriod.set(at.period, current);
  };

  for (const ritual of rituals) touch(ritual.occurredAt, "ritualCount");
  // P0.5: `scheduledAt` to już `preferred_date ?? created_at` rezerwacji.
  for (const consultation of consultations) touch(consultation.scheduledAt, "consultationCount");

  return [...byPeriod.values()].sort((a, b) => (a.period < b.period ? 1 : -1));
}

/** Aktywność kwartału → istniejący kontrakt `ChronicleReport` (bez nowych pól). */
export function toChronicleReport(
  activity: QuarterActivity,
  language: Language = DEFAULT_LANGUAGE,
): ChronicleReport {
  const options = { lng: language } as const;
  return {
    id: `quarter:${activity.period}`,
    title: translate("chronicle.reports.title", {
      ...options,
      quarterRoman: ROMAN[activity.quarter - 1] ?? String(activity.quarter),
      quarterNumber: activity.quarter,
      year: activity.year,
    }),
    period: activity.period,
    issuedAt: activity.lastActivityAt,
    summary: translate("chronicle.reports.summary", {
      ...options,
      rituals: activity.ritualCount,
      consultations: activity.consultationCount,
    }),
  };
}

/** Pełna projekcja: rytuały + konsultacje → raporty kwartalne (najnowszy pierwszy). */
export function buildQuarterlyReports(
  rituals: readonly ChronicleRitual[],
  consultations: readonly ChronicleConsultation[],
  language: Language = DEFAULT_LANGUAGE,
): ChronicleReport[] {
  return buildQuarterActivity(rituals, consultations).map((activity) =>
    toChronicleReport(activity, language),
  );
}
