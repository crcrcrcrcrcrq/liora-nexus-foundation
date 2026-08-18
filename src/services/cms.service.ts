import { api, API_ROUTES } from "@/services/api";
import type { ApiResult, BlogPost } from "@/types";

/**
 * Kontrakt warstwy CMS.
 *
 * Treści statyczne (bloki stron, wpisy bloga) będą pobierane z backendu.
 * Dopóki endpointy nie istnieją, moduły domenowe korzystają z lokalnych
 * danych — podmiana sprowadza się do użycia tych funkcji.
 */
export interface CmsBlock {
  key: string;
  title: string;
  body: string;
  updatedAt: string;
}

export function fetchBlocks(page: string): Promise<ApiResult<CmsBlock[]>> {
  return api.get<CmsBlock[]>(`${API_ROUTES.cmsBlocks}?page=${encodeURIComponent(page)}`);
}

export function saveBlock(
  block: Pick<CmsBlock, "key" | "title" | "body">,
): Promise<ApiResult<CmsBlock>> {
  return api.patch<CmsBlock>(`${API_ROUTES.cmsBlocks}/${encodeURIComponent(block.key)}`, block);
}

export function fetchCmsPosts(): Promise<ApiResult<BlogPost[]>> {
  return api.get<BlogPost[]>(API_ROUTES.cmsPosts);
}

export function saveCmsPost(post: BlogPost): Promise<ApiResult<BlogPost>> {
  return api.patch<BlogPost>(`${API_ROUTES.cmsPosts}/${encodeURIComponent(post.slug)}`, post);
}
