CREATE TABLE public.chronicle_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_at timestamptz NOT NULL DEFAULT now(),
  language text NOT NULL DEFAULT 'pl',
  spread text NOT NULL DEFAULT '',
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  interpretation text NOT NULL DEFAULT '',
  heard text NOT NULL DEFAULT '',
  leaving text NOT NULL DEFAULT '',
  taking text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.chronicle_reflections FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chronicle_reflections TO authenticated;
GRANT ALL ON public.chronicle_reflections TO service_role;

ALTER TABLE public.chronicle_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY chronicle_reflections_select_own ON public.chronicle_reflections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY chronicle_reflections_insert_own ON public.chronicle_reflections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY chronicle_reflections_update_own ON public.chronicle_reflections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY chronicle_reflections_delete_own ON public.chronicle_reflections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX chronicle_reflections_user_reading_at_idx
  ON public.chronicle_reflections (user_id, reading_at DESC);

CREATE TRIGGER chronicle_reflections_set_updated_at
  BEFORE UPDATE ON public.chronicle_reflections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chronicle_rituals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('tarot', 'astrology', 'note')),
  title text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  reflection text NOT NULL DEFAULT '',
  details text,
  interpretation_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.chronicle_rituals FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chronicle_rituals TO authenticated;
GRANT ALL ON public.chronicle_rituals TO service_role;

ALTER TABLE public.chronicle_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY chronicle_rituals_select_own ON public.chronicle_rituals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY chronicle_rituals_insert_own ON public.chronicle_rituals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY chronicle_rituals_update_own ON public.chronicle_rituals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY chronicle_rituals_delete_own ON public.chronicle_rituals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX chronicle_rituals_user_occurred_at_idx
  ON public.chronicle_rituals (user_id, occurred_at DESC);

CREATE TRIGGER chronicle_rituals_set_updated_at
  BEFORE UPDATE ON public.chronicle_rituals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  service_slug text NOT NULL,
  preferred_date text,
  message text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'confirmed', 'done', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.bookings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_select_own ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY bookings_select_staff ON public.bookings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY bookings_insert_own ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookings_update_own ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookings_delete_own ON public.bookings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX bookings_user_created_at_idx
  ON public.bookings (user_id, created_at DESC);

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chronicle_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.chronicle_notes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chronicle_notes TO authenticated;
GRANT ALL ON public.chronicle_notes TO service_role;

ALTER TABLE public.chronicle_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY chronicle_notes_select_own ON public.chronicle_notes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY chronicle_notes_insert_own ON public.chronicle_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY chronicle_notes_update_own ON public.chronicle_notes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY chronicle_notes_delete_own ON public.chronicle_notes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX chronicle_notes_user_created_at_idx
  ON public.chronicle_notes (user_id, created_at DESC);

CREATE TRIGGER chronicle_notes_set_updated_at
  BEFORE UPDATE ON public.chronicle_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

REVOKE ALL ON public.booking_schedule FROM anon, authenticated;
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

CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL CHECK (locale IN ('pl', 'en')),
  content_key text NOT NULL CHECK (length(content_key) BETWEEN 1 AND 200),
  value text NOT NULL CHECK (length(value) <= 5000),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_content_locale_key_unique UNIQUE (locale, content_key)
);

REVOKE ALL ON public.site_content FROM anon, authenticated;
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_content_select_public ON public.site_content
  FOR SELECT TO anon, authenticated USING (active);

CREATE POLICY site_content_select_staff ON public.site_content
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY site_content_insert_staff ON public.site_content
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY site_content_update_staff ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY site_content_delete_staff ON public.site_content
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE INDEX site_content_locale_active_idx ON public.site_content (locale, active);

CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  theme_id text NOT NULL DEFAULT 'obsidian'
    CHECK (theme_id IN ('obsidian', 'ivory', 'burgundy', 'emerald')),
  template_id text NOT NULL DEFAULT 'premium-luxury'
    CHECK (template_id IN ('premium-luxury')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.site_settings FROM anon, authenticated;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_settings_select_public ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY site_settings_insert_staff ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY site_settings_update_staff ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;