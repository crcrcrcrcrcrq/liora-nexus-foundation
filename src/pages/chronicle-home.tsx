import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { ChronicleHeader } from "@/features/kronika/components/ChronicleShell";
import { LastRitualCard } from "@/features/kronika/components/LastRitualCard";
import { ChronicleReflectionCard } from "@/features/kronika/components/ChronicleReflection";
import { ChronicleTimeline } from "@/features/kronika/components/ChronicleTimeline";
import { ChronicleReportsCard } from "@/features/kronika/components/ChronicleReports";
import { SampleNotice } from "@/features/kronika/components/SampleNotice";
import { useChronicle } from "@/features/kronika/hooks/useChronicle";
import { CHRONICLE_SECTIONS } from "@/features/kronika/model/sections";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/kronika",
  head: () => ({
    ...chronicleHead("chronicle.meta.home.title"),
  }),
  component: ChronicleHome,
});

function ChronicleHome() {
  const { t } = useLanguage();
  const { chronicle, isSample, isLoading } = useChronicle();
  const name = chronicle.profile.displayName;
  const recent = chronicle.rituals.slice(0, 3);

  return (
    <div className="grid gap-16">
      <ChronicleHeader
        eyebrow={name ? t("chronicle.home.eyebrowWithName", { name }) : t("chronicle.home.eyebrow")}
        title={t("chronicle.home.title")}
        lead={t("chronicle.home.lead")}
        description={t("chronicle.home.description")}
      />

      {isSample ? (
        <SampleNotice note={t("chronicle.home.sampleNote")} isLoading={isLoading} />
      ) : null}

      <LastRitualCard ritual={chronicle.lastRitual} />

      <ChronicleReflectionCard reflection={chronicle.reflection} />

      <ChronicleReportsCard rituals={chronicle.rituals} consultations={chronicle.consultations} />

      <section>
        <p className="eyebrow text-foreground/55">{t("chronicle.home.timelineEyebrow")}</p>
        <div className="mt-10">
          <ChronicleTimeline rituals={recent} />
        </div>
        {chronicle.rituals.length > recent.length ? (
          <Link
            to="/kronika/rytualy"
            className="mt-10 inline-block rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 transition-colors duration-500 hover:text-gold"
          >
            {t("chronicle.home.backLink")}
          </Link>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHRONICLE_SECTIONS.filter((section) => section.to !== "/kronika").map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="glass rounded-sm p-8 transition-colors duration-500 hover:border-gold/30"
          >
            <p className="eyebrow text-foreground/55">{t(section.labelKey)}</p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/55">
              {t(section.descriptionKey)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
