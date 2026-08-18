/**
 * Geometria rytuału LIORA — 22 karty ułożone w okrąg o zakresie 300°,
 * z dolną częścią otwartą od strony użytkownika.
 *
 * Wszystkie wartości są podane w jednostkach bazowych (px na scenie o boku
 * `SCENE`). Scena jest skalowana proporcjonalnie do szerokości kontenera, więc
 * układ jest identyczny na desktopie, tablecie i telefonie — bez osobnych
 * wariantów, bez gridu, bez przewijania.
 */

/** Bok kwadratowej sceny w jednostkach bazowych. */
export const SCENE = 720;

/** Promień okręgu (środek sceny → środek karty). */
export const RADIUS = 272;

/** Rozmiar pojedynczej karty na scenie. */
export const CARD_W = 86;
export const CARD_H = 132;

/** Zakres łuku w stopniach — dół pozostaje otwarty. */
export const ARC = 300;

/** Rozmiar karty w widoku wyniku (poza sceną okręgu). */
export const RESULT_CARD = { width: 132, height: 202 } as const;

export interface CardPlacement {
  /** Przesunięcie względem środka sceny. */
  x: number;
  y: number;
  /** Obrót karty — promieniście na zewnątrz okręgu. */
  rotate: number;
}

/** Pozycja karty o indeksie `index` w talii `total` kart. */
export function placeOnCircle(index: number, total: number): CardPlacement {
  const step = total > 1 ? ARC / (total - 1) : 0;
  const angle = -ARC / 2 + step * index;
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.sin(rad) * RADIUS,
    y: -Math.cos(rad) * RADIUS,
    rotate: angle,
  };
}

/** Pozycja wybranej karty przesuwającej się do środka okręgu. */
export function placeInCenter(order: number, picks: number): CardPlacement {
  const gap = CARD_W * 1.22;
  const offset = (order - (picks - 1) / 2) * gap;
  return { x: offset, y: 0, rotate: 0 };
}
