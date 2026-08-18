/**
 * LIORA P0.24 — funkcje serwerowe bloga.
 *
 * Odczyt publiczny jest jawnie publiczny (tylko `status = published`).
 * Każda operacja administracyjna wymaga sesji SSR i serwerowego sprawdzenia
 * roli personelu (`requireStaffRole`). Payload zawiera wyłącznie treść —
 * nigdy `user_id`, `role`, `isAdmin`.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import type { BlogPostRecord, BlogStatus, PublicBlogPost } from "@/features/blog/model/types";

function readLocale(input: unknown): Language {
  const raw = (input ?? {}) as Record<string, unknown>;
  const locale = raw["locale"];
  return SUPPORTED_LANGUAGES.includes(locale as Language) ? (locale as Language) : DEFAULT_LANGUAGE;
}

/* ----------------------------- publiczne ----------------------------- */

export const fetchPublishedBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ({ locale: readLocale(input) }))
  .handler(async ({ data }): Promise<PublicBlogPost[]> => {
    const { readPublishedPosts } = await import("./blog.server");
    return readPublishedPosts(data.locale);
  });

export const fetchPublishedBlogPost = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ({
    locale: readLocale(input),
    slug: String((input as { slug?: unknown })?.slug ?? "").slice(0, 200),
  }))
  .handler(async ({ data }): Promise<PublicBlogPost | null> => {
    const { readPublishedPost } = await import("./blog.server");
    return readPublishedPost(data.locale, data.slug);
  });

/* --------------------------- administracyjne -------------------------- */

export const fetchAdminBlogPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<BlogPostRecord[]> => {
    const { requireStaffRole } = await import("./admin.server");
    const { listAdminPosts } = await import("./blog.server");
    await requireStaffRole(context.supabase, context.userId);
    return listAdminPosts(context.supabase);
  });

export const fetchAdminBlogPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => ({ id: String((input as { id?: unknown })?.id ?? "") }))
  .handler(async ({ data, context }): Promise<BlogPostRecord | null> => {
    const { requireStaffRole } = await import("./admin.server");
    const { getAdminPost, blogIdInput } = await import("./blog.server");
    await requireStaffRole(context.supabase, context.userId);
    return getAdminPost(context.supabase, blogIdInput.parse(data).id);
  });

export const createBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => input)
  .handler(async ({ data, context }): Promise<BlogPostRecord> => {
    const { requireStaffRole } = await import("./admin.server");
    const { blogPostInput, insertPost } = await import("./blog.server");
    await requireStaffRole(context.supabase, context.userId);
    return insertPost(context.supabase, blogPostInput.parse(data));
  });

export const updateBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => input)
  .handler(async ({ data, context }): Promise<BlogPostRecord> => {
    const { requireStaffRole } = await import("./admin.server");
    const { blogPostInput, blogIdInput, updatePost } = await import("./blog.server");
    await requireStaffRole(context.supabase, context.userId);
    const { id } = blogIdInput.parse(data);
    return updatePost(context.supabase, id, blogPostInput.parse(data));
  });

async function changeStatus(
  supabase: unknown,
  userId: string,
  id: unknown,
  status: BlogStatus,
): Promise<BlogPostRecord> {
  const { requireStaffRole } = await import("./admin.server");
  const { blogIdInput, setPostStatus } = await import("./blog.server");
  const client = supabase as Parameters<typeof setPostStatus>[0];
  await requireStaffRole(client, userId);
  return setPostStatus(client, blogIdInput.parse({ id }).id, status);
}

export const publishBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => ({ id: (input as { id?: unknown })?.id }))
  .handler(({ data, context }): Promise<BlogPostRecord> =>
    changeStatus(context.supabase, context.userId, data.id, "published"),
  );

export const unpublishBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => ({ id: (input as { id?: unknown })?.id }))
  .handler(({ data, context }): Promise<BlogPostRecord> =>
    changeStatus(context.supabase, context.userId, data.id, "draft"),
  );

export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => ({ id: (input as { id?: unknown })?.id }))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { requireStaffRole } = await import("./admin.server");
    const { blogIdInput, deletePost } = await import("./blog.server");
    await requireStaffRole(context.supabase, context.userId);
    const { id } = blogIdInput.parse({ id: data.id });
    await deletePost(context.supabase, id);
    return { id };
  });
