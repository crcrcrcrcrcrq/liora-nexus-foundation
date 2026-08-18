/**
 * LIORA P0.10 — deterministyczne wyliczanie wolnych terminów.
 *
 * Funkcje są czyste: nie sięgają do sieci, DB ani czasu systemowego poza
 * jawnie przekazanym `today`. Dostępność = harmonogram − terminy zajęte.
 * Nie przechowujemy slotów w bazie; liczymy je za każdym razem.
 */
import type { WeeklySchedule, Weekday } from "../model/schedule";

/** Data w formacie YYYY-MM-DD (taki sam jak `<input type="date">` i kolumna `preferred_date`). */
export type IsoDate = string;

export function toIsoDate(date: Date): IsoDate {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Zwraca listę dat (YYYY-MM-DD) możliwych do zarezerwowania.
 *
 * @param takenDates daty już zajęte (rezerwacje o statusie `new`/`confirmed`)
 * @param today punkt odniesienia; dzięki temu wynik jest testowalny
 */
export function computeAvailableDates(
  schedule: WeeklySchedule,
  takenDates: readonly IsoDate[],
  today: Date,
): IsoDate[] {
  const openWeekdays = new Set<Weekday>(schedule.openWeekdays);
  if (openWeekdays.size === 0) return [];

  const occupied = new Map<IsoDate, number>();
  for (const date of takenDates) {
    occupied.set(date, (occupied.get(date) ?? 0) + 1);
  }

  const start = parseIsoDate(toIsoDate(today)) ?? today;
  const available: IsoDate[] = [];

  for (let offset = schedule.leadTimeDays; offset <= schedule.horizonDays; offset += 1) {
    const day = addDays(start, offset);
    if (!openWeekdays.has(day.getUTCDay() as Weekday)) continue;
    const iso = toIsoDate(day);
    if ((occupied.get(iso) ?? 0) >= schedule.capacityPerDay) continue;
    available.push(iso);
  }

  return available;
}

/** Zakres dat, dla którego pytamy bazę o zajęte terminy. */
export function availabilityRange(schedule: WeeklySchedule, today: Date) {
  const start = parseIsoDate(toIsoDate(today)) ?? today;
  return {
    from: toIsoDate(addDays(start, schedule.leadTimeDays)),
    to: toIsoDate(addDays(start, schedule.horizonDays)),
  };
}
