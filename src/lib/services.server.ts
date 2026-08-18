/**
 * LIORA P0.27 — warstwa serwerowa usług.
 *
 * Moduł wyłącznie serwerowy. `public.services` jest jedynym źródłem prawdy dla
 * oferty; nie duplikujemy jej w CMS (`site_content` pozostaje warstwą tekstów).
 *
 * Odczyt publiczny idzie przez klienta publishable (RLS jako `anon`, polityka
 * `services_select_public` → tylko `is_active`). Każdy zapis przechodzi przez
 * klienta sesyjnego, po serwerowym rozstrzygnięciu roli personelu.
 *
 * Dostęp do tabeli idzie przez nietypowanego klienta PostgREST, aby warstwa nie
 * zależała od momentu regeneracji `src/integrations/supabase/types.ts`.
 * Kontrakt kolumn utrwala migracja `*_services` oraz `ServiceRow` poniżej.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import type { ServiceRecord, ServiceLocaleContent } from "@/features/services/model/types";

type ServicesClient = SupabaseClient<never, "public", never>;

function untyped(client: unknown): ServicesClient {
  return client as ServicesClient;
}

interface ServiceRow {
  id: string;
  slug: string;
  price: number | null;
  currency: string;
  sort_order: number;
  is_active: boolean;
  is_bookable: boolean;
  featured: boolean;
  cta_path: string;
  title_pl: string;
  title_en: string;
  duration_pl: string;
  duration_en: string;
  summary_pl: string;
  summary_en: string;
  cta_pl: string;
  cta_en: string;
  includes_pl: unknown;
  includes_en: unknown;
}

const COLUMNS =
  "id, slug, price, currency, sort_order, is_active, is_bookable, featured, cta_path, " +
  "title_pl, title_en, duration_pl, duration_en, summary_pl, summary_en, cta_pl, cta_en, " +
  "includes_pl, includes_en";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const localeContent = z.object({
  title: z.string().trim().max(160).default(""),
  duration: z.string().trim().max(120).default(""),
  summary: z.string().trim().max(1200).default(""),
  cta: z.string().trim().max(80).default(""),
  includes: z.array(z.string().trim().max(240)).max(12).default([]),
});

/**
 * Walidacja serwerowa. Payload zawiera WYŁĄCZNIE dane usługi — nigdy `user_id`,
 * `role` ani `isAdmin`; autorytet roli rozstrzyga się przed wywołaniem zapisu.
 */
export const serviceInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().regex(SLUG, "Invalid slug").max(80),
  price: z.number().int().min(0).max(1_000_000).nullable().default(null),
  currency: z.string().trim().min(3).max(8).default("PLN"),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
  isBookable: z.boolean().default(true),
  featured: z.boolean().default(false),
  ctaPath: z
    .string()
    .trim()
    .regex(/^\/[a-z0-9/-]*$/, "Invalid path")
    .max(120)
    .default("/rezerwacja"),
  content: z.object({ pl: localeContent, en: localeContent }),
});

export type ServiceInput = z.infer<typeof serviceInput>;

function includes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function content(row: ServiceRow, language: Language): ServiceLocaleContent {
  const suffix = language === "en" ? "en" : "pl";
  return {
    title: suffix === "en" ? row.title_en : row.title_pl,
    duration: suffix === "en" ? row.duration_en : row.duration_pl,
    summary: suffix === "en" ? row.summary_en : row.summary_pl,
    cta: suffix === "en" ? row.cta_en : row.cta_pl,
    includes: includes(suffix === "en" ? row.includes_en : row.includes_pl),
  };
}

export function toService(row: ServiceRow): ServiceRecord {
  return {
    id: row.id,
    slug: row.slug,
    price: row.price,
    currency: row.currency,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    isBookable: row.is_bookable,
    featured: row.featured,
    ctaPath: row.cta_path,
    content: SUPPORTED_LANGUAGES.reduce(
      (acc, language) => {
        acc[language] = content(row, language);
        return acc;
      },
      {} as Record<Language, ServiceLocaleContent>,
    ),
  };
}

function toRow(input: ServiceInput) {
  return {
    slug: input.slug,
    price: input.price,
    currency: input.currency,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    is_bookable: input.isBookable,
    featured: input.featured,
    cta_path: input.ctaPath,
    title_pl: input.content.pl.title,
    title_en: input.content.en.title,
    duration_pl: input.content.pl.duration,
    duration_en: input.content.en.duration,
    summary_pl: input.content.pl.summary,
    summary_en: input.content.en.summary,
    cta_pl: input.content.pl.cta,
    cta_en: input.content.en.cta,
    includes_pl: input.content.pl.includes,
    includes_en: input.content.en.includes,
  };
}

function publicClient(): ServicesClient | null {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;

  return untyped(
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

/**
 * Publiczna oferta. NIGDY nie rzuca — brak backendu lub błąd bazy oznacza pustą
 * listę, a widok publiczny ma wtedy własny fallback do oferty wbudowanej.
 */
export async function readPublicServices(): Promise<ServiceRecord[]> {
  const client = publicClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("services")
      .select(COLUMNS)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) return [];
    return ((data ?? []) as unknown as ServiceRow[]).map(toService);
  } catch {
    return [];
  }
}

/** Pełna lista dla personelu — również usługi nieaktywne (RLS: staff). */
export async function listServices(supabase: unknown): Promise<ServiceRecord[]> {
  const { data, error } = await untyped(supabase)
    .from("services")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error("Services unavailable");
  return ((data ?? []) as unknown as ServiceRow[]).map(toService);
}

export async function upsertService(
  supabase: unknown,
  input: ServiceInput,
): Promise<ServiceRecord> {
  const client = untyped(supabase);
  const row = toRow(input);

  const query = input.id
    ? client
        .from("services")
        .update(row as never)
        .eq("id", input.id)
    : client.from("services").insert(row as never);

  const { data, error } = await query.select(COLUMNS).single();
  if (error) {
    if (error.code === "23505") throw new Error("SERVICE_SLUG_TAKEN");
    throw new Error("Service was not saved");
  }
  if (!data) throw new Error("Service was not saved");
  return toService(data as unknown as ServiceRow);
}

export async function setServiceActive(
  supabase: unknown,
  id: string,
  isActive: boolean,
): Promise<ServiceRecord> {
  const { data, error } = await untyped(supabase)
    .from("services")
    .update({ is_active: isActive } as never)
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error || !data) throw new Error("Service was not updated");
  return toService(data as unknown as ServiceRow);
}
