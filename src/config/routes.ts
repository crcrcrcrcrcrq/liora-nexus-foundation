/**
 * LIORA P0.22 — mapa publicznych tras PL ↔ EN.
 *
 * Zasada: wewnętrznym identyfikatorem strony pozostaje jej dotychczasowa,
 * polska ścieżka (`/uslugi`, `/biblioteka/$slug`). Ta mapa tłumaczy ją na
 * adres w danym języku (`/pl/uslugi`, `/en/services`). Dzięki temu komponenty
 * i `head()` stron nie muszą znać prefiksów — robi to jedna warstwa.
 *
 * Nie ma tu treści ani tłumaczeń tekstów: wyłącznie slugi adresów.
 */
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type Language } from "@/config/i18n";

export interface PublicRoute {
  /** Ścieżka kanoniczna (PL) — identyfikator strony w kodzie. */
  id: string;
  /** Slug adresu w każdym języku, bez prefiksu języka. */
  path: Record<Language, string>;
  /** Strona prywatna/systemowa: bez hreflang i bez sitemapy. */
  private?: boolean;
}

export const PUBLIC_ROUTES: PublicRoute[] = [
  { id: "/", path: { pl: "/", en: "/" } },
  { id: "/o-mnie", path: { pl: "/o-mnie", en: "/about" } },
  { id: "/uslugi", path: { pl: "/uslugi", en: "/services" } },
  { id: "/rezerwacja", path: { pl: "/rezerwacja", en: "/booking" } },
  { id: "/tarot", path: { pl: "/tarot", en: "/tarot" } },
  { id: "/astrologia", path: { pl: "/astrologia", en: "/astrology" } },
  { id: "/rytualy", path: { pl: "/rytualy", en: "/rituals" } },
  { id: "/rytualy/$slug", path: { pl: "/rytualy/$slug", en: "/rituals/$slug" } },
  { id: "/biblioteka", path: { pl: "/biblioteka", en: "/library" } },
  { id: "/biblioteka/$slug", path: { pl: "/biblioteka/$slug", en: "/library/$slug" } },
  { id: "/faq", path: { pl: "/faq", en: "/faq" } },
  { id: "/gdzie-dzialam", path: { pl: "/gdzie-dzialam", en: "/where-i-work" } },
  { id: "/kontakt", path: { pl: "/kontakt", en: "/contact" } },
  { id: "/sanktuarium", path: { pl: "/sanktuarium", en: "/sanctuary" } },
  { id: "/polityka-prywatnosci", path: { pl: "/polityka-prywatnosci", en: "/privacy-policy" } },
  { id: "/regulamin", path: { pl: "/regulamin", en: "/terms" } },
  { id: "/powrot", path: { pl: "/powrot", en: "/return" }, private: true },
  { id: "/kronika", path: { pl: "/kronika", en: "/chronicle" }, private: true },
  {
    id: "/kronika/notatki",
    path: { pl: "/kronika/notatki", en: "/chronicle/notes" },
    private: true,
  },
  {
    id: "/kronika/refleksje",
    path: { pl: "/kronika/refleksje", en: "/chronicle/reflections" },
    private: true,
  },
  {
    id: "/kronika/rytualy",
    path: { pl: "/kronika/rytualy", en: "/chronicle/rituals" },
    private: true,
  },
  {
    id: "/kronika/konsultacje",
    path: { pl: "/kronika/konsultacje", en: "/chronicle/consultations" },
    private: true,
  },
  {
    id: "/kronika/profil",
    path: { pl: "/kronika/profil", en: "/chronicle/profile" },
    private: true,
  },
];

const BY_ID = new Map(PUBLIC_ROUTES.map((route) => [route.id, route]));

function segmentsOf(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** Dopasowuje konkretny adres do wzorca trasy (obsługuje segmenty `$param`). */
function matchPattern(
  pattern: string,
  segments: string[],
): { params: Record<string, string> } | null {
  const patternSegments = segmentsOf(pattern);
  if (patternSegments.length !== segments.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < patternSegments.length; index += 1) {
    const expected = patternSegments[index]!;
    const actual = segments[index]!;
    if (expected.startsWith("$")) {
      params[expected.slice(1)] = actual;
      continue;
    }
    if (expected !== actual) return null;
  }
  return { params };
}

export interface RouteMatch {
  route: PublicRoute;
  params: Record<string, string>;
}

/** Rozpoznaje trasę po adresie w dowolnym języku (bez prefiksu języka). */
export function matchPublicRoute(path: string, language?: Language): RouteMatch | null {
  const segments = segmentsOf(path);
  const languages = language ? [language] : SUPPORTED_LANGUAGES;
  for (const route of PUBLIC_ROUTES) {
    for (const code of languages) {
      const matched = matchPattern(route.path[code], segments);
      if (matched) return { route, params: matched.params };
    }
  }
  return null;
}

function applyParams(pattern: string, params: Record<string, string>): string {
  const filled = segmentsOf(pattern).map((segment) =>
    segment.startsWith("$") ? (params[segment.slice(1)] ?? segment) : segment,
  );
  return filled.length === 0 ? "/" : `/${filled.join("/")}`;
}

/** Zwraca ten sam adres w innym języku, np. `/uslugi` → `/services`. */
export function translateRoutePath(path: string, language: Language): string {
  const matched = matchPublicRoute(path);
  if (!matched) return path;
  return applyParams(matched.route.path[language], matched.params);
}

/** Adres publiczny z prefiksem języka: `/uslugi` + `en` → `/en/services`. */
export function withLocalePrefix(path: string, language: Language): string {
  const translated = translateRoutePath(path, language);
  return translated === "/" ? `/${language}` : `/${language}${translated}`;
}

/** Wyciąga język z adresu z prefiksem; `null` gdy trasa nie jest publiczna. */
export function readLocaleFromPathname(pathname: string): Language | null {
  const first = segmentsOf(pathname)[0];
  return SUPPORTED_LANGUAGES.includes(first as Language) ? (first as Language) : null;
}

/** Usuwa prefiks języka: `/en/services` → `/services`. */
export function stripLocalePrefix(pathname: string): string {
  const segments = segmentsOf(pathname);
  if (SUPPORTED_LANGUAGES.includes(segments[0] as Language)) segments.shift();
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

/**
 * Odpowiednik bieżącego adresu w innym języku (przełącznik języka).
 * Gdy odpowiednik nie istnieje, wracamy na stronę główną właściwego języka.
 */
export function switchLocaleHref(pathname: string, language: Language): string {
  const rest = stripLocalePrefix(pathname);
  const matched = matchPublicRoute(rest);
  if (!matched) return `/${language}`;
  return `/${language}${applyParams(matched.route.path[language], matched.params) === "/" ? "" : applyParams(matched.route.path[language], matched.params)}`;
}

/** Trasa po identyfikatorze (ścieżce kanonicznej PL). */
export function publicRouteById(id: string): PublicRoute | undefined {
  return BY_ID.get(id);
}

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };
export type { Language };
