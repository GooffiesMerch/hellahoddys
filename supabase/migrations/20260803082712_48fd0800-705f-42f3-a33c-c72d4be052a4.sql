CREATE TABLE public.printful_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT,
  status_code INTEGER NOT NULL,
  ok BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  printful_order_id BIGINT,
  payload JSONB,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX printful_webhook_logs_received_at_idx
  ON public.printful_webhook_logs (received_at DESC);

GRANT ALL ON public.printful_webhook_logs TO service_role;

ALTER TABLE public.printful_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access to webhook logs"
  ON public.printful_webhook_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.backend_log_webhook(
  p_secret TEXT,
  p_event_type TEXT,
  p_status_code INTEGER,
  p_ok BOOLEAN,
  p_note TEXT,
  p_printful_order_id BIGINT,
  p_payload JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  INSERT INTO public.printful_webhook_logs
    (event_type, status_code, ok, note, printful_order_id, payload)
  VALUES (p_event_type, p_status_code, p_ok, p_note, p_printful_order_id, p_payload);

  DELETE FROM public.printful_webhook_logs
  WHERE received_at < now() - INTERVAL '30 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_list_webhook_logs(
  p_secret TEXT,
  p_limit INTEGER DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE result JSONB;
BEGIN
  PERFORM public.backend_auth(p_secret);
  SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.received_at DESC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT * FROM public.printful_webhook_logs
    ORDER BY received_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500)
  ) l;
  RETURN result;
END;
$$;