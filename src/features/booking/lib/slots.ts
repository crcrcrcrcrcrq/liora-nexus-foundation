/**
 * LIORA P0.28 — deterministyczne wyliczanie godzin (slotów) z grafiku.
 *
 * Funkcje są czyste: brak sieci, brak DB, brak czasu systemowego. Ten sam
 * moduł liczy sloty w UI i weryfikuje je po stronie serwera, więc klient nigdy
 * nie może „wymyślić” godziny spoza grafiku.
 */
import { SLOT_MINUTES, type ScheduleWindow, type Weekday } from "../model/schedule";
import { parseIsoDate, type IsoDate } from "./availability";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isTime(value: string): boolean {
  return TIME.test(value);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function toTime(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Sloty dla dnia tygodnia: każde aktywne okno dzielone na kroki SLOT_MINUTES. */
export function slotsForWeekday(windows: readonly ScheduleWindow[], weekday: Weekday): string[] {
  const slots = new Set<string>();
  for (const window of windows) {
    if (window.weekday !== weekday) continue;
    if (!isTime(window.fromTime) || !isTime(window.toTime)) continue;
    const start = toMinutes(window.fromTime);
    const end = toMinutes(window.toTime);
    for (let at = start; at + SLOT_MINUTES <= end; at += SLOT_MINUTES) {
      slots.add(toTime(at));
    }
  }
  return [...slots].sort();
}

/** Sloty dla konkretnej daty ISO (YYYY-MM-DD), liczone w UTC jak reszta P0.10. */
export function slotsForDate(windows: readonly ScheduleWindow[], date: IsoDate): string[] {
  const parsed = parseIsoDate(date);
  if (!parsed) return [];
  return slotsForWeekday(windows, parsed.getUTCDay() as Weekday);
}

/** Czy godzina mieści się w grafiku dla wskazanej daty. */
export function isSlotInSchedule(
  windows: readonly ScheduleWindow[],
  date: IsoDate,
  time: string,
): boolean {
  if (!isTime(time)) return false;
  return slotsForDate(windows, date).includes(time);
}
