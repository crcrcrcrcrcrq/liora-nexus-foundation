/**
 * LIORA P0.19 — warstwa serwerowa CMS.
 *
 * Moduł wyłącznie serwerowy. Nie tworzy drugiego źródła prawdy dla treści:
 * `public.site_content` przechowuje NADPISANIA kluczy i18n, a `public.site_settings`
 * jeden rekord konfiguracji prezentacji (theme + template).
 *
 * Odczyt publiczny idzie przez klienta publishable (RLS jako `anon`), zapis
 * wyłącznie przez klienta sesyjnego po serwerowym sprawdzeniu roli personelu.
 *
 * Dostęp do tabel CMS idzie przez nietypowanego klienta PostgREST (`cms()`),
 * aby warstwa nie zależała od momentu regeneracji `src/integrations/supabase/types.ts`.
 * Kontrakt kolumn jest utrwalony w migracji `*_site_content_site_settings`
 * oraz w typach `ContentRow` / `SettingsRow` poniżej.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LioraServerClient } from "@/integrations/supabase/session.server";
import { SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import { isEditableKey, CMS_VALUE_MAX_LENGTH } from "@/features/cms/model/fields";
import {
  DEFAULT_SITE_SETTINGS,
  isTemplateId,
  isThemeId,
  type SiteSettings,
} from "@/features/cms/model/theme";

export interface CmsBundle {
  content: Record<Language, Record<string, string>>;
  settings: SiteSettings;
}

export interface CmsEntryInput {
  locale: Language;
  key: string;
  value: string;
}

interface ContentRow {
  locale: string;
  content_key: string;
  value: string;
}

interface SettingsRow {
  theme_id: string;
  template_id: string;
}

/** Nietypowany dostęp do tabel CMS (patrz nota o migracji na górze pliku). */
type CmsClient = SupabaseClient<never, "public", never>;

function cms(client: unknown): CmsClient {
  return client as CmsClient;
}

function emptyContent(): Record<Language, Record<string, string>> {
  return SUPPORTED_LANGUAGES.reduce(
    (acc, language) => {
      acc[language] = {};
      return acc;
    },
    {} as Record<Language, Record<string, string>>,
  );
}

export function emptyBundle(): CmsBundle {
  return { content: emptyContent(), settings: { ...DEFAULT_SITE_SETTINGS } };
}

/**
 * Klient publishable do odczytu publicznego. Klucze `sb_*` nie są JWT, więc
 * wysyłamy wyłącznie nagłówek `apikey` (bez `Authorization: Bearer`).
 */
function publicClient(): CmsClient | null {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return cms(
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

function toContent(rows: ContentRow[]): Record<Language, Record<string, string>> {
  const content = emptyContent();
  for (const row of rows) {
    const locale = row.locale as Language;
    if (!SUPPORTED_LANGUAGES.includes(locale)) continue;
    if (!isEditableKey(row.content_key)) continue;
    content[locale][row.content_key] = row.value;
  }
  return content;
}

function toSettings(row: SettingsRow | null): SiteSettings {
  return {
    themeId: isThemeId(row?.theme_id) ? row.theme_id : DEFAULT_SITE_SETTINGS.themeId,
    templateId: isTemplateId(row?.template_id) ? row.template_id : DEFAULT_SITE_SETTINGS.templateId,
  };
}

async function readBundle(client: CmsClient, onlyActive: boolean): Promise<CmsBundle> {
  const contentQuery = client.from("site_content").select("locale, content_key, value");
  const [contentResult, settingsResult] = await Promise.all([
    onlyActive ? contentQuery.eq("active", true) : contentQuery,
    client.from("site_settings").select("theme_id, template_id").eq("id", "default").maybeSingle(),
  ]);

  if (contentResult.error) throw new Error("CMS content unavailable");

  return {
    content: toContent((contentResult.data ?? []) as unknown as ContentRow[]),
    settings: toSettings((settingsResult.data ?? null) as unknown as SettingsRow | null),
  };
}

/**
 * Publiczny odczyt treści. NIGDY nie rzuca — brak konfiguracji backendu lub
 * błąd bazy oznacza po prostu brak nadpisań, czyli teksty domyślne ze słownika.
 */
export async function readPublicBundle(): Promise<CmsBundle> {
  const client = publicClient();
  if (!client) return emptyBundle();

  try {
    return await readBundle(client, true);
  } catch {
    return emptyBundle();
  }
}

/** Odczyt dla panelu — pod sesją personelu (RLS obowiązuje jak dla tego konta). */
export async function readAdminBundle(supabase: LioraServerClient): Promise<CmsBundle> {
  return readBundle(cms(supabase), false);
}

/**
 * Walidacja serwerowa treści. Odrzuca klucze spoza allowlisty, nieznane języki,
 * zbyt długie wartości i znaczniki HTML — admin edytuje tekst, nie markup.
 */
export function validateEntries(entries: unknown): CmsEntryInput[] {
  if (!Array.isArray(entries)) throw new Error("Invalid CMS payload");
  if (entries.length > 200) throw new Error("Invalid CMS payload: too many entries");

  return entries.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    const locale = typeof item["locale"] === "string" ? item["locale"] : "";
    const key = typeof item["key"] === "string" ? item["key"] : "";
    const value = typeof item["value"] === "string" ? item["value"] : "";

    if (!SUPPORTED_LANGUAGES.includes(locale as Language)) {
      throw new Error("Invalid CMS payload: unsupported locale");
    }
    if (!isEditableKey(key)) throw new Error("Invalid CMS payload: key is not editable");
    if (value.length > CMS_VALUE_MAX_LENGTH) {
      throw new Error("Invalid CMS payload: value too long");
    }
    if (/[<>]/.test(value)) throw new Error("Invalid CMS payload: markup is not allowed");

    return { locale: locale as Language, key, value };
  });
}

/**
 * Zapis nadpisań. Pusta wartość = powrót do tekstu domyślnego (usuwamy wiersz),
 * dzięki czemu CMS nigdy nie utrwala pustej strony.
 */
export async function writeEntries(
  supabase: LioraServerClient,
  entries: CmsEntryInput[],
): Promise<void> {
  const client = cms(supabase);
  const removals = entries.filter((entry) => entry.value.trim() === "");
  const upserts = entries.filter((entry) => entry.value.trim() !== "");

  for (const entry of removals) {
    const { error } = await client
      .from("site_content")
      .delete()
      .eq("locale", entry.locale)
      .eq("content_key", entry.key);
    if (error) throw new Error("CMS content was not saved");
  }

  if (upserts.length > 0) {
    const { error } = await client.from("site_content").upsert(
      upserts.map((entry) => ({
        locale: entry.locale,
        content_key: entry.key,
        value: entry.value,
        active: true,
      })) as never,
      { onConflict: "locale,content_key" },
    );
    if (error) throw new Error("CMS content was not saved");
  }
}

export async function writeSettings(
  supabase: LioraServerClient,
  settings: SiteSettings,
): Promise<SiteSettings> {
  const { error } = await cms(supabase)
    .from("site_settings")
    .upsert(
      { id: "default", theme_id: settings.themeId, template_id: settings.templateId } as never,
      { onConflict: "id" },
    );
  if (error) throw new Error("Site settings were not saved");
  return settings;
}
