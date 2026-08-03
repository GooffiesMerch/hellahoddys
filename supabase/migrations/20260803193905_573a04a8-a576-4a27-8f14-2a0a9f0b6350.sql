ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_key
  ON public.orders (stripe_session_id) WHERE stripe_session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.backend_create_order(p_secret text, p_order jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE new_id UUID;
BEGIN
  PERFORM public.backend_auth(p_secret);
  INSERT INTO public.orders (status, email, recipient, items, subtotal, shipping_cost, tax, total, shipping_method, stripe_session_id, payment_status, currency)
  VALUES (
    COALESCE(p_order->>'status', 'pending'),
    p_order->>'email',
    p_order->'recipient',
    p_order->'items',
    COALESCE((p_order->>'subtotal')::NUMERIC, 0),
    COALESCE((p_order->>'shipping_cost')::NUMERIC, 0),
    COALESCE((p_order->>'tax')::NUMERIC, 0),
    COALESCE((p_order->>'total')::NUMERIC, 0),
    p_order->>'shipping_method',
    p_order->>'stripe_session_id',
    COALESCE(p_order->>'payment_status', 'unpaid'),
    COALESCE(p_order->>'currency', 'USD')
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.backend_update_order(p_secret text, p_id uuid, p_patch jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.backend_auth(p_secret);
  UPDATE public.orders SET
    printful_order_id = COALESCE((p_patch->>'printful_order_id')::BIGINT, printful_order_id),
    status = COALESCE(p_patch->>'status', status),
    shipping_cost = COALESCE((p_patch->>'shipping_cost')::NUMERIC, shipping_cost),
    tax = COALESCE((p_patch->>'tax')::NUMERIC, tax),
    total = COALESCE((p_patch->>'total')::NUMERIC, total),
    currency = COALESCE(p_patch->>'currency', currency),
    stripe_session_id = COALESCE(p_patch->>'stripe_session_id', stripe_session_id),
    payment_status = COALESCE(p_patch->>'payment_status', payment_status),
    amount_paid = COALESCE((p_patch->>'amount_paid')::NUMERIC, amount_paid),
    printful_payload = COALESCE(p_patch->'printful_payload', printful_payload)
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.backend_get_order_by_session(p_secret text, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE result JSONB;
BEGIN
  PERFORM public.backend_auth(p_secret);
  SELECT to_jsonb(o) INTO result FROM public.orders o WHERE o.stripe_session_id = p_session_id;
  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.backend_get_order_by_session(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backend_get_order_by_session(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.backend_get_order_by_session(text, text) TO service_role;