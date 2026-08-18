import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LANGUAGE } from "@/config/i18n";
import { withLocalePrefix } from "@/config/routes";
import { readStoredLanguage } from "@/hooks/useLanguage";

/**
 * P0.22 — adres bez prefiksu językowego jest zachowany wyłącznie jako
 * przekierowanie na wersję językową. Treść żyje pod /pl/... i /en/....
 */
export const Route = createFileRoute("/biblioteka/$slug")({
  beforeLoad: ({ params }) => {
    const language = readStoredLanguage() ?? DEFAULT_LANGUAGE;
    let canonicalPath = "/biblioteka/$slug";
    for (const [key, value] of Object.entries(params as Record<string, string>)) {
      canonicalPath = canonicalPath.replace(`$${key}`, value);
    }
    throw redirect({ href: withLocalePrefix(canonicalPath, language), statusCode: 301 });
  },
});
