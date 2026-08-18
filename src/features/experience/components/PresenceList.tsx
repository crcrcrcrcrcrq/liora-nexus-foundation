import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { relativeDay } from "../lib/format";
import type { Presence } from "../model/types";

/**
 * Lista obecności. Bez kolumn CRM, bez numerów ID — jedynym kluczem osoby
 * jest prywatny identyfikator LIORA.
 */
export function PresenceList({
  people,
  selectedId,
  onSelect,
}: {
  people: readonly Presence[];
  selectedId?: string;
  onSelect?: (lioraId: string) => void;
}) {
  const { t, language } = useLanguage();

  return (
    <ul className="grid gap-2">
      {people.map((person) => {
        const active = person.lioraId === selectedId;
        return (
          <li key={person.lioraId}>
            <button
              type="button"
              onClick={() => onSelect?.(person.lioraId)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-sm border border-transparent px-4 py-4 text-left transition-colors duration-500 ease-[var(--ease-luxe)]",
                active ? "border-border bg-surface-raised" : "hover:border-border/60",
              )}
            >
              <span className="font-mono text-sm tracking-[0.12em] text-gold">
                {person.lioraId}
              </span>
              {person.tier ? (
                <span className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
                  {t(`experience.people.tiers.${person.tier}`)}
                </span>
              ) : null}
              {typeof person.visits === "number" ? (
                <span className="text-xs text-foreground/50">
                  {t("experience.people.visits", { count: person.visits })}
                </span>
              ) : null}
              <span className="text-xs text-foreground/50">
                {relativeDay(person.lastSeenAt, language)}
              </span>
              {person.contact ? (
                <span
                  className={cn(
                    "text-xs",
                    person.contact === "awaiting" ? "text-gold" : "text-foreground/40",
                  )}
                >
                  {t(`experience.people.contact.${person.contact}`)}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
