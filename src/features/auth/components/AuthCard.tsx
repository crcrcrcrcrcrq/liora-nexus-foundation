import type { ReactNode } from "react";

/** Wspólna, spokojna oprawa ekranów powrotu do Kroniki. */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="glass mx-auto w-full max-w-md rounded-sm p-8 sm:p-10">
      <p className="eyebrow text-foreground/55">{eyebrow}</p>
      <h1 className="mt-6 font-display text-3xl leading-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/55">{description}</p>
      {children ? <div className="mt-10">{children}</div> : null}
      {footer ? <div className="mt-8 border-t border-border pt-6">{footer}</div> : null}
    </div>
  );
}
