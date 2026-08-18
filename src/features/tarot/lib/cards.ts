import { translate as t } from "@/lib/i18n";
import { CARD_BY_ID, CARD_COUNT as DECK_CARD_COUNT, majorArcana } from "../model/deck";
import type { DrawnCard, TarotCard, TarotOrientation } from "../model/types";

/** Pełna talia 22 Wielkich Arkanów — czytana na bieżąco w aktywnym języku. */
export function cards(): readonly TarotCard[] {
  return majorArcana();
}

export const CARD_COUNT = DECK_CARD_COUNT;

export function getCardById(id: number): TarotCard {
  return CARD_BY_ID(id) ?? CARD_BY_ID(0)!;
}

/** Znaczenie karty w zadanej pozycji. */
export function meaningOf(card: TarotCard, orientation: TarotOrientation): string {
  return orientation === "upright" ? card.upright : card.reversed;
}

export function cardMeaning(drawn: DrawnCard): string {
  return meaningOf(drawn.card, drawn.orientation);
}

export function orientationLabel(orientation: TarotOrientation): string {
  return orientation === "upright"
    ? t("tarot.orientation.upright")
    : t("tarot.orientation.reversed");
}

export function keywordsOf(drawn: DrawnCard): string[] {
  return drawn.card.keywords;
}

/** Krótkie znaczenie karty — słowa klucze złożone w jedną linię. */
export function shortMeaning(drawn: DrawnCard): string {
  return drawn.card.keywords.join(" · ");
}
