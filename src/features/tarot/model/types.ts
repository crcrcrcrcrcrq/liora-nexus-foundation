/** Model domenowy modułu Tarot. */

export interface TarotCard {
  id: number;
  roman: string;
  name: string;
  keywords: string[];
  upright: string;
  reversed: string;
}

export type TarotOrientation = "upright" | "reversed";

/** Pojedyncza pozycja w rozkładzie. `key` jest unikalne w obrębie rozkładu. */
export interface TarotPosition {
  key: string;
  label: string;
  hint: string;
}

/**
 * Definicja rozkładu. Dodanie nowego rozkładu sprowadza się do dopisania
 * obiektu do `TAROT_SPREADS` — logika losowania i prezentacji jest generyczna.
 */
export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  /** Liczba kart wynika z liczby pozycji. */
  positions: TarotPosition[];
  /** Rozkłady płatne wymagają zamówienia interpretacji. */
  free: boolean;
}

export interface DrawnCard {
  card: TarotCard;
  orientation: TarotOrientation;
  positionKey: string;
}

export interface TarotReading {
  spreadId: string;
  drawnAt: string;
  cards: DrawnCard[];
}
