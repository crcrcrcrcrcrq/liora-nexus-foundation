/**
 * LIORA P0.25 — skład publicznego artykułu bloga (dane z bazy).
 *
 * Treść jest zwykłym tekstem: akapity rozdziela pusta linia, linia zaczynająca
 * się od `## ` jest śródtytułem. Brak HTML z bazy, brak `dangerouslySetInnerHTML`.
 */
import { Link } from "@/components/i18n/LocaleLink";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/utils/format";
import { useLanguage } from "@/hooks/useLanguage";
import type { PublicBlogPost } from "@/features/blog/model/types";

interface PublicArticleTemplateProps {
  post: PublicBlogPost;
  related: PublicBlogPost[];
}

type Block = { kind: "heading" | "paragraph"; text: string };

function toBlocks(content: string): Block[] {
  return content
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((chunk) =>
      chunk.startsWith("## ")
        ? { kind: "heading" as const, text: chunk.slice(3).trim() }
        : { kind: "paragraph" as const, text: chunk },
    );
}

export function PublicArticleTemplate({ post, related }: PublicArticleTemplateProps) {
  const { t } = useLanguage();
  const blocks = toBlocks(post.content);

  return (
    <article className="pb-28">
      <header className="px-6 pt-28 sm:px-8 lg:px-10 lg:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow">{t("library.page.eyebrow")}</p>
            <h1 className="mt-6 text-balance font-display text-[2.25rem] leading-[1.12] tracking-[-0.005em] text-foreground sm:text-[2.875rem] lg:text-[3.5rem] lg:leading-[1.06]">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-8 text-pretty text-lg leading-[1.8] text-foreground/70 lg:text-xl lg:leading-[1.75]">
                {post.excerpt}
              </p>
            ) : null}
            <p className="mt-10 text-[0.6875rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {post.authorName || t("library.page.author")}
              {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="px-6 sm:px-8 lg:px-10">
        <div className="mx-auto mt-16 max-w-[38rem] lg:mt-24">
          {blocks.map((block, index) =>
            block.kind === "heading" ? (
              <h2
                key={`${index}-${block.text.slice(0, 24)}`}
                className="mt-16 font-display text-[1.5rem] leading-[1.3] text-foreground lg:mt-20 lg:text-[1.75rem]"
              >
                {block.text}
              </h2>
            ) : (
              <p
                key={`${index}-${block.text.slice(0, 24)}`}
                className="mt-6 text-pretty text-[1.0625rem] leading-[1.9] text-foreground/70"
              >
                {block.text}
              </p>
            ),
          )}

          <div className="hairline my-16 lg:my-20" />

          <Reveal>
            <section
              aria-labelledby="library-chronicle"
              className="border border-border/70 p-8 sm:p-10"
            >
              <h2
                id="library-chronicle"
                className="font-display text-[1.375rem] leading-snug text-foreground"
              >
                {t("library.page.chronicleTitle")}
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-[1.8] text-foreground/60">
                {t("library.page.chronicleBody")}
              </p>
              <Link
                to="/kronika/refleksje"
                className="mt-7 inline-block rounded-sm text-sm text-gold outline-none transition-colors hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                {t("library.page.chronicleCta")}
              </Link>
            </section>
          </Reveal>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="px-6 sm:px-8 lg:px-10">
          <div className="mx-auto mt-24 max-w-6xl lg:mt-32">
            <Reveal>
              <p className="eyebrow">{t("library.page.related")}</p>
              <div className="mt-10 grid gap-12 sm:grid-cols-2 sm:gap-10">
                {related.map((item) => (
                  <article key={item.slug}>
                    <Link
                      to="/biblioteka/$slug"
                      params={{ slug: item.slug }}
                      className="group block rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                    >
                      <h3 className="text-balance font-display text-[1.5rem] leading-[1.25] text-foreground transition-colors duration-500 group-hover:text-gold">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-[0.9375rem] leading-[1.8] text-foreground/60">
                        {item.excerpt}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      ) : null}

      <div className="px-6 sm:px-8 lg:px-10">
        <div className="mx-auto mt-20 max-w-6xl">
          <Link
            to="/biblioteka"
            className="rounded-sm text-sm text-gold outline-none hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            {t("library.page.allPosts")}
          </Link>
        </div>
      </div>
    </article>
  );
}
