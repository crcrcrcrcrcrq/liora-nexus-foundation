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