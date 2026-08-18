DO $do$ BEGIN CREATE TYPE public.app_role AS ENUM ('guest', 'client', 'moderator', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $do$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'pl',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
CREATE POLICY "profiles_select_staff" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_admin" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
CREATE POLICY "user_roles_update_admin" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_admin" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;

REVOKE ALL ON public.profiles FROM anon, authenticated;
REVOKE ALL ON public.user_roles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE TABLE IF NOT EXISTS public.chronicle_reflections (
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

DROP POLICY IF EXISTS chronicle_reflections_select_own ON public.chronicle_reflections;
CREATE POLICY chronicle_reflections_select_own ON public.chronicle_reflections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_reflections_insert_own ON public.chronicle_reflections;
CREATE POLICY chronicle_reflections_insert_own ON public.chronicle_reflections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_reflections_update_own ON public.chronicle_reflections;
CREATE POLICY chronicle_reflections_update_own ON public.chronicle_reflections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_reflections_delete_own ON public.chronicle_reflections;
CREATE POLICY chronicle_reflections_delete_own ON public.chronicle_reflections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS chronicle_reflections_user_reading_at_idx
  ON public.chronicle_reflections (user_id, reading_at DESC);

DROP TRIGGER IF EXISTS chronicle_reflections_set_updated_at ON public.chronicle_reflections;
CREATE TRIGGER chronicle_reflections_set_updated_at
  BEFORE UPDATE ON public.chronicle_reflections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.chronicle_rituals (
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

DROP POLICY IF EXISTS chronicle_rituals_select_own ON public.chronicle_rituals;
CREATE POLICY chronicle_rituals_select_own ON public.chronicle_rituals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_rituals_insert_own ON public.chronicle_rituals;
CREATE POLICY chronicle_rituals_insert_own ON public.chronicle_rituals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_rituals_update_own ON public.chronicle_rituals;
CREATE POLICY chronicle_rituals_update_own ON public.chronicle_rituals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_rituals_delete_own ON public.chronicle_rituals;
CREATE POLICY chronicle_rituals_delete_own ON public.chronicle_rituals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS chronicle_rituals_user_occurred_at_idx
  ON public.chronicle_rituals (user_id, occurred_at DESC);

DROP TRIGGER IF EXISTS chronicle_rituals_set_updated_at ON public.chronicle_rituals;
CREATE TRIGGER chronicle_rituals_set_updated_at
  BEFORE UPDATE ON public.chronicle_rituals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.bookings (
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

DROP POLICY IF EXISTS bookings_select_own ON public.bookings;
CREATE POLICY bookings_select_own ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS bookings_select_staff ON public.bookings;
CREATE POLICY bookings_select_staff ON public.bookings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS bookings_insert_own ON public.bookings;
CREATE POLICY bookings_insert_own ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS bookings_update_own ON public.bookings;
CREATE POLICY bookings_update_own ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS bookings_delete_own ON public.bookings;
CREATE POLICY bookings_delete_own ON public.bookings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS bookings_update_staff ON public.bookings;
CREATE POLICY bookings_update_staff ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX IF NOT EXISTS bookings_user_created_at_idx
  ON public.bookings (user_id, created_at DESC);

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.chronicle_notes (
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

DROP POLICY IF EXISTS chronicle_notes_select_own ON public.chronicle_notes;
CREATE POLICY chronicle_notes_select_own ON public.chronicle_notes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_notes_insert_own ON public.chronicle_notes;
CREATE POLICY chronicle_notes_insert_own ON public.chronicle_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_notes_update_own ON public.chronicle_notes;
CREATE POLICY chronicle_notes_update_own ON public.chronicle_notes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS chronicle_notes_delete_own ON public.chronicle_notes;
CREATE POLICY chronicle_notes_delete_own ON public.chronicle_notes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS chronicle_notes_user_created_at_idx
  ON public.chronicle_notes (user_id, created_at DESC);

DROP TRIGGER IF EXISTS chronicle_notes_set_updated_at ON public.chronicle_notes;
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

CREATE TABLE IF NOT EXISTS public.booking_schedule (
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

DROP POLICY IF EXISTS booking_schedule_select_staff ON public.booking_schedule;
CREATE POLICY booking_schedule_select_staff ON public.booking_schedule
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS booking_schedule_insert_staff ON public.booking_schedule;
CREATE POLICY booking_schedule_insert_staff ON public.booking_schedule
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS booking_schedule_update_staff ON public.booking_schedule;
CREATE POLICY booking_schedule_update_staff ON public.booking_schedule
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS booking_schedule_delete_staff ON public.booking_schedule;
CREATE POLICY booking_schedule_delete_staff ON public.booking_schedule
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP TRIGGER IF EXISTS booking_schedule_set_updated_at ON public.booking_schedule;
CREATE TRIGGER booking_schedule_set_updated_at
  BEFORE UPDATE ON public.booking_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_active_per_date
  ON public.bookings (preferred_date)
  WHERE preferred_date IS NOT NULL AND status IN ('new', 'confirmed');

CREATE TABLE IF NOT EXISTS public.site_content (
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

DROP POLICY IF EXISTS site_content_select_public ON public.site_content;
CREATE POLICY site_content_select_public ON public.site_content
  FOR SELECT TO anon, authenticated USING (active);

DROP POLICY IF EXISTS site_content_select_staff ON public.site_content;
CREATE POLICY site_content_select_staff ON public.site_content
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS site_content_insert_staff ON public.site_content;
CREATE POLICY site_content_insert_staff ON public.site_content
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS site_content_update_staff ON public.site_content;
CREATE POLICY site_content_update_staff ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS site_content_delete_staff ON public.site_content;
CREATE POLICY site_content_delete_staff ON public.site_content
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE INDEX IF NOT EXISTS site_content_locale_active_idx ON public.site_content (locale, active);

DROP TRIGGER IF EXISTS site_content_set_updated_at ON public.site_content;
CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.site_settings (
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

DROP POLICY IF EXISTS site_settings_select_public ON public.site_settings;
CREATE POLICY site_settings_select_public ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS site_settings_insert_staff ON public.site_settings;
CREATE POLICY site_settings_insert_staff ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS site_settings_update_staff ON public.site_settings;
CREATE POLICY site_settings_update_staff ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale text NOT NULL CHECK (locale IN ('pl','en')),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamp with time zone,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (locale, slug)
);

REVOKE ALL ON public.blog_posts FROM anon, authenticated;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_posts_select_public ON public.blog_posts;
CREATE POLICY blog_posts_select_public ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS blog_posts_select_staff ON public.blog_posts;
CREATE POLICY blog_posts_select_staff ON public.blog_posts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS blog_posts_insert_staff ON public.blog_posts;
CREATE POLICY blog_posts_insert_staff ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS blog_posts_update_staff ON public.blog_posts;
CREATE POLICY blog_posts_update_staff ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS blog_posts_delete_staff ON public.blog_posts;
CREATE POLICY blog_posts_delete_staff ON public.blog_posts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS blog_posts_public_idx ON public.blog_posts (locale, status, published_at DESC);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  price integer,
  currency text NOT NULL DEFAULT 'PLN',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_bookable boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  cta_path text NOT NULL DEFAULT '/rezerwacja',
  title_pl text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  duration_pl text NOT NULL DEFAULT '',
  duration_en text NOT NULL DEFAULT '',
  summary_pl text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  cta_pl text NOT NULL DEFAULT '',
  cta_en text NOT NULL DEFAULT '',
  includes_pl jsonb NOT NULL DEFAULT '[]'::jsonb,
  includes_en jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS services_select_public ON public.services;
CREATE POLICY services_select_public ON public.services
  FOR SELECT TO anon, authenticated
  USING (is_active);

DROP POLICY IF EXISTS services_select_staff ON public.services;
CREATE POLICY services_select_staff ON public.services
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS services_insert_staff ON public.services;
CREATE POLICY services_insert_staff ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS services_update_staff ON public.services;
CREATE POLICY services_update_staff ON public.services
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS services_delete_staff ON public.services;
CREATE POLICY services_delete_staff ON public.services
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP TRIGGER IF EXISTS services_set_updated_at ON public.services;
CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS services_active_order_idx ON public.services (is_active, sort_order);

INSERT INTO public.services (
  slug, price, currency, sort_order, is_active, is_bookable, featured, cta_path,
  title_pl, title_en, duration_pl, duration_en, summary_pl, summary_en,
  cta_pl, cta_en, includes_pl, includes_en
) VALUES
(
  'rozklad-trzech-kart', 0, 'PLN', 10, true, false, false, '/tarot',
  'Rozkład trzech kart', 'Three-card reading',
  'natychmiast, online', 'instant, online',
  'Bezpłatny rozkład dostępny bezpośrednio na stronie. Trzy karty Wielkich Arkanów z pełnym opisem pozycji prostej i odwróconej.',
  'A free spread available directly on the site. Three Major Arcana cards with a full description of the upright and reversed position.',
  'Wypróbuj teraz', 'Try now',
  '["Losowanie bez powtórzeń z 22 kart","Opis każdej pozycji: przeszłość, teraźniejszość, kierunek","Możliwość zamówienia rozszerzonej interpretacji"]'::jsonb,
  '["Draw without repeats from 22 cards","Description of each position: past, present, direction","Option to order an extended interpretation"]'::jsonb
),
(
  'konsultacja-indywidualna', 249, 'PLN', 20, true, true, true, '/rezerwacja',
  'Konsultacja indywidualna', 'Individual consultation',
  '60 minut', '60 minutes',
  'Rozmowa jeden na jeden wokół jednego, konkretnego pytania. Tarot jako narzędzie diagnozy, nie przewidywania.',
  'A one-on-one conversation centred on a single, specific question. Tarot as a tool for diagnosis, not prediction.',
  'Umów spotkanie', 'Book a session',
  '["Wstępna ankieta i ustalenie pytania","60 minut połączenia audio lub wideo","Notatka podsumowująca w ciągu 48 godzin"]'::jsonb,
  '["Initial questionnaire and question framing","60-minute audio or video call","Summary note within 48 hours"]'::jsonb
),
(
  'analiza-relacji', 349, 'PLN', 30, true, true, false, '/rezerwacja',
  'Analiza relacji', 'Relationship analysis',
  '90 minut', '90 minutes',
  'Rozbudowany rozkład dwóch stron relacji: oczekiwania, blokady, realne pole porozumienia i granice.',
  'An extended spread covering both sides of a relationship: expectations, blocks, the real ground for understanding, and boundaries.',
  'Umów spotkanie', 'Book a session',
  '["Rozkład dwustronny (12 kart)","90 minut rozmowy","Pisemne podsumowanie z rekomendacjami"]'::jsonb,
  '["Two-sided spread (12 cards)","90-minute conversation","Written summary with recommendations"]'::jsonb
),
(
  'portret-astrologiczny', 429, 'PLN', 40, true, true, false, '/rezerwacja',
  'Portret astrologiczny', 'Astrological portrait',
  'dokument + 60 minut', 'document + 60 minutes',
  'Kompletna analiza kosmogramu urodzeniowego wraz z tranzytami na najbliższy rok i omówieniem w rozmowie.',
  'A complete birth chart analysis together with transits for the coming year, discussed in a follow-up conversation.',
  'Umów spotkanie', 'Book a session',
  '["Kosmogram z dokładnością do minuty urodzenia","Dokument PDF (25–35 stron)","Godzinne omówienie i sesja pytań"]'::jsonb,
  '["Birth chart accurate to the minute of birth","PDF document (25–35 pages)","One-hour discussion and Q&A session"]'::jsonb
),
(
  'opieka-kwartalna', 1290, 'PLN', 50, true, true, false, '/rezerwacja',
  'Opieka kwartalna', 'Quarterly care',
  '3 miesiące', '3 months',
  'Stała współpraca dla osób w okresie decyzji zawodowych lub życiowych. Ograniczona liczba miejsc w kwartale.',
  'Ongoing support for those navigating career or life decisions. A limited number of places per quarter.',
  'Umów spotkanie', 'Book a session',
  '["Trzy sesje po 60 minut","Kontakt asynchroniczny między sesjami","Kalendarz tranzytów przygotowany indywidualnie"]'::jsonb,
  '["Three 60-minute sessions","Asynchronous contact between sessions","Individually prepared transit calendar"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

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

REVOKE ALL ON FUNCTION public.active_schedule_windows() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.active_schedule_windows() TO anon, authenticated, service_role;

INSERT INTO public.booking_schedule (weekday, from_time, to_time, is_active)
SELECT w, '10:00'::time, '18:00'::time, true
FROM unnest(ARRAY[1,2,3,4,5]) AS w
WHERE NOT EXISTS (SELECT 1 FROM public.booking_schedule);

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