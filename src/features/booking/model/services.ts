import { translate as t } from "@/lib/i18n";
import type { ServiceOffer } from "./types";

const SLUGS = [
  "rozklad-trzech-kart",
  "konsultacja-indywidualna",
  "analiza-relacji",
  "portret-astrologiczny",
  "opieka-kwartalna",
] as const;

const KEY_BY_SLUG: Record<(typeof SLUGS)[number], string> = {
  "rozklad-trzech-kart": "threeCardReading",
  "konsultacja-indywidualna": "individualConsultation",
  "analiza-relacji": "relationshipAnalysis",
  "portret-astrologiczny": "astrologicalPortrait",
  "opieka-kwartalna": "quarterlyCare",
};

const BASE: Omit<ServiceOffer, "title" | "duration" | "summary" | "includes">[] = [
  { slug: "rozklad-trzech-kart", price: 0, currency: "PLN" },
  { slug: "konsultacja-indywidualna", price: 249, currency: "PLN", featured: true },
  { slug: "analiza-relacji", price: 349, currency: "PLN" },
  { slug: "portret-astrologiczny", price: 429, currency: "PLN" },
  { slug: "opieka-kwartalna", price: 1290, currency: "PLN" },
];

/**
 * P0.20 — oferta jest budowana PRZY KAŻDYM WYWOŁANIU, nigdy raz przy imporcie.
 * Zamrożenie na poziomie modułu powodowało, że po przełączeniu na EN nazwy i
 * opisy usług zostawały po polsku (moduł czytał słownik tylko raz, na starcie).
 * Slugi, ceny i waluta to dane biznesowe — nie podlegają tłumaczeniu.
 */
export function services(): ServiceOffer[] {
  return BASE.map((base) => {
    const key = KEY_BY_SLUG[base.slug as (typeof SLUGS)[number]];
    return {
      ...base,
      title: t(`services.items.${key}.title`),
      duration: t(`services.items.${key}.duration`),
      summary: t(`services.items.${key}.summary`),
      includes: t(`services.items.${key}.includes`, { returnObjects: true }) as unknown as string[],
    };
  });
}

export const SERVICE_BY_SLUG = (slug: string) => services().find((s) => s.slug === slug);
