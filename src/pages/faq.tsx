import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/constants/faq";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import { buildMeta, breadcrumbSchema, faqSchema } from "@/utils/seo";

export const page = definePage({
  path: "/faq",
  head: () => ({
    meta: buildMeta({
      title: t("faq.meta.title"),
      description: t("faq.meta.description"),
      path: "/faq",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          faqSchema(
            FAQ_ITEMS.map((item) => ({
              question: t(item.questionKey),
              answer: t(item.answerKey),
            })),
          ),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("faq.breadcrumbs.home"), path: "/" },
            { name: t("faq.breadcrumbs.faq"), path: "/faq" },
          ]),
        ),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useLanguage();
  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("faq.page.eyebrow")}
          title={t("faq.page.title")}
          description={t("faq.meta.description")}
        />
      </Reveal>

      <Reveal delay={0.1} className="mt-14 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.questionKey} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-display text-lg text-foreground">
                {t(item.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/55">
                {t(item.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  );
}
