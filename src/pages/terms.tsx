import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { SITE } from "@/config/site";
import { buildMeta } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useTrackOnce } from "@/hooks/useAnalytics";

export const page = definePage({
  path: "/regulamin",
  head: () => {
    const title = t("legal.terms.meta.title");
    const description = t("legal.terms.meta.description");
    return {
      meta: buildMeta({ title, description, path: "/regulamin" }),
    };
  },
  component: TermsPage,
});

const SECTION_KEYS = [
  "scope",
  "nature",
  "siteUse",
  "booking",
  "payment",
  "cancellation",
  "sessionFlow",
  "userObligations",
  "liability",
  "complaints",
  "age",
  "changes",
  "contact",
] as const;

function TermsPage() {
  const { t } = useLanguage();
  useTrackOnce("terms_view");
  const description = t("legal.terms.meta.description");
  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("legal.terms.page.eyebrow")}
          title={t("legal.terms.page.title")}
          description={description}
        />
      </Reveal>
      <div className="mt-14 grid max-w-3xl gap-8">
        {SECTION_KEYS.map((key, index) => (
          <Reveal key={key} delay={index * 0.05}>
            <div>
              <h2 className="font-display text-xl text-foreground">
                {t(`legal.terms.sections.${key}.title`)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                {t(`legal.terms.sections.${key}.body`, { email: SITE.email })}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
