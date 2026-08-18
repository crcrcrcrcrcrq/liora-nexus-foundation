import { useCallback, useEffect, useState } from "react";
import {
  dayKey,
  isLocked as computeLocked,
  localTarotLimitGateway,
  msUntilMidnight,
  type TarotLimitGateway,
} from "../lib/dailyLimit";

export interface DailyLimitState {
  /** true dopiero po hydracji — wcześniej nie znamy stanu storage. */
  ready: boolean;
  /** Czy dzisiejszy rozkład został już wykonany. */
  locked: boolean;
  /** Milisekundy do północy (odblokowania). */
  msRemaining: number;
  /** Oznacza dzisiejszy rozkład jako wykonany. */
  markCompleted: () => void;
}

/**
 * Limit jednego darmowego rozkładu dziennie.
 * Źródło prawdy jest wstrzykiwane — wymiana na backend nie dotyka UI.
 */
export function useDailyLimit(
  gateway: TarotLimitGateway = localTarotLimitGateway,
): DailyLimitState {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [msRemaining, setMsRemaining] = useState(0);

  useEffect(() => {
    setLocked(computeLocked(gateway.readLastDay()));
    setMsRemaining(msUntilMidnight());
    setReady(true);
  }, [gateway]);

  useEffect(() => {
    if (!locked) return;
    const timer = window.setInterval(() => {
      const left = msUntilMidnight();
      setMsRemaining(left);
      if (left <= 0) setLocked(computeLocked(gateway.readLastDay()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [locked, gateway]);

  const markCompleted = useCallback(() => {
    gateway.writeLastDay(dayKey());
    setLocked(true);
    setMsRemaining(msUntilMidnight());
  }, [gateway]);

  return { ready, locked, msRemaining, markCompleted };
}
