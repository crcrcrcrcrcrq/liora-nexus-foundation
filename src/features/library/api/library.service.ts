import { allPosts, POST_BY_SLUG } from "../model/posts";
import type { BlogPost } from "../model/types";

/**
 * Warstwa dostępu do treści Biblioteki Refleksji. Dziś czyta ze słownika,
 * po podłączeniu CMS wystarczy podmienić implementację tych funkcji.
 */
export function listPosts(): BlogPost[] {
  return allPosts().sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): BlogPost | undefined {
  return POST_BY_SLUG(slug);
}

export function listCategories(): string[] {
  return Array.from(new Set(allPosts().map((post) => post.category))).sort();
}

export function relatedPosts(slug: string, limit = 2): BlogPost[] {
  const current = getPost(slug);
  if (!current) return [];
  const sameCategory = listPosts().filter(
    (post) => post.slug !== slug && post.category === current.category,
  );
  const rest = listPosts().filter(
    (post) => post.slug !== slug && post.category !== current.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}
