/**
 * LIORA P0.35 — bezwzględny adres bazowy dla artefaktów wymagających pełnych URL-i.
 *
 * Kolejność źródeł:
 *  1. `VITE_SITE_URL` (jawna konfiguracja produkcyjna) — jeśli jest, wygrywa,
 *  2. host żądania (`x-forwarded-proto` + `x-forwarded-host`/`host`) — pozwala
 *     wygenerować poprawny `sitemap.xml` i `robots.txt` zanim domena zostanie
 *     wpisana do środowiska.
 *
 * Kanoniczne linki w `<head>` nadal mogą być relatywne (przeglądarki i roboty
 * rozwiązują je względem bieżącego adresu), ale protokół Sitemap i dyrektywa
 * `Sitemap:` w robots.txt WYMAGAJĄ adresów bezwzględnych.
 */
import { SITE } from "@/config/site";

function normalize(value: string): string {
  return value.replace(/\/+$/, "");
}

export function resolveBaseUrl(request: Request): string {
  if (SITE.baseUrl) return normalize(SITE.baseUrl);

  const headers = request.headers;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return "";

  const proto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return normalize(`${proto}://${host}`);
}
