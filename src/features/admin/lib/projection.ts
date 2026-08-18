import type { AdminBookingRow } from "@/features/admin/model/types";
import type {
  Consultation,
  ConsultationStage,
  TimelineEvent,
} from "@/features/experience/model/types";

/**
 * LIORA P0.9 — projekcje Admina na istniejącym modelu domenowym.
 *
 * Funkcje są czyste i nie tworzą nowej domeny: przekładają realne rekordy
 * `bookings` na kształty, które istniejące komponenty już rozumieją.
 */

/** Status rezerwacji → istniejący stan konsultacji. Bez nowych stanów. */
export function stageForStatus(status: string): ConsultationStage {
  switch (status) {
    case "confirmed":
      return "scheduled";
    case "done":
      return "completed";
    case "cancelled":
      return "closed";
    default:
      return "new";
  }
}

export function toConsultations(
  rows: readonly AdminBookingRow[],
  subjectOf: (serviceSlug: string) => string,
): Consultation[] {
  return rows.map((row) => ({
    id: row.id,
    lioraId: row.lioraId,
    subject: subjectOf(row.serviceSlug),
    stage: stageForStatus(row.status),
    requestedAt: row.createdAt,
  }));
}

/** Ślady dnia — wyłącznie realne zdarzenia rezerwacji z bieżącej doby. */
export function toTimeline(
  rows: readonly AdminBookingRow[],
  sentenceOf: (row: AdminBookingRow) => string,
  hourOf: (iso: string) => string,
  now: Date = new Date(),
): TimelineEvent[] {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return rows
    .filter((row) => new Date(row.createdAt).getTime() >= startOfDay)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((row) => ({
      id: row.id,
      at: hourOf(row.createdAt),
      tone: "consultation" as const,
      sentence: sentenceOf(row),
    }));
}
