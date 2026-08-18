import { useLanguage } from "@/hooks/useLanguage";
import { ReflectionEntry } from "./ReflectionEntry";
import type { ReflectionAnswers, SoulReflection } from "../model/reflection";

/** Oś czasu refleksji — pamiętnik, nie tabela. Bez stronicowania. */
export function ReflectionTimeline({
  entries,
  onUpdate,
  emptyNote,
}: {
  entries: readonly SoulReflection[];
  onUpdate: (id: string, answers: ReflectionAnswers) => void;
  emptyNote?: string;
}) {
  const { t } = useLanguage();

  if (entries.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-foreground/55">
        {emptyNote ?? t("chronicle.reflections.empty")}
      </p>
    );
  }

  return (
    <ol
      aria-label={t("chronicle.reflections.timelineAria")}
      className="relative grid gap-14 before:absolute before:bottom-2 before:left-1 before:top-2 before:w-px before:bg-border"
    >
      {entries.map((entry, index) => (
        <ReflectionEntry key={entry.id} entry={entry} index={index} onUpdate={onUpdate} />
      ))}
    </ol>
  );
}
