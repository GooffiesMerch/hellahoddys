CREATE TABLE IF NOT EXISTS public.backend_secrets (
  name TEXT PRIMARY KEY,
  secret TEXT NOT NULL
);
ALTER TABLE public.backend_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backend_secrets FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.backend_secrets FROM anon, authenticated;
GRANT ALL ON public.backend_secrets TO service_role;

INSERT INTO public.backend_secrets (name, secret)
VALUES ('backend', '201c2298d74ee860ff9c3c793e0374b5f73b80e9e1ad234037508bd099a748c8')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;

-- Public catalog is readable by the storefront again.
DROP POLICY IF EXISTS "printful_products_no_client_access" ON public.printful_products;
DROP POLICY IF EXISTS "printful_variants_no_client_access" ON public.printful_variants;
GRANT SELECT ON public.printful_products TO anon, authenticated;
GRANT SELECT ON public.printful_variants TO anon, authenticated;

DROP POLICY IF EXISTS "Printful products are publicly viewable" ON public.printful_products;
CREATE POLICY "Printful products are publicly viewable"
  ON public.printful_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Printful variants are publicly viewable" ON public.printful_variants;
CREATE POLICY "Printful variants are publicly viewable"
  ON public.printful_variants FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.backend_auth(p_secret TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_secret IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.backend_secrets
    WHERE name = 'backend' AND secret = p_secret
  ) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.backend_auth(TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.backend_upsert_products(p_secret TEXT, p_rows JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  INSERT INTO public.printful_products AS t
    (id, external_id, name, thumbnail_url, variant_count, store_id, store_name, synced_at)
  SELECT r.id, r.external_id, r.name, r.thumbnail_url,
         COALESCE(r.variant_count, 0), r.store_id, r.store_name,
         COALESCE(r.synced_at, now())
  FROM jsonb_populate_recordset(NULL::public.printful_products, p_rows) r
  ON CONFLICT (id) DO UPDATE SET
    external_id = EXCLUDED.external_id,
    name = EXCLUDED.name,
    thumbnail_url = EXCLUDED.thumbnail_url,
    variant_count = EXCLUDED.variant_count,
    store_id = EXCLUDED.store_id,
    store_name = EXCLUDED.store_name,
    synced_at = EXCLUDED.synced_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_upsert_variants(p_secret TEXT, p_rows JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  INSERT INTO public.printful_variants AS t
    (id, product_id, store_id, external_id, sku, name, size, color,
     retail_price, currency, thumbnail_url, availability, synced_at)
  SELECT r.id, r.product_id, r.store_id, r.external_id, r.sku, r.name, r.size, r.color,
         r.retail_price, COALESCE(r.currency, 'USD'), r.thumbnail_url, r.availability,
         COALESCE(r.synced_at, now())
  FROM jsonb_populate_recordset(NULL::public.printful_variants, p_rows) r
  ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    store_id = EXCLUDED.store_id,
    external_id = EXCLUDED.external_id,
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    retail_price = EXCLUDED.retail_price,
    currency = EXCLUDED.currency,
    thumbnail_url = EXCLUDED.thumbnail_url,
    availability = EXCLUDED.availability,
    synced_at = EXCLUDED.synced_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_delete_products(p_secret TEXT, p_ids BIGINT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN RETURN; END IF;
  DELETE FROM public.printful_variants WHERE product_id = ANY(p_ids);
  DELETE FROM public.printful_products WHERE id = ANY(p_ids);
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_create_order(p_secret TEXT, p_order JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id UUID;
BEGIN
  PERFORM public.backend_auth(p_secret);
  INSERT INTO public.orders (status, email, recipient, items, subtotal, total, shipping_method)
  VALUES (
    COALESCE(p_order->>'status', 'pending'),
    p_order->>'email',
    p_order->'recipient',
    p_order->'items',
    COALESCE((p_order->>'subtotal')::NUMERIC, 0),
    COALESCE((p_order->>'total')::NUMERIC, 0),
    p_order->>'shipping_method'
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_update_order(p_secret TEXT, p_id UUID, p_patch JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  UPDATE public.orders SET
    printful_order_id = COALESCE((p_patch->>'printful_order_id')::BIGINT, printful_order_id),
    status = COALESCE(p_patch->>'status', status),
    shipping_cost = COALESCE((p_patch->>'shipping_cost')::NUMERIC, shipping_cost),
    tax = COALESCE((p_patch->>'tax')::NUMERIC, tax),
    total = COALESCE((p_patch->>'total')::NUMERIC, total),
    currency = COALESCE(p_patch->>'currency', currency),
    printful_payload = COALESCE(p_patch->'printful_payload', printful_payload)
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_update_order_tracking(
  p_secret TEXT,
  p_printful_order_id BIGINT,
  p_status TEXT,
  p_tracking_number TEXT,
  p_tracking_url TEXT,
  p_carrier TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  UPDATE public.orders SET
    status = COALESCE(p_status, status),
    tracking_number = p_tracking_number,
    tracking_url = p_tracking_url,
    carrier = p_carrier
  WHERE printful_order_id = p_printful_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_get_order(p_secret TEXT, p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  PERFORM public.backend_auth(p_secret);
  SELECT to_jsonb(o) - 'recipient' - 'printful_payload' INTO result
  FROM public.orders o WHERE o.id = p_id;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.backend_record_webhook_event(
  p_secret TEXT,
  p_event_id TEXT,
  p_event_type TEXT,
  p_printful_order_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.backend_auth(p_secret);
  INSERT INTO public.printful_webhook_events (event_id, event_type, printful_order_id)
  VALUES (p_event_id, p_event_type, p_printful_order_id);
  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.backend_upsert_products(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_upsert_variants(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_delete_products(TEXT, BIGINT[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_create_order(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_update_order(TEXT, UUID, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_update_order_tracking(TEXT, BIGINT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_get_order(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backend_record_webhook_event(TEXT, TEXT, TEXT, BIGINT) TO anon, authenticated;