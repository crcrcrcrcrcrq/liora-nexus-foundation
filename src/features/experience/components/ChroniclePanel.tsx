import { useLanguage } from "@/hooks/useLanguage";
import { formatDay, formatMoment } from "../lib/format";
import type { ChronicleDigest } from "../model/types";

/**
 * Kronika widziana z Experience Center — WYŁĄCZNIE do czytania.
 * Nie ma tu żadnej ścieżki edycji: historia człowieka należy do niego.
 */
export function ChroniclePanel({ digest }: { digest: ChronicleDigest }) {
  const { t, language } = useLanguage();

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-sm tracking-[0.12em] text-gold">{digest.lioraId}</p>
        <p className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
          {t("experience.chronicle.readOnly")}
        </p>
      </div>

      <dl className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Fact label={t("experience.chronicle.facts.visits")} value={String(digest.visits)} />
        <Fact
          label={t("experience.chronicle.facts.rituals")}
          value={String(digest.ritualDates.length)}
        />
        <Fact
          label={t("experience.chronicle.facts.interpretations")}
          value={String(digest.interpretations.length)}
        />
        <Fact
          label={t("experience.chronicle.facts.contact")}
          value={t(`experience.people.contact.${digest.contact}`)}
        />
      </dl>

      <section>
        <p className="eyebrow text-foreground/55">{t("experience.chronicle.ritualDates")}</p>
        <ul className="mt-5 grid gap-3 text-sm text-foreground/60">
          {digest.ritualDates.map((date) => (
            <li key={date}>{formatDay(date, language)}</li>
          ))}
        </ul>
      </section>

      <section>
        <p className="eyebrow text-foreground/55">{t("experience.chronicle.interpretations")}</p>
        <ul className="mt-5 grid gap-4">
          {digest.interpretations.map((item) => (
            <li key={item.id} className="border-b border-border pb-4">
              <p className="text-sm text-foreground/75">{item.title}</p>
              <p className="mt-1 text-xs text-foreground/40">
                {formatDay(item.purchasedAt, language)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="eyebrow text-foreground/55">{t("experience.chronicle.marks")}</p>
        <ul className="mt-5 grid gap-4">
          {digest.marks.map((mark) => (
            <li key={mark.id} className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-sm text-foreground/75">{mark.title}</span>
              <span className="text-xs text-foreground/40">
                {formatMoment(mark.occurredAt, language)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-foreground/40">
        {t("experience.chronicle.privacyNote")}
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
        {label}
      </dt>
      <dd className="mt-2 font-display text-3xl text-foreground">{value}</dd>
    </div>
  );
}
