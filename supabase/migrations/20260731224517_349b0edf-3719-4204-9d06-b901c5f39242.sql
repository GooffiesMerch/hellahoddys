CREATE TABLE public.printful_webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  event_type text,
  printful_order_id bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.printful_webhook_events TO service_role;

ALTER TABLE public.printful_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printful_webhook_events FORCE ROW LEVEL SECURITY;

CREATE POLICY "No browser access to webhook events"
  ON public.printful_webhook_events
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);