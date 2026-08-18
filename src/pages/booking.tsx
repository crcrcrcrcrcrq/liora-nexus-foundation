import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { BookingForm } from "@/features/booking/components/BookingForm";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/rezerwacja",
  head: () => {
    const title = t("booking.meta.title");
    const description = t("booking.meta.description");
    return {
      meta: buildMeta({ title, description, path: "/rezerwacja" }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: t("booking.breadcrumb.home"), path: "/" },
              { name: t("booking.breadcrumb.booking"), path: "/rezerwacja" },
            ]),
          ),
        },
      ],
    };
  },
  component: BookingPage,
});

function BookingPage() {
  const { t } = useLanguage();
  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("booking.page.eyebrow")}
          title={t("booking.page.title")}
          description={t("booking.meta.description")}
        />
      </Reveal>
      <Reveal delay={0.1} className="mt-16 max-w-2xl">
        <BookingForm />
      </Reveal>
    </Section>
  );
}
