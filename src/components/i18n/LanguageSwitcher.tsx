import { useRouter, useRouterState } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/useLanguage";
import { trackEvent } from "@/lib/analytics/client";
import { switchLocaleHref } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * LIORA P0.22 — przełącznik języka zmienia ADRES, nie tylko stan i18n.
 *
 * URL jest jedynym źródłem prawdy o języku strony publicznej, więc kliknięcie
 * prowadzi na odpowiednik bieżącej trasy (`/pl/uslugi` ↔ `/en/services`).
 * Zapis wyboru w przeglądarce służy tylko przekierowaniom adresów bez prefiksu.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, languages, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="group"
      aria-label={t("common.language")}
    >
      {languages.map((code) => {
        const href = switchLocaleHref(pathname, code);
        return (
          <a
            key={code}
            href={href}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
              event.preventDefault();
              // P0.31 — zdarzenie opisuje docelowy locale z ADRESU, nie z pamięci przeglądarki.
              trackEvent("language_selected", { path: href, locale: code });
              setLanguage(code);
              void router.navigate({ href, replace: false });
            }}
            aria-current={code === language ? "true" : undefined}
            className={cn(
              // P0.33 — pełnowymiarowy cel dotykowy (44×44) i widoczny focus,
              // bez zmiany semantyki: adres pozostaje jedynym źródłem języka.
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-3 text-xs uppercase tracking-[var(--tracking-luxe)] outline-none transition-colors duration-300 ease-[var(--ease-luxe)] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              code === language
                ? "bg-accent/50 text-gold"
                : "text-foreground/50 hover:text-foreground/80",
            )}
          >
            {t(`common.languages.${code}`)}
          </a>
        );
      })}
    </div>
  );
}
