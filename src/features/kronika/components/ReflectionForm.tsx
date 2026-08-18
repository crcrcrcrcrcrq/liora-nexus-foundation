import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { ReflectionAnswers } from "../model/reflection";

const EMPTY: ReflectionAnswers = { heard: "", leaving: "", taking: "" };
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Trzy pytania, które zamykają rytuał. Formularz jest cichy: bez walidacji
 * krzykiem, bez okien, bez komunikatów systemowych.
 */
export function ReflectionForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  className,
}: {
  initial?: ReflectionAnswers;
  onSubmit: (answers: ReflectionAnswers) => void;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const baseId = useId();
  const [answers, setAnswers] = useState<ReflectionAnswers>(initial ?? EMPTY);

  const fields = [
    { key: "heard", label: t("chronicle.reflections.form.heard") },
    { key: "leaving", label: t("chronicle.reflections.form.leaving") },
    { key: "taking", label: t("chronicle.reflections.form.taking") },
  ] as const;

  const filled = Object.values(answers).some((value) => value.trim().length > 0);

  return (
    <motion.form
      className={cn("grid gap-8", className)}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!filled) return;
        onSubmit({
          heard: answers.heard.trim(),
          leaving: answers.leaving.trim(),
          taking: answers.taking.trim(),
        });
      }}
    >
      {fields.map((field) => (
        <div key={field.key} className="grid gap-3 text-left">
          <label
            htmlFor={`${baseId}-${field.key}`}
            className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55"
          >
            {field.label}
          </label>
          <Textarea
            id={`${baseId}-${field.key}`}
            value={answers[field.key]}
            aria-label={field.label}
            rows={3}
            onChange={(event) =>
              setAnswers((previous) => ({ ...previous, [field.key]: event.target.value }))
            }
            className="min-h-24 resize-none rounded-sm border-border bg-transparent text-[0.95rem] leading-[1.9] text-foreground/80 transition-colors duration-500 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            placeholder={t("chronicle.reflections.form.placeholder")}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="gold" disabled={!filled}>
          {submitLabel ?? t("chronicle.reflections.form.save")}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("chronicle.reflections.form.cancel")}
          </Button>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-foreground/45">
        {t("chronicle.reflections.form.note")}
      </p>
    </motion.form>
  );
}
