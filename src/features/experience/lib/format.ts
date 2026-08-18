import { translate as t } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

/** Formatowanie dat w tonie Kroniki — spokojne, bez sekund i technikaliów. */
export function formatDay(iso: string, language: Language = "pl"): string {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMoment(iso: string, language: Language = "pl"): string {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatHour(iso: string, language: Language = "pl"): string {
  return new Intl.DateTimeFormat(language, { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

/** „dziś”, „wczoraj”, w innym razie data. */
export function relativeDay(iso: string, language: Language = "pl", now = new Date()): string {
  const date = new Date(iso);
  const days = Math.floor((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return t("experience.time.today", { lng: language });
  if (days === 1) return t("experience.time.yesterday", { lng: language });
  return formatDay(iso, language);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
