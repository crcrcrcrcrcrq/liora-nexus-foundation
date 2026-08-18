import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

/** Współdzielone stany widoków: ładowanie, błąd, brak danych. */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 animate-spin rounded-full border border-gold/30 border-t-gold",
        className,
      )}
    />
  );
}

export function LoadingState({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 py-12 text-sm text-foreground/55"
    >
      <Spinner />
      {label ?? t("states.loading.default")}
    </div>
  );
}

/** Szkielet treści — używany zamiast pustego ekranu przy leniwym ładowaniu. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-surface-raised", className)} />;
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title?: string;
  description?: string | null;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div role="alert" className="glass animate-fade-in rounded-sm p-9">
      <p className="eyebrow text-foreground/55">{t("states.error.eyebrow")}</p>
      <h3 className="mt-4 font-display text-2xl text-foreground">
        {title ?? t("states.error.title")}
      </h3>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/55">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="ghost" size="sm" className="mt-6" onClick={onRetry}>
          {t("states.error.retry")}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-border/70 p-12 text-center">
      <h3 className="font-display text-2xl text-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/55">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  );
}
