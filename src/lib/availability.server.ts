/**
 * LIORA P0.11 — serwerowe źródło dostępności terminów.
 *
 * Moduł wyłącznie serwerowy. Dostępność jest publiczna, więc korzystamy z
 * klucza publishable (bez sesji) i z dwóch funkcji zwracających minimum:
 * `public.active_schedule_weekdays` (same numery dni tygodnia) oraz
 * `public.booked_dates` (same daty zajęte). Żadnych danych osobowych,
 * żadnego service-role. RLS na `bookings` i `booking_schedule` bez zmian.
 *
 * Brak konfiguracji grafiku = brak dostępności (pusta lista).
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/schema";
import { SUPABASE_ENDPOINT, SUPABASE_PUBLISHABLE_KEY, supabaseFetch } from "@/config/supabase";
import {
  availabilityRange,
  computeAvailableDates,
  type IsoDate,
} from "@/features/booking/lib/availability";
import {
  scheduleFromWeekdays,
  type ScheduleWindow,
  type Weekday,
} from "@/features/booking/model/schedule";

/** Publiczny kontrakt dostępności: wolne dni + okna godzinowe grafiku. */
export interface AvailabilityPayload {
  dates: IsoDate[];
  windows: ScheduleWindow[];
}

function createPublicClient() {
  // Bezpośrednio na zewnętrzny endpoint — bez zarezerwowanych zmiennych Cloud.
  return createClient<Database>(SUPABASE_ENDPOINT, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: supabaseFetch(SUPABASE_PUBLISHABLE_KEY),
    },
  });
}

/**
 * Wolne dni dla wskazanej usługi. Harmonogram jest wspólny dla praktyki,
 * `serviceSlug` służy dziś wyłącznie walidacji istnienia usługi.
 */
export async function readAvailableDates(today: Date = new Date()): Promise<IsoDate[]> {
  return (await readAvailability(today)).dates;
}

/**
 * P0.28 — jedno źródło dostępności dla UI i dla walidacji zapisu.
 * Zwraca wyłącznie dane potrzebne do wyboru terminu: wolne dni i okna
 * godzinowe. Żadnych rezerwacji, żadnych danych osobowych.
 */
export async function readAvailability(today: Date = new Date()): Promise<AvailabilityPayload> {
  const supabase = createPublicClient();

  const { data: windowRows, error: scheduleError } = await supabase.rpc("active_schedule_windows");
  if (scheduleError) throw new Error(scheduleError.message);

  const windows: ScheduleWindow[] = (
    (windowRows ?? []) as { weekday: number; from_time: string; to_time: string }[]
  )
    .filter((row) => Number.isInteger(row.weekday) && row.weekday >= 0 && row.weekday <= 6)
    .map((row) => ({
      weekday: row.weekday as Weekday,
      fromTime: row.from_time.slice(0, 5),
      toTime: row.to_time.slice(0, 5),
    }));

  const weekdays = windows.map((window) => window.weekday);

  // Brak skonfigurowanego grafiku = brak dostępności. Nic nie zgadujemy.
  if (weekdays.length === 0) return { dates: [], windows: [] };

  const schedule = scheduleFromWeekdays(weekdays);
  const range = availabilityRange(schedule, today);

  const { data, error } = await supabase.rpc("booked_dates", {
    _from: range.from,
    _to: range.to,
  });
  if (error) throw new Error(error.message);

  const taken = ((data ?? []) as { booked_date: string }[]).map((row) => row.booked_date);
  return { dates: computeAvailableDates(schedule, taken, today), windows };
}
