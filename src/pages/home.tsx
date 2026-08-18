import { lazy, Suspense } from "react";
import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { SITE } from "@/config/site";
import { buildMeta, personSchema, organizationSchema, localBusinessSchema } from "@/utils/seo";
import { services } from "@/features/booking/model/services";
import { usePublicServices } from "@/features/services/hooks/useServices";
import { listPosts } from "@/features/library/api/library.service";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Hero } from "@/components/landing/Hero";
import { SkeletonBlock } from "@/components/state/States";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/utils/format";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

/** Talia jest ciężka i interaktywna — ładuje się osobnym chunkiem. */
const TarotDeck = lazy(() =>
  import("@/features/tarot/components/TarotDeck").then((module) => ({
    default: module.TarotDeck,
  })),
);

function DeckFallback() {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-11 lg:gap-3">
      {Array.from({ length: 22 }).map((_, index) => (
        <SkeletonBlock key={index} className="aspect-[2/3]" />
      ))}
    </div>
  );
}

export const page = definePage({
  path: "/",
  head: () => ({
    meta: buildMeta({
      title: t("landing.meta.title"),
      description: t("landing.meta.description"),
      path: "/",
    }),
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(personSchema()) },
      { type: "application/ld+json", children: JSON.stringify(organizationSchema()) },
      { type: "application/ld+json", children: JSON.stringify(localBusinessSchema()) },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: "/",
          inLanguage: "pl-PL",
          description: t("landing.meta.description"),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  const { offers } = usePublicServices();
  const featured = offers
    .filter((item) => item.isBookable)
    .map((item) => item.offer)
    .slice(0, 3);
  const posts = listPosts().slice(0, 3);

  return (
    <>
      <Hero />

      <div className="hairline" />

      <Section id="tarot" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow={t("landing.tarotSection.eyebrow")}
            title={t("landing.tarotSection.title")}
            description={t("landing.tarotSection.description")}
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-14 sm:mt-16 lg:mt-24">
          <Suspense fallback={<DeckFallback />}>
            <TarotDeck />
          </Suspense>
        </Reveal>
        <Reveal delay={0.15} className="mt-16 flex justify-center lg:mt-24">
          <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
            <Link to="/tarot">{t("landing.tarotSection.fullReadingButton")}</Link>
          </Button>
        </Reveal>
      </Section>

      <div className="hairline" />

      <Section id="uslugi" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow={t("landing.servicesSection.eyebrow")}
            title={t("landing.servicesSection.title")}
            description={t("landing.servicesSection.description")}
          />
        </Reveal>
        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:mt-24 lg:grid-cols-3 lg:gap-8">
          {featured.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.1} className="h-full">
              <article className="glass flex h-full flex-col rounded-sm p-7 transition-colors duration-700 ease-[var(--ease-luxe)] hover:border-gold/40 sm:p-8 lg:p-10">
                <p className="eyebrow">{service.duration}</p>
                <h3 className="mt-6 text-balance font-display text-[1.625rem] leading-[1.25] text-foreground lg:text-[1.875rem]">
                  {service.title}
                </h3>
                <p className="mt-5 flex-1 text-pretty text-[0.9375rem] leading-[1.8] text-foreground/60">
                  {service.summary}
                </p>
                <p className="mt-9 font-display text-xl tracking-[0.02em] text-gold">
                  {formatPrice(service.price, service.currency)}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-16 flex justify-center lg:mt-24">
          <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
            <Link to="/uslugi">{t("landing.servicesSection.fullPriceListButton")}</Link>
          </Button>
        </Reveal>
      </Section>

      <div className="hairline" />

      <Section id="biblioteka" className="scroll-mt-28">
        <Reveal>
          <SectionHeading
            eyebrow={t("landing.blogSection.eyebrow")}
            title={t("landing.blogSection.title")}
          />
        </Reveal>
        <div className="mt-14 grid gap-12 sm:mt-16 sm:grid-cols-2 sm:gap-10 lg:mt-24 lg:grid-cols-3 lg:gap-14">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.1}>
              <article>
                <p className="eyebrow">{post.category}</p>
                <h3 className="mt-5 text-balance font-display text-[1.625rem] leading-[1.25] text-foreground">
                  <Link
                    to="/biblioteka/$slug"
                    params={{ slug: post.slug }}
                    className="rounded-sm outline-none transition-colors duration-500 ease-[var(--ease-luxe)] hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-4 text-pretty text-[0.9375rem] leading-[1.8] text-foreground/60">
                  {post.excerpt}
                </p>
                <p className="mt-6 text-[0.6875rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                  {formatDate(post.date)} · {post.readingTime} min
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-16 flex justify-center lg:mt-24">
          <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
            <Link to="/biblioteka">{t("landing.blogSection.readJournalButton")}</Link>
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
