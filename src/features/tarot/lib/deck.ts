import { CARD_COUNT, cards } from "./cards";
import { randomOrientation, shuffled } from "./shuffle";

/** Pojedynczy rewers leżący na stole. */
export interface DeckSlot {
  /** Pozycja na stole (0…21). */
  slot: number;
  /** Identyfikator karty przypisanej do rewersu — unikalny w obrębie talii. */
  cardId: number;
  /** Pozycja karty ustalana przy tasowaniu, ujawniana dopiero po odkryciu. */
  orientation: ReturnType<typeof randomOrientation>;
}

export const DECK_SIZE = CARD_COUNT;

/**
 * Buduje potasowaną talię rewersów. Każda z 22 kart trafia dokładnie na jeden
 * rewers, więc ta sama karta nie może zostać wylosowana dwa razy.
 */
export function createDeck(): DeckSlot[] {
  return shuffled(cards().map((card) => card.id)).map((cardId, slot) => ({
    slot,
    cardId,
    orientation: randomOrientation(),
  }));
}

export function slotAt(deck: readonly DeckSlot[], slot: number): DeckSlot | undefined {
  return deck[slot];
}
