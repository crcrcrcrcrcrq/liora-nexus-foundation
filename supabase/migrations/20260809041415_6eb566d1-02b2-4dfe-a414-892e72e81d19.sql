ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_time time without time zone;

CREATE OR REPLACE FUNCTION public.active_schedule_windows()
RETURNS TABLE(weekday smallint, from_time time without time zone, to_time time without time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.weekday, s.from_time, s.to_time
  FROM public.booking_schedule s
  WHERE s.is_active
  ORDER BY s.weekday, s.from_time
$$;

REVOKE ALL ON FUNCTION public.active_schedule_windows() FROM public;
GRANT EXECUTE ON FUNCTION public.active_schedule_windows() TO anon;
GRANT EXECUTE ON FUNCTION public.active_schedule_windows() TO authenticated;
GRANT EXECUTE ON FUNCTION public.active_schedule_windows() TO service_role;