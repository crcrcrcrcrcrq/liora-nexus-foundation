/**
 * LIORA P0.35 — robots.txt serwowany dynamicznie.
 *
 * Powód zmiany wobec pliku statycznego:
 *  1. dyrektywa `Sitemap:` musi być adresem BEZWZGLĘDNYM — plik statyczny nie
 *     znał hosta, więc mapy witryny w ogóle nie zgłaszał,
 *  2. prywatna strefa Sanktuarium (`/pl/sanktuarium`, `/en/sanctuary`) była
 *     indeksowalna mimo że bez sesji renderuje wyłącznie stan dostępu.
 *
 * Reguły są tą samą listą co wcześniej, uzupełnioną o Sanktuarium.
 */
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { resolveBaseUrl } from "@/lib/site-url.server";

const PRIVATE_PATHS = [
  "/admin",
  "/kronika",
  "/powrot",
  "/sanktuarium",
  "/pl/kronika",
  "/pl/powrot",
  "/pl/sanktuarium",
  "/en/chronicle",
  "/en/return",
  "/en/sanctuary",
];

const CRAWLERS = ["*", "Googlebot", "Bingbot"];

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const baseUrl = resolveBaseUrl(request);

        const blocks = CRAWLERS.map((agent) =>
          [`User-agent: ${agent}`, "Allow: /", ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`)].join(
            "\n",
          ),
        );

        blocks.push(["User-agent: Twitterbot", "Allow: /"].join("\n"));
        blocks.push(["User-agent: facebookexternalhit", "Allow: /"].join("\n"));

        const body = [
          blocks.join("\n\n"),
          baseUrl ? `\nSitemap: ${baseUrl}/sitemap.xml` : "",
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
