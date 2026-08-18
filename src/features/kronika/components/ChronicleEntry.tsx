import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatChronicleDate } from "../lib/format";
import { RitualIcon } from "./RitualIcon";
import type { ChronicleRitual } from "../model/types";

/** Pojedynczy wpis osi czasu — jeden ślad, możliwy do rozwinięcia. */
export function ChronicleEntry({ ritual, index }: { ritual: ChronicleRitual; index: number }) {
  const { t, language } = useLanguage();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const expandable = Boolean(ritual.details);

  return (
    <motion.li
      className="relative pl-10 sm:pl-14"
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: Math.min(index * 0.08, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-raised text-foreground/55"
      >
        <RitualIcon kind={ritual.kind} />
      </span>

      <p className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {formatChronicleDate(ritual.occurredAt, language)} ·{" "}
        {t(`chronicle.ritualKind.${ritual.kind}`)}
      </p>
      <h3 className="mt-3 font-display text-xl leading-snug text-foreground sm:text-2xl">
        {ritual.title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/55">
        {ritual.reflection}
      </p>

      {expandable ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="mt-5 rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            {open ? t("chronicle.timeline.collapse") : t("chronicle.timeline.expand")}
          </button>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.p
                key="details"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl overflow-hidden text-sm leading-relaxed text-foreground/55"
              >
                <span className="mt-4 block border-l border-border pl-5">{ritual.details}</span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </motion.li>
  );
}
