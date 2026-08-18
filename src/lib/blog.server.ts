/**
 * LIORA P0.24 — warstwa serwerowa bloga.
 *
 * Moduł wyłącznie serwerowy. Odczyt publiczny idzie przez klienta publishable
 * (RLS jako `anon`, więc drafty są nieosiągalne), zapis wyłącznie przez klienta
 * sesyjnego po serwerowym rozstrzygnięciu roli personelu. Rola ani tożsamość
 * nigdy nie pochodzą z żądania.
 *
 * Dostęp do tabeli idzie przez nietypowanego klienta PostgREST, aby warstwa nie
 * zależała od momentu regeneracji `src/integrations/supabase/types.ts`.
 * Kontrakt kolumn utrwala migracja `*_blog_posts`.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { LioraServerClient } from "@/integrations/supabase/session.server";
import { SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import {
  BLOG_LIMITS,
  type BlogPostRecord,
  type BlogStatus,
  type PublicBlogPost,
} from "@/features/blog/model/types";

type BlogClient = SupabaseClient<never, "public", never>;

function blog(client: unknown): BlogClient {
  return client as BlogClient;
}

const COLUMNS =
  "id, locale, slug, title, excerpt, content, author_name, status, published_at, seo_title, seo_description, created_at, updated_at";

const PUBLIC_COLUMNS =
  "locale, slug, title, excerpt, content, author_name, published_at, seo_title, seo_description";

interface Row {
  id: string;
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  status: string;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

function toRecord(row: Row): BlogPostRecord {
  return {
    id: row.id,
    locale: row.locale as Language,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    authorName: row.author_name ?? "",
    status: row.status === "published" ? "published" : "draft",
    publishedAt: row.published_at,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPublic(row: Omit<Row, "id" | "status" | "created_at" | "updated_at">): PublicBlogPost {
  return {
    locale: row.locale as Language,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    authorName: row.author_name ?? "",
    publishedAt: row.published_at,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Walidacja serwerowa                                                 */
/* ------------------------------------------------------------------ */

const localeSchema = z.enum(["pl", "en"] as [Language, ...Language[]]);
const statusSchema = z.enum(["draft", "published"] as [BlogStatus, ...BlogStatus[]]);

export const blogPostInput = z
  .object({
    locale: localeSchema,
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(BLOG_LIMITS.slug)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
    title: z.string().trim().min(1, "Title is required").max(BLOG_LIMITS.title),
    excerpt: z.string().trim().max(BLOG_LIMITS.excerpt).default(""),
    content: z.string().max(BLOG_LIMITS.content).default(""),
    authorName: z.string().trim().max(BLOG_LIMITS.authorName).default(""),
    status: statusSchema.default("draft"),
    publishedAt: z.string().datetime().nullable().default(null),
    seoTitle: z.string().trim().max(BLOG_LIMITS.seoTitle).default(""),
    seoDescription: z.string().trim().max(BLOG_LIMITS.seoDescription).default(""),
  })
  .superRefine((value, ctx) => {
    if (value.status === "published" && value.content.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Content is required to publish",
      });
    }
  });

export type BlogPostInput = z.infer<typeof blogPostInput>;

export const blogIdInput = z.object({ id: z.string().uuid() });

function toWriteRow(input: BlogPostInput) {
  return {
    locale: input.locale,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    author_name: input.authorName,
    status: input.status,
    published_at:
      input.status === "published" ? (input.publishedAt ?? new Date().toISOString()) : null,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
  };
}

/* ------------------------------------------------------------------ */
/* Odczyt administracyjny (sesja personelu, RLS jak dla tego konta)     */
/* ------------------------------------------------------------------ */

export async function listAdminPosts(supabase: LioraServerClient): Promise<BlogPostRecord[]> {
  const { data, error } = await blog(supabase)
    .from("blog_posts")
    .select(COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Blog posts unavailable");
  return ((data ?? []) as unknown as Row[]).map(toRecord);
}

export async function getAdminPost(
  supabase: LioraServerClient,
  id: string,
): Promise<BlogPostRecord | null> {
  const { data, error } = await blog(supabase)
    .from("blog_posts")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Blog post unavailable");
  return data ? toRecord(data as unknown as Row) : null;
}

export async function insertPost(
  supabase: LioraServerClient,
  input: BlogPostInput,
): Promise<BlogPostRecord> {
  const { data, error } = await blog(supabase)
    .from("blog_posts")
    .insert(toWriteRow(input) as never)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.code === "23505" ? "Slug already used" : "Blog post not saved");
  return toRecord(data as unknown as Row);
}

export async function updatePost(
  supabase: LioraServerClient,
  id: string,
  input: BlogPostInput,
): Promise<BlogPostRecord> {
  const { data, error } = await blog(supabase)
    .from("blog_posts")
    .update(toWriteRow(input) as never)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.code === "23505" ? "Slug already used" : "Blog post not saved");
  if (!data) throw new Error("Blog post not found");
  return toRecord(data as unknown as Row);
}

/** Zmiana statusu publikacji. Publikacja pustego artykułu jest odrzucana. */
export async function setPostStatus(
  supabase: LioraServerClient,
  id: string,
  status: BlogStatus,
): Promise<BlogPostRecord> {
  const current = await getAdminPost(supabase, id);
  if (!current) throw new Error("Blog post not found");
  if (status === "published" && current.content.trim().length === 0) {
    throw new Error("Content is required to publish");
  }

  const { data, error } = await blog(supabase)
    .from("blog_posts")
    .update({
      status,
      published_at:
        status === "published" ? (current.publishedAt ?? new Date().toISOString()) : null,
    } as never)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error("Blog post status not changed");
  if (!data) throw new Error("Blog post not found");
  return toRecord(data as unknown as Row);
}

export async function deletePost(supabase: LioraServerClient, id: string): Promise<void> {
  const { error } = await blog(supabase).from("blog_posts").delete().eq("id", id);
  if (error) throw new Error("Blog post not deleted");
}

/* ------------------------------------------------------------------ */
/* Odczyt publiczny — klient publishable, RLS jako `anon`               */
/* ------------------------------------------------------------------ */

function publicClient(): BlogClient | null {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return blog(
    createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    }),
  );
}

function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

/** Lista publiczna: wyłącznie `published` i wyłącznie żądany język. */
export async function readPublishedPosts(locale: Language): Promise<PublicBlogPost[]> {
  if (!isLanguage(locale)) return [];
  const client = publicClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select(PUBLIC_COLUMNS)
      .eq("locale", locale)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return ((data ?? []) as unknown as Row[]).map(toPublic);
  } catch {
    return [];
  }
}

/** Pojedynczy artykuł publiczny; `null` dla draftu, innego języka i braku. */
export async function readPublishedPost(
  locale: Language,
  slug: string,
): Promise<PublicBlogPost | null> {
  if (!isLanguage(locale)) return null;
  const client = publicClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select(PUBLIC_COLUMNS)
      .eq("locale", locale)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return toPublic(data as unknown as Row);
  } catch {
    return null;
  }
}
