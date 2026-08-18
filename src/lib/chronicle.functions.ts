import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseSession } from "@/integrations/supabase/session-middleware";
import type { ReflectionCard, SoulReflection } from "@/features/kronika/model/reflection";
import type {
  ChronicleNote,
  ChronicleOverview,
  ChronicleRitual,
} from "@/features/kronika/model/types";
import { BOOKING_COLUMNS, toBooking, type BookingRow } from "@/features/booking/lib/booking-row";
import { bookingToChronicleConsultation } from "@/features/booking/lib/chronicle-projection";
import { buildQuarterlyReports } from "@/features/kronika/lib/reports-projection";

/**
 * LIORA P0.4 — trwały zapis Kroniki Duszy.
 *
 * Tożsamość pochodzi WYŁĄCZNIE z sesji SSR (ciasteczko HttpOnly →
 * `requireSupabaseSession` → `getUser()`). Payload przenosi dane domenowe,
 * nigdy `user_id`; własność egzekwuje RLS (`auth.uid() = user_id`).
 */

interface ReflectionRow {
  id: string;
  reading_at: string;
  updated_at: string;
  language: string;
  spread: string;
  cards: unknown;
  interpretation: string;
  heard: string;
  leaving: string;
  taking: string;
}

interface RitualRow {
  id: string;
  kind: string;
  title: string;
  occurred_at: string;
  reflection: string;
  details: string | null;
  interpretation_path: string | null;
}

const REFLECTION_COLUMNS =
  "id, reading_at, updated_at, language, spread, cards, interpretation, heard, leaving, taking";
const RITUAL_COLUMNS = "id, kind, title, occurred_at, reflection, details, interpretation_path";

interface NoteRow {
  id: string;
  body: string;
  created_at: string;
}

const NOTE_COLUMNS = "id, body, created_at";
/** Limit spójny z ograniczeniem w bazie (P0.8). */
const NOTE_MAX_LENGTH = 4000;

function toNote(row: NoteRow): ChronicleNote {
  return { id: row.id, createdAt: row.created_at, body: row.body };
}

function toCards(value: unknown): ReflectionCard[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const card = item as Partial<ReflectionCard>;
    return [
      {
        name: typeof card.name === "string" ? card.name : "",
        position: typeof card.position === "string" ? card.position : "",
        orientation: typeof card.orientation === "string" ? card.orientation : "",
      },
    ];
  });
}

function toReflection(row: ReflectionRow): SoulReflection {
  return {
    id: row.id,
    readingAt: row.reading_at,
    updatedAt: row.updated_at,
    language: row.language,
    spread: row.spread,
    cards: toCards(row.cards),
    interpretation: row.interpretation,
    heard: row.heard,
    leaving: row.leaving,
    taking: row.taking,
  };
}

function toRitual(row: RitualRow): ChronicleRitual {
  const kind: ChronicleRitual["kind"] =
    row.kind === "astrology" || row.kind === "note" ? row.kind : "tarot";
  return {
    id: row.id,
    kind,
    title: row.title,
    occurredAt: row.occurred_at,
    reflection: row.reflection,
    ...(row.details ? { details: row.details } : {}),
    ...(row.interpretation_path ? { interpretationPath: row.interpretation_path } : {}),
  };
}

/** Karty jako zwykły JSON — bez struktur nominalnych w zapisie. */
function cardsJson(cards: readonly ReflectionCard[]): Record<string, string>[] {
  return cards.map((card) => ({
    name: card.name,
    position: card.position,
    orientation: card.orientation,
  }));
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

interface ReflectionInput {
  readingAt: string;
  language: string;
  spread: string;
  interpretation: string;
  cards: ReflectionCard[];
  heard: string;
  leaving: string;
  taking: string;
}

function parseReflectionInput(input: unknown): ReflectionInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const readingAt = text(raw["readingAt"]);
  if (!readingAt) throw new Error("Invalid reflection: readingAt is required");
  return {
    readingAt,
    language: text(raw["language"]) || "pl",
    spread: text(raw["spread"]),
    interpretation: text(raw["interpretation"]),
    cards: toCards(raw["cards"]),
    heard: text(raw["heard"]),
    leaving: text(raw["leaving"]),
    taking: text(raw["taking"]),
  };
}

