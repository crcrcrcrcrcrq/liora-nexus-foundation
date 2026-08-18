ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'pl';

CREATE OR REPLACE FUNCTION public.bookings_validate_language()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.language IS NULL OR NEW.language NOT IN ('pl', 'en') THEN
    RAISE EXCEPTION 'Unsupported booking language: %', NEW.language;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_validate_language ON public.bookings;
CREATE TRIGGER bookings_validate_language
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_validate_language();