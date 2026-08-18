import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePageViewTracking } from "@/hooks/useAnalytics";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SITE } from "@/config/site";
import { personSchema } from "@/utils/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
// Sesja użytkownika ma jedno źródło prawdy: <IdentityProvider />.
import { IdentityProvider } from "@/features/identity/context/IdentityProvider";
import { Toaster } from "@/components/ui/sonner";
import { translate as t } from "@/lib/i18n";
import { DEFAULT_LANGUAGE, LANGUAGE_TAGS } from "@/config/i18n";
import { readLocaleFromPathname } from "@/config/routes";
import { setActiveLanguage } from "@/lib/i18n";
import { fetchSiteBundle } from "@/lib/cms.functions";
import { applyContentOverrides } from "@/features/cms/lib/overrides";
import {
  DEFAULT_SITE_SETTINGS,
  isTemplateId,
  isThemeId,
  type SiteSettings,
} from "@/features/cms/model/theme";
import "@/config/i18n";

function NotFoundComponent() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">{t("errors.notFound.eyebrow")}</p>
        <h1 className="mt-6 font-display text-4xl text-foreground">{t("errors.notFound.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/55">
          {t("errors.notFound.description")}
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex h-11 items-center justify-center rounded-sm border border-gold/40 px-7 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold transition-colors hover:bg-accent"
        >
          {t("errors.notFound.backHome")}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">{t("errors.boundary.eyebrow")}</p>
        <h1 className="mt-6 font-display text-3xl text-foreground">{t("errors.boundary.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/55">
          {t("errors.boundary.description")}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-sm bg-gold px-7 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold-foreground"
          >
            {t("errors.boundary.retry")}
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-sm border border-gold/40 px-7 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold"
          >
            {t("errors.boundary.backHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const title = t("seo.defaultTitle");
    const description = t("seo.defaultDescription");
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { name: "author", content: SITE.name },
        { property: "og:site_name", content: SITE.name },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: SITE.locale },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "theme-color", content: "#0D0D0D" },
        { property: "og:title", content: title },
        { name: "twitter:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@200;300;400;500&display=swap",
        },
      ],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(personSchema()) }],
    };
  },
  /**
   * P0.19 — treść CMS i preset wyglądu ładowane raz, przy wejściu do aplikacji.
   * Nadpisania dokładamy do i18n zanim cokolwiek się wyrenderuje; brak backendu
   * albo brak wpisów oznacza po prostu teksty domyślne ze słownika.
   */
  loader: async () => {
    const bundle = await fetchSiteBundle();
    applyContentOverrides(bundle.content);
    return bundle;
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // P0.22 — język dokumentu wynika z adresu, także w HTML wysłanym z serwera.
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const language = readLocaleFromPathname(pathname) ?? DEFAULT_LANGUAGE;

  /**
   * P0.26 — preset wyglądu trafia do HTML już po stronie serwera, więc reload
   * nie miga domyślnym motywem. Nieznana wartość albo brak backendu = bezpieczny
   * fallback do kanonicznego presetu (`DEFAULT_SITE_SETTINGS`).
   */
  const settings = useRouterState({
    select: (state): SiteSettings => {
      const raw = (state.matches[0]?.loaderData as { settings?: unknown } | undefined)?.settings as
        Record<string, unknown> | undefined;
      return {
        themeId: isThemeId(raw?.["themeId"]) ? raw["themeId"] : DEFAULT_SITE_SETTINGS.themeId,
        templateId: isTemplateId(raw?.["templateId"])
          ? raw["templateId"]
          : DEFAULT_SITE_SETTINGS.templateId,
      };
    },
  });

  return (
    <html
      lang={LANGUAGE_TAGS[language].html}
      data-theme={settings.themeId}
      data-template={settings.templateId}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { settings, content } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const urlLanguage = readLocaleFromPathname(pathname);
  const { t } = useLanguage();

  // P0.31 — odsłony strony publicznej (fire-and-forget, poza ścieżką renderu).
  usePageViewTracking();

  // P0.22 — URL jest jedynym źródłem prawdy o języku (SSR i nawigacja klient-side).
  useState(() => {
    if (urlLanguage) setActiveLanguage(urlLanguage);
    return true;
  });
  if (typeof window !== "undefined" && urlLanguage) setActiveLanguage(urlLanguage);

  /**
   * P0.19 — nadpisania CMS muszą trafić do i18n także w przeglądarce, PRZED
   * pierwszym renderem dzieci. Loader roota wykonuje się na serwerze, więc bez
   * tego hydratacja przywracałaby teksty domyślne. Inicjalizator `useState`
   * uruchamia się raz, zanim `<Outlet />` zdąży się wyrenderować.
   */
  useState(() => {
    applyContentOverrides(content);
    return true;
  });

  // Atrybut `lang` musi odpowiadać językowi z adresu (czytniki ekranu, SEO).
  useEffect(() => {
    document.documentElement.lang = LANGUAGE_TAGS[urlLanguage ?? DEFAULT_LANGUAGE].html;
  }, [urlLanguage]);

  /**
   * P0.19 — preset wyglądu to wyłącznie atrybut `data-theme`; wartości kolorów
   * żyją w arkuszu stylów. Aplikacja nigdy nie wstrzykuje CSS-a od administratora.
   */
  useEffect(() => {
    document.documentElement.dataset["theme"] = settings.themeId;
    document.documentElement.dataset["template"] = settings.templateId;
  }, [settings.themeId, settings.templateId]);

  return (
    <QueryClientProvider client={queryClient}>
      <IdentityProvider>
        {/* Klawiatura: pierwsze zatrzymanie prowadzi wprost do treści. */}
        <a
          href="#tresc"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:inline-flex focus:h-11 focus:items-center focus:rounded-sm focus:border focus:border-gold/40 focus:bg-surface focus:px-6 focus:text-xs focus:uppercase focus:tracking-[var(--tracking-luxe)] focus:text-gold"
        >
          {t("layout.skipToContent")}
        </a>
        {isAdmin ? null : <Header />}
        {/* Offset treści = wysokość nagłówka w stanie spoczynku (h-20 / lg:h-28). */}
        <main id="tresc" className={isAdmin ? undefined : "pt-20 lg:pt-28"}>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        {isAdmin ? null : <Footer />}
        <Toaster />
      </IdentityProvider>
    </QueryClientProvider>
  );
}
