import { notFound, useLoaderData } from "@tanstack/react-router";
import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { RITUALS } from "@/constants/rituals";
import type { RitualItem } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";

export const page = definePage({
  path: "/rytualy/$slug",
  loader: ({ params }) => {
    const ritual = RITUALS.find((item) => item.slug === params.slug);
    if (!ritual) throw notFound();
    return { ritual };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: t("rituals.notFound.title") }, { name: "robots", content: "noindex" }],
      };
    }
    const title = t("rituals.meta.detailTitle", { title: t(loaderData.ritual.titleKey) });
    const description = t(loaderData.ritual.summaryKey);
    return {
      meta: buildMeta({
        title,
        description,
        path: `/rytualy/${params.slug}`,
        type: "article",
        section: t(loaderData.ritual.cycleKey),
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: t(loaderData.ritual.titleKey),
            description,
            step: (loaderData.ritual as RitualItem).steps.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: t(step.titleKey),
              text: t(step.descriptionKey),
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: t("rituals.breadcrumbs.home"), path: "/" },
              { name: t("rituals.breadcrumbs.rituals"), path: "/rytualy" },
              { name: t(loaderData.ritual.titleKey), path: `/rytualy/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: RitualPage,
});

function RitualPage() {
  const { ritual } = useLoaderData({ strict: false }) as { ritual: RitualItem };
  const { t } = useLanguage();

  return (
    <Section className="pt-28">
      <Reveal>
        <Link to="/rytualy" className="eyebrow text-gold/70">
          {t("rituals.page.backToAll")}
        </Link>
        <div className="mt-8">
          <SectionHeading
            as="h1"
            eyebrow={t(ritual.cycleKey)}
            title={t(ritual.titleKey)}
            description={t(ritual.summaryKey)}
          />
        </div>
      </Reveal>

      <div className="mt-16 grid max-w-3xl gap-10">
        {ritual.steps.map((step, index) => (
          <Reveal key={step.titleKey} delay={index * 0.06}>
            <div className="border-l border-border pl-8">
              <p className="font-display text-4xl text-gold/30">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-2xl text-foreground">{t(step.titleKey)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                {t(step.descriptionKey)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
