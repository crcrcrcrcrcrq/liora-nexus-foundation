import { translate as t } from "@/lib/i18n";
import cisza from "@/assets/library/cisza.jpg";
import pytania from "@/assets/library/pytania.jpg";
import tarot from "@/assets/library/tarot.jpg";
import kronika from "@/assets/library/kronika.jpg";
import arkana from "@/assets/library/arkana.jpg";
import poranek from "@/assets/library/poranek.jpg";
import type { BlogPost } from "./types";

interface PostMeta {
  slug: string;
  date: string;
  readingTime: number;
  heroImage: string;
  /** Liczba akapitów w kolejnych sekcjach tekstu. */
  sections: number[];
}

const POST_META: PostMeta[] = [
  {
    slug: "cisza-tez-potrafi-odpowiedziec",
    date: "2026-03-20",
    readingTime: 6,
    heroImage: cisza,
    sections: [2, 2, 2],
  },
  {
    slug: "dlaczego-wracamy-do-tych-samych-pytan",
    date: "2026-03-06",
    readingTime: 7,
    heroImage: pytania,
    sections: [2, 2, 2],
  },
  {
    slug: "tarot-jako-narzedzie-refleksji",
    date: "2026-02-20",
    readingTime: 8,
    heroImage: tarot,
    sections: [2, 2, 2],
  },
  {
    slug: "jak-prowadzic-kronike-duszy",
    date: "2026-02-06",
    readingTime: 6,
    heroImage: kronika,
    sections: [2, 2, 2],
  },
  {
    slug: "symbolika-wielkich-arkanow",
    date: "2026-01-24",
    readingTime: 9,
    heroImage: arkana,
    sections: [2, 2, 2],
  },
  {
    slug: "poranny-rytual-uwaznosci",
    date: "2026-01-10",
    readingTime: 5,
    heroImage: poranek,
    sections: [2, 2, 2],
  },
];

/** Tłumaczenia czytane są przy każdym wywołaniu — treść podąża za wyborem języka. */
function toPost(meta: PostMeta): BlogPost {
  const base = `library.posts.${meta.slug}`;
  return {
    slug: meta.slug,
    date: meta.date,
    readingTime: meta.readingTime,
    heroImage: meta.heroImage,
    heroAlt: t(`${base}.heroAlt`),
    title: t(`${base}.title`),
    category: t(`${base}.category`),
    excerpt: t(`${base}.excerpt`),
    lead: t(`${base}.lead`),
    quote: t(`${base}.quote`),
    author: t("library.page.author"),
    authorRole: t("library.page.authorRole"),
    sections: meta.sections.map((paragraphs, index) => ({
      heading: t(`${base}.sections.s${index + 1}.heading`),
      paragraphs: Array.from({ length: paragraphs }, (_, p) =>
        t(`${base}.sections.s${index + 1}.p${p + 1}`),
      ),
    })),
  };
}

export function allPosts(): BlogPost[] {
  return POST_META.map(toPost);
}

export const POST_BY_SLUG = (slug: string): BlogPost | undefined => {
  const meta = POST_META.find((post) => post.slug === slug);
  return meta ? toPost(meta) : undefined;
};