/* ─────────────────────────── refleksje ─────────────────────────── */

export const listReflections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<SoulReflection[]> => {
    const { data, error } = await context.supabase
      .from("chronicle_reflections")
      .select(REFLECTION_COLUMNS)
      .order("reading_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as ReflectionRow[]).map(toReflection);
  });

export const createReflectionEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator(parseReflectionInput)
  .handler(async ({ data, context }): Promise<SoulReflection> => {
    const { data: row, error } = await context.supabase
      .from("chronicle_reflections")
      .insert({
        user_id: context.userId,
        reading_at: data.readingAt,
        language: data.language,
        spread: data.spread,
        interpretation: data.interpretation,
        cards: cardsJson(data.cards),
        heard: data.heard,
        leaving: data.leaving,
        taking: data.taking,
      })
      .select(REFLECTION_COLUMNS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Reflection was not saved");
    return toReflection(row as ReflectionRow);
  });

export const updateReflectionEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const id = text(raw["id"]);
    if (!id) throw new Error("Invalid reflection: id is required");
    return {
      id,
      heard: text(raw["heard"]),
      leaving: text(raw["leaving"]),
      taking: text(raw["taking"]),
    };
  })
  .handler(async ({ data, context }): Promise<SoulReflection> => {
    const { data: row, error } = await context.supabase
      .from("chronicle_reflections")
      .update({ heard: data.heard, leaving: data.leaving, taking: data.taking })
      .eq("id", data.id)
      .select(REFLECTION_COLUMNS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Reflection was not updated");
    return toReflection(row as ReflectionRow);
  });

export const deleteReflectionEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const id = text((input as Record<string, unknown>)?.["id"]);
    if (!id) throw new Error("Invalid reflection: id is required");
    return { id };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase
      .from("chronicle_reflections")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Jednorazowe przeniesienie zapisów z pamięci przeglądarki.
 * Wykonuje się tylko wtedy, gdy Kronika użytkownika jest jeszcze pusta —
 * inaczej nie dałoby się bezpiecznie rozstrzygnąć własności wpisów.
 */
export const importLocalReflections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const entries = Array.isArray(raw["entries"]) ? raw["entries"] : [];
    return { entries: entries.map(parseReflectionInput) };
  })
  .handler(async ({ data, context }): Promise<{ imported: number }> => {
    if (data.entries.length === 0) return { imported: 0 };

    const { count, error: countError } = await context.supabase
      .from("chronicle_reflections")
      .select("id", { count: "exact", head: true });
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) return { imported: 0 };

    const { error } = await context.supabase.from("chronicle_reflections").insert(
      data.entries.map((entry) => ({
        user_id: context.userId,
        reading_at: entry.readingAt,
        language: entry.language,
        spread: entry.spread,
        interpretation: entry.interpretation,
        cards: cardsJson(entry.cards),
        heard: entry.heard,
        leaving: entry.leaving,
        taking: entry.taking,
      })),
    );
    if (error) throw new Error(error.message);
    return { imported: data.entries.length };
  });

/* ─────────────────────────── rytuały ─────────────────────────── */

export const listRituals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<ChronicleRitual[]> => {
    const { data, error } = await context.supabase
      .from("chronicle_rituals")
      .select(RITUAL_COLUMNS)
      .order("occurred_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as RitualRow[]).map(toRitual);
  });

export const createRitual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const kind = text(raw["kind"]);
    if (kind !== "tarot" && kind !== "astrology" && kind !== "note") {
      throw new Error("Invalid ritual kind");
    }
    return {
      kind,
      title: text(raw["title"]),
      occurredAt: text(raw["occurredAt"]) || new Date().toISOString(),
      reflection: text(raw["reflection"]),
      details: text(raw["details"]),
      interpretationPath: text(raw["interpretationPath"]),
    };
  })
  .handler(async ({ data, context }): Promise<ChronicleRitual> => {
    const { data: row, error } = await context.supabase
      .from("chronicle_rituals")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        title: data.title,
        occurred_at: data.occurredAt,
        reflection: data.reflection,
        details: data.details || null,
        interpretation_path: data.interpretationPath || null,
      })
      .select(RITUAL_COLUMNS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Ritual was not saved");
    return toRitual(row as RitualRow);
  });

/* ─────────────────────────── przegląd ─────────────────────────── */

