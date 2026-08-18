import { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * Rewers autorskiej talii LIORA — ciemne matowe tło, tłoczona tekstura
 * luksusowego papieru, złota ramka, monogram L/Y i sygnatura marki.
 * Wyłącznie prezentacja.
 */
function CardBackBase({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[4px] border border-gold/30",
        "bg-[linear-gradient(155deg,oklch(0.225_0.006_83)_0%,oklch(0.165_0.002_83)_45%,oklch(0.205_0.006_83)_100%)]",
        "shadow-[inset_0_1px_0_oklch(1_0_0/6%),inset_0_-1px_0_oklch(0_0_0/50%)]",
        className,
      )}
    >
      {/* Tłoczona tekstura — splot luksusowego papieru */}
      <span
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(1 0 0 / 3.5%) 0px, oklch(1 0 0 / 3.5%) 1px, transparent 1px, transparent 7px), repeating-linear-gradient(-45deg, oklch(0 0 0 / 22%) 0px, oklch(0 0 0 / 22%) 1px, transparent 1px, transparent 7px)",
        }}
      />
      {/* Miękkie światło od góry */}
      <span className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_-10%,oklch(1_0_0/8%),transparent_65%)]" />

      {/* Subtelna złota ramka — podwójna linia */}
      <span className="absolute inset-[5px] rounded-[2px] border border-gold/35" />
      <span className="absolute inset-[9px] rounded-[1px] border border-gold/12" />

      {/* Monogram LY + sygnatura marki */}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-[7%]">
        <span className="relative flex items-center justify-center">
          <span className="absolute size-[58%] min-h-10 min-w-10 rotate-45 border border-gold/30" />
          <span className="absolute size-[40%] min-h-6 min-w-6 rotate-45 border border-gold/15" />
          <span className="relative flex items-baseline font-display leading-none text-gold/85">
            <span className="text-[1.25rem] sm:text-[1.5rem]">L</span>
            <span className="-ml-[0.18em] text-[1.05rem] text-gold/60 sm:text-[1.25rem]">Y</span>
          </span>
        </span>
        <span className="flex flex-col items-center gap-[3px]">
          <span className="text-[0.4rem] uppercase leading-none tracking-[0.4em] text-gold/50 sm:text-[0.46rem]">
            Liora
          </span>
          <span className="text-[0.3rem] uppercase leading-none tracking-[0.32em] text-gold/30 sm:text-[0.34rem]">
            Premium Tarot
          </span>
        </span>
      </span>

      {/* Narożniki */}
      {[
        "left-[9px] top-[9px]",
        "right-[9px] top-[9px] rotate-90",
        "right-[9px] bottom-[9px] rotate-180",
        "left-[9px] bottom-[9px] -rotate-90",
      ].map((position) => (
        <span
          key={position}
          className={cn("absolute size-2 border-l border-t border-gold/40", position)}
        />
      ))}
    </span>
  );
}

/** Rewers jest czysto statyczny — memoizacja odcina zbędne renderowania 22 kart. */
export const CardBack = memo(CardBackBase);
