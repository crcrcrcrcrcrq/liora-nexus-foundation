import { DEFAULT_SPREAD_ID, getSpread, tarotSpreads } from "../model/spreads";
import type { TarotPosition, TarotSpread } from "../model/types";

export { tarotSpreads, DEFAULT_SPREAD_ID, getSpread };

/** Liczba kart wymagana przez rozkład (dla darmowego tarota: 3). */
export function spreadSize(spread: TarotSpread): number {
  return spread.positions.length;
}

export function positionAt(spread: TarotSpread, index: number): TarotPosition | undefined {
  return spread.positions[index];
}

export function positionOf(spread: TarotSpread, key: string): TarotPosition | undefined {
  return spread.positions.find((position) => position.key === key);
}
