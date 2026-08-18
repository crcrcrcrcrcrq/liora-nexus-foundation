/**
 * LIORA P0.24 — model artykułów bloga (Biblioteka Refleksji).
 *
 * PL i EN są niezależnymi rekordami: jeden artykuł = jeden język.
 * Brak automatycznego fallbacku i brak tłumaczeń automatycznych.
 */
import type { Language } from "@/config/i18n";

export type BlogStatus = "draft" | "published";

export const BLOG_STATUSES: BlogStatus[] = ["draft", "published"];

export const BLOG_LIMITS = {
  title: 160,
  slug: 120,
  excerpt: 400,
  content: 40_000,
  authorName: 120,
  seoTitle: 70,
  seoDescription: 200,
} as const;

/** Rekord administracyjny — widoczny wyłącznie dla personelu. */
export interface BlogPostRecord {
  id: string;
  locale: Language;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  status: BlogStatus;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

/** Artykuł widoczny publicznie (wyłącznie `status = published`). */
export interface PublicBlogPost {
  locale: Language;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
}

export interface BlogPostDraft {
  locale: Language;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  status: BlogStatus;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
}

export const EMPTY_BLOG_DRAFT: BlogPostDraft = {
  locale: "pl",
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  authorName: "",
  status: "draft",
  publishedAt: null,
  seoTitle: "",
  seoDescription: "",
};

/** Bezpieczny slug z tytułu — pomoc dla panelu, walidacja i tak jest serwerowa. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/gi, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, BLOG_LIMITS.slug);
}
