import { translate as t } from "@/lib/i18n";
import type { DeckSlot } from "./deck";
import { getCardById } from "./cards";
import { positionAt, spreadSize } from "./spread";
import type { DrawnCard, TarotReading, TarotSpread } from "../model/types";

/**
 * Składa rozkład ze wskazanych przez użytkownika rewersów. Karty pochodzą
 * z jednej, wcześniej potasowanej talii, więc powtórzenia są niemożliwe.
 */
export function buildReading(
  spread: TarotSpread,
  deck: readonly DeckSlot[],
  pickedSlots: readonly number[],
): TarotReading {
  const cards: DrawnCard[] = pickedSlots.slice(0, spreadSize(spread)).map((slot, index) => {
    const entry = deck[slot]!;
    const position = positionAt(spread, index)!;
    return {
      card: getCardById(entry.cardId),
      orientation: entry.orientation,
      positionKey: position.key,
    };
  });

  return { spreadId: spread.id, drawnAt: new Date().toISOString(), cards };
}

/** Udział kart odwróconych — miara oporu w rozkładzie. */
export function reversedRatio(reading: TarotReading): number {
  if (reading.cards.length === 0) return 0;
  return (
    reading.cards.filter((drawn) => drawn.orientation === "reversed").length / reading.cards.length
  );
}

/** Jednozdaniowe streszczenie — nazwy kart w kolejności pozycji. */
export function summarize(spread: TarotSpread, reading: TarotReading): string {
  return `${spread.name}: ${reading.cards.map((drawn) => drawn.card.name).join(", ")}.`;
}

/**
 * Krótka interpretacja całego rozkładu: oś kart, poziom oporu wynikający
 * z pozycji odwróconych i wskazanie następnego kroku.
 */
export function composeInterpretation(spread: TarotSpread, reading: TarotReading): string {
  if (reading.cards.length === 0) return "";

  const names = reading.cards.map((drawn) => drawn.card.name);
  const axis =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")}${t("tarot.interpretation.axisJoin")}${names[names.length - 1]}`
      : names[0]!;
  const ratio = reversedRatio(reading);

  const tone =
    ratio === 0
      ? t("tarot.interpretation.toneNone")
      : ratio < 0.5
        ? t("tarot.interpretation.toneSome")
        : ratio < 1
          ? t("tarot.interpretation.toneMost")
          : t("tarot.interpretation.toneAll");

  const keywords = Array.from(new Set(reading.cards.flatMap((drawn) => drawn.card.keywords))).slice(
    0,
    3,
  );

  return [
    t("tarot.interpretation.axis", { axis }),
    tone,
    keywords.length > 0
      ? t("tarot.interpretation.keywords", { keywords: keywords.join(", ") })
      : "",
    t("tarot.interpretation.nextStep"),
  ]
    .filter(Boolean)
    .join(" ");
}
