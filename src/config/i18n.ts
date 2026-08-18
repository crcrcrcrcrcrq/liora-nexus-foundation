import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { pl } from "@/locales/pl";
import { en } from "@/locales/en";

/**
 * Jedyny system tłumaczeń w projekcie (i18next + react-i18next).
 *
 * • słowniki: `src/locales/<lang>/<namespace>.ts` (kontrakt: typ `Dictionary` z `locales/pl`),
 * • inicjalizacja: wyłącznie ten plik, importowany raz w `src/routes/__root.tsx`,
 * • dostęp w komponentach: hook `useLanguage()` (`src/hooks/useLanguage.ts`),
 * • dostęp poza Reactem (np. `head()` tras): `translate()` z `src/lib/i18n.ts`.
 *
 * Dokumentacja: `docs/i18n.md`.
 */

export const SUPPORTED_LANGUAGES = ["pl", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "pl";

/** Tag języka używany w atrybucie `lang`, `og:locale` i `hreflang`. */
export const LANGUAGE_TAGS: Record<Language, { html: string; og: string }> = {
  pl: { html: "pl", og: "pl_PL" },
  en: { html: "en", og: "en_US" },
};

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18next;
