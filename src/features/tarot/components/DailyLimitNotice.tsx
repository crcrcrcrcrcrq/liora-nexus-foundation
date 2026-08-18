import { formatCountdown } from "../lib/dailyLimit";

/**
 * Komunikat po wykorzystaniu dziennego rozkładu — wyłącznie prezentacja.
 */
export function DailyLimitNotice({ msRemaining }: { msRemaining: number }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-2 py-6 text-center">
      <span className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 rotate-45 border border-gold/25" />
        <span className="absolute inset-[6px] rotate-45 border border-gold/12" />
        <span className="font-display text-xl leading-none text-gold/80">L</span>
      </span>

      <h2 className="mt-10 text-balance font-display text-[1.6rem] leading-tight text-foreground sm:text-[2rem]">
        Dzisiejszy rytuał został zakończony.
      </h2>
      <p className="mt-5 text-pretty text-[0.9375rem] leading-[1.85] text-foreground/55">
        Daj kartom odpocząć. Kolejny bezpłatny rozkład otworzy się po północy.
      </p>

      <div className="mt-10 w-full max-w-xs">
        <div className="hairline" />
        <p className="mt-6 text-[0.6rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
          Następne losowanie za
        </p>
        <p
          className="mt-3 font-display text-[2rem] leading-none tabular-nums text-gold/85"
          role="timer"
          aria-live="off"
        >
          {formatCountdown(msRemaining)}
        </p>
      </div>
    </div>
  );
}
