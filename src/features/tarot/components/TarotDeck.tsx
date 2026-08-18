import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { DeckStack } from "./DeckStack";
import { CardCircle } from "./CardCircle";
import { ReadingResult } from "./ReadingResult";
import { DailyLimitNotice } from "./DailyLimitNotice";
import { useTarotDraw } from "../hooks/useTarotDraw";
import { useDailyLimit } from "../hooks/useDailyLimit";
import { useScaleToFit } from "../hooks/useScaleToFit";
import { RESULT_CARD, SCENE } from "../lib/circle";
import { spreadSize } from "../lib/spread";
import { tarotRitualKey, tarotToRitualDraft } from "../lib/chronicle-entry";
import { useRitualRecord } from "@/features/kronika/hooks/useRitualRecord";
import { useAnalytics } from "@/hooks/useAnalytics";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Sesja Tarota LIORA: powitanie → tasowanie → okrąg 22 kart → wybór trzech →
 * odkrycie → interpretacja → zaproszenie do pełnego czytania.
 * Komponent wyłącznie prezentuje stan z hooków.
 */
export function TarotDeck({ spreadId }: { spreadId?: string }) {
  const { t } = useLanguage();
  const RITUAL_LINES = t("tarot.ritual.lines", { returnObjects: true }) as string[];
  const { spread, deck, picked, reading, interpretation, stage, shuffle, pick, reset, remaining } =
    useTarotDraw(spreadId);
  const reduced = useReducedMotion() ?? false;
  const size = spreadSize(spread);
  const { ready, locked, msRemaining, markCompleted } = useDailyLimit();
  const { ref: sceneRef, scale, measured } = useScaleToFit(SCENE);

  const { track } = useAnalytics();
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  /**
   * P0.31 — analityka Tarota jest wyłącznie licznikiem etapów rytuału.
   * Nie zapisujemy wylosowanych kart, pytań ani żadnego tekstu użytkownika;
   * historia rytuału (Kronika) pozostaje osobnym, niezależnym modelem danych.
   */
  useEffect(() => {
    if (stage === "shuffling" && !startedRef.current) {
      startedRef.current = true;
      track("tarot_started", { spread: spread.id });
    }
    if (stage === "finished" && !completedRef.current) {
      completedRef.current = true;
      track("tarot_completed", { spread: spread.id });
    }
  }, [stage, spread.id, track]);

  const counted = useRef(false);
  const [line, setLine] = useState(0);
  const { record } = useRitualRecord();

  // Rozkład zaliczamy dokładnie raz — dopiero gdy rytuał jest zakończony
  // i interpretacja gotowa. Wyjście wcześniej nie zużywa limitu.
  useEffect(() => {
    if (stage !== "finished" || !reading || counted.current) return;
    counted.current = true;
    markCompleted();
  }, [stage, reading, markCompleted]);

  // P0.6: zakończony rozkład zostaje śladem w Kronice — tylko dla zalogowanej
  // osoby i tylko raz na losowanie (klucz z `drawnAt`).
  useEffect(() => {
    if (stage !== "finished" || !reading || !interpretation) return;
    record(tarotRitualKey(reading), tarotToRitualDraft(spread, reading, interpretation));
  }, [stage, reading, interpretation, spread, record]);

  // Sekwencja napięcia w trakcie tasowania.
  useEffect(() => {
    if (stage !== "shuffling") {
      setLine(0);
      return;
    }
    const timer = window.setTimeout(() => setLine(1), 1300);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const inCircle = stage === "spreading" || stage === "selecting" || stage === "revealing";
  const dealt = measured && stage !== "spreading";

  const status =
    stage === "idle"
      ? t("tarot.ritual.statusIdle")
      : stage === "shuffling"
        ? t("tarot.ritual.statusShuffling")
        : stage === "spreading"
          ? t("tarot.ritual.statusSpreading")
          : stage === "selecting"
            ? t("tarot.ritual.statusSelecting", { count: size, remaining })
            : stage === "revealing"
              ? t("tarot.ritual.statusRevealing")
              : t("tarot.ritual.statusFinished");

  const blocked = ready && locked && stage !== "finished";

  return (
    <div className="relative">
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div className="relative overflow-hidden rounded-sm border border-border/70 bg-[radial-gradient(120%_100%_at_50%_-10%,oklch(1_0_0/4%),transparent_65%)] px-4 py-14 sm:px-8 sm:py-20">
        {/* Przyciemnienie sceny w trakcie sekwencji tasowania. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background"
          initial={false}
          animate={{ opacity: stage === "shuffling" ? 0.45 : 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        />

        <AnimatePresence mode="wait">
          {!ready ? (
            <div key="loading" className="min-h-[24rem]" aria-hidden />
          ) : blocked ? (
            <motion.div
              key="locked"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <DailyLimitNotice msRemaining={msRemaining} />
            </motion.div>
          ) : null}

          {/* Etap 1–2: powitanie i tasowanie */}
          {!blocked && ready && (stage === "idle" || stage === "shuffling") ? (
            <motion.div
              key="deck"
              className="relative flex flex-col items-center"
              initial={false}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="relative scale-90 sm:scale-100">
                {/* Oddech światła wokół talii w trakcie tasowania. */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-24 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.11_85/18%),transparent_70%)]"
                  initial={false}
                  animate={
                    stage === "shuffling" && !reduced
                      ? { opacity: [0.25, 0.75, 0.35], scale: [0.94, 1.06, 0.98] }
                      : { opacity: 0, scale: 0.94 }
                  }
                  transition={{ duration: 2.4, ease: EASE }}
                />
                <DeckStack
                  shuffling={stage === "shuffling"}
                  reduced={reduced}
                  width={132}
                  height={202}
                />
              </div>

              <div className="mt-14 flex min-h-[7.5rem] max-w-md items-start justify-center">
                {stage === "shuffling" ? (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={line}
                      className="text-balance text-center font-display text-[1.25rem] leading-[1.6] text-gold/75 sm:text-[1.55rem]"
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.6, ease: EASE }}
                    >
                      {RITUAL_LINES[line]}
                    </motion.p>
                  </AnimatePresence>
                ) : (
                  <p className="text-balance text-center font-display text-[1.25rem] leading-[1.6] text-foreground/80 sm:text-[1.55rem]">
                    {t("tarot.ritual.idleInstructionLine1")}
                    <br />
                    {t("tarot.ritual.idleInstructionLine2")}
                    <br />
                    {t("tarot.ritual.idleInstructionLine3")}
                  </p>
                )}
              </div>

              <div className="mt-10">
                <Button variant="gold" size="lg" onClick={shuffle} disabled={stage === "shuffling"}>
                  {stage === "shuffling"
                    ? t("tarot.ritual.shufflingButton")
                    : t("tarot.ritual.shuffleButton")}
                </Button>
              </div>
            </motion.div>
          ) : null}

          {/* Etap 3–5: okrąg 300°, wybór trzech kart */}
          {!blocked && inCircle ? (
            <motion.div
              key="circle"
              className="flex flex-col items-center"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {/* Scena o stałej geometrii, skalowana proporcjonalnie do szerokości. */}
              <div ref={sceneRef} className="relative w-full" style={{ height: SCENE * scale }}>
                <div
                  className="absolute left-1/2 top-0"
                  style={{
                    width: SCENE,
                    height: SCENE,
                    transform: `translateX(-50%) scale(${scale})`,
                    transformOrigin: "top center",
                    opacity: measured ? 1 : 0,
                  }}
                >
                  <CardCircle
                    deck={deck}
                    picked={picked}
                    pickLimit={size}
                    active={stage === "selecting"}
                    deal={dealt}
                    onPick={pick}
                    reduced={reduced}
                    centerLabel={t("tarot.ritual.centerLabel")}
                  />
                </div>
              </div>

              <p className="mt-4 text-center text-[0.65rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 sm:text-[0.7rem]">
                {stage === "spreading"
                  ? t("tarot.ritual.captionSpreading")
                  : stage === "selecting"
                    ? t("tarot.ritual.captionSelecting", { count: size, remaining })
                    : t("tarot.ritual.captionRevealing")}
              </p>
            </motion.div>
          ) : null}

          {/* Etap 6–8: odkrycie, wynik i zaproszenie */}
          {stage === "finished" && reading ? (
            <motion.div
              key="reading"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <ReadingResult
                reading={reading}
                spread={spread}
                interpretation={interpretation}
                reduced={reduced}
                width={RESULT_CARD.width}
                height={RESULT_CARD.height}
                onRestart={reset}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <PrivacyNote tone="tarot" className="mt-12 text-center" />
    </div>
  );
}
