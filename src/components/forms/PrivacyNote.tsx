import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Spokojna informacja o prywatności towarzysząca każdemu miejscu,
 * w którym LIORA przyjmuje dane. Jeden ton, jeden wygląd w całym produkcie.
 */
export function PrivacyNote({ tone, className }: { tone: string; className?: string }) {
  const { t } = useLanguage();
  return (
    <p className={cn("text-xs leading-relaxed text-foreground/45", className)}>
      {t(`forms.privacy.${tone}`)}
    </p>
  );
}
