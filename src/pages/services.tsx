import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { services } from "@/features/booking/model/services";
import { usePublicServices } from "@/features/services/hooks/useServices";
import { EmptyState, ErrorState, LoadingState } from "@/components/state/States";
import { formatPrice } from "@/utils/format";
import { buildMeta, breadcrumbSchema, serviceSchema } from "@/utils/seo";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const page = definePage({
  path: "/uslugi",
  head: () => ({
    meta: buildMeta({
      title: t("services.meta.title"),
      description: t("services.meta.description"),
      path: "/uslugi",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("services.breadcrumbs.home"), path: "/" },
            { name: t("services.breadcrumbs.services"), path: "/uslugi" },
          ]),
        ),
      },
      ...services().map((service) => ({
        type: "application/ld+json",
        children: JSON.stringify(
          serviceSchema({
            name: service.title,
            description: service.summary,
            price: service.price,
            currency: service.currency,
            path: "/uslugi",
          }),
        ),
      })),
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useLanguage();
  const description = t("services.meta.description");
  const { offers, isLoading, isError } = usePublicServices();

  return (
    <>
      <Section className="pt-28">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={t("services.hero.eyebrow")}
            title={t("services.hero.title")}
            description={description}
          />
        </Reveal>

        {isLoading ? <LoadingState label={t("services.states.loading")} /> : null}
        {!isLoading && isError ? <ErrorState title={t("services.states.error")} /> : null}
        {!isLoading && !isError && offers.length === 0 ? (
          <EmptyState title={t("services.states.empty")} />
        ) : null}

        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          {offers.map(({ offer: service, ctaPath, ctaLabel }, index) => (
            <Reveal key={service.slug} delay={index * 0.06}>
              <article className="glass flex h-full flex-col rounded-sm p-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow">{service.duration}</p>
                    <h2 className="mt-4 font-display text-3xl text-foreground">{service.title}</h2>
                  </div>
                  <p className="font-display text-2xl whitespace-nowrap text-gold">
                    {formatPrice(service.price, service.currency)}
                  </p>
                </div>

                <p className="mt-6 text-sm leading-relaxed text-foreground/55">{service.summary}</p>

                <div className="hairline my-8" />

                <ul className="flex-1 space-y-3">
                  {service.includes.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-foreground/60">
                      <span className="text-gold/60">—</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={service.featured ? "gold" : "outline"}
                  className="mt-10 self-start"
                >
                  <Link to={ctaPath}>
                    {ctaLabel ||
                      (service.price === 0 ? t("services.tryNowButton") : t("services.bookButton"))}
                  </Link>
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
