import type { RitualDraft } from "@/features/kronika/hooks/useRitualRecord";
import { orientationLabel } from "./cards";
import { positionOf } from "./spread";
import type { TarotReading, TarotSpread } from "../model/types";

/**
 * P0.6 — czyste mapowanie istniejącego wyniku Tarota na wpis
 * `chronicle_rituals`. Nie generuje nowych treści: korzysta wyłącznie
 * z danych, które rytuał już posiada.
 */
export function tarotToRitualDraft(
  spread: TarotSpread,
  reading: TarotReading,
  interpretation: string,
): RitualDraft {
  const details = reading.cards
    .map((drawn) => {
      const position = positionOf(spread, drawn.positionKey)?.label ?? drawn.positionKey;
      return `${position}: ${drawn.card.name} (${orientationLabel(drawn.orientation)})`;
    })
    .join(" · ");

  return {
    kind: "tarot",
    title: spread.name,
    occurredAt: reading.drawnAt,
    reflection: interpretation,
    details,
  };
}

/** Stabilny klucz jednego zakończonego losowania — chroni przed duplikatem. */
export function tarotRitualKey(reading: TarotReading): string {
  return `tarot:${reading.drawnAt}`;
}
