import { useState } from "react";
import { Link } from "@/components/i18n/LocaleLink";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/hooks/useLanguage";
import { useReflections } from "@/features/kronika/hooks/useReflections";
import { ReflectionForm } from "@/features/kronika/components/ReflectionForm";
import type { ReflectionContext } from "@/features/kronika/model/reflection";
import { orientationLabel } from "../lib/cards";
import { positionOf } from "../lib/spread";
import type { TarotReading, TarotSpread } from "../model/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Zamknięcie rytuału: zaproszenie do zapisania refleksji w Kronice Duszy.
 * Kontekst odczytu (data, karty, interpretacja, język) zapisuje się sam.
 */
export function ReadingReflection({
  reading,
  spread,
  interpretation,
}: {
  reading: TarotReading;
  spread: TarotSpread;
  interpretation: string;
}) {
  const { t, language } = useLanguage();
  const reduced = useReducedMotion();
  const { save } = useReflections();
  const [saved, setSaved] = useState(false);

  const context: ReflectionContext = {
    readingAt: reading.drawnAt,
    language,
    spread: spread.name,
    interpretation,
    cards: reading.cards.map((drawn) => ({
      name: drawn.card.name,
      position: positionOf(spread, drawn.positionKey)?.label ?? drawn.positionKey,
      orientation: orientationLabel(drawn.orientation),
    })),
  };

  return (
    <section
      aria-label={t("chronicle.reflections.form.aria")}
      className="glass mx-auto mt-16 max-w-3xl rounded-sm p-8 sm:p-12"
    >
      <p className="eyebrow text-foreground/55">{t("chronicle.reflections.form.eyebrow")}</p>
      <AnimatePresence mode="wait" initial={false}>
        {saved ? (
          <motion.div
            key="saved"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-6"
            role="status"
            aria-live="polite"
          >
            <p className="font-display text-2xl leading-snug text-foreground/80">
              {t("chronicle.reflections.form.savedTitle")}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-[1.9] text-foreground/55">
              {t("chronicle.reflections.form.savedBody")}
            </p>
            <Link
              to="/kronika/refleksje"
              className="mt-8 inline-block rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              {t("chronicle.reflections.form.savedLink")}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="mt-6 max-w-xl font-display text-2xl leading-snug text-foreground/80">
              {t("chronicle.reflections.form.title")}
            </p>
            <ReflectionForm
              className="mt-10"
              onSubmit={(answers) => {
                save(context, answers);
                setSaved(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
