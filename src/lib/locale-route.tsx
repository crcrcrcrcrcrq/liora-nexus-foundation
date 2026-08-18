/**
 * LIORA P0.22 — warstwa tras językowych.
 *
 * Każda publiczna strona ma JEDNĄ implementację (`src/pages/*`). Pliki tras
 * `/pl/...` i `/en/...` są cienkimi opakowaniami, które:
 *   1. ustawiają język ZANIM wykona się loader, `head()` i render (także w SSR),
 *   2. dokładają canonical + hreflang wyliczone z mapy tras,
 *   3. przekazują dalej niezmieniony komponent strony.
 *
 * Dzięki temu URL jest jedynym źródłem prawdy o języku publicznej strony.
 */
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { LANGUAGE_TAGS, type Language } from "@/config/i18n";
import { alternateLinks, localizePath, setActiveLanguage } from "@/lib/i18n";

type HeadResult = {
  meta?: Record<string, string>[];
  links?: Record<string, string>[];
  scripts?: Record<string, unknown>[];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PageContext {
  /** Parametry trasy — kształt zależy od strony, dlatego luźny typ. */
  params: any;
  loaderData?: any;
  search?: any;
  /** Język wynikający z adresu — jedyne źródło prawdy dla loaderów. */
  language: Language;
}

export interface PageDefinition {
  /** Ścieżka kanoniczna (PL) — identyfikator strony w mapie tras. */
  path: string;
  component: () => ReactNode;
  notFoundComponent?: () => ReactNode;
  head?: (ctx: PageContext) => HeadResult;
  loader?: (ctx: PageContext) => any;
  validateSearch?: (search: Record<string, unknown>) => any;
  /**
   * `false` dla treści istniejących niezależnie w każdym języku (artykuły
   * bloga). Wtedy nie generujemy hreflang do adresu, który może nie istnieć.
   */
  alternates?: boolean;
}

/** Deklaracja strony niezależna od języka i od prefiksu URL. */
export function definePage(definition: PageDefinition): PageDefinition {
  return definition;
}

/**
 * Buduje opcje trasy `createFileRoute` dla konkretnego języka.
 * `params` z trasy trafiają do adresu kanonicznego (np. `/biblioteka/$slug`).
 */
export function localeRoute(language: Language, page: PageDefinition) {
  const resolvePath = (params: Record<string, string> | undefined) => {
    let path = page.path;
    for (const [key, value] of Object.entries(params ?? {})) {
      path = path.replace(`$${key}`, value);
    }
    return path;
  };

  const options: Record<string, unknown> = {
    beforeLoad: () => {
      setActiveLanguage(language);
    },
    component: page.component,
    head: (ctx: { params?: Record<string, string> }) => {
      setActiveLanguage(language);
      const base = page.head ? page.head({ params: {}, ...ctx, language } as PageContext) : {};
      const canonicalPath = resolvePath(ctx.params);
      const href = `${SITE.baseUrl}${localizePath(canonicalPath, language)}`;
      const alternates =
        page.alternates === false
          ? []
          : alternateLinks(canonicalPath).map((link) => ({
              ...link,
              href: `${SITE.baseUrl}${link.href}`,
            }));
      return {
        ...base,
        meta: [
          ...(base.meta ?? []),
          { property: "og:locale", content: LANGUAGE_TAGS[language].og },
        ],
        links: [...(base.links ?? []), { rel: "canonical", href }, ...alternates],
      };
    },
  };

  if (page.loader) {
    options["loader"] = (ctx: PageContext) => {
      setActiveLanguage(language);
      return page.loader!({ ...ctx, language });
    };
  }
  if (page.notFoundComponent) options["notFoundComponent"] = page.notFoundComponent;
  if (page.validateSearch) options["validateSearch"] = page.validateSearch;

  return options as never;
}
