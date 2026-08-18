import { Button } from "@/components/ui/button";
import type { AstrologyRequest, EngineStatus, NatalChartResponse } from "../model/types";
import { useLanguage } from "@/hooks/useLanguage";

interface RitualOutcomeProps {
  request: AstrologyRequest;
  engineStatus: EngineStatus;
  engineMessage: string;
  result: NatalChartResponse | null;
  onRestart: () => void;
}

/**
 * Etap 4 — ekran informacyjny. Nie prezentuje wymyślonych danych:
 * pokazuje przyjęte dane wejściowe, status integracji i miejsca,
 * w których pojawi się kosmogram oraz interpretacja z backendu.
 */
export function RitualOutcome({
  request,
  engineStatus,
  engineMessage,
  result,
  onRestart,
}: RitualOutcomeProps) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="eyebrow">{t("astrology.ritual.outcome.eyebrow")}</p>
        <h2 className="mt-6 text-balance font-display text-[1.75rem] leading-[1.2] text-foreground sm:text-[2.25rem]">
          {t("astrology.ritual.outcome.title")}
        </h2>
        <p role="status" className="mt-6 text-[0.9375rem] leading-[1.8] text-foreground/60">
          {engineMessage}
        </p>
      </div>

      <dl className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
        <SummaryItem
          label={t("astrology.ritual.outcome.summary.birthDate")}
          value={request.birthDate}
        />
        <SummaryItem
          label={t("astrology.ritual.outcome.summary.birthTime")}
          value={request.birthTime}
        />
        <SummaryItem label={t("astrology.ritual.outcome.summary.city")} value={request.city} />
      </dl>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <PlaceholderPanel
          title={t("astrology.ritual.outcome.chart.title")}
          description={t("astrology.ritual.outcome.chart.description")}
          filled={Boolean(result?.chart.ascendant || result?.chart.planets?.length)}
        >
          {result?.chart.ascendant ? (
            <p className="font-display text-2xl text-foreground">
              {t("astrology.ritual.outcome.chart.ascendant", { value: result.chart.ascendant })}
            </p>
          ) : null}
        </PlaceholderPanel>

        <PlaceholderPanel
          title={t("astrology.ritual.outcome.interpretation.title")}
          description={t("astrology.ritual.outcome.interpretation.description")}
          filled={Boolean(result?.interpretation)}
        >
          {result?.interpretation ? (
            <p className="text-[0.9375rem] leading-[1.8] text-foreground/70">
              {result.interpretation.summary}
            </p>
          ) : null}
        </PlaceholderPanel>
      </div>

      {engineStatus === "error" ? (
        <p role="alert" className="mt-8 text-center text-xs text-destructive">
          {t("astrology.ritual.outcome.error")}
        </p>
      ) : null}

      <div className="mt-14 flex justify-center">
        <Button variant="outline" size="lg" onClick={onRestart}>
          {t("astrology.ritual.outcome.restart")}
        </Button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-6 py-7">
      <dt className="eyebrow text-foreground/55">{label}</dt>
      <dd className="mt-3 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function PlaceholderPanel({
  title,
  description,
  filled,
  children,
}: {
  title: string;
  description: string;
  filled: boolean;
  children?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section className="rounded-sm border border-dashed border-border px-7 py-9">
      <h3 className="eyebrow text-foreground/55">{title}</h3>
      {filled ? (
        <div className="mt-5">{children}</div>
      ) : (
        <>
          <p className="mt-5 text-sm leading-[1.8] text-foreground/50">{description}</p>
          <p className="mt-6 text-xs tracking-[0.18em] text-foreground/55">
            {t("astrology.ritual.outcome.pending")}
          </p>
        </>
      )}
    </section>
  );
}
