import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatChronicleDateTime } from "../lib/format";
import { ReflectionForm } from "./ReflectionForm";
import type { ReflectionAnswers, SoulReflection } from "../model/reflection";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Pojedynczy wpis pamiętnika: kontekst odczytu i trzy odpowiedzi. */
export function ReflectionEntry({
  entry,
  index,
  onUpdate,
}: {
  entry: SoulReflection;
  index: number;
  onUpdate: (id: string, answers: ReflectionAnswers) => void;
}) {
  const { t, language } = useLanguage();
  const reduced = useReducedMotion();
  const [editing, setEditing] = useState(false);

  const answers = [
    { key: "heard", label: t("chronicle.reflections.form.heard"), value: entry.heard },
    { key: "leaving", label: t("chronicle.reflections.form.leaving"), value: entry.leaving },
    { key: "taking", label: t("chronicle.reflections.form.taking"), value: entry.taking },
  ].filter((answer) => answer.value.trim().length > 0);

  return (
    <motion.li
      className="relative pl-10 sm:pl-14"
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: Math.min(index * 0.08, 0.4), ease: EASE }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-2 h-2 w-2 rounded-full border border-gold/50 bg-surface-raised"
      />

      <p className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {formatChronicleDateTime(entry.readingAt, language)}
      </p>
      <h3 className="mt-3 font-display text-xl leading-snug text-foreground sm:text-2xl">
        {entry.spread}
      </h3>

      {entry.cards.length > 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/55">
          {entry.cards
            .map((card) => `${card.position}: ${card.name} (${card.orientation})`)
            .join(" · ")}
        </p>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div
            key="edit"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-8 max-w-2xl"
          >
            <ReflectionForm
              initial={{ heard: entry.heard, leaving: entry.leaving, taking: entry.taking }}
              submitLabel={t("chronicle.reflections.form.update")}
              onCancel={() => setEditing(false)}
              onSubmit={(next) => {
                onUpdate(entry.id, next);
                setEditing(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="read"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-6 grid max-w-2xl gap-6"
          >
            {answers.map((answer) => (
              <div key={answer.key} className="border-l border-border pl-5">
                <p className="text-[0.65rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
                  {answer.label}
                </p>
                <p className="mt-2 text-[0.95rem] leading-[1.9] text-foreground/75">
                  {answer.value}
                </p>
              </div>
            ))}

            {entry.interpretation ? (
              <details className="group">
                <summary className="cursor-pointer list-none rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                  {t("chronicle.reflections.entry.interpretation")}
                </summary>
                <p className="mt-4 border-l border-border pl-5 text-sm leading-[1.9] text-foreground/55">
                  {entry.interpretation}
                </p>
              </details>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={`${t("chronicle.reflections.entry.edit")} — ${entry.spread}`}
                className="rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                {t("chronicle.reflections.entry.edit")}
              </button>
              <span className="text-[0.65rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/35">
                {t("chronicle.reflections.entry.language")}: {entry.language.toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
