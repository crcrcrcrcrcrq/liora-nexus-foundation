import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { buildMeta, breadcrumbSchema, personSchema } from "@/utils/seo";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const page = definePage({
  path: "/o-mnie",
  head: () => ({
    meta: buildMeta({
      title: t("about.meta.title"),
      description: t("about.meta.description"),
      path: "/o-mnie",
      type: "profile",
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(personSchema()) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("about.breadcrumbs.home"), path: "/" },
            { name: t("about.breadcrumbs.about"), path: "/o-mnie" },
          ]),
        ),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLanguage();
  const description = t("about.meta.description");

  const principles = [
    {
      key: "archetype",
      title: t("about.principles.archetype.title"),
      body: t("about.principles.archetype.body"),
    },
    {
      key: "discretion",
      title: t("about.principles.discretion.title"),
      body: t("about.principles.discretion.body"),
    },
    {
      key: "boundaries",
      title: t("about.principles.boundaries.title"),
      body: t("about.principles.boundaries.body"),
    },
  ];

  return (
    <>
      <Section className="pt-28">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={t("about.hero.eyebrow")}
            title={t("about.hero.title")}
            description={description}
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-14 max-w-3xl">
          <div className="grid gap-6 text-base leading-relaxed text-foreground/60">
            <p>{t("about.intro.paragraph1")}</p>
            <p>{t("about.intro.paragraph2")}</p>
          </div>
        </Reveal>
      </Section>

      <div className="hairline" />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow={t("about.principlesSection.eyebrow")}
            title={t("about.principlesSection.title")}
          />
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {principles.map((item, index) => (
            <Reveal key={item.key} delay={index * 0.08}>
              <div>
                <p className="font-display text-5xl text-gold/30">0{index + 1}</p>
                <h2 className="mt-4 font-display text-2xl text-foreground">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/55">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-16">
          <Button asChild variant="gold" size="lg">
            <Link to="/rezerwacja">{t("about.bookButton")}</Link>
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
