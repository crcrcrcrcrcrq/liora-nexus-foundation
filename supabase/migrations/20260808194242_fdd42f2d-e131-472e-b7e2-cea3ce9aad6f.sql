CREATE TABLE public.booking_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  from_time time NOT NULL,
  to_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_schedule_time_order CHECK (to_time > from_time)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_schedule TO authenticated;
GRANT ALL ON public.booking_schedule TO service_role;

ALTER TABLE public.booking_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY booking_schedule_select_staff ON public.booking_schedule
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY booking_schedule_insert_staff ON public.booking_schedule
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY booking_schedule_update_staff ON public.booking_schedule
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY booking_schedule_delete_staff ON public.booking_schedule
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE TRIGGER booking_schedule_set_updated_at
  BEFORE UPDATE ON public.booking_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Publiczna dostępność potrzebuje wyłącznie zbioru aktywnych dni tygodnia.
CREATE OR REPLACE FUNCTION public.active_schedule_weekdays()
RETURNS TABLE(weekday smallint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT s.weekday
  FROM public.booking_schedule s
  WHERE s.is_active
$$;

REVOKE ALL ON FUNCTION public.active_schedule_weekdays() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.active_schedule_weekdays() TO anon, authenticated, service_role;

-- Capacity = 1: najwyżej jedna aktywna rezerwacja na dany dzień.
CREATE UNIQUE INDEX bookings_one_active_per_date
  ON public.bookings (preferred_date)
  WHERE preferred_date IS NOT NULL AND status IN ('new', 'confirmed');