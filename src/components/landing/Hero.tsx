import { Link } from "@/components/i18n/LocaleLink";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalytics } from "@/hooks/useAnalytics";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hero landing page — spokojna, luksusowa kompozycja z dużą ilością przestrzeni. */
export function Hero() {
  const reduced = useReducedMotion();
  const { t } = useLanguage();
  const { track } = useAnalytics();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.2, delay, ease: EASE },
        };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Delikatne światło i gradient tła */}
      <div aria-hidden className="hero-light pointer-events-none absolute inset-0 -z-10" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-18rem] -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px] sm:h-[46rem] sm:w-[46rem]"
        initial={reduced ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
      />

      <div className="mx-auto flex min-h-[84svh] max-w-7xl flex-col justify-center px-6 pb-24 pt-32 sm:min-h-[90svh] sm:px-8 sm:pb-36 sm:pt-44 lg:px-10 lg:pb-48 lg:pt-52">
        <motion.p {...rise(0)} className="eyebrow">
          {t("landing.hero.eyebrow", { year: SITE.founded })}
        </motion.p>

        <motion.h1
          {...rise(0.12)}
          className="mt-8 max-w-[18ch] text-balance font-display text-[2.9rem] leading-[1.06] tracking-[-0.015em] text-foreground sm:mt-10 sm:max-w-[20ch] sm:text-[4.25rem] sm:leading-[1.03] lg:text-[5.5rem] xl:text-[6.25rem]"
        >
          {t("landing.hero.title", {
            interpolation: { escapeValue: false },
          })
            .split(/<gold>|<\/gold>/)
            .map((part, index) =>
              index === 1 ? (
                <span key={index} className="text-gold-gradient">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
        </motion.h1>

        <motion.p
          {...rise(0.24)}
          className="mt-8 max-w-md text-pretty text-[0.9375rem] leading-[1.85] text-foreground/60 sm:mt-10 sm:max-w-xl sm:text-lg sm:leading-[1.8] lg:text-xl lg:leading-[1.75]"
        >
          {t("landing.hero.description")}
        </motion.p>

        <motion.div
          {...rise(0.36)}
          className="mt-12 flex flex-col items-stretch gap-3 sm:mt-16 sm:flex-row sm:items-center sm:gap-5"
        >
          <Button asChild variant="gold" size="lg" className="group w-full sm:w-auto">
            <Link
              to="/rezerwacja"
              onClick={() => track("cta_click", { variant: "booking", surface: "home_hero" })}
            >
              {t("landing.hero.bookButton")}
              <ArrowRight className="transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
            <Link
              to="/tarot"
              onClick={() => track("cta_click", { variant: "tarot", surface: "home_hero" })}
            >
              {t("landing.hero.freeReadingButton")}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
