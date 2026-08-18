import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useAstrologyRitual } from "../hooks/useAstrologyRitual";
import { BirthDataForm } from "./BirthDataForm";
import { RitualIntro } from "./RitualIntro";
import { RitualOutcome } from "./RitualOutcome";
import { RitualProgress } from "./RitualProgress";
import { astrologyRitualKey, astrologyToRitualDraft } from "../lib/chronicle-entry";
import { useRitualRecord } from "@/features/kronika/hooks/useRitualRecord";

/** Orkiestracja czterech etapów rytuału astrologicznego. */
export function AstrologyRitual() {
  const ritual = useAstrologyRitual();
  const { record } = useRitualRecord();

  // P0.6: gotowy wynik zostaje śladem w Kronice — tylko dla zalogowanej osoby,
  // tylko gdy silnik faktycznie odpowiedział i tylko raz na komplet danych.
  useEffect(() => {
    const { stage, request, result, engineStatus } = ritual;
    if (stage !== "outcome" || !request || !result || engineStatus !== "ready") return;
    record(
      astrologyRitualKey(request),
      astrologyToRitualDraft(request, result, new Date().toISOString()),
    );
  }, [ritual, record]);

  return (
    <div className="relative">
      <StageTransition stageKey={ritual.stage}>
        {ritual.stage === "intro" ? <RitualIntro onBegin={ritual.begin} /> : null}
        {ritual.stage === "form" ? <BirthDataForm onSubmit={ritual.submit} /> : null}
        {ritual.stage === "processing" ? (
          <RitualProgress onComplete={ritual.completeSequence} />
        ) : null}
        {ritual.stage === "outcome" && ritual.request ? (
          <RitualOutcome
            request={ritual.request}
            engineStatus={ritual.engineStatus}
            engineMessage={ritual.engineMessage}
            result={ritual.result}
            onRestart={ritual.restart}
          />
        ) : null}
      </StageTransition>
    </div>
  );
}

/** Spokojne przejście między etapami; respektuje prefers-reduced-motion. */
function StageTransition({ stageKey, children }: { stageKey: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <div>{children}</div>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stageKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
