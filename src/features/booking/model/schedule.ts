/**
 * LIORA P0.11 — struktura tygodniowego harmonogramu dostępności.
 *
 * Po P0.11 grafik NIE jest już danymi przykładowymi. Źródłem prawdy jest
 * tabela `public.booking_schedule` zarządzana przez Admina. Ten moduł zawiera
 * wyłącznie kształt danych i stałe reguły domenowe (pojemność, horyzont,
 * wyprzedzenie), które nie zmieniły się od P0.10.
 *
 * Strefa czasowa: wszystkie daty liczymy w UTC (jak w P0.10), a
 * `preferred_date` pozostaje tekstem `YYYY-MM-DD`.
 */

/** 0 = niedziela … 6 = sobota (zgodnie z `Date.prototype.getDay()`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Pojedynczy przedział godzinowy w grafiku (rekord `booking_schedule`). */
export interface ScheduleEntry {
  id: string;
  weekday: Weekday;
  /** HH:MM */
  fromTime: string;
  /** HH:MM */
  toTime: string;
  isActive: boolean;
}

/**
 * P0.28 — publiczne okno dostępności (bez identyfikatora rekordu).
 * To jedyna część grafiku, jaka opuszcza serwer w kierunku anonimowego gościa.
 */
export interface ScheduleWindow {
  weekday: Weekday;
  /** HH:MM */
  fromTime: string;
  /** HH:MM */
  toTime: string;
}

/** Długość pojedynczego slotu w minutach (capacity dnia pozostaje = 1). */
export const SLOT_MINUTES = 60;

export interface WeeklySchedule {
  /** Dni tygodnia, w których praktyka przyjmuje (z aktywnych wpisów grafiku). */
  openWeekdays: Weekday[];
  /** Ile rezerwacji może przypadać na jeden dzień. Ustalone: jedna dziennie. */
  capacityPerDay: number;
  /** Ile dni naprzód pokazujemy dostępność. */
  horizonDays: number;
  /** Minimalne wyprzedzenie w dniach (0 = można wybrać dzisiaj). */
  leadTimeDays: number;
}

/** Reguły niezmienne od P0.10 — nie są konfigurowalne przez Admina. */
export const SCHEDULE_RULES = {
  capacityPerDay: 1,
  horizonDays: 60,
  leadTimeDays: 1,
} as const;

/**
 * Buduje harmonogram z listy aktywnych dni tygodnia.
 * Brak konfiguracji = brak dostępności (pusta lista dni).
 */
export function scheduleFromWeekdays(weekdays: readonly Weekday[]): WeeklySchedule {
  return {
    openWeekdays: [...new Set(weekdays)],
    ...SCHEDULE_RULES,
  };
}
