import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Kafel Sanktuarium. Ten sam materiał co na stronie głównej: szkło, hairline,
 * spokojne wejście. Bez metryk, bez wykresów, bez języka panelu.
 */
export function SanctuaryCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  index = 0,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
  footer?: ReactNode;
  index?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      className={cn("glass flex flex-col rounded-sm p-8 sm:p-10", className)}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: Math.min(index * 0.08, 0.32), ease: EASE }}
    >
      <p className="eyebrow text-foreground/55">{eyebrow}</p>
      <h2 className="mt-6 font-display text-2xl leading-snug text-foreground sm:text-[1.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-xl text-sm leading-[1.9] text-foreground/55">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
      {footer ? <div className="mt-8">{footer}</div> : null}
    </motion.section>
  );
}
