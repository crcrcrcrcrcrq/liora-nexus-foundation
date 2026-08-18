import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

/** Krok 2 — potwierdzenie bez technicznych szczegółów i bez ujawniania, czy adres istnieje. */
export function MagicLinkSent({ onAgain }: { onAgain: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-8">
      <p className="text-sm leading-relaxed text-foreground/70">
        {t("auth.magicLink.sent.description")}
      </p>
      <div className="hairline" />
      <p className="text-xs leading-relaxed text-foreground/55">{t("auth.magicLink.sent.note")}</p>
      <Button type="button" variant="ghost" onClick={onAgain} className="justify-self-start">
        {t("auth.magicLink.sent.again")}
      </Button>
    </div>
  );
}
