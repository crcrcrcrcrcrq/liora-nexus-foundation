CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  locale text NOT NULL DEFAULT 'pl',
  path text NOT NULL DEFAULT '/',
  anonymous_session_id text NOT NULL,
  visitor_type text NOT NULL DEFAULT 'new',
  country text,
  region text,
  city text,
  device_type text NOT NULL DEFAULT 'unknown',
  referrer_category text NOT NULL DEFAULT 'direct',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS analytics_events_select_staff ON public.analytics_events;
CREATE POLICY analytics_events_select_staff
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE INDEX IF NOT EXISTS analytics_events_occurred_at_idx ON public.analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_type_occurred_idx ON public.analytics_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON public.analytics_events (anonymous_session_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_path_idx ON public.analytics_events (path, occurred_at DESC);