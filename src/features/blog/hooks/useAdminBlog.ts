import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlogPost,
  deleteBlogPost,
  fetchAdminBlogPosts,
  publishBlogPost,
  unpublishBlogPost,
  updateBlogPost,
} from "@/lib/blog.functions";
import type { BlogPostDraft, BlogPostRecord } from "@/features/blog/model/types";

/**
 * LIORA P0.24 — dostęp panelu do artykułów. Autoryzacja i walidacja są
 * serwerowe; hook zna wyłącznie dane widoku.
 */
const KEY = ["admin", "blog"] as const;

export function useAdminBlogPosts() {
  return useQuery<BlogPostRecord[]>({
    queryKey: KEY,
    queryFn: () => fetchAdminBlogPosts(),
    staleTime: 15_000,
  });
}

export function useAdminBlogMutations() {
  const client = useQueryClient();
  const invalidate = () => void client.invalidateQueries({ queryKey: KEY });

  const save = useMutation({
    mutationFn: (draft: BlogPostDraft & { id?: string }) =>
      draft.id ? updateBlogPost({ data: draft }) : createBlogPost({ data: draft }),
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishBlogPost({ data: { id } }),
    onSuccess: invalidate,
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => unpublishBlogPost({ data: { id } }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBlogPost({ data: { id } }),
    onSuccess: invalidate,
  });

  return { save, publish, unpublish, remove };
}