/**
 * Pełny obraz Kroniki zalogowanego użytkownika. Wyłącznie dane rzeczywiste —
 * brak wpisów oznacza pusty stan, nigdy zapis przykładowy.
 */
export const fetchChronicleOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<ChronicleOverview> => {
    const { supabase, userId, email } = context;

    const [profileResult, ritualsResult, bookingsResult, notesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("email, display_name, created_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("chronicle_rituals").select(RITUAL_COLUMNS).order("occurred_at", {
        ascending: false,
      }),
      // P0.5: konsultacje to projekcja rezerwacji — RLS ogranicza wynik do
      // rezerwacji zalogowanej osoby, bez `user_id` z klienta.
      supabase.from("bookings").select(BOOKING_COLUMNS).order("created_at", { ascending: false }),
      // P0.8: prywatne notatki użytkownika — jedno żądanie razem z resztą Kroniki.
      supabase
        .from("chronicle_notes")
        .select(NOTE_COLUMNS)
        .order("created_at", { ascending: false }),
    ]);

    if (ritualsResult.error) throw new Error(ritualsResult.error.message);
    if (bookingsResult.error) throw new Error(bookingsResult.error.message);
    if (notesResult.error) throw new Error(notesResult.error.message);

    const profileRow = (profileResult.data ?? null) as {
      email: string | null;
      display_name: string | null;
      created_at: string | null;
    } | null;

    const rituals = ((ritualsResult.data ?? []) as RitualRow[]).map(toRitual);

    const consultations = ((bookingsResult.data ?? []) as BookingRow[])
      .map(toBooking)
      .map(bookingToChronicleConsultation);

    return {
      profile: {
        email: profileRow?.email ?? email,
        ...(profileRow?.display_name ? { displayName: profileRow.display_name } : {}),
        ...(profileRow?.created_at ? { joinedAt: profileRow.created_at } : {}),
      },
      lastRitual: rituals[0] ?? null,
      rituals,
      consultations,
      notes: ((notesResult.data ?? []) as NoteRow[]).map(toNote),
      reflection: null,
      // P0.7: raporty to kwartalna projekcja istniejących danych
      // (chronicle_rituals + bookings). Brak tabeli, brak zapisu.
      reports: buildQuarterlyReports(rituals, consultations),
    };
  });

/* ─────────────────────────── notatki ─────────────────────────── */

/**
 * P0.8 — prywatne notatki użytkownika. Osobny byt: nie refleksja i nie
 * rytuał `kind='note'`. Tożsamość zawsze z sesji SSR, własność przez RLS.
 */

function parseNoteBody(value: unknown): string {
  const body = text(value).trim();
  if (!body) throw new Error("Invalid note: body is required");
  if (body.length > NOTE_MAX_LENGTH) throw new Error("Invalid note: body is too long");
  return body;
}

export const listChronicleNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseSession])
  .handler(async ({ context }): Promise<ChronicleNote[]> => {
    const { data, error } = await context.supabase
      .from("chronicle_notes")
      .select(NOTE_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as NoteRow[]).map(toNote);
  });

export const createChronicleNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => ({
    body: parseNoteBody((input as Record<string, unknown>)?.["body"]),
  }))
  .handler(async ({ data, context }): Promise<ChronicleNote> => {
    const { data: row, error } = await context.supabase
      .from("chronicle_notes")
      .insert({ user_id: context.userId, body: data.body })
      .select(NOTE_COLUMNS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Note was not saved");
    return toNote(row as NoteRow);
  });

export const updateChronicleNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const id = text(raw["id"]);
    if (!id) throw new Error("Invalid note: id is required");
    return { id, body: parseNoteBody(raw["body"]) };
  })
  .handler(async ({ data, context }): Promise<ChronicleNote> => {
    const { data: row, error } = await context.supabase
      .from("chronicle_notes")
      .update({ body: data.body })
      .eq("id", data.id)
      .select(NOTE_COLUMNS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Note was not updated");
    return toNote(row as NoteRow);
  });

export const deleteChronicleNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseSession])
  .inputValidator((input: unknown) => {
    const id = text((input as Record<string, unknown>)?.["id"]);
    if (!id) throw new Error("Invalid note: id is required");
    return { id };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("chronicle_notes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
