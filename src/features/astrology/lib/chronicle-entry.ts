import { translate as t } from "@/lib/i18n";
import type { RitualDraft } from "@/features/kronika/hooks/useRitualRecord";
import type { AstrologyRequest, NatalChartResponse } from "../model/types";

/**
 * P0.6 — czyste mapowanie gotowego wyniku astrologicznego na wpis
 * `chronicle_rituals`. Zapisujemy wyłącznie to, czego potrzebuje istniejący
 * model Kroniki: tytuł, moment, streszczenie interpretacji i dane wejściowe,
 * które identyfikują kosmogram. Bez pełnego payloadu efemeryd.
 */
export function astrologyToRitualDraft(
  request: AstrologyRequest,
  result: NatalChartResponse,
  occurredAt: string,
): RitualDraft {
  const details = [
    `${t("astrology.ritual.outcome.summary.birthDate")}: ${request.birthDate}`,
    `${t("astrology.ritual.outcome.summary.birthTime")}: ${request.birthTime}`,
    `${t("astrology.ritual.outcome.summary.city")}: ${request.city}`,
    result.chart.ascendant
      ? t("astrology.ritual.outcome.chart.ascendant", { value: result.chart.ascendant })
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    kind: "astrology",
    title: t("astrology.page.title"),
    occurredAt,
    reflection: result.interpretation?.summary ?? "",
    details,
  };
}

/** Stabilny klucz jednego obliczenia — chroni przed duplikatem przy re-renderze. */
export function astrologyRitualKey(request: AstrologyRequest): string {
  return `astrology:${request.birthDate}T${request.birthTime}:${request.city}`;
}
