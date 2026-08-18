import { useLanguage } from "@/hooks/useLanguage";
import { formatChronicleDate } from "../lib/format";
import type { ChronicleProfile } from "../model/types";

/** Sekcja 5 — profil w trzech liniach. Nic ponad to. */
export function ProfileCard({ profile }: { profile: ChronicleProfile }) {
  const { t, language } = useLanguage();
  const empty = t("chronicle.format.empty");
  const rows = [
    { label: t("chronicle.profile.rows.name"), value: profile.displayName ?? empty },
    { label: t("chronicle.profile.rows.email"), value: profile.email },
    {
      label: t("chronicle.profile.rows.joinedAt"),
      value: profile.joinedAt ? formatChronicleDate(profile.joinedAt, language) : empty,
    },
  ];

  return (
    <section className="glass rounded-sm p-8 sm:p-12">
      <dl className="grid gap-6 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 border-b border-border pb-5 last:border-0 last:pb-0"
          >
            <dt className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {row.label}
            </dt>
            <dd className="truncate text-foreground/75">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
