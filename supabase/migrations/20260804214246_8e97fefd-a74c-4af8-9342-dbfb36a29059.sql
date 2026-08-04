ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;
CREATE INDEX IF NOT EXISTS orders_paypal_order_id_idx ON public.orders (paypal_order_id);

CREATE OR REPLACE FUNCTION public.backend_get_order_by_session(p_secret text, p_session_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE result JSONB;
BEGIN
  PERFORM public.backend_auth(p_secret);
  SELECT to_jsonb(o) INTO result
  FROM public.orders o
  WHERE o.paypal_order_id = p_session_id OR o.stripe_session_id = p_session_id
  LIMIT 1;
  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.backend_get_order_by_session(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.backend_get_order_by_session(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.backend_get_order_by_session(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.backend_get_order_by_session(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.backend_update_order(p_secret text, p_id uuid, p_patch jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.backend_auth(p_secret);
  UPDATE public.orders SET
    status = COALESCE(p_patch->>'status', status),
    printful_order_id = COALESCE((p_patch->>'printful_order_id')::BIGINT, printful_order_id),
    tracking_number = COALESCE(p_patch->>'tracking_number', tracking_number),
    tracking_url = COALESCE(p_patch->>'tracking_url', tracking_url),
    carrier = COALESCE(p_patch->>'carrier', carrier),
    subtotal = COALESCE((p_patch->>'subtotal')::NUMERIC, subtotal),
    shipping_cost = COALESCE((p_patch->>'shipping_cost')::NUMERIC, shipping_cost),
    tax = COALESCE((p_patch->>'tax')::NUMERIC, tax),
    total = COALESCE((p_patch->>'total')::NUMERIC, total),
    currency = COALESCE(p_patch->>'currency', currency),
    stripe_session_id = COALESCE(p_patch->>'stripe_session_id', stripe_session_id),
    paypal_order_id = COALESCE(p_patch->>'paypal_order_id', paypal_order_id),
    payment_status = COALESCE(p_patch->>'payment_status', payment_status),
    amount_paid = COALESCE((p_patch->>'amount_paid')::NUMERIC, amount_paid),
    printful_payload = COALESCE(p_patch->'printful_payload', printful_payload)
  WHERE id = p_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.backend_update_order(text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.backend_update_order(text, uuid, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.backend_update_order(text, uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.backend_update_order(text, uuid, jsonb) TO service_role;