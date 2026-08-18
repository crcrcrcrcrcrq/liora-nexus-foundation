import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("px-6 py-24 sm:px-8 sm:py-28 lg:px-10 lg:py-40", className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as = "h2",
}: SectionHeadingProps) {
  const Tag = as;
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Tag className="mt-6 text-balance font-display text-[2.125rem] leading-[1.12] tracking-[-0.005em] text-foreground sm:text-[2.75rem] lg:text-5xl lg:leading-[1.08]">
        {title}
      </Tag>
      {description ? (
        <p className="mt-6 max-w-xl text-pretty text-[0.9375rem] leading-[1.8] text-foreground/60 sm:mt-7 sm:text-base lg:text-lg lg:leading-[1.8]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
