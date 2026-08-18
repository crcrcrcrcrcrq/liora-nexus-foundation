import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { TimelineEvent } from "../model/types";

/**
 * Timeline dnia. To nie jest log systemowy — to historia wydarzeń zapisana
 * zdaniami. Każdy wiersz da się przeczytać na głos bez zażenowania.
 */
export function Timeline({ events }: { events: readonly TimelineEvent[] }) {
  const { t } = useLanguage();
  const reduced = useReducedMotion();

  return (
    <ol className="relative grid gap-8 border-l border-border/70 pl-6">
      {events.map((event, index) => (
        <motion.li
          key={event.id}
          className="relative"
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            aria-hidden
            className={cn(
              "absolute -left-[1.6rem] top-2 size-1.5 rounded-full",
              event.tone === "system" ? "bg-foreground/30" : "bg-gold/70",
            )}
          />
          <p className="font-mono text-xs tracking-[0.12em] text-foreground/40">{event.at}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/75">{event.sentence}</p>
        </motion.li>
      ))}
      {events.length === 0 ? (
        <li className="text-sm text-foreground/45">{t("experience.activity.quiet")}</li>
      ) : null}
    </ol>
  );
}
