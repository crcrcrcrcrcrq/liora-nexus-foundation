/**
 * Model domenowy Experience Center.
 *
 * LIORA nie prowadzi rejestru klientów — prowadzi opiekę nad historiami ludzi.
 * Dlatego model nie zna pojęcia „rekordu klienta”, tylko `Presence` (obecność)
 * oraz `Chronicle` (ślad). Dane osobowe nie są częścią tego modelu: warstwa
 * prezentacji operuje wyłącznie na prywatnym identyfikatorze LIORA.
 */

/** Prywatny identyfikator w formacie LIO-XXXX-XXXX. Jedyny widoczny w panelu. */
export type LioraId = string;

export type PresenceTier = "guest" | "member" | "premium";

export type ContactState = "calm" | "awaiting" | "answered";

/**
 * Obecność osoby w przestrzeni LIORY.
 *
 * UWAGA (bezpieczeństwo): pola `givenName` i `email` są opcjonalne i wypełnia
 * je backend wyłącznie dla roli `admin`. Moderator otrzymuje ten sam kształt
 * obiektu z pustymi polami — nie ma ścieżki, którą mógłby je odsłonić.
 */
export interface Presence {
  lioraId: LioraId;
  lastSeenAt: string;
  /**
   * Pola opisowe są opcjonalne: pochodzą z realnych danych tylko wtedy, gdy
   * backend potrafi je uczciwie wyprowadzić. Brak wartości oznacza brak
   * informacji — widok nie pokazuje wtedy nic zamiast zgadywać.
   */
  tier?: PresenceTier;
  visits?: number;
  contact?: ContactState;
  /** Tylko administrator. Backend nie wysyła tego pola moderatorowi. */
  givenName?: string;
  /** Tylko administrator. Przechowywane w formie zaszyfrowanej (patrz privacy.ts). */
  email?: string;
}

export type ChronicleMarkKind = "tarot" | "astrology" | "consultation" | "interpretation" | "note";

/** Ślad w Kronice. Historia jest niezmienna — panel czyta, nigdy nie edytuje. */
export interface ChronicleMark {
  id: string;
  kind: ChronicleMarkKind;
  title: string;
  occurredAt: string;
}

export interface ChronicleDigest {
  lioraId: LioraId;
  visits: number;
  ritualDates: readonly string[];
  interpretations: readonly { id: string; title: string; purchasedAt: string }[];
  contact: ContactState;
  lastActivityAt: string;
  marks: readonly ChronicleMark[];
}

/** Workflow konsultacji — pięć spokojnych stanów, bez „pipeline'u sprzedaży”. */
export const CONSULTATION_STAGES = ["new", "awaiting", "scheduled", "completed", "closed"] as const;

export type ConsultationStage = (typeof CONSULTATION_STAGES)[number];

export interface Consultation {
  id: string;
  lioraId: LioraId;
  subject: string;
  stage: ConsultationStage;
  requestedAt: string;
  scheduledFor?: string;
}

export type TimelineTone = "return" | "ritual" | "consultation" | "interpretation" | "system";

/** Wydarzenie w historii dnia — narracja, nie log systemowy. */
export interface TimelineEvent {
  id: string;
  at: string;
  tone: TimelineTone;
  /** Zdanie w języku ludzkim, np. „Anna powróciła do swojej Kroniki.” */
  sentence: string;
}

/** Cicha treść ekranu powitalnego. */
export interface OverviewGreetingData {
  returned: number;
  awaiting: number;
  scheduled: number;
}
