import { useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { ChronicleCard, ChroniclePlaceholder } from "./ChronicleShell";
import { buildQuarterlyReports } from "../lib/reports-projection";
import type { ChronicleConsultation, ChronicleRitual } from "../model/types";

/**
 * P0.7 — kwartalne podsumowania w istniejącej Kronice.
 *
 * Lista powstaje z tej samej czystej projekcji, którą serwer wypełnia
 * `ChronicleOverview.reports`; tutaj stosujemy wyłącznie język interfejsu.
 * Brak aktywności = brak raportów (bez zapisu przykładowego).
 */
export function ChronicleReportsCard({
  rituals,
  consultations,
}: {
  rituals: readonly ChronicleRitual[];
  consultations: readonly ChronicleConsultation[];
}) {
  const { t, language } = useLanguage();
  const reports = useMemo(
    () => buildQuarterlyReports(rituals, consultations, language),
    [rituals, consultations, language],
  );

  return (
    <ChronicleCard
      title={t("chronicle.reports.eyebrow")}
      description={t("chronicle.reports.description")}
    >
      {reports.length === 0 ? (
        <ChroniclePlaceholder note={t("chronicle.reports.empty")} />
      ) : (
        <ul className="grid gap-6">
          {reports.map((report) => (
            <li key={report.id} className="border-b border-border pb-6 last:border-none last:pb-0">
              <p className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
                {report.period}
              </p>
              <h3 className="mt-3 font-display text-xl leading-snug text-foreground sm:text-2xl">
                {report.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">{report.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </ChronicleCard>
  );
}
