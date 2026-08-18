import { useLanguage } from "@/hooks/useLanguage";
import { ChronicleEntry } from "./ChronicleEntry";
import type { ChronicleRitual } from "../model/types";

/** Sekcja 2 — pionowa oś czasu. Dziennik, nie tabela. */
export function ChronicleTimeline({
  rituals,
  emptyNote,
}: {
  rituals: readonly ChronicleRitual[];
  emptyNote?: string;
}) {
  const { t } = useLanguage();
  if (rituals.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-foreground/55">
        {emptyNote ?? t("chronicle.timeline.emptyNote")}
      </p>
    );
  }

  return (
    <ol className="relative grid gap-12 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border sm:before:left-4">
      {rituals.map((ritual, index) => (
        <ChronicleEntry key={ritual.id} ritual={ritual} index={index} />
      ))}
    </ol>
  );
}
