import { Link } from "@/components/i18n/LocaleLink";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { formatChronicleDate } from "../lib/format";
import { RitualIcon } from "./RitualIcon";
import type { ChronicleRitual } from "../model/types";

/** Sekcja 1 — ostatni ślad, zapisany dużą, spokojną kartą. */
export function LastRitualCard({ ritual }: { ritual: ChronicleRitual | null }) {
  const { t, language } = useLanguage();

  if (!ritual) {
    return (
      <section className="glass rounded-sm p-8 sm:p-12">
        <p className="eyebrow text-foreground/55">{t("chronicle.lastRitual.eyebrow")}</p>
        <p className="mt-6 max-w-xl font-display text-2xl leading-snug text-foreground/70 sm:text-3xl">
          {t("chronicle.lastRitual.emptyTitle")}
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/55">
          {t("chronicle.lastRitual.emptyDescription")}
        </p>
      </section>
    );
  }

  return (
    <section className="glass rounded-sm p-8 sm:p-12">
      <div className="flex items-center gap-3 text-foreground/55">
        <RitualIcon kind={ritual.kind} />
        <p className="eyebrow">
          {t("chronicle.lastRitual.eyebrow")} · {t(`chronicle.ritualKind.${ritual.kind}`)}
        </p>
      </div>

      <h2 className="mt-6 font-display text-3xl leading-tight text-foreground sm:text-4xl">
        {ritual.title}
      </h2>
      <p className="mt-3 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {formatChronicleDate(ritual.occurredAt, language)}
      </p>

      <p className="mt-8 max-w-2xl font-display text-xl leading-relaxed text-foreground/75 sm:text-2xl">
        „{ritual.reflection}”
      </p>

      {ritual.details ? (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/50">
          {ritual.details}
        </p>
      ) : null}

      <div className="mt-10">
        {ritual.interpretationPath ? (
          <Button asChild variant="outline">
            <a href={ritual.interpretationPath}>{t("chronicle.lastRitual.backToInterpretation")}</a>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/kronika/rytualy">{t("chronicle.lastRitual.backToInterpretation")}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
