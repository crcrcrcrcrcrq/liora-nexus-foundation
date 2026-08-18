import { translate as t } from "@/lib/i18n";
import { toLioraId } from "../lib/liora-id";
import type {
  Consultation,
  ChronicleDigest,
  OverviewGreetingData,
  Presence,
  TimelineEvent,
} from "./types";

/**
 * Zapis przykładowy Experience Center.
 *
 * Pokazuje kształt przestrzeni, zanim backend zacznie przysyłać prawdziwe
 * ślady. Widoki oznaczają go dyskretną adnotacją. Żaden rekord nie zawiera
 * prawdziwych danych osobowych — identyfikatory powstają z ziarna technicznego
 * przez `toLioraId`, dokładnie tak jak zrobi to backend.
 */

const SEEDS = ["anna", "marta", "julia", "piotr", "eliza", "nina"] as const;

export function getSamplePresences(): Presence[] {
  return [
    {
      seed: SEEDS[0],
      tier: "premium",
      visits: 24,
      lastSeenAt: "2026-08-05T09:14:00.000Z",
      contact: "awaiting",
    },
    {
      seed: SEEDS[1],
      tier: "member",
      visits: 11,
      lastSeenAt: "2026-08-05T08:02:00.000Z",
      contact: "calm",
    },
    {
      seed: SEEDS[2],
      tier: "premium",
      visits: 38,
      lastSeenAt: "2026-08-04T21:47:00.000Z",
      contact: "answered",
    },
    {
      seed: SEEDS[3],
      tier: "member",
      visits: 4,
      lastSeenAt: "2026-08-04T18:20:00.000Z",
      contact: "awaiting",
    },
    {
      seed: SEEDS[4],
      tier: "guest",
      visits: 1,
      lastSeenAt: "2026-08-03T12:05:00.000Z",
      contact: "calm",
    },
    {
      seed: SEEDS[5],
      tier: "member",
      visits: 9,
      lastSeenAt: "2026-08-02T20:31:00.000Z",
      contact: "awaiting",
    },
  ].map(({ seed, ...rest }) => ({ lioraId: toLioraId(seed), ...rest }) as Presence);
}

export function getSampleGreeting(): OverviewGreetingData {
  return { returned: 12, awaiting: 3, scheduled: 1 };
}

export function getSampleConsultations(): Consultation[] {
  return [
    {
      id: "c-1",
      lioraId: toLioraId(SEEDS[0]),
      subject: t("experience.sample.consultations.first"),
      stage: "new",
      requestedAt: "2026-08-05T09:31:00.000Z",
    },
    {
      id: "c-2",
      lioraId: toLioraId(SEEDS[3]),
      subject: t("experience.sample.consultations.second"),
      stage: "awaiting",
      requestedAt: "2026-08-04T17:10:00.000Z",
    },
    {
      id: "c-3",
      lioraId: toLioraId(SEEDS[2]),
      subject: t("experience.sample.consultations.third"),
      stage: "scheduled",
      requestedAt: "2026-08-02T11:00:00.000Z",
      scheduledFor: "2026-08-09T18:00:00.000Z",
    },
    {
      id: "c-4",
      lioraId: toLioraId(SEEDS[1]),
      subject: t("experience.sample.consultations.fourth"),
      stage: "completed",
      requestedAt: "2026-07-24T08:40:00.000Z",
      scheduledFor: "2026-07-30T17:00:00.000Z",
    },
    {
      id: "c-5",
      lioraId: toLioraId(SEEDS[5]),
      subject: t("experience.sample.consultations.fifth"),
      stage: "closed",
      requestedAt: "2026-07-10T19:15:00.000Z",
    },
  ];
}

export function getSampleTimeline(): TimelineEvent[] {
  return [
    { id: "t-1", at: "09:14", tone: "return", sentence: t("experience.sample.timeline.first") },
    { id: "t-2", at: "09:31", tone: "ritual", sentence: t("experience.sample.timeline.second") },
    {
      id: "t-3",
      at: "10:12",
      tone: "consultation",
      sentence: t("experience.sample.timeline.third"),
    },
    {
      id: "t-4",
      at: "12:48",
      tone: "interpretation",
      sentence: t("experience.sample.timeline.fourth"),
    },
    { id: "t-5", at: "16:05", tone: "return", sentence: t("experience.sample.timeline.fifth") },
    { id: "t-6", at: "20:22", tone: "ritual", sentence: t("experience.sample.timeline.sixth") },
  ];
}

export function getSampleChronicleDigest(lioraId: string): ChronicleDigest {
  return {
    lioraId,
    visits: 24,
    ritualDates: [
      "2026-08-05T09:31:00.000Z",
      "2026-07-28T19:10:00.000Z",
      "2026-07-14T21:02:00.000Z",
    ],
    interpretations: [
      {
        id: "i-1",
        title: t("experience.sample.interpretations.first"),
        purchasedAt: "2026-07-29T10:00:00.000Z",
      },
      {
        id: "i-2",
        title: t("experience.sample.interpretations.second"),
        purchasedAt: "2026-06-18T14:25:00.000Z",
      },
    ],
    contact: "awaiting",
    lastActivityAt: "2026-08-05T09:31:00.000Z",
    marks: [
      {
        id: "m-1",
        kind: "tarot",
        title: t("experience.sample.marks.first"),
        occurredAt: "2026-08-05T09:31:00.000Z",
      },
      {
        id: "m-2",
        kind: "interpretation",
        title: t("experience.sample.marks.second"),
        occurredAt: "2026-07-29T10:00:00.000Z",
      },
      {
        id: "m-3",
        kind: "astrology",
        title: t("experience.sample.marks.third"),
        occurredAt: "2026-07-14T21:02:00.000Z",
      },
      {
        id: "m-4",
        kind: "consultation",
        title: t("experience.sample.marks.fourth"),
        occurredAt: "2026-06-30T17:00:00.000Z",
      },
    ],
  };
}
