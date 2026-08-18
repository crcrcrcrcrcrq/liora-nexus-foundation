import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import { localizePath } from "@/lib/i18n";

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
export type { Language };

/** Klucz pamięci przeglądarki — wybór języka przetrwa odświeżenie strony. */
const STORAGE_KEY = "liora.language";

interface LanguageState {
  language: Language;
  languages: readonly Language[];
  t: ReturnType<typeof useTranslation>["t"];
  setLanguage: (next: Language) => void;
  toggleLanguage: () => void;
  /** Adres tej samej trasy w wybranym języku (gotowe pod `/pl` i `/en`). */
  pathFor: (pathname: string, language?: Language) => string;
}

/**
 * Jedyny punkt dostępu do warstwy tłumaczeń w komponentach UI.
 * Komponenty nie importują `react-i18next` ani `i18next` bezpośrednio.
 */
export function useLanguage(): LanguageState {
  const { t, i18n } = useTranslation();
  const language = (
    SUPPORTED_LANGUAGES.includes(i18n.language as Language) ? i18n.language : DEFAULT_LANGUAGE
  ) as Language;

  const setLanguage = useCallback(
    (next: Language) => {
      void i18n.changeLanguage(next);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* prywatny tryb przeglądarki — wybór działa tylko w tej sesji */
        }
      }
    },
    [i18n],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "pl" ? "en" : "pl");
  }, [language, setLanguage]);

  const pathFor = useCallback(
    (pathname: string, next: Language = language) => localizePath(pathname, next),
    [language],
  );

  return { language, languages: SUPPORTED_LANGUAGES, t, setLanguage, toggleLanguage, pathFor };
}

/** Zapisany wcześniej wybór języka (używane przy starcie aplikacji). */
export function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(stored as Language) ? (stored as Language) : null;
  } catch {
    return null;
  }
}
