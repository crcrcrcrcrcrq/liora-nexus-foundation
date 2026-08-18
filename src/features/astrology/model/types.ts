/**
 * Model domenowy modułu Astrologia (RC1).
 *
 * Moduł nie wykonuje obliczeń astrologicznych. Definiuje wyłącznie kontrakt
 * danych, który wypełni zewnętrzny silnik efemeryd po integracji z backendem.
 */

/** Dane wejściowe zebrane od użytkownika. */
export interface AstrologyRequest {
  /** ISO `YYYY-MM-DD`. */
  birthDate: string;
  /** 24-godzinny `HH:mm`. */
  birthTime: string;
  city: string;
}

/** Pozycja pojedynczego ciała niebieskiego — uzupełnia silnik obliczeniowy. */
export interface PlanetPosition {
  body: string;
  sign: string;
  degree: number;
  house: number;
}

/** Kosmogram zwracany przez backend. Pusty do czasu integracji. */
export interface NatalChart {
  ascendant?: string;
  midheaven?: string;
  planets?: PlanetPosition[];
  houses?: { house: number; sign: string }[];
}

/** Interpretacja tekstowa przygotowana po stronie serwera. */
export interface NatalInterpretation {
  summary: string;
  sections: { title: string; body: string }[];
}

/** Pełna odpowiedź przyszłego endpointu `/astrology/chart`. */
export interface NatalChartResponse {
  chart: NatalChart;
  interpretation?: NatalInterpretation;
}

/** Etapy rytuału astrologicznego. */
export type RitualStage = "intro" | "form" | "processing" | "outcome";

/** Status integracji z silnikiem obliczeniowym. */
export type EngineStatus = "not-connected" | "ready" | "error";

/**
 * Kontrakt dostawcy efemeryd. Podłączenie zewnętrznego silnika sprowadza się
 * do implementacji tego interfejsu i zarejestrowania go w `astrology.service`.
 */
export interface EphemerisProvider {
  id: string;
  label: string;
  fetchChart(input: AstrologyRequest): Promise<NatalChartResponse | null>;
}
