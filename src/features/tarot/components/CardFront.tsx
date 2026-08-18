import { memo } from "react";
import { cn } from "@/lib/utils";
import { CardGlyph } from "./CardGlyph";
import type { TarotCard, TarotOrientation } from "../model/types";

/**
 * Awers autorskiej talii LIORA: numer, nazwa, ilustracja i złota ramka.
 * Wyłącznie prezentacja — dane pochodzą z modelu.
 */
function CardFrontBase({
  card,
  orientation,
  className,
}: {
  card: TarotCard;
  orientation: TarotOrientation;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute inset-0 flex flex-col overflow-hidden rounded-[4px] border border-gold/40",
        "bg-[linear-gradient(170deg,oklch(0.245_0.008_83)_0%,oklch(0.18_0.003_83)_60%,oklch(0.21_0.006_83)_100%)]",
        "shadow-[inset_0_1px_0_oklch(1_0_0/7%)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-[5px] rounded-[2px] border border-gold/25" />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,oklch(1_0_0/7%),transparent_60%)]" />

      <span className="relative flex items-center justify-between px-[9%] pt-[7%]">
        <span className="text-[0.5rem] leading-none tracking-[0.3em] text-gold/70 sm:text-[0.6rem]">
          {card.roman}
        </span>
        <span
          className={cn(
            "size-1.5 rotate-45 border border-gold/50",
            orientation === "reversed" && "bg-gold/40",
          )}
        />
      </span>

      <span
        className={cn(
          "relative flex flex-1 items-center justify-center px-[16%] py-[6%] text-gold/80",
          orientation === "reversed" && "rotate-180",
        )}
      >
        <CardGlyph id={card.id} className="h-full w-full" />
      </span>

      <span className="relative px-[8%] pb-[8%] text-center">
        <span className="mx-auto mb-[6%] block h-px w-1/2 bg-[var(--gradient-hairline)]" />
        <span className="block font-display text-[0.72rem] leading-tight text-ivory sm:text-[0.9rem]">
          {card.name}
        </span>
      </span>
    </span>
  );
}

/** Awers zależy wyłącznie od karty i jej pozycji — memoizacja stabilizuje okrąg. */
export const CardFront = memo(CardFrontBase);
