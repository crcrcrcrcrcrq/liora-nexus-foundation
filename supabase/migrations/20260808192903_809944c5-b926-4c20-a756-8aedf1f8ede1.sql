CREATE OR REPLACE FUNCTION public.booked_dates(_from date, _to date)
RETURNS TABLE (booked_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT (b.preferred_date)::date
  FROM public.bookings b
  WHERE b.preferred_date IS NOT NULL
    AND b.preferred_date ~ '^\d{4}-\d{2}-\d{2}$'
    AND b.status IN ('new', 'confirmed')
    AND (b.preferred_date)::date BETWEEN _from AND _to
$$;

REVOKE ALL ON FUNCTION public.booked_dates(date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.booked_dates(date, date) TO anon, authenticated, service_role;