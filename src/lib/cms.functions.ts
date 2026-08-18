/**
 * LIORA P0.19 — funkcje serwerowe CMS.
 *
 * Odczyt publiczny jest jawnie publiczny (treść strony). Każdy zapis wymaga
 * sesji SSR i serwerowego sprawdzenia roli personelu (`requireStaffRole`).
 * Payload zawiera wyłącznie treść — nigdy `user_id`, `role`, `isAdmin`.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { CmsBundle } from "./cms.server";
import { isTemplateId, isThemeId, type SiteSettings } from "@/features/cms/model/theme";

export const fetchSiteBundle = createServerFn({ method: "GET" }).handler(
  async (): Promise<CmsBundle> => {
    const { readPublicBundle } = await import("./cms.server");
    return readPublicBundle();
  },
);

export const fetchCmsAdminBundle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<CmsBundle> => {
    const { requireStaffRole } = await import("./admin.server");
    const { readAdminBundle } = await import("./cms.server");
    await requireStaffRole(context.supabase, context.userId);
    return readAdminBundle(context.supabase);
  });

export const saveCmsContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => ({
    entries: (input as { entries?: unknown })?.entries,
  }))
  .handler(async ({ data, context }): Promise<CmsBundle> => {
    const { requireStaffRole } = await import("./admin.server");
    const { validateEntries, writeEntries, readAdminBundle } = await import("./cms.server");
    await requireStaffRole(context.supabase, context.userId);
    await writeEntries(context.supabase, validateEntries(data.entries));
    return readAdminBundle(context.supabase);
  });

export const saveSiteSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): SiteSettings => {
    const raw = (input ?? {}) as Record<string, unknown>;
    if (!isThemeId(raw["themeId"])) throw new Error("Invalid settings: unknown theme");
    if (!isTemplateId(raw["templateId"])) throw new Error("Invalid settings: unknown template");
    return { themeId: raw["themeId"], templateId: raw["templateId"] };
  })
  .middleware([requireSupabaseSession])
  .handler(async ({ data, context }): Promise<SiteSettings> => {
    const { requireStaffRole } = await import("./admin.server");
    const { writeSettings } = await import("./cms.server");
    await requireStaffRole(context.supabase, context.userId);
    return writeSettings(context.supabase, data);
  });
