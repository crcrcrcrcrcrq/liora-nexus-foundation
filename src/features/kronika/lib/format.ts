/** Formatowanie dat w tonie dziennika, nie rejestru. */
import { translate as t, type Language, DEFAULT_LANGUAGE } from "@/lib/i18n";

const LOCALE_TAG: Record<Language, string> = { pl: "pl-PL", en: "en-US" };

function formatters(language: Language) {
  const tag = LOCALE_TAG[language];
  return {
    long: new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }),
    time: new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit" }),
    month: new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" }),
  };
}

function toDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatChronicleDate(iso: string, language: Language = DEFAULT_LANGUAGE): string {
  const date = toDate(iso);
  return date
    ? formatters(language).long.format(date)
    : t("chronicle.format.empty", { lng: language });
}

export function formatChronicleDateTime(
  iso: string,
  language: Language = DEFAULT_LANGUAGE,
): string {
  const date = toDate(iso);
  if (!date) return t("chronicle.format.empty", { lng: language });
  const { long, time } = formatters(language);
  return `${long.format(date)}, ${t("chronicle.format.dateTimeConnector", { lng: language })} ${time.format(date)}`;
}

export function formatChronicleMonth(iso: string, language: Language = DEFAULT_LANGUAGE): string {
  const date = toDate(iso);
  return date
    ? formatters(language).month.format(date)
    : t("chronicle.format.empty", { lng: language });
}
