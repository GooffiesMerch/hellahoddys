CREATE TABLE public.printful_products (
  id BIGINT PRIMARY KEY,
  external_id TEXT,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  variant_count INT NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.printful_variants (
  id BIGINT PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.printful_products(id) ON DELETE CASCADE,
  external_id TEXT,
  sku TEXT,
  name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  retail_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  thumbnail_url TEXT,
  availability TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX printful_variants_product_id_idx ON public.printful_variants(product_id);
CREATE INDEX printful_variants_sku_idx ON public.printful_variants(sku);
CREATE INDEX printful_variants_external_id_idx ON public.printful_variants(external_id);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printful_order_id BIGINT,
  status TEXT NOT NULL DEFAULT 'draft',
  email TEXT NOT NULL,
  recipient JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  shipping_method TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  printful_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_printful_order_id_idx ON public.orders(printful_order_id);

GRANT SELECT ON public.printful_products TO anon, authenticated;
GRANT SELECT ON public.printful_variants TO anon, authenticated;
GRANT ALL ON public.printful_products TO service_role;
GRANT ALL ON public.printful_variants TO service_role;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.printful_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printful_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Printful products are publicly viewable"
  ON public.printful_products FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Printful variants are publicly viewable"
  ON public.printful_variants FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();