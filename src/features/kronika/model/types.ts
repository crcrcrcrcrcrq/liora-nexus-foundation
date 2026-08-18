/**
 * Model domenowy Kroniki Duszy.
 *
 * Kronika jest zapisem drogi człowieka, nie rejestrem danych. Struktury
 * poniżej są kontraktem dla przyszłego backendu — frontend niczego nie liczy.
 */

export type ChronicleRitualKind = "tarot" | "astrology" | "consultation" | "note";

export interface ChronicleRitual {
  id: string;
  /** Rodzaj rytuału — decyduje o delikatnej ikonie na osi czasu. */
  kind: Exclude<ChronicleRitualKind, "consultation">;
  title: string;
  /** Data w formacie ISO 8601 (UTC) — formatowanie należy do widoku. */
  occurredAt: string;
  /** Jedno zdanie, które zostaje w pamięci. */
  reflection: string;
  /** Dłuższy zapis widoczny po rozwinięciu wpisu. */
  details?: string;
  /** Ścieżka do pełnej interpretacji, gdy backend ją udostępni. */
  interpretationPath?: string;
}

export type ConsultationStatus = "upcoming" | "completed" | "cancelled";

export interface ChronicleConsultation {
  id: string;
  type: string;
  scheduledAt: string;
  status: ConsultationStatus;
  summary?: string;
  detailsPath?: string;
}

export interface ChronicleNote {
  id: string;
  createdAt: string;
  body: string;
}

/** Codzienny, spokojny fragment towarzyszący powrotowi do Kroniki. */
export interface ChronicleReflection {
  id: string;
  date: string;
  body: string;
  source?: string;
}

/** Miejsce na przyszłe raporty (kwartalne podsumowania drogi). */
export interface ChronicleReport {
  id: string;
  title: string;
  period: string;
  issuedAt: string;
  summary: string;
}

export interface ChronicleProfile {
  displayName?: string;
  email: string;
  joinedAt?: string;
}

/** Pełny obraz Kroniki zwracany przez backend jednym żądaniem. */
export interface ChronicleOverview {
  profile: ChronicleProfile;
  lastRitual: ChronicleRitual | null;
  rituals: readonly ChronicleRitual[];
  consultations: readonly ChronicleConsultation[];
  notes: readonly ChronicleNote[];
  reflection: ChronicleReflection | null;
  reports: readonly ChronicleReport[];
  /** `true`, gdy treść pochodzi z zapisu przykładowego, a nie z serwera. */
  isSample?: boolean;
}
