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