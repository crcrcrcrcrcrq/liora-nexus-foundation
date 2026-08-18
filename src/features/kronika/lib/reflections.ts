/**
 * Dostęp do refleksji. Warstwa jest schowana za interfejsem `ReflectionGateway`,
 * aby przyszły zapis po stronie serwera nie dotknął ani hooków, ani widoków.
 */
import type { ReflectionAnswers, ReflectionContext, SoulReflection } from "../model/reflection";

export interface ReflectionGateway {
  readAll(): SoulReflection[];
  writeAll(entries: readonly SoulReflection[]): void;
}

const STORAGE_KEY = "liora.chronicle.reflections";

function isReflection(value: unknown): value is SoulReflection {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<SoulReflection>;
  return typeof entry.id === "string" && typeof entry.readingAt === "string";
}

/** Domyślne źródło: prywatna pamięć przeglądarki. */
export const localReflectionGateway: ReflectionGateway = {
  readAll() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isReflection) : [];
    } catch {
      return [];
    }
  },
  writeAll(entries) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* prywatny tryb przeglądarki — wpis żyje tylko w tej sesji */
    }
  },
};

/** Identyfikator wpisu: czytelny, bez zewnętrznych zależności. */
export function reflectionId(now: Date = new Date()): string {
  return `ref-${now.getTime().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function createReflection(
  context: ReflectionContext,
  answers: ReflectionAnswers,
  now: Date = new Date(),
): SoulReflection {
  return { id: reflectionId(now), updatedAt: now.toISOString(), ...context, ...answers };
}

/** Najnowsze wpisy jako pierwsze — Kronika czyta się od teraz wstecz. */
export function sortReflections(entries: readonly SoulReflection[]): SoulReflection[] {
  return [...entries].sort((a, b) => b.readingAt.localeCompare(a.readingAt));
}

export function hasAnswers(answers: ReflectionAnswers): boolean {
  return Boolean(answers.heard.trim() || answers.leaving.trim() || answers.taking.trim());
}

/**
 * P0.4 — pamięć przeglądarki przestaje być warstwą trwałości.
 *
 * Odczytuje ewentualne stare wpisy i natychmiast je usuwa, aby po migracji
 * do Kroniki nie istniało drugie źródło prawdy. Zwraca pustą listę, gdy nie
 * ma czego przenieść lub gdy zapis jest nieczytelny (żadnego zgadywania).
 */
export function drainLocalReflections(): SoulReflection[] {
  if (typeof window === "undefined") return [];
  const entries = localReflectionGateway.readAll();
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* prywatny tryb przeglądarki */
  }
  return entries;
}
