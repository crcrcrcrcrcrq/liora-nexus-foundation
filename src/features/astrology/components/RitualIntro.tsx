import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

/** Etap 1 — ekran wprowadzający do rytuału. */
export function RitualIntro({ onBegin }: { onBegin: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">{t("astrology.ritual.intro.eyebrow")}</p>
      <h2 className="mt-6 text-balance font-display text-[1.875rem] leading-[1.15] text-foreground sm:text-[2.5rem] lg:text-[3rem]">
        {t("astrology.ritual.intro.title")}
      </h2>
      <p className="mt-6 text-pretty text-[0.9375rem] leading-[1.8] text-foreground/60 sm:text-base lg:text-lg">
        {t("astrology.ritual.intro.description")}
      </p>
      <Button variant="gold" size="lg" className="mt-12" onClick={onBegin}>
        {t("astrology.ritual.intro.cta")}
      </Button>
    </div>
  );
}
