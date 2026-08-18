import { Link } from "@/components/i18n/LocaleLink";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/utils/format";
import { useLanguage } from "@/hooks/useLanguage";
import type { BlogPost } from "@/features/library/model/types";

interface ArticleTemplateProps {
  post: BlogPost;
  related: BlogPost[];
}

/** Skład artykułu w duchu magazynu: duży obraz, lead, szerokie marginesy, wyróżniony cytat. */
export function ArticleTemplate({ post, related }: ArticleTemplateProps) {
  const { t } = useLanguage();

  return (
    <article className="pb-28">
      <header className="px-6 pt-28 sm:px-8 lg:px-10 lg:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow">{post.category}</p>
            <h1 className="mt-6 text-balance font-display text-[2.25rem] leading-[1.12] tracking-[-0.005em] text-foreground sm:text-[2.875rem] lg:text-[3.5rem] lg:leading-[1.06]">
              {post.title}
            </h1>
            <p className="mt-8 text-pretty text-lg leading-[1.8] text-foreground/70 lg:text-xl lg:leading-[1.75]">
              {post.lead}
            </p>
            <p className="mt-10 text-[0.6875rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {post.author} · {formatDate(post.date)} ·{" "}
              {t("library.page.readingMinutes", { count: post.readingTime })}
            </p>
          </Reveal>
        </div>
      </header>

      <Reveal delay={0.05} className="mt-14 px-6 sm:px-8 lg:mt-20 lg:px-10">
        <figure className="mx-auto max-w-6xl overflow-hidden">
          <img
            src={post.heroImage}
            alt={post.heroAlt}
            fetchPriority="high"
            decoding="async"
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
          />
        </figure>
      </Reveal>

      <div className="px-6 sm:px-8 lg:px-10">
        <div className="mx-auto mt-16 max-w-[38rem] lg:mt-24">
          {post.sections.map((section, index) => (
            <Reveal key={section.heading} delay={0.05}>
              <section className={index === 0 ? "" : "mt-16 lg:mt-20"}>
                <h2 className="font-display text-[1.5rem] leading-[1.3] text-foreground lg:text-[1.75rem]">
                  {section.heading}
                </h2>
                <div className="mt-6 grid gap-6">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="text-pretty text-[1.0625rem] leading-[1.9] text-foreground/70"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {index === 0 ? (
                <blockquote className="my-16 border-l border-gold/50 pl-7 lg:my-20">
                  <p className="text-balance font-display text-[1.5rem] leading-[1.45] text-foreground/90 lg:text-[1.75rem]">
                    {post.quote}
                  </p>
                </blockquote>
              ) : null}
            </Reveal>
          ))}

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
                      <img
                        src={item.heroImage}
                        alt={item.heroAlt}
                        loading="lazy"
                        width={1600}
                        height={900}
                        className="h-56 w-full object-cover opacity-90 transition-opacity duration-700 ease-[var(--ease-luxe)] group-hover:opacity-100"
                      />
                      <p className="eyebrow mt-6">{item.category}</p>
                      <h3 className="mt-4 text-balance font-display text-[1.5rem] leading-[1.25] text-foreground transition-colors duration-500 group-hover:text-gold">
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
