import i18next from "@/config/i18n";
import { translate } from "@/lib/i18n";

/** Znacznik Intl dla aktywnego języka — sama prezentacja, waluta bez zmian. */
const INTL_TAG: Record<string, string> = { pl: "pl-PL", en: "en-GB" };

function activeTag(): string {
  return INTL_TAG[i18next.language] ?? INTL_TAG["pl"]!;
}

export function formatPrice(value: number | null, currency = "PLN"): string {
  if (value === null) return translate("common.pricing.individualQuote");
  if (value === 0) return translate("common.pricing.free");
  return new Intl.NumberFormat(activeTag(), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string, locale = activeTag()): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
