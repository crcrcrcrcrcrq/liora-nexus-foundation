import { Link } from "@/components/i18n/LocaleLink";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import { cardMeaning, orientationLabel, shortMeaning } from "../lib/cards";
import { positionOf } from "../lib/spread";
import { ReadingReflection } from "./ReadingReflection";
import type { DrawnCard, TarotReading, TarotSpread } from "../model/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Pojedyncza odkryta karta: obrót 3D i subtelne światło po złotej ramce. */
function RevealedCard({
  drawn,
  spread,
  index,
  reduced,
  width,
  height,
}: {
  drawn: DrawnCard;
  spread: TarotSpread;
  index: number;
  reduced: boolean;
  width: number;
  height: number;
}) {
  const position = positionOf(spread, drawn.positionKey);
  const delay = 0.2 + index * 0.45;

  return (
    <motion.article
      className="flex w-full max-w-[19rem] flex-col items-center text-center"
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: delay * 0.6 }}
    >
      <p className="eyebrow">
        Karta {["I", "II", "III", "IV", "V"][index] ?? index + 1} · {position?.label}
      </p>

      <div className="perspective-1200 mt-5" style={{ width, height }}>
        <motion.div
          className="preserve-3d relative size-full"
          initial={reduced ? false : { rotateY: 180 }}
          animate={{ rotateY: 0 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: EASE, delay }}
        >
          <div className="backface-hidden absolute inset-0 shadow-[var(--shadow-luxe)]">
            <CardFront card={drawn.card} orientation={drawn.orientation} />
            {/* Subtelne światło przesuwające się po złotej ramce */}
            {reduced ? null : (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4px]"
              >
                <motion.span
                  className="absolute -inset-y-8 w-1/3 bg-[linear-gradient(105deg,transparent,oklch(1_0_0/12%),transparent)]"
                  initial={{ x: "-140%" }}
                  animate={{ x: "260%" }}
                  transition={{ duration: 1.5, ease: EASE, delay: delay + 0.6 }}
                />
              </motion.span>
            )}
          </div>
          <div className="backface-hidden rotate-y-180 absolute inset-0">
            <CardBack />
          </div>
        </motion.div>
      </div>

      <h3 className="mt-7 font-display text-[1.5rem] leading-tight text-foreground">
        <span className="mr-2 text-gold/70">{drawn.card.roman}</span>
        {drawn.card.name}
      </h3>
      <p className="mt-2 text-[0.65rem] uppercase tracking-[var(--tracking-luxe)] text-gold/75">
        {shortMeaning(drawn)}
      </p>
      <p className="mt-1 text-[0.65rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {orientationLabel(drawn.orientation)}
      </p>
      <div className="hairline my-5" />
      <p className="text-pretty text-[0.9rem] leading-[1.85] text-foreground/65">
        {cardMeaning(drawn)}
      </p>
    </motion.article>
  );
}

/** Wynik sesji: trzy odkryte karty, interpretacja całości i zaproszenie do pełnego czytania. */
export function ReadingResult({
  reading,
  spread,
  interpretation,
  reduced,
  width,
  height,
  onRestart,
  className,
}: {
  reading: TarotReading;
  spread: TarotSpread;
  interpretation: string;
  reduced: boolean;
  width: number;
  height: number;
  onRestart: () => void;
  className?: string;
}) {
  const outroDelay = 0.2 + reading.cards.length * 0.45 + 1.2;

  return (
    <div className={cn("", className)}>
      <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-16 sm:gap-x-14">
        {reading.cards.map((drawn, index) => (
          <RevealedCard
            key={drawn.card.id}
            drawn={drawn}
            spread={spread}
            index={index}
            reduced={reduced}
            width={width}
            height={height}
          />
        ))}
      </div>

      <motion.div
        className="glass mx-auto mt-20 max-w-3xl rounded-sm p-8 text-center shadow-[var(--shadow-luxe)] sm:p-12"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: reduced ? 0 : outroDelay }}
      >
        <p className="eyebrow">Interpretacja rozkładu</p>
        <p className="mt-6 text-pretty text-[1.0625rem] leading-[1.9] text-foreground/75">
          {interpretation}
        </p>
      </motion.div>

      <ReadingReflection reading={reading} spread={spread} interpretation={interpretation} />

      <motion.div
        className="mx-auto mt-16 max-w-2xl text-center"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: reduced ? 0 : outroDelay + 0.35 }}
      >
        <div className="hairline" />
        <h3 className="mt-10 text-balance font-display text-[1.75rem] leading-tight text-foreground sm:text-[2.125rem]">
          Poznaj pełną interpretację swojej sytuacji.
        </h3>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-[0.9375rem] leading-[1.85] text-foreground/55">
          Bezpłatny rozkład pokazuje kierunek. Pełne czytanie osadza go w twojej historii, pytaniu i
          decyzji, przed którą stoisz.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="gold" size="lg">
            <Link to="/kontakt">Poznaj pełną interpretację</Link>
          </Button>
          <Button variant="ghost" size="lg" onClick={onRestart}>
            Nowy rozkład
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
