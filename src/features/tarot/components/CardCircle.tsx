import { memo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import { getCardById } from "../lib/cards";
import { CARD_H, CARD_W, SCENE, placeInCenter, placeOnCircle } from "../lib/circle";
import type { DeckSlot } from "../lib/deck";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Środek stołu: tekstura, monogram LIORA i instrukcja wyboru. */
function TableCenter({ visible, label }: { visible: boolean; label: string }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 flex size-[360px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/* Delikatna tekstura aksamitnego stołu */}
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,oklch(1_0_0/5%),transparent_70%)]" />
      <span
        className="absolute inset-0 rounded-full opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(1 0 0 / 2.5%) 0px, oklch(1 0 0 / 2.5%) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(-45deg, oklch(0 0 0 / 16%) 0px, oklch(0 0 0 / 16%) 1px, transparent 1px, transparent 6px)",
        }}
      />
      <span className="absolute inset-0 rounded-full border border-gold/10" />

      <span className="relative flex items-center justify-center">
        <span className="absolute size-16 rotate-45 border border-gold/25" />
        <span className="absolute size-11 rotate-45 border border-gold/12" />
        <span className="relative flex items-baseline font-display leading-none text-gold/85">
          <span className="text-2xl">L</span>
          <span className="-ml-[0.18em] text-xl text-gold/60">Y</span>
        </span>
      </span>
      <span className="relative mt-5 text-[0.55rem] uppercase leading-none tracking-[0.42em] text-gold/45">
        Liora Premium Tarot
      </span>

      <span className="relative mt-9 max-w-[15rem] text-balance text-center font-display text-[1.15rem] leading-[1.6] text-foreground/75">
        {label}
      </span>
    </motion.div>
  );
}

/** Pojedynczy rewers w okręgu — memoizowany, by wybór karty nie odświeżał całej talii. */
const CircleCard = memo(function CircleCard({
  entry,
  index,
  total,
  order,
  pickLimit,
  complete,
  active,
  deal,
  reduced,
  onPick,
}: {
  entry: DeckSlot;
  index: number;
  total: number;
  /** Kolejność wyboru (0…n-1) albo -1, gdy karta nie została wskazana. */
  order: number;
  pickLimit: number;
  complete: boolean;
  active: boolean;
  deal: boolean;
  reduced: boolean;
  onPick: (slot: number) => void;
}) {
  const isPicked = order !== -1;
  const disabled = !active || isPicked || complete;
  const place = isPicked
    ? placeInCenter(order, pickLimit)
    : deal
      ? placeOnCircle(index, total)
      : { x: index * 0.6 - 6, y: -index * 0.9, rotate: index * 0.2 };
  const card = getCardById(entry.cardId);

  return (
    <motion.button
      type="button"
      onClick={() => onPick(index)}
      disabled={disabled}
      aria-label={
        isPicked
          ? `Karta ${index + 1} — wybrana jako ${order + 1} z ${pickLimit}`
          : `Wybierz kartę ${index + 1} z ${total}`
      }
      aria-pressed={isPicked}
      className={cn(
        "absolute left-1/2 top-1/2 rounded-[4px] outline-none",
        "focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
      style={{
        width: CARD_W,
        height: CARD_H,
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        zIndex: isPicked ? 60 : index,
        transformStyle: "preserve-3d",
        perspective: 900,
      }}
      initial={false}
      animate={{
        opacity: complete && !isPicked ? 0 : 1,
        x: place.x,
        y: place.y,
        rotate: place.rotate,
        scale: isPicked ? 1.18 : 1,
      }}
      transition={{
        duration: reduced ? 0 : isPicked ? 0.9 : 1.05,
        ease: EASE,
        delay: reduced || isPicked || complete || !deal ? 0 : index * 0.035,
        opacity: { duration: 0.7, ease: EASE, delay: complete ? 0.25 : 0 },
      }}
      {...(disabled || reduced
        ? {}
        : {
            whileHover: { scale: 1.09, y: place.y * 0.94 },
            whileFocus: { scale: 1.09, y: place.y * 0.94 },
          })}
    >
      <span
        className={cn(
          "relative block size-full transition-shadow duration-[250ms] ease-[var(--ease-luxe)]",
          "drop-shadow-[0_14px_28px_oklch(0_0_0/55%)]",
          !disabled && "hover:drop-shadow-[0_26px_46px_oklch(0_0_0/70%)]",
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isPicked && !reduced ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 900ms var(--ease-luxe)",
        }}
      >
        <span
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <CardBack />
        </span>
        <span
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardFront card={card} orientation={entry.orientation} />
        </span>
      </span>
    </motion.button>
  );
});

/**
 * Etap rozkładania i wyboru: 22 rewersy rozłożone w okręgu 300° wokół środka
 * stołu, wybór trzech kart z płynnym obrotem 3D i zanikaniem pozostałych.
 * Komponent wyłącznie prezentuje przekazany stan.
 */
export function CardCircle({
  deck,
  picked,
  pickLimit,
  active,
  deal,
  onPick,
  reduced,
  centerLabel,
}: {
  deck: DeckSlot[];
  picked: number[];
  pickLimit: number;
  active: boolean;
  /** false = karty czekają złożone na środku; true = rozkładają się w okrąg. */
  deal: boolean;
  onPick: (slot: number) => void;
  reduced: boolean;
  centerLabel: string;
}) {
  const complete = picked.length >= pickLimit;

  return (
    <div
      className="perspective-1200 relative"
      style={{ width: SCENE, height: SCENE }}
      role="group"
      aria-label={`Talia ${deck.length} kart ułożona w okrąg`}
    >
      <TableCenter visible={deal && !complete} label={centerLabel} />

      {deck.map((entry, index) => (
        <CircleCard
          key={entry.cardId}
          entry={entry}
          index={index}
          total={deck.length}
          order={picked.indexOf(index)}
          pickLimit={pickLimit}
          complete={complete}
          active={active}
          deal={deal}
          reduced={reduced}
          onPick={onPick}
        />
      ))}
    </div>
  );
}
