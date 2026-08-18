CREATE TABLE public.blog_posts (
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

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_posts_select_public ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY blog_posts_select_staff ON public.blog_posts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY blog_posts_insert_staff ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY blog_posts_update_staff ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY blog_posts_delete_staff ON public.blog_posts
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX blog_posts_public_idx ON public.blog_posts (locale, status, published_at DESC);

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

CREATE POLICY services_select_public ON public.services
  FOR SELECT TO anon, authenticated
  USING (is_active);

CREATE POLICY services_select_staff ON public.services
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY services_insert_staff ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY services_update_staff ON public.services
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY services_delete_staff ON public.services
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

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

CREATE POLICY bookings_update_staff ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));