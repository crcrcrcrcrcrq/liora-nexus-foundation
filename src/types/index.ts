/**
 * Typy współdzielone między modułami.
 *
 * Modele domenowe żyją w `src/features/<domena>/model/types.ts`; tutaj są
 * wyłącznie re-eksportowane, żeby uniknąć duplikacji definicji.
 */

export type {
  TarotCard,
  TarotOrientation,
  TarotPosition,
  TarotSpread,
  DrawnCard,
  TarotReading,
} from "@/features/tarot/model/types";

export type {
  AstrologyRequest,
  NatalChart,
  NatalChartResponse,
  NatalInterpretation,
  PlanetPosition,
  RitualStage,
  EngineStatus,
  EphemerisProvider,
} from "@/features/astrology/model/types";

export type { BookingRequest, BookingRecord, ServiceOffer } from "@/features/booking/model/types";

export type { BlogPost } from "@/features/library/model/types";

export type { AdminUser, AdminRole, MagicLinkSession } from "@/features/auth/model/types";

/* Aliasy nazw domenowych używane w warstwie services i panelu administratora. */
export type { BookingRecord as Booking } from "@/features/booking/model/types";
export type { NatalChart as AstrologyChart } from "@/features/astrology/model/types";
export type { AdminUser as User } from "@/features/auth/model/types";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  confirmed: boolean;
}

/** Ujednolicony wynik wywołania API — sukces albo komunikat błędu. */
export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface FaqItem {
  questionKey: string;
  answerKey: string;
}

export interface RitualItem {
  slug: string;
  titleKey: string;
  cycleKey: string;
  summaryKey: string;
  steps: { titleKey: string; descriptionKey: string }[];
}

export interface LocationItem {
  cityKey: string;
  countryKey: string;
  formatKey: string;
  descriptionKey: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  topic: string;
  message: string;
  consent: boolean;
}
