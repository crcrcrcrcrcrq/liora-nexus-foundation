import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/state/States";
import { RITUALS } from "@/constants/rituals";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";

export const page = definePage({
  path: "/rytualy",
  head: () => ({
    meta: buildMeta({
      title: t("rituals.meta.listTitle"),
      description: t("rituals.meta.listDescription"),
      path: "/rytualy",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("rituals.breadcrumbs.home"), path: "/" },
            { name: t("rituals.breadcrumbs.rituals"), path: "/rytualy" },
          ]),
        ),
      },
    ],
  }),
  component: RitualsPage,
});

function RitualsPage() {
  const { t } = useLanguage();
  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("rituals.page.eyebrow")}
          title={t("rituals.page.title")}
          description={t("rituals.meta.listDescription")}
        />
      </Reveal>

      {RITUALS.length === 0 ? (
        <div className="mt-14">
          <EmptyState
            title={t("rituals.page.emptyTitle")}
            description={t("rituals.page.emptyDescription")}
          />
        </div>
      ) : (
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {RITUALS.map((ritual, index) => (
            <Reveal key={ritual.slug} delay={index * 0.08}>
              <Link
                to="/rytualy/$slug"
                params={{ slug: ritual.slug }}
                className="glass block h-full rounded-sm p-9 transition-colors duration-500 hover:border-gold/40"
              >
                <p className="eyebrow">{t(ritual.cycleKey)}</p>
                <h2 className="mt-4 font-display text-3xl text-foreground">{t(ritual.titleKey)}</h2>
                <p className="mt-4 text-sm leading-relaxed text-foreground/55">
                  {t(ritual.summaryKey)}
                </p>
                <p className="mt-6 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold/70">
                  {t("rituals.page.stepsCount", { count: ritual.steps.length })}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
