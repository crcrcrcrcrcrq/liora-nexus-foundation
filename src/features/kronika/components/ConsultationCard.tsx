import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { formatChronicleDateTime } from "../lib/format";
import type { ChronicleConsultation } from "../model/types";

/** Sekcja 4 — konsultacja jako karta, nigdy jako wiersz tabeli. */
export function ConsultationCard({ consultation }: { consultation: ChronicleConsultation }) {
  const { t, language } = useLanguage();
  return (
    <article className="glass rounded-sm p-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-foreground/55">
            {t(`chronicle.consultations.status.${consultation.status}`)}
          </p>
          <h3 className="mt-4 font-display text-xl leading-snug text-foreground sm:text-2xl">
            {consultation.type}
          </h3>
          <p className="mt-3 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
            {formatChronicleDateTime(consultation.scheduledAt, language)}
          </p>
        </div>
      </div>

      {consultation.summary ? (
        <p className="mt-6 text-sm leading-relaxed text-foreground/55">{consultation.summary}</p>
      ) : null}

      <Button
        asChild={Boolean(consultation.detailsPath)}
        variant="outline"
        className="mt-8"
        disabled={!consultation.detailsPath}
      >
        {consultation.detailsPath ? (
          <a href={consultation.detailsPath}>{t("chronicle.consultations.viewRecord")}</a>
        ) : (
          <span>{t("chronicle.consultations.viewRecord")}</span>
        )}
      </Button>
    </article>
  );
}
