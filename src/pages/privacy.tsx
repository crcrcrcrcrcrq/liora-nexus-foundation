import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { SITE } from "@/config/site";
import { buildMeta } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useTrackOnce } from "@/hooks/useAnalytics";

export const page = definePage({
  path: "/polityka-prywatnosci",
  head: () => {
    const title = t("legal.privacy.meta.title");
    const description = t("legal.privacy.meta.description");
    return {
      meta: buildMeta({ title, description, path: "/polityka-prywatnosci" }),
    };
  },
  component: PrivacyPage,
});

const SECTION_KEYS = [
  "controller",
  "scope",
  "purpose",
  "legalBasis",
  "bookings",
  "contactForms",
  "email",
  "accounts",
  "chronicle",
  "browserStorage",
  "analytics",
  "retention",
  "recipients",
  "security",
  "rights",
  "changes",
  "contact",
] as const;

function PrivacyPage() {
  const { t } = useLanguage();
  // P0.31 — wyłącznie zagregowana odsłona dokumentu, bez danych użytkownika.
  useTrackOnce("privacy_policy_view");
  const description = t("legal.privacy.meta.description");
  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("legal.privacy.page.eyebrow")}
          title={t("legal.privacy.page.title")}
          description={description}
        />
      </Reveal>
      <div className="mt-14 grid max-w-3xl gap-8">
        {SECTION_KEYS.map((key, index) => (
          <Reveal key={key} delay={index * 0.05}>
            <div>
              <h2 className="font-display text-xl text-foreground">
                {t(`legal.privacy.sections.${key}.title`)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                {t(`legal.privacy.sections.${key}.body`, {
                  email: SITE.email,
                  legalName: SITE.legalName,
                })}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
