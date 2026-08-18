import { translate as t } from "@/lib/i18n";
import type { TarotSpread } from "./types";

/**
 * Rejestr rozkładów.
 *
 * Aby dodać nowy rozkład, wystarczy dopisać obiekt poniżej: interfejs,
 * losowanie i widok wyniku działają na dowolnej liczbie pozycji.
 * Etykiety i opisy pochodzą z namespace'u i18n `tarot.spreads.<key>`.
 */
/**
 * P0.20 — rejestr rozkładów budowany przy każdym wywołaniu (język aktywny).
 * Identyfikatory rozkładów i pozycji pozostają techniczne, nietłumaczone.
 */
export function tarotSpreads(): TarotSpread[] {
  return [
    {
      id: "trzy-karty",
      name: t("tarot.spreads.threeCards.name"),
      description: t("tarot.spreads.threeCards.description"),
      free: true,
      positions: [
        {
          key: "past",
          label: t("tarot.spreads.threeCards.positions.past.label"),
          hint: t("tarot.spreads.threeCards.positions.past.hint"),
        },
        {
          key: "present",
          label: t("tarot.spreads.threeCards.positions.present.label"),
          hint: t("tarot.spreads.threeCards.positions.present.hint"),
        },
        {
          key: "future",
          label: t("tarot.spreads.threeCards.positions.future.label"),
          hint: t("tarot.spreads.threeCards.positions.future.hint"),
        },
      ],
    },
    {
      id: "decyzja",
      name: t("tarot.spreads.decisionCross.name"),
      description: t("tarot.spreads.decisionCross.description"),
      free: true,
      positions: [
        {
          key: "core",
          label: t("tarot.spreads.decisionCross.positions.core.label"),
          hint: t("tarot.spreads.decisionCross.positions.core.hint"),
        },
        {
          key: "option-a",
          label: t("tarot.spreads.decisionCross.positions.optionA.label"),
          hint: t("tarot.spreads.decisionCross.positions.optionA.hint"),
        },
        {
          key: "option-b",
          label: t("tarot.spreads.decisionCross.positions.optionB.label"),
          hint: t("tarot.spreads.decisionCross.positions.optionB.hint"),
        },
        {
          key: "cost",
          label: t("tarot.spreads.decisionCross.positions.cost.label"),
          hint: t("tarot.spreads.decisionCross.positions.cost.hint"),
        },
      ],
    },
    {
      id: "relacja",
      name: t("tarot.spreads.relationshipAnalysis.name"),
      description: t("tarot.spreads.relationshipAnalysis.description"),
      free: false,
      positions: [
        {
          key: "you",
          label: t("tarot.spreads.relationshipAnalysis.positions.you.label"),
          hint: t("tarot.spreads.relationshipAnalysis.positions.you.hint"),
        },
        {
          key: "them",
          label: t("tarot.spreads.relationshipAnalysis.positions.them.label"),
          hint: t("tarot.spreads.relationshipAnalysis.positions.them.hint"),
        },
        {
          key: "bond",
          label: t("tarot.spreads.relationshipAnalysis.positions.bond.label"),
          hint: t("tarot.spreads.relationshipAnalysis.positions.bond.hint"),
        },
        {
          key: "block",
          label: t("tarot.spreads.relationshipAnalysis.positions.block.label"),
          hint: t("tarot.spreads.relationshipAnalysis.positions.block.hint"),
        },
        {
          key: "ground",
          label: t("tarot.spreads.relationshipAnalysis.positions.ground.label"),
          hint: t("tarot.spreads.relationshipAnalysis.positions.ground.hint"),
        },
      ],
    },
  ];
}

export const DEFAULT_SPREAD_ID = "trzy-karty";

export function getSpread(id: string): TarotSpread {
  const all = tarotSpreads();
  return all.find((spread) => spread.id === id) ?? all[0]!;
}

/** Zgodność wsteczna: pozycje domyślnego rozkładu trzech kart. */
export function readingPositions() {
  return getSpread(DEFAULT_SPREAD_ID).positions;
}
