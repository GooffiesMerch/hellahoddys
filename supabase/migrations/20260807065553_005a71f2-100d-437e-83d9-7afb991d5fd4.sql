CREATE OR REPLACE FUNCTION public.backend_list_orders(p_secret text, p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE result JSONB;
BEGIN
  PERFORM public.backend_auth(p_secret);
  SELECT COALESCE(jsonb_agg(to_jsonb(o) ORDER BY o.created_at DESC), '[]'::jsonb)
  INTO result
  FROM (
    SELECT id, created_at, updated_at, status, payment_status, email,
           amount_paid, total, subtotal, shipping_cost, tax, currency,
           paypal_order_id, printful_order_id, tracking_number, tracking_url, carrier
    FROM public.orders
    ORDER BY created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500)
  ) o;
  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.backend_list_orders(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.backend_list_orders(text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.backend_list_orders(text, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.backend_list_orders(text, integer) TO service_role;