import { translate as t } from "@/lib/i18n";
import type { ChronicleOverview } from "./types";

/**
 * Zapis przykładowy — pokazuje kształt Kroniki, zanim backend zacznie
 * przysyłać prawdziwe ślady. Widoki oznaczają go dyskretną adnotacją.
 */
export function getSampleChronicle(): ChronicleOverview {
  return {
    profile: { email: t("chronicle.sample.profileEmail") },
    lastRitual: {
      id: "sample-1",
      kind: "tarot",
      title: t("chronicle.sample.ritual1.title"),
      occurredAt: "2026-07-28T19:10:00.000Z",
      reflection: t("chronicle.sample.ritual1.reflection"),
      details: t("chronicle.sample.ritual1.details"),
    },
    rituals: [
      {
        id: "sample-1",
        kind: "tarot",
        title: t("chronicle.sample.timelineRitual1.title"),
        occurredAt: "2026-07-28T19:10:00.000Z",
        reflection: t("chronicle.sample.timelineRitual1.reflection"),
        details: t("chronicle.sample.timelineRitual1.details"),
      },
      {
        id: "sample-2",
        kind: "astrology",
        title: t("chronicle.sample.ritual2.title"),
        occurredAt: "2026-06-14T09:40:00.000Z",
        reflection: t("chronicle.sample.ritual2.reflection"),
        details: t("chronicle.sample.ritual2.details"),
      },
      {
        id: "sample-3",
        kind: "note",
        title: t("chronicle.sample.ritual3.title"),
        occurredAt: "2026-05-30T20:05:00.000Z",
        reflection: t("chronicle.sample.ritual3.reflection"),
      },
    ],
    consultations: [
      {
        id: "sample-c1",
        type: t("chronicle.sample.consultation1.type"),
        scheduledAt: "2026-08-19T17:00:00.000Z",
        status: "upcoming",
        summary: t("chronicle.sample.consultation1.summary"),
      },
      {
        id: "sample-c2",
        type: t("chronicle.sample.consultation2.type"),
        scheduledAt: "2026-06-02T16:30:00.000Z",
        status: "completed",
        summary: t("chronicle.sample.consultation2.summary"),
      },
    ],
    notes: [],
    reflection: {
      id: "sample-r1",
      date: "2026-08-05T05:00:00.000Z",
      body: t("chronicle.sample.reflection.body"),
      source: t("chronicle.sample.reflection.source"),
    },
    reports: [],
    isSample: true,
  };
}
