import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

/** Liczba komunikatów sekwencji przygotowującej kosmogram. */
export const RITUAL_STEPS = ["date", "planets", "chart", "interpretation"] as const;

/** Łączny czas trwania sekwencji (mieści się w zakresie 4–6 s). */
export const RITUAL_DURATION_MS = 5200;

const TICK_MS = 80;

interface RitualSequence {
  /** Postęp 0–100. */
  progress: number;
  stepIndex: number;
  message: string;
}

/**
 * Odlicza czas sekwencji i zwraca postęp oraz aktualny komunikat.
 * Sekwencja zawsze kończy się wywołaniem `onComplete`, także przy odmontowaniu
 * timera po zmianie etapu.
 */
export function useRitualSequence(active: boolean, onComplete: () => void): RitualSequence {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(100, (elapsed / RITUAL_DURATION_MS) * 100);
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(timer);
        completeRef.current();
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [active]);

  const stepIndex = Math.min(
    RITUAL_STEPS.length - 1,
    Math.floor((progress / 100) * RITUAL_STEPS.length),
  );

  return {
    progress,
    stepIndex,
    message: t(`astrology.ritual.progress.steps.${RITUAL_STEPS[stepIndex]!}`),
  };
}
