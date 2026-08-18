import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Dyskretna adnotacja pod nagłówkiem sekcji.
 * Dopóki Kronika się otwiera, mówi o oczekiwaniu; potem — że to jeszcze
 * nie jest Twój ślad, tylko jego kształt.
 */
export function SampleNotice({ note, isLoading = false }: { note: string; isLoading?: boolean }) {
  const { t } = useLanguage();
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "animate-fade-in text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55",
        isLoading && "animate-pulse",
      )}
    >
      {isLoading ? t("chronicle.sampleNotice.loading") : note}
    </p>
  );
}
