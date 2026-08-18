import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { SITE } from "@/config/site";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/kontakt",
  head: () => {
    const title = t("contact.meta.title");
    const description = t("contact.meta.description");
    return {
      meta: buildMeta({ title, description, path: "/kontakt" }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: t("contact.breadcrumbs.home"), path: "/" },
              { name: t("contact.breadcrumbs.contact"), path: "/kontakt" },
            ]),
          ),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLanguage();
  return (
    <Section className="pt-28">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={t("contact.page.eyebrow")}
            title={t("contact.page.title")}
            description={t("contact.meta.description")}
          />
          <div className="hairline my-10" />
          <p className="eyebrow">{t("contact.page.emailLabel")}</p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-3 block text-sm text-foreground/70 transition-colors hover:text-gold"
          >
            {SITE.email}
          </a>
          <p className="eyebrow mt-10">{t("contact.page.languagesLabel")}</p>
          <p className="mt-3 text-sm text-foreground/70">{t("contact.page.languagesValue")}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
