/**
 * Adres produkcyjny pochodzi z konfiguracji środowiska (VITE_SITE_URL).
 * Dopóki nie jest ustawiony, adresy kanoniczne pozostają relatywne.
 */
const SITE_URL = ((import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "").replace(
  /\/+$/,
  "",
);

export const SITE = {
  name: "Liora Ylva",
  legalName: "Liora Ylva — Tarot & Astrologia",
  domain: "lioraylva.com",
  /** Pusty dopóki środowisko nie poda VITE_SITE_URL — wtedy ścieżki są relatywne. */
  baseUrl: SITE_URL,
  email: "kontakt@lioraylva.com",
  locale: "pl_PL",
  founded: 2019,
  languages: ["pl", "en"] as const,
} as const;

export type Locale = (typeof SITE.languages)[number];
