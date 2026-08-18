import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { AstrologyRitual } from "@/features/astrology/components/AstrologyRitual";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/astrologia",
  head: () => {
    const title = t("astrology.meta.title");
    const description = t("astrology.meta.description");
    return {
      meta: buildMeta({ title, description, path: "/astrologia" }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: t("astrology.breadcrumb.home"), path: "/" },
              { name: t("astrology.breadcrumb.astrology"), path: "/astrologia" },
            ]),
          ),
        },
      ],
    };
  },
  component: AstrologyPage,
});

function AstrologyPage() {
  const { t } = useLanguage();
  return (
    <>
      <Section className="pt-28">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={t("astrology.page.eyebrow")}
            title={t("astrology.page.title")}
            description={t("astrology.meta.description")}
            align="center"
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-16">
          <AstrologyRitual />
        </Reveal>
      </Section>
    </>
  );
}
