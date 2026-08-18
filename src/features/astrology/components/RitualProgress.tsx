import { motion, useReducedMotion } from "motion/react";
import { RITUAL_STEPS, useRitualSequence } from "../hooks/useRitualSequence";
import { useLanguage } from "@/hooks/useLanguage";

/** Etap 3 — sekwencja przygotowująca, około pięciu sekund. */
export function RitualProgress({ onComplete }: { onComplete: () => void }) {
  const { t } = useLanguage();
  const { progress, stepIndex, message } = useRitualSequence(true, onComplete);
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-sm border border-border bg-surface-raised/40 px-7 py-16 text-center sm:px-12 sm:py-20">
      {!reduced ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-gold)", opacity: 0.05 }}
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className="relative">
        <p className="eyebrow">{t("astrology.ritual.progress.eyebrow")}</p>

        <p
          role="status"
          aria-live="polite"
          className="mt-8 min-h-[3.5rem] font-display text-xl leading-relaxed text-foreground sm:text-2xl"
        >
          <motion.span
            key={stepIndex}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {message}
          </motion.span>
        </p>

        <div
          role="progressbar"
          aria-label={t("astrology.ritual.progress.progressAriaLabel")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="mt-12 h-px w-full bg-border"
        >
          <div
            className="h-px bg-gold transition-[width] duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-6 text-xs tracking-[0.18em] text-foreground/55">
          {t("astrology.ritual.progress.counter", {
            current: stepIndex + 1,
            total: RITUAL_STEPS.length,
          })}
        </p>
      </div>
    </div>
  );
}
