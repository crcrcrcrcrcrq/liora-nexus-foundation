import i18next, { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import {
  matchPublicRoute,
  stripLocalePrefix,
  translateRoutePath,
  withLocalePrefix,
} from "@/config/routes";

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };
export type { Language };

/* ------------------------------------------------------------------ */
/* P0.22 — aktywny język żądania/renderu.                              */
/* ------------------------------------------------------------------ */

/**
 * Język wynikający z adresu URL. Ustawiany przez warstwę tras (`/pl`, `/en`)
 * ZANIM cokolwiek się wyrenderuje — również na serwerze. To on, a nie
 * localStorage, decyduje o języku publicznej strony.
 */
let activeLanguage: Language = DEFAULT_LANGUAGE;

export function getActiveLanguage(): Language {
  return activeLanguage;
}

/** Ustawia język aktywny dla renderu i dla `translate()` poza Reactem. */
export function setActiveLanguage(language: Language): void {
  activeLanguage = language;
  if (i18next.language !== language) void i18next.changeLanguage(language);
}

/**
 * Tłumaczenie poza drzewem Reacta (route `head()`, JSON-LD, sitemap, serwisy).
 * W komponentach zawsze używaj `useLanguage()`.
 */
export function translate(
  key: string,
  options?: Record<string, unknown> & { lng?: Language },
): string {
  return i18next.t(key, { lng: activeLanguage, ...options }) as string;
}

/** Tłumacz przypięty do konkretnego języka (`/pl` vs `/en`). */
export function translator(language: Language = DEFAULT_LANGUAGE) {
  return (key: string, options?: Record<string, unknown>) =>
    translate(key, { ...options, lng: language });
}

/* ------------------------------------------------------------------ */
/* Routing wielojęzyczny — prefiksy /pl i /en (P0.22).                 */
/* ------------------------------------------------------------------ */

/** Prefiksy językowe są aktywne od P0.22. */
export const LOCALE_PREFIX_ENABLED = true;

/** Wyciąga język z adresu (`/en/services` → `en`); brak prefiksu → domyślny. */
export function readLocale(pathname: string): Language {
  const segment = pathname.split("/").filter(Boolean)[0];
  return SUPPORTED_LANGUAGES.includes(segment as Language)
    ? (segment as Language)
    : DEFAULT_LANGUAGE;
}

/** Usuwa prefiks języka z adresu (`/en/services` → `/services`). */
export function stripLocale(pathname: string): string {
  return stripLocalePrefix(pathname);
}

/**
 * Buduje adres publiczny w danym języku.
 * Przyjmuje ścieżkę kanoniczną (PL) albo adres w dowolnym języku.
 */
export function localizePath(pathname: string, language: Language = activeLanguage): string {
  return withLocalePrefix(stripLocalePrefix(pathname), language);
}

/** Ten sam adres bez prefiksu, ale w slugach danego języka. */
export function translatePath(pathname: string, language: Language = activeLanguage): string {
  return translateRoutePath(stripLocalePrefix(pathname), language);
}

/**
 * Zestaw `hreflang` dla trasy. Generujemy go wyłącznie dla stron publicznych
 * znanych z mapy tras — nigdy dla adresów, które nie istnieją.
 */
export function alternateLinks(pathname: string) {
  const clean = stripLocalePrefix(pathname);
  const matched = matchPublicRoute(clean);
  if (!matched || matched.route.private) return [];

  return [
    ...SUPPORTED_LANGUAGES.map((language) => ({
      rel: "alternate",
      hrefLang: language,
      href: localizePath(clean, language),
    })),
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: localizePath(clean, DEFAULT_LANGUAGE),
    },
  ];
}
