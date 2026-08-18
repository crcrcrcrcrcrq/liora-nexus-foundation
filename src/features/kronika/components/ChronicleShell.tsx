import type { ReactNode } from "react";
import { Link } from "@/components/i18n/LocaleLink";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { PrivacyNote } from "@/components/forms/PrivacyNote";
import { CHRONICLE_SECTIONS } from "../model/sections";

/** Rama Kroniki Duszy: nagłówek powitalny i nawigacja po sekcjach. */
export function ChronicleShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-28 sm:px-8 lg:px-10">
      <nav
        aria-label={t("chronicle.nav.aria")}
        className="-mx-1 mb-12 flex gap-1 overflow-x-auto pb-1"
      >
        {CHRONICLE_SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            activeOptions={{ exact: section.to === "/kronika" }}
            className={cn(
              "inline-flex min-h-11 items-center whitespace-nowrap rounded-sm px-4 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            activeProps={{
              className: "bg-surface-raised text-gold",
              "aria-current": "page",
            }}
          >
            {t(section.labelKey)}
          </Link>
        ))}
      </nav>
      {children}
      <p className="mt-16 text-xs leading-relaxed text-foreground/45">
        {t("chronicle.privacy.line1")} {t("chronicle.privacy.line2")}
      </p>
      <PrivacyNote tone="chronicle" className="mt-3" />
    </div>
  );
}

export function ChronicleHeader({
  eyebrow,
  title,
  lead,
  description,
}: {
  eyebrow: string;
  title: string;
  /** Druga linia nagłówka — ciągłość historii. */
  lead?: string;
  description: string;
}) {
  return (
    <header className="border-b border-border pb-10">
      <p className="eyebrow text-foreground/55">{eyebrow}</p>
      <h1 className="mt-6 font-display text-4xl leading-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      {lead ? (
        <p className="mt-3 font-display text-2xl leading-tight text-foreground/55 sm:text-3xl">
          {lead}
        </p>
      ) : null}
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/55">{description}</p>
    </header>
  );
}

/** Kafel sekcji przygotowany pod dane z backendu. */
export function ChronicleCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-sm p-8", className)}>
      <p className="eyebrow text-foreground/55">{title}</p>
      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-foreground/55">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

/** Spokojny stan „jeszcze nic tu nie ma” — bez języka technicznego. */
export function ChroniclePlaceholder({ note }: { note: string }) {
  return <p className="text-sm leading-relaxed text-foreground/55">{note}</p>;
}
