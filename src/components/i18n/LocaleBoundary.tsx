/**
 * LIORA P0.22 — granica językowa renderu.
 *
 * Ustawia język i18n ZANIM wyrenderują się dzieci (inicjalizator `useState`
 * wykonuje się także w SSR), więc HTML wysłany z serwera jest już we
 * właściwym języku. Atrybut `lang` dokumentu jest synchronizowany z URL.
 */
import { useEffect, useState, type ReactNode } from "react";
import { LANGUAGE_TAGS, type Language } from "@/config/i18n";
import { setActiveLanguage } from "@/lib/i18n";

export function LocaleBoundary({
  language,
  children,
}: {
  language: Language;
  children: ReactNode;
}) {
  useState(() => {
    setActiveLanguage(language);
    return language;
  });

  // Nawigacja klient-side między /pl i /en musi też przestawić język.
  if (typeof window !== "undefined") setActiveLanguage(language);

  useEffect(() => {
    setActiveLanguage(language);
    document.documentElement.lang = LANGUAGE_TAGS[language].html;
  }, [language]);

  return <>{children}</>;
}
