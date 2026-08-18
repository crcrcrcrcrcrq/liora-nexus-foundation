import { randomInt, shuffle } from "@/utils/random";
import type { TarotOrientation } from "../model/types";

/** Tasowanie Fisher–Yates na kopii tablicy (bez powtórzeń). */
export function shuffled<T>(input: readonly T[]): T[] {
  return shuffle(input);
}

/** Losowa pozycja karty: prosta albo odwrócona. */
export function randomOrientation(): TarotOrientation {
  return randomInt(2) === 0 ? "upright" : "reversed";
}
