/**
 * Limit jednego darmowego rozkładu na dobę.
 *
 * Warstwa dostępu jest celowo wydzielona za interfejsem `TarotLimitGateway`,
 * aby w przyszłości zastąpić localStorage walidacją po stronie backendu
 * bez zmian w UI ani w hookach.
 */

export interface TarotLimitGateway {
  /** Dzień ostatniego rozkładu w formacie YYYY-MM-DD lub null. */
  readLastDay(): string | null;
  /** Zapisuje dzień wykonania rozkładu. */
  writeLastDay(day: string): void;
  /** Czyści zapis (używane wyłącznie w testach i narzędziach). */
  clear(): void;
}

const STORAGE_KEY = "liora.tarot.last-reading-day";

/** Lokalny dzień użytkownika w formacie YYYY-MM-DD. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Milisekundy pozostałe do lokalnej północy. */
export function msUntilMidnight(from: Date = new Date()): number {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - from.getTime());
}

/** Format licznika godz:min:sek. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = `${Math.floor(total / 3600)}`.padStart(2, "0");
  const m = `${Math.floor((total % 3600) / 60)}`.padStart(2, "0");
  const s = `${total % 60}`.padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** Domyślna implementacja oparta o localStorage (etap przed backendem). */
export const localTarotLimitGateway: TarotLimitGateway = {
  readLastDay() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  writeLastDay(day) {
    try {
      window.localStorage.setItem(STORAGE_KEY, day);
    } catch {
      /* brak dostępu do storage — limit po prostu nie zadziała */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorowane */
    }
  },
};

/** Czy zapisany dzień blokuje kolejny rozkład. */
export function isLocked(lastDay: string | null, now: Date = new Date()): boolean {
  return lastDay === dayKey(now);
}
