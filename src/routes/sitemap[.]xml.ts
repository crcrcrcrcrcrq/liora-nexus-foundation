import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { resolveBaseUrl } from "@/lib/site-url.server";
import { RITUALS } from "@/constants/rituals";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, localizePath } from "@/lib/i18n";

// P0.35 — protokół Sitemap wymaga adresów BEZWZGLĘDNYCH. Gdy `VITE_SITE_URL`
// nie jest ustawiony, bazę wyliczamy z hosta żądania zamiast emitować
// niepoprawne ścieżki relatywne.

interface SitemapEntry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/o-mnie", changefreq: "monthly", priority: "0.7" },
  { path: "/uslugi", changefreq: "monthly", priority: "0.9" },
  { path: "/tarot", changefreq: "weekly", priority: "0.9" },
  { path: "/astrologia", changefreq: "weekly", priority: "0.8" },
  { path: "/rytualy", changefreq: "monthly", priority: "0.6" },
  { path: "/biblioteka", changefreq: "weekly", priority: "0.8" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/gdzie-dzialam", changefreq: "monthly", priority: "0.5" },
  { path: "/kontakt", changefreq: "monthly", priority: "0.6" },
  { path: "/rezerwacja", changefreq: "monthly", priority: "0.9" },
  { path: "/regulamin", changefreq: "yearly", priority: "0.2" },
  { path: "/polityka-prywatnosci", changefreq: "yearly", priority: "0.2" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const BASE_URL = resolveBaseUrl(request);
        const entries: (SitemapEntry & { lastmod?: string })[] = [
          ...STATIC_ENTRIES,
          ...RITUALS.map((ritual) => ({
            path: `/rytualy/${ritual.slug}`,
            changefreq: "yearly" as const,
            priority: "0.5",
          })),
        ];

        // P0.22 — w sitemapie żyją wyłącznie adresy z prefiksem językowym,
        // a każdy wpis wskazuje swoje odpowiedniki (hreflang + x-default).
        const alternates = (path: string) =>
          [
            ...SUPPORTED_LANGUAGES.map(
              (language) =>
                `    <xhtml:link rel="alternate" hreflang="${language}" href="${BASE_URL}${localizePath(path, language)}" />`,
            ),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${localizePath(path, DEFAULT_LANGUAGE)}" />`,
          ].join("\n");

        const localizedEntries = entries.flatMap((entry) =>
          SUPPORTED_LANGUAGES.map((language) => ({
            ...entry,
            loc: localizePath(entry.path, language),
            withAlternates: true,
          })),
        );

        // P0.25 — artykuły bloga są niezależne w każdym języku: tylko
        // opublikowane, bez hreflang między wersjami, lastmod z publikacji.
        const { readPublishedPosts } = await import("@/lib/blog.server");
        const postEntries = (
          await Promise.all(
            SUPPORTED_LANGUAGES.map(async (language) => {
              const posts = await readPublishedPosts(language);
              return posts.map((post) => ({
                path: `/biblioteka/${post.slug}`,
                loc: localizePath(`/biblioteka/${post.slug}`, language),
                changefreq: "monthly" as const,
                priority: "0.6",
                ...(post.publishedAt ? { lastmod: post.publishedAt } : {}),
                withAlternates: false,
              }));
            }),
          )
        ).flat();

        const urls = [...localizedEntries, ...postEntries].map((entry) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${entry.loc}</loc>`,
            entry.withAlternates ? alternates(entry.path) : null,
            entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
            entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
            entry.priority ? `    <priority>${entry.priority}</priority>` : null,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
