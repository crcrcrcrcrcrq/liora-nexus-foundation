import { translate as t } from "@/lib/i18n";
import type { TarotCard } from "./types";

/**
 * 22 Wielkie Arkana. Każda karta ma pełny opis (pozycja prosta i odwrócona)
 * używany przez bezpłatny rozkład trzech kart. Teksty pochodzą z namespace'u
 * i18n `tarot.cards.<slug>` (PL/EN); tutaj trzymamy jedynie numerację i klucz.
 */
const CARD_SLUGS = [
  "fool",
  "magician",
  "highPriestess",
  "empress",
  "emperor",
  "hierophant",
  "lovers",
  "chariot",
  "strength",
  "hermit",
  "wheelOfFortune",
  "justice",
  "hangedMan",
  "death",
  "temperance",
  "devil",
  "tower",
  "star",
  "moon",
  "sun",
  "judgement",
  "world",
] as const;

const CARD_ROMANS = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
] as const;

function buildCard(id: number): TarotCard {
  const slug = CARD_SLUGS[id]!;
  const base = `tarot.cards.${slug}`;
  return {
    id,
    roman: CARD_ROMANS[id]!,
    name: t(`${base}.name`),
    keywords: t(`${base}.keywords`, { returnObjects: true }) as unknown as string[],
    upright: t(`${base}.upright`),
    reversed: t(`${base}.reversed`),
  };
}

export const CARD_COUNT = CARD_SLUGS.length;

/**
 * P0.20 — talia budowana przy każdym wywołaniu, nigdy raz przy imporcie.
 * Dzięki temu nazwy i znaczenia kart podążają za aktywnym językiem.
 */
export function majorArcana(): TarotCard[] {
  return CARD_SLUGS.map((_, id) => buildCard(id));
}

export const CARD_BY_ID = (id: number): TarotCard | undefined =>
  id >= 0 && id < CARD_COUNT ? buildCard(id) : undefined;
