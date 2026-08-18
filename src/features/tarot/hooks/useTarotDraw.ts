import { useCallback, useEffect, useMemo, useState } from "react";
import { createDeck, type DeckSlot } from "../lib/deck";
import { buildReading, composeInterpretation } from "../lib/reading";
import { DEFAULT_SPREAD_ID, getSpread, spreadSize } from "../lib/spread";
import type { TarotReading, TarotSpread } from "../model/types";

export interface TarotDrawState {
  spread: TarotSpread;
  /** Potasowana talia rewersów (22 unikalne karty). */
  deck: DeckSlot[];
  /** Indeksy rewersów wskazanych przez użytkownika, w kolejności wyboru. */
  picked: number[];
  reading: TarotReading | null;
  /** Krótka interpretacja całego rozkładu. */
  interpretation: string;
  /** Etap rytuału — jedyne źródło prawdy o przebiegu sesji. */
  stage: TarotStage;
  shuffle: () => void;
  pick: (slot: number) => void;
  reset: () => void;
  remaining: number;
  isComplete: boolean;
}

/**
 * Etapy rytuału:
 * idle → shuffling → spreading → selecting → revealing → finished.
 */
export type TarotStage =
  "idle" | "shuffling" | "spreading" | "selecting" | "revealing" | "finished";

const SHUFFLE_MS = 2400;
/** Pauza po rozłożeniu okręgu, zanim użytkownik może wybierać. */
const SPREAD_MS = 900;
const REVEAL_MS = 1200;

/**
 * Stan losowania: tasowanie talii, wskazywanie kart bez powtórzeń
 * i złożenie gotowego rozkładu. UI wyłącznie renderuje ten stan.
 */
export function useTarotDraw(initialSpreadId: string = DEFAULT_SPREAD_ID): TarotDrawState {
  const [deck, setDeck] = useState<DeckSlot[]>(() => createDeck());
  const [picked, setPicked] = useState<number[]>([]);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [stage, setStage] = useState<TarotStage>("idle");

  const spread = useMemo(() => getSpread(initialSpreadId), [initialSpreadId]);
  const size = spreadSize(spread);

  // Tasowanie kończy się przejściem do etapu rozkładania kart.
  useEffect(() => {
    if (stage !== "shuffling") return;
    const timer = window.setTimeout(() => setStage("spreading"), SHUFFLE_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // Karty są już w okręgu — po krótkiej pauzie oddajemy ruch użytkownikowi.
  useEffect(() => {
    if (stage !== "spreading") return;
    const timer = window.setTimeout(() => setStage("selecting"), SPREAD_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // Odkrywanie kart: rozkład powstaje dopiero po animacji obrotu.
  // Timer jest sprzątany przy odmontowaniu — przerwany rytuał nic nie zapisuje.
  useEffect(() => {
    if (stage !== "revealing") return;
    const timer = window.setTimeout(() => {
      setReading(buildReading(spread, deck, picked));
      setStage("finished");
    }, REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [stage, spread, deck, picked]);

  const shuffle = useCallback(() => {
    setDeck(createDeck());
    setPicked([]);
    setReading(null);
    setStage("shuffling");
  }, []);

  const pick = useCallback(
    (slot: number) => {
      if (stage !== "selecting") return;
      setPicked((prev) => {
        if (prev.includes(slot) || prev.length >= size) return prev;
        const next = [...prev, slot];
        if (next.length === size) setStage("revealing");
        return next;
      });
    },
    [size, stage],
  );

  const reset = useCallback(() => {
    setDeck(createDeck());
    setPicked([]);
    setReading(null);
    setStage("idle");
  }, []);

  const interpretation = useMemo(
    () => (reading ? composeInterpretation(spread, reading) : ""),
    [reading, spread],
  );

  return {
    spread,
    deck,
    picked,
    reading,
    interpretation,
    stage,
    shuffle,
    pick,
    reset,
    remaining: Math.max(0, size - picked.length),
    isComplete: picked.length >= size,
  };
}
