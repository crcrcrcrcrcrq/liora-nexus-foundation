import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ErrorState, LoadingState } from "@/components/state/States";
import { Button } from "@/components/ui/button";
import { TextInput, SelectInput, TextArea } from "@/components/forms/fields";
import { useAdminBlogMutations, useAdminBlogPosts } from "@/features/blog/hooks/useAdminBlog";
import {
  BLOG_LIMITS,
  EMPTY_BLOG_DRAFT,
  slugify,
  type BlogPostDraft,
  type BlogPostRecord,
} from "@/features/blog/model/types";
import { withLocalePrefix } from "@/config/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import type { Language } from "@/config/i18n";

export const Route = createFileRoute("/admin/blog")({
  head: () => adminHead(t("admin.meta.blog.title")),
  component: AdminBlog,
});

type Editing = (BlogPostDraft & { id?: string }) | null;

function toDraft(post: BlogPostRecord): BlogPostDraft & { id: string } {
  const { createdAt: _c, updatedAt: _u, ...rest } = post;
  return rest;
}

/**
 * LIORA P0.24 — panel Bloga. Lista + edytor korzystają wyłącznie z funkcji
 * serwerowych; o publikacji decyduje serwer (rola personelu + walidacja).
 */
function AdminBlog() {
  const { t } = useLanguage();
  const posts = useAdminBlogPosts();
  const { save, publish, unpublish, remove } = useAdminBlogMutations();

  const [query, setQuery] = useState("");
  const [localeFilter, setLocaleFilter] = useState<"all" | Language>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (posts.data ?? [])
      .filter((post) => (localeFilter === "all" ? true : post.locale === localeFilter))
      .filter((post) => (statusFilter === "all" ? true : post.status === statusFilter))
      .filter((post) =>
        needle.length === 0
          ? true
          : `${post.title} ${post.slug} ${post.authorName}`.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [posts.data, query, localeFilter, statusFilter]);

  const commit = (status: "draft" | "published") => {
    if (!editing) return;
    const draft: BlogPostDraft & { id?: string } = { ...editing, status };
    if (draft.title.trim().length === 0) {
      setError(t("admin.blog.errors.titleRequired"));
      return;
    }
    if (draft.slug.trim().length === 0) draft.slug = slugify(draft.title);
    if (status === "published" && draft.content.trim().length === 0) {
      setError(t("admin.blog.errors.contentRequired"));
      return;
    }
    setError(null);
    save.mutate(draft, {
      onSuccess: () => setEditing(null),
      onError: (mutationError) => setError((mutationError as Error).message),
    });
  };

  return (
    <div className="grid min-w-0 gap-8">
      <AdminHeader
        title={t("admin.blog.title")}
        description={t("admin.blog.description")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setEditing({ ...EMPTY_BLOG_DRAFT });
            }}
          >
            {t("admin.blog.newPost")}
          </Button>
        }
      />

      {editing ? (
        <AdminCard>
          <div className="grid min-w-0 gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.blog.fields.locale")}
                <SelectInput
                  value={editing.locale}
                  onChange={(event) =>
                    setEditing({ ...editing, locale: event.target.value as Language })
                  }
                >
                  <option value="pl" className="bg-surface">
                    PL
                  </option>
                  <option value="en" className="bg-surface">
                    EN
                  </option>
                </SelectInput>
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.blog.fields.status")}
                <span className="text-sm normal-case tracking-normal text-foreground/70">
                  {t(`admin.blog.status.${editing.status}`)}
                </span>
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55 sm:col-span-2">
                {t("admin.blog.fields.title")}
                <TextInput
                  value={editing.title}
                  maxLength={BLOG_LIMITS.title}
                  onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.blog.fields.slug")}
                <TextInput
                  value={editing.slug}
                  maxLength={BLOG_LIMITS.slug}
                  onChange={(event) =>
                    setEditing({ ...editing, slug: slugify(event.target.value) })
                  }
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.blog.fields.author")}
                <TextInput
                  value={editing.authorName}
                  maxLength={BLOG_LIMITS.authorName}
                  onChange={(event) => setEditing({ ...editing, authorName: event.target.value })}
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55 sm:col-span-2">
                {t("admin.blog.fields.excerpt")}
                <TextArea
                  rows={2}
                  value={editing.excerpt}
                  maxLength={BLOG_LIMITS.excerpt}
                  onChange={(event) => setEditing({ ...editing, excerpt: event.target.value })}
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55 sm:col-span-2">
                {t("admin.blog.fields.content")}
                <TextArea
                  rows={12}
                  value={editing.content}
                  maxLength={BLOG_LIMITS.content}
                  onChange={(event) => setEditing({ ...editing, content: event.target.value })}
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.blog.fields.seoTitle")}
                <TextInput
                  value={editing.seoTitle}
                  maxLength={BLOG_LIMITS.seoTitle}
                  onChange={(event) => setEditing({ ...editing, seoTitle: event.target.value })}
                />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.blog.fields.seoDescription")}
                <TextInput
                  value={editing.seoDescription}
                  maxLength={BLOG_LIMITS.seoDescription}
                  onChange={(event) =>
                    setEditing({ ...editing, seoDescription: event.target.value })
                  }
                />
              </label>
            </div>

            {error ? (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled={save.isPending} onClick={() => commit("draft")}>
                {t("admin.blog.actions.saveDraft")}
              </Button>
              <Button disabled={save.isPending} onClick={() => commit("published")}>
                {t("admin.blog.actions.publish")}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t("admin.blog.actions.cancel")}
              </Button>
            </div>
          </div>
        </AdminCard>
      ) : null}

      <AdminCard>
        <div className="grid min-w-0 gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <TextInput
              value={query}
              placeholder={t("admin.blog.searchPlaceholder")}
              aria-label={t("admin.blog.searchPlaceholder")}
              onChange={(event) => setQuery(event.target.value)}
            />
            <SelectInput
              value={localeFilter}
              aria-label={t("admin.blog.fields.locale")}
              onChange={(event) => setLocaleFilter(event.target.value as "all" | Language)}
            >
              <option value="all" className="bg-surface">
                {t("admin.blog.filters.allLocales")}
              </option>
              <option value="pl" className="bg-surface">
                PL
              </option>
              <option value="en" className="bg-surface">
                EN
              </option>
            </SelectInput>
            <SelectInput
              value={statusFilter}
              aria-label={t("admin.blog.fields.status")}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | "draft" | "published")
              }
            >
              <option value="all" className="bg-surface">
                {t("admin.blog.filters.allStatuses")}
              </option>
              <option value="draft" className="bg-surface">
                {t("admin.blog.status.draft")}
              </option>
              <option value="published" className="bg-surface">
                {t("admin.blog.status.published")}
              </option>
            </SelectInput>
          </div>

          {posts.isLoading ? <LoadingState /> : null}
          {posts.isError ? <ErrorState description={t("admin.blog.unavailable")} /> : null}

          <div className="grid gap-3">
            {rows.map((post) => (
              <div
                key={post.id}
                className="grid min-w-0 gap-3 border-b border-border pb-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{post.title}</p>
                  <p className="mt-1 text-xs text-foreground/55">
                    {post.locale.toUpperCase()} · {t(`admin.blog.status.${post.status}`)} ·{" "}
                    {post.authorName || "—"} · {(post.publishedAt ?? post.updatedAt).slice(0, 10)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setEditing(toDraft(post));
                    }}
                  >
                    {t("admin.blog.actions.edit")}
                  </Button>
                  {post.status === "published" ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => unpublish.mutate(post.id)}>
                        {t("admin.blog.actions.unpublish")}
                      </Button>
                      <a
                        className="text-xs text-gold underline-offset-4 hover:underline"
                        href={`${withLocalePrefix("/biblioteka", post.locale)}/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("admin.blog.actions.preview")}
                      </a>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => publish.mutate(post.id)}>
                      {t("admin.blog.actions.publish")}
                    </Button>
                  )}
                  {confirmDelete === post.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        remove.mutate(post.id);
                        setConfirmDelete(null);
                      }}
                    >
                      {t("admin.blog.actions.confirmDelete")}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(post.id)}>
                      {t("admin.blog.actions.delete")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!posts.isLoading && rows.length === 0 ? (
              <p className="text-sm text-foreground/55">{t("admin.blog.empty")}</p>
            ) : null}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
