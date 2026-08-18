import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { LOCATIONS } from "@/constants/locations";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";

export const page = definePage({
  path: "/gdzie-dzialam",
  head: () => ({
    meta: buildMeta({
      title: t("locations.meta.title"),
      description: t("locations.meta.description"),
      path: "/gdzie-dzialam",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("locations.breadcrumbs.home"), path: "/" },
            { name: t("locations.breadcrumbs.locations"), path: "/gdzie-dzialam" },
          ]),
        ),
      },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { t } = useLanguage();
  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("locations.page.eyebrow")}
          title={t("locations.page.title")}
          description={t("locations.meta.description")}
        />
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {LOCATIONS.map((location, index) => (
          <Reveal key={location.cityKey} delay={index * 0.06}>
            <article className="glass h-full rounded-sm p-8">
              <p className="eyebrow">{t(location.countryKey)}</p>
              <h2 className="mt-4 font-display text-2xl text-foreground">{t(location.cityKey)}</h2>
              <p className="mt-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold/70">
                {t(location.formatKey)}
              </p>
              <div className="hairline my-6" />
              <p className="text-sm leading-relaxed text-foreground/55">
                {t(location.descriptionKey)}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
