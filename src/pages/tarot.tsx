import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { TarotDeck } from "@/features/tarot/components/TarotDeck";
import { majorArcana } from "@/features/tarot/model/deck";
import { tarotSpreads } from "@/features/tarot/model/spreads";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";

export const page = definePage({
  path: "/tarot",
  head: () => ({
    meta: buildMeta({
      title: t("tarot.meta.title"),
      description: t("tarot.meta.description"),
      path: "/tarot",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("tarot.breadcrumbs.home"), path: "/" },
            { name: t("tarot.breadcrumbs.tarot"), path: "/tarot" },
          ]),
        ),
      },
    ],
  }),
  component: TarotPage,
});

function TarotPage() {
  const { t: tt } = useLanguage();

  return (
    <>
      <Section className="pt-28">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={tt("tarot.hero.eyebrow")}
            title={tt("tarot.hero.title")}
            description={tt("tarot.meta.description")}
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-16">
          <TarotDeck />
        </Reveal>
      </Section>

      <div className="hairline" />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow={tt("tarot.methodSection.eyebrow")}
            title={tt("tarot.methodSection.title")}
            description={tt("tarot.methodSection.description")}
          />
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {tarotSpreads().map((spread, index) => (
            <Reveal key={spread.id} delay={index * 0.08}>
              <div>
                <p className="font-display text-5xl text-gold/30">0{index + 1}</p>
                <h3 className="mt-4 font-display text-2xl text-foreground">{spread.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/55">
                  {spread.description}
                </p>
                <ul className="mt-5 grid gap-2">
                  {spread.positions.map((position) => (
                    <li key={position.key} className="text-xs leading-relaxed text-foreground/55">
                      <span className="text-gold/70">{position.label}</span> — {position.hint}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="hairline" />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow={tt("tarot.deckSection.eyebrow")}
            title={tt("tarot.deckSection.title")}
            description={tt("tarot.deckSection.description")}
          />
        </Reveal>
        <div className="mt-14 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {majorArcana().map((card) => (
            <div key={card.id} className="border-b border-border pb-5">
              <p className="text-sm text-foreground">
                <span className="mr-3 text-gold/70">{card.roman}</span>
                {card.name}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                {card.keywords.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
