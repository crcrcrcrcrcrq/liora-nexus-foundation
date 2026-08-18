import { useLanguage } from "@/hooks/useLanguage";
import { formatChronicleDate } from "../lib/format";
import type { ChronicleReflection as Reflection } from "../model/types";

/** Sekcja 3 — dzisiejsza refleksja. Jedno zdanie na cały dzień. */
export function ChronicleReflectionCard({ reflection }: { reflection: Reflection | null }) {
  const { t, language } = useLanguage();
  const body = reflection?.body ?? t("chronicle.reflection.defaultBody");

  return (
    <section className="rounded-sm border border-border bg-surface-raised/40 p-8 sm:p-12">
      <p className="eyebrow text-foreground/55">
        {reflection?.source ?? t("chronicle.reflection.defaultSource")}
      </p>
      <p className="mt-6 max-w-2xl font-display text-2xl leading-relaxed text-foreground/80 sm:text-3xl">
        {body}
      </p>
      {reflection?.date ? (
        <p className="mt-6 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
          {formatChronicleDate(reflection.date, language)}
        </p>
      ) : null}
    </section>
  );
}
