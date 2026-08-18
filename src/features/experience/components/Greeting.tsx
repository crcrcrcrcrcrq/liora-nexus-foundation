import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/hooks/useLanguage";
import type { OverviewGreetingData } from "../model/types";

/**
 * Ekran powitalny. Nie dashboard, nie tabela — trzy zdania i cisza wokół nich.
 */
export function Greeting({ data }: { data: OverviewGreetingData }) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();

  const lines = [
    t("experience.overview.lines.returned", { count: data.returned }),
    t("experience.overview.lines.awaiting", { count: data.awaiting }),
    t("experience.overview.lines.scheduled", { count: data.scheduled }),
  ];

  return (
    <section className="flex min-h-[52vh] flex-col items-center justify-center px-2 text-center">
      <motion.p
        className="eyebrow text-foreground/55"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {t("experience.overview.eyebrow")}
      </motion.p>

      <motion.h1
        className="mt-8 font-display text-4xl leading-tight text-foreground sm:text-5xl"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        {t("experience.overview.greeting")}
      </motion.h1>

      <div className="mt-12 grid gap-5">
        {lines.map((line, index) => (
          <motion.p
            key={line}
            className="text-base leading-relaxed text-foreground/65 sm:text-lg"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35 + index * 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.span
        aria-hidden
        className="mt-14 block h-px w-24 bg-gold/40"
        initial={reduced ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  );
}
