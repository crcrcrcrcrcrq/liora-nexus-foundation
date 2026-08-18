import { useLoaderData } from "@tanstack/react-router";
import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { Section, SectionHeading } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/state/States";
import { fetchPublishedBlogPosts } from "@/lib/blog.functions";
import type { PublicBlogPost } from "@/features/blog/model/types";
import { formatDate } from "@/utils/format";
import { buildMeta, breadcrumbSchema } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/biblioteka",
  // P0.25 — lista czyta wyłącznie opublikowane artykuły w języku z adresu.
  loader: async ({ language }) => ({
    posts: await fetchPublishedBlogPosts({ data: { locale: language } }),
  }),
  head: () => ({
    meta: buildMeta({
      title: t("library.meta.listTitle"),
      description: t("library.meta.listDescription"),
      path: "/biblioteka",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: t("library.breadcrumbs.home"), path: "/" },
            { name: t("library.breadcrumbs.library"), path: "/biblioteka" },
          ]),
        ),
      },
    ],
  }),
  component: LibraryIndex,
});

function LibraryIndex() {
  const { t } = useLanguage();
  const { posts } = useLoaderData({ strict: false }) as unknown as { posts: PublicBlogPost[] };
  const [featured, ...rest] = posts;

  return (
    <Section className="pt-28">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("library.page.eyebrow")}
          title={t("library.page.title")}
          description={t("library.page.description")}
        />
      </Reveal>

      {!featured ? (
        <div className="mt-16">
          <EmptyState
            title={t("library.page.emptyTitle")}
            description={t("library.page.emptyDescription")}
          />
        </div>
      ) : (
        <>
          <Reveal delay={0.05}>
            <article className="mt-16 lg:mt-24">
              <div className="mx-auto max-w-3xl border-l border-gold/40 pl-8">
                <p className="eyebrow">{t("library.page.featured")}</p>
                <h2 className="mt-5 text-balance font-display text-[2rem] leading-[1.15] text-foreground lg:text-[2.5rem]">
                  <Link
                    to="/biblioteka/$slug"
                    params={{ slug: featured.slug }}
                    className="rounded-sm outline-none transition-colors duration-500 ease-[var(--ease-luxe)] hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-6 text-pretty text-base leading-[1.85] text-foreground/60">
                  {featured.excerpt}
                </p>
                <p className="mt-7 text-[0.6875rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                  {featured.authorName || t("library.page.author")}
                  {featured.publishedAt ? ` · ${formatDate(featured.publishedAt)}` : ""}
                </p>
              </div>
            </article>
          </Reveal>

          <div className="hairline my-20 lg:my-28" />

          <div className="grid gap-14 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3 lg:gap-16">
            {rest.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.05}>
                <article>
                  <Link
                    to="/biblioteka/$slug"
                    params={{ slug: post.slug }}
                    className="group block rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    <h3 className="text-balance font-display text-[1.5rem] leading-[1.25] text-foreground transition-colors duration-500 ease-[var(--ease-luxe)] group-hover:text-gold">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mt-4 text-pretty text-[0.9375rem] leading-[1.8] text-foreground/60">
                    {post.excerpt}
                  </p>
                  <p className="mt-6 text-[0.6875rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                    {post.authorName || t("library.page.author")}
                    {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
