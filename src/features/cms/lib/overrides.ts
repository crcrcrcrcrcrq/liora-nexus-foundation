/**
 * LIORA P0.19 — nakładanie nadpisań CMS na warstwę i18n.
 *
 * Treść z bazy jest NADPISANIEM domyślnego słownika, nie drugim źródłem prawdy.
 * Brak wpisu = tekst z `src/locales/<lang>/*`. Dzięki temu brakująca treść nigdy
 * nie wywraca strony i nie wymaga fallbacku międzyjęzykowego: PL czyta PL,
 * EN czyta EN.
 *
 * WAŻNE: instancja i18next jest współdzielona i długowieczna (na serwerze żyje
 * między żądaniami). Dlatego nakładanie musi być ODWRACALNE — dla każdego klucza
 * z allowlisty ustawiamy albo wartość z CMS, albo z powrotem wartość domyślną.
 * Bez tego wyłączenie lub usunięcie treści w panelu nie wracałoby na stronie
 * do tekstu domyślnego aż do restartu serwera.
 */
import i18next, { SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import { pl } from "@/locales/pl";
import { en } from "@/locales/en";
import { CMS_FIELDS, isEditableKey } from "../model/fields";

export type CmsContentBundle = Partial<Record<Language, Record<string, string>>>;

/** Słowniki domyślne — wartość bazowa każdego edytowalnego klucza. */
const DEFAULT_DICTIONARIES: Record<Language, unknown> = { pl, en };

function assign(target: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let node = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!;
    const next = node[part];
    if (typeof next !== "object" || next === null) node[part] = {};
    node = node[part] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]!] = value;
}

function readPath(source: unknown, path: string): string | undefined {
  let node: unknown = source;
  for (const part of path.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Wartość domyślna klucza ze słownika i18n (bez nadpisań CMS).
 * Używane przez panel do pokazania podglądu tekstu domyślnego i wyszukiwania.
 */
export function readDefaultValue(language: Language, key: string): string {
  return readPath(DEFAULT_DICTIONARIES[language], key) ?? "";
}

/** Buduje zagnieżdżoną strukturę i18n z płaskiej mapy kluczy. */
export function nestOverrides(flat: Record<string, string>): Record<string, unknown> {
  const nested: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (!isEditableKey(key)) continue;
    assign(nested, key, value);
  }
  return nested;
}

/**
 * Ustawia w i18next aktualny stan każdego edytowalnego klucza:
 * wartość z CMS, a gdy jej nie ma — wartość domyślna ze słownika.
 */
export function applyContentOverrides(bundle: CmsContentBundle): void {
  for (const language of SUPPORTED_LANGUAGES) {
    const flat = bundle[language] ?? {};
    const nested: Record<string, unknown> = {};

    for (const field of CMS_FIELDS) {
      const override = flat[field.key];
      const value =
        typeof override === "string" && override.length > 0
          ? override
          : readPath(DEFAULT_DICTIONARIES[language], field.key);
      if (typeof value === "string") assign(nested, field.key, value);
    }

    i18next.addResourceBundle(language, "translation", nested, true, true);
  }
}
