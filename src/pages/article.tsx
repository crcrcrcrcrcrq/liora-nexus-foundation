import { notFound, useLoaderData } from "@tanstack/react-router";
import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { fetchPublishedBlogPost, fetchPublishedBlogPosts } from "@/lib/blog.functions";
import type { PublicBlogPost } from "@/features/blog/model/types";
import { PublicArticleTemplate } from "@/components/library/PublicArticleTemplate";
import { Section } from "@/components/layout/Section";
import { buildMeta, breadcrumbSchema, articleSchema } from "@/utils/seo";
import { translate as t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/biblioteka/$slug",
  // Artykuły PL i EN są niezależne — brak hreflang między językami.
  alternates: false,
  // P0.25 — treść wyłącznie z bazy: `published` + język z adresu.
  loader: async ({ params, language }) => {
    const post = await fetchPublishedBlogPost({
      data: { locale: language, slug: params.slug },
    });
    if (!post) throw notFound();
    const all = await fetchPublishedBlogPosts({ data: { locale: language } });
    return { post, related: all.filter((item) => item.slug !== post.slug).slice(0, 2) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: t("library.meta.postNotFoundTitle") },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    const path = `/biblioteka/${params.slug}`;
    return {
      meta: [
        ...buildMeta({
          title: post.seoTitle || `${post.title} | Liora Ylva`,
          description: post.seoDescription || post.excerpt,
          path,
          type: "article",
          ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
        }),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            articleSchema({
              title: post.title,
              description: post.seoDescription || post.excerpt,
              date: post.publishedAt ?? "",
              path,
            }),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: t("library.breadcrumbs.home"), path: "/" },
              { name: t("library.breadcrumbs.library"), path: "/biblioteka" },
              { name: post.title, path },
            ]),
          ),
        },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostNotFound() {
  const { t } = useLanguage();
  return (
    <Section className="pt-28">
      <p className="eyebrow">{t("library.notFound.eyebrow")}</p>
      <h1 className="mt-6 font-display text-4xl text-foreground">{t("library.notFound.title")}</h1>
      <Link to="/biblioteka" className="mt-8 inline-block text-sm text-gold hover:underline">
        {t("library.notFound.back")}
      </Link>
    </Section>
  );
}

function PostPage() {
  const { post, related } = useLoaderData({ strict: false }) as unknown as {
    post: PublicBlogPost;
    related: PublicBlogPost[];
  };
  return <PublicArticleTemplate post={post} related={related} />;
}
